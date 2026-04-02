import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private paymentsService: PaymentsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20' as any,
    });
  }

  async createCheckoutSession(userId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new Error('Plan not found');

    let priceId = plan.stripePriceId;

    if (!priceId) {
      this.logger.log(`Creating Stripe Product/Price for plan: ${plan.name}`);
      const product = await this.stripe.products.create({
        name: plan.name,
      });
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(Number(plan.price) * 100),
        currency: plan.currency.toLowerCase(),
        recurring: { interval: plan.billingCycle.toLowerCase().includes('year') ? 'year' : 'month' },
      });
      priceId = price.id;

      await this.prisma.subscriptionPlan.update({
        where: { id: planId },
        data: { stripeProductId: product.id, stripePriceId: price.id },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      client_reference_id: userId,
      metadata: { userId, planId },
    });

    return { url: session.url };
  }

  async createSubscription(userId: string, planId: string, email: string, name: string) {
    this.logger.log(`Creating subscription: userId=${userId}, planId=${planId}, email=${email}, name=${name}`);
    
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        this.logger.error(`Plan not found: ${planId}`);
        throw new Error('Plan not found');
      }

      // 1. Get or Create Customer
      let customerId: string;
      const existingSub = await this.prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId;
    } else {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // 2. Ensure Plan exists in Stripe
    let priceId = plan.stripePriceId;
    if (!priceId) {
      const product = await this.stripe.products.create({ name: plan.name });
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(Number(plan.price) * 100),
        currency: plan.currency.toLowerCase(),
        recurring: { interval: plan.billingCycle.toLowerCase().includes('year') ? 'year' : 'month' },
      });
      priceId = price.id;
      await this.prisma.subscriptionPlan.update({
        where: { id: planId },
        data: { stripeProductId: product.id, stripePriceId: price.id },
      });
    }

    // 3. Create Subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { userId, planId },
    });

    let latestInvoice = subscription.latest_invoice as any;
    
    // Fallback: If latest_invoice is only an ID, retrieve the full object
    if (typeof latestInvoice === 'string') {
      latestInvoice = await this.stripe.invoices.retrieve(latestInvoice, {
        expand: ['payment_intent'],
      });
    }

    const paymentIntent = latestInvoice?.payment_intent as any;

    // If there is no client secret, it might be a free plan or something already paid.
    // In these cases, the subscription is often already 'active'.
    if (!paymentIntent || !paymentIntent.client_secret) {
      this.logger.log(`No payment intent needed for subscription ${subscription.id} (Status: ${subscription.status}, Total: ${latestInvoice?.total})`);
      return {
        subscriptionId: subscription.id,
        clientSecret: null, // Frontend will know to skip card payment
      };
    }

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    };
    } catch (err: any) {
      this.logger.error(`Failed to create subscription: ${err.message}`);
      throw err;
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    return this.handleEventIdempotently(event);
  }

  private async handleEventIdempotently(event: Stripe.Event) {
    const existingEvent = await (this.prisma as any).stripeEvent.findUnique({
      where: { eventId: event.id }
    });

    if (existingEvent) {
      this.logger.log(`Duplicate event ignored: ${event.id} (${event.type})`);
      return { received: true, duplicate: true };
    }

    // Record event as processing
    await (this.prisma as any).stripeEvent.create({
      data: {
        eventId: event.id,
        type: event.type,
        status: 'PROCESSING'
      }
    });

    try {
      this.logger.log(`Processing Stripe event: ${event.type} (${event.id})`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      await (this.prisma as any).stripeEvent.update({
        where: { eventId: event.id },
        data: { status: 'PROCESSED' }
      });

      return { received: true };
    } catch (err: any) {
      this.logger.error(`Error processing event ${event.id}: ${err.message}`);
      await (this.prisma as any).stripeEvent.update({
        where: { eventId: event.id },
        data: { status: 'FAILED' }
      });
      // Returning 200 to Stripe to avoid infinite retry loops, but we logged the failure
      return { received: true, error: err.message };
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const stripeSubscriptionId = (invoice as any).subscription as string;
    const amountPaid = invoice.amount_paid / 100;
    const currency = invoice.currency.toUpperCase();

    console.log("Webhook received: invoice.paid", { stripeSubscriptionId, amountPaid, currency });

    if (!stripeSubscriptionId) return;

    // 1. Update Subscription Status
    const subscription = await this.prisma.subscription.update({
      where: { stripeSubscriptionId },
      data: {
        amountPaid: amountPaid as any,
        currency: currency,
        status: 'ACTIVE',
      },
    });

    // 2. Create Branded Transaction & PDF Receipt (Unified)
    const user = await this.prisma.user.findUnique({
      where: { id: subscription.userId },
      include: { Subscription: { include: { SubscriptionPlan: true } } }
    } as any);

    const transaction = await this.paymentsService.handleStripeSuccess({
      stripeInvoiceId: invoice.id,
      subscriptionId: subscription.id,
      amount: amountPaid,
      currency: currency,
      senderName: user?.name || 'Valued Customer',
      senderEmail: user?.email || invoice.customer_email || '',
      planName: (subscription as any).SubscriptionPlan?.name || 'ANN Subscription',
    });

    // 3. Notify User
    await this.notificationsService.createNotification(
      subscription.userId,
      '✅ Payment Successful',
      `We've received your payment of ${currency} ${amountPaid}. Your receipt is ready for download.`,
      NotificationType.PAYMENT_SUCCESS,
      { transactionId: transaction.id }
    );
  }


  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const stripeSubscriptionId = (invoice as any).subscription as string;
    if (!stripeSubscriptionId) return;

    this.logger.warn(`Payment failed for subscription ${stripeSubscriptionId}. Marking as PAST_DUE.`);

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId },
      data: { status: 'PAST_DUE' as any }
    });

    // Create Audit Trail for failure
    const sub = await this.prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
    if (sub) {
      const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await (this.prisma as any).paymentTransaction.upsert({
        where: { stripeInvoiceId: invoice.id },
        create: {
          transactionId,
          subscriptionId: sub.id,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId,
          amount: (invoice.amount_due / 100) as any,
          currency: invoice.currency.toUpperCase(),
          status: 'FAILED',
          isVerified: false,
        },
        update: { status: 'FAILED' }
      });
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription canceled in Stripe: ${subscription.id}`);
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'CANCELLED' }
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription updated in Stripe: ${subscription.id} (Status: ${subscription.status})`);
    
    // Map Stripe status to our DB status
    let status: any = 'ACTIVE';
    if (subscription.status === 'past_due') status = 'PAST_DUE';
    if (subscription.status === 'canceled') status = 'CANCELLED';
    if (subscription.status === 'unpaid') status = 'UNPAID';

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status }
    });
  }

  private async handleSubscriptionCreated(session: Stripe.Checkout.Session) {
    const { userId, planId } = session.metadata || {};
    const stripeSubscriptionId = (session as any).subscription as string;
    const stripeCustomerId = (session as any).customer as string;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency ? session.currency.toUpperCase() : 'USD';

    if (!userId || !planId) {
      this.logger.error('Missing metadata in Stripe session');
      return;
    }

    console.log("Webhook received: checkout.session.completed", { userId, planId, stripeSubscriptionId });

    // Update or Create Subscription in DB
    const subscription = await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: stripeSubscriptionId },
      create: {
        userId,
        planId,
        status: 'ACTIVE',
        stripeSubscriptionId,
        stripeCustomerId,
        amountPaid: amountPaid as any,
        currency,
        startDate: new Date(),
      },
      update: {
        status: 'ACTIVE',
        planId,
        amountPaid: amountPaid as any,
        currency,
      },
    } as any);

    // Create Audit Trail for the initial payment
    if (session.invoice) {
        // Retrieve the invoice to get the hosted_invoice_url
        const invoice = await this.stripe.invoices.retrieve(session.invoice as string);
        
        const transaction = await (this.prisma as any).paymentTransaction.upsert({
          where: { stripeInvoiceId: session.invoice as string },
          create: {
            subscriptionId: (subscription as any).id,
            stripeInvoiceId: session.invoice as string,
            stripeSubscriptionId: stripeSubscriptionId,
            amount: amountPaid as any,
            currency: currency,
            status: 'PAID',
            paymentMethod: 'STRIPE',
            receiptUrl: invoice.hosted_invoice_url || null
          },
          update: { 
            status: 'PAID',
            paymentMethod: 'STRIPE',
            receiptUrl: invoice.hosted_invoice_url || null
          }
        });
        console.log('STRIPE TRANSACTION SAVED:', transaction);
    }

    // Optionally update items left or user role
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
      include: { SubscriptionPlan: true } as any
    });

    // Send Payment Success Notification & Receipt (Unified)
    if (session.invoice) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { Subscription: { include: { SubscriptionPlan: true } } }
        } as any);

        await this.paymentsService.handleStripeSuccess({
          stripeInvoiceId: session.invoice as string,
          subscriptionId: (subscription as any).id,
          amount: amountPaid,
          currency: currency,
          senderName: user?.name || session.customer_details?.name || 'Valued Customer',
          senderEmail: user?.email || session.customer_details?.email || '',
          planName: (user as any).Subscription?.SubscriptionPlan?.name || 'ANN Subscription',
        });

        await this.notificationsService.createNotification(
          userId,
          '✅ Payment Successful',
          `We've received your payment of ${currency} ${amountPaid}. Your receipt is ready for download.`,
          NotificationType.PAYMENT_SUCCESS,
          { transactionId: stripeSubscriptionId } // Note: Using sub ID as reference if TXN ID isn't returned yet
        );
    }
  }

  async verifySession(sessionId: string) {
    try {
      this.logger.log(`Directly verifying Stripe session: ${sessionId}`);
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['invoice', 'subscription'],
      });

      if (session.payment_status === 'paid') {
        const invoice = session.invoice as Stripe.Invoice;
        return {
          subscriptionStatus: 'ACTIVE',
          paymentMethod: 'STRIPE',
          transactionStatus: 'PAID',
          invoiceUrl: invoice?.hosted_invoice_url || null,
          amountPaid: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || 'USD',
          invoiceId: invoice?.id || null,
          planName: 'ANN Subscription',
          date: new Date().toISOString(),
        };
      }
      return null;
    } catch (err) {
      this.logger.error(`Error verifying Stripe session: ${err.message}`);
      return null;
    }
  }
}
