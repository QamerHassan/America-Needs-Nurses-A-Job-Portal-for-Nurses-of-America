import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private mailService: MailService,
  ) {}

  async getAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });
  }

  async getActivePlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
  }

  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        User: {
          select: { name: true, email: true }
        },
        SubscriptionPlan: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateSubscription(id: string, data: any) {
    // Fetch the subscription before updating to detect status transitions
    const existing = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true } },
        SubscriptionPlan: { select: { name: true } },
      },
    });

    const updated = await this.prisma.subscription.update({
      where: { id },
      data,
    });

    // -- Side-effect: Notify employer on approval or rejection --
    if (existing && data.status && existing.status !== data.status) {
      const employer = existing.User;
      const planName = existing.SubscriptionPlan?.name || 'Premium Plan';

      if (data.status === 'ACTIVE' && existing.status === 'PENDING_VERIFICATION') {
        // Send approval email
        this.mailService.sendPaymentStatusUpdateEmail(
          employer.email,
          employer.name || 'Employer',
          'APPROVED',
        ).catch(err => console.error('[updateSubscription] Approval email failed:', err));

        // In-app notification
        this.prisma.notification.create({
          data: {
            userId: employer.id,
            type: 'PAYMENT_VERIFIED' as any,
            title: 'Payment Approved ✅',
            message: `Your ${planName} subscription payment has been verified. You can now post unlimited jobs!`,
            metadata: { subscriptionId: id },
          },
        }).catch(err => console.error('[updateSubscription] In-app notification failed:', err));

      } else if (data.status === 'REJECTED') {
        // Send rejection email
        this.mailService.sendPaymentStatusUpdateEmail(
          employer.email,
          employer.name || 'Employer',
          'REJECTED',
          data.rejectionReason || 'Your payment could not be verified. Please contact support.',
        ).catch(err => console.error('[updateSubscription] Rejection email failed:', err));
      }
    }

    return updated;
  }

  async getAdminStats() {
    const totalActive = await this.prisma.subscription.count({
      where: { status: 'ACTIVE' }
    });
    
    // Simulating revenue calculation for demo
    return {
      totalActive,
      revenue: 12450,
      trending: '+12%'
    };
  }

  async updatePlan(id: string, data: any) {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
      },
    });
  }

  async createPlan(data: any) {
    try {
      return await this.prisma.subscriptionPlan.create({
        data: {
          ...data,
          price: parseFloat(data.price),
        },
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  async initiateManualSubscription(userId: string, planId: string) {
    // Check if there's already a pending or active subscription for this user
    const existing = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PENDING_VERIFICATION'] }
      },
      orderBy: { createdAt: 'desc' },
      include: { SubscriptionPlan: true }
    });

    // GHOST SESSION RECOVERY
    let dbUser = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: {
        Company: {
          take: 1
        }
      }
    });

    if (!dbUser) {
       console.warn(`[initiateManualSubscription] User ID ${userId} not found in DB. Performing session recovery.`);
       dbUser = await this.prisma.user.create({
         data: {
           id: userId,
           name: 'Recovered Session User',
           email: `recovered_${userId.substring(0,8)}@temp.dev`,
           password: 'none',
           role: 'EMPLOYER'
         },
         include: {
           Company: {
             take: 1
           }
         }
       });
    }

    let subscription;

    if (existing && existing.status === SubscriptionStatus.PENDING_VERIFICATION) {
      if (existing.planId !== planId) {
         subscription = await this.prisma.subscription.update({
           where: { id: existing.id },
           data: { planId },
           include: { SubscriptionPlan: true }
         });
      } else {
        subscription = existing;
      }
    } else {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          planId,
          status: SubscriptionStatus.PENDING_VERIFICATION,
          startDate: new Date(),
        },
        include: {
          SubscriptionPlan: true
        }
      });
    }

    // --- ADMIN NOTIFICATION FLOW ---
    try {
      const employerName = dbUser.name || 'Unknown Employer';
      const planName = subscription.SubscriptionPlan?.name || 'Premium Plan';
      const amount = subscription.SubscriptionPlan?.price ? subscription.SubscriptionPlan.price.toString() : '0';
      const currency = subscription.SubscriptionPlan?.currency || 'USD';
      const logoUrl = dbUser.Company?.[0]?.logoUrl ?? undefined;

      // Generate Invoice PDF (Directly from object to avoid indexing race conditions)
      const pdfBufferRaw = await this.paymentsService.generateInvoiceForSubscription(userId, subscription, dbUser);
      const pdfBuffer = Buffer.from(pdfBufferRaw);

      // Send Email to Admin
      await this.mailService.sendAdminManualPaymentInvoiceEmail(
        employerName,
        planName,
        amount,
        currency,
        pdfBuffer,
        logoUrl
      );

      console.log(`[initiateManualSubscription] Admin notification sent for manual payment by ${employerName}`);
    } catch (emailError) {
      console.error('[initiateManualSubscription] Failed to send admin notification:', emailError);
    }

    return subscription;
  }

  async getLatestSubscriptionForUser(userId: string) {
    if (!userId) {
      console.warn(`[getLatestSubscription] Empty userId provided`);
      return { subscription: null };
    }

    try {
      let subscription = await this.prisma.subscription.findFirst({
        where: { userId },
        include: { SubscriptionPlan: true },
        orderBy: { createdAt: 'desc' },
      });

      if (subscription) {
        // Ensure Decimals are returned as readable numbers to prevent PDF errors
        (subscription as any).amountPaid = subscription.amountPaid ? Number(subscription.amountPaid) : null;
        if (subscription.SubscriptionPlan) {
          (subscription.SubscriptionPlan as any).price = Number(subscription.SubscriptionPlan.price);
        }
      }

      return { subscription };
    } catch (error) {
      console.error(`[getLatestSubscription] Error fetching for user ${userId}:`, error);
      return { subscription: null };
    }
  }

  async getLatestSuccessfulSubscription(userId: string, sessionId?: string, subId?: string) {
    if (!userId) {
      console.warn(`[getLatestSuccessfulSubscription] Empty userId provided`);
      return null;
    }

    try {
      // Find the latest active subscription for the user
      // We also look for the latest PaymentTransaction to get accurate payment data
      const subscription = await this.prisma.subscription.findFirst({
        where: { 
          userId,
          status: { in: ['ACTIVE', 'PENDING_VERIFICATION', 'REJECTED'] }
        },
        include: { 
          SubscriptionPlan: true,
          PaymentTransaction: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!subscription) {
        // 🚀 FALLBACK: If subscription not in DB yet (webhook delay), check Stripe API directly
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

        if (subId) {
          try {
            console.log(`[Fallback] Checking Stripe Subscription directly for subId: ${subId}`);
            const stripeSub = await stripe.subscriptions.retrieve(subId, {
              expand: ['latest_invoice', 'latest_invoice.payment_intent'],
            });

            if (stripeSub.status === 'active' || stripeSub.status === 'trialing') {
              const invoice = stripeSub.latest_invoice as any;
              return {
                subscriptionStatus: 'ACTIVE',
                paymentMethod: 'STRIPE',
                transactionStatus: 'PAID',
                invoiceUrl: invoice?.hosted_invoice_url || null,
                amountPaid: invoice ? invoice.amount_paid / 100 : 0,
                currency: invoice?.currency?.toUpperCase() || 'USD',
                invoiceId: invoice?.id || null,
                planName: 'ANN Subscription',
                date: new Date().toISOString(),
              };
            }
          } catch (stripeError) {
            console.error('[Fallback] Error verifying Stripe subscription:', stripeError.message);
          }
        }

        if (sessionId) {
          try {
            console.log(`[Fallback] Checking Stripe Session directly for sessionId: ${sessionId}`);
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
              expand: ['invoice', 'subscription'],
            });

            if (session.payment_status === 'paid') {
              const invoice = session.invoice as any;
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
          } catch (stripeSessionError) {
            console.error('[Fallback] Error verifying Stripe session:', stripeSessionError.message);
          }
        }
        return null;
      }

      // Extract the latest transaction for the receipt data
      const latestTransaction = subscription.PaymentTransaction?.[0] || null;

      // Map statuses for frontend logic
      let transactionStatus = latestTransaction ? latestTransaction.status : null;
      let paymentMethod = latestTransaction ? latestTransaction.paymentMethod : (subscription.stripeSubscriptionId ? 'STRIPE' : 'BANK_TRANSFER');

      // Return standardized JSON structure
      return {
        subscriptionStatus: subscription.status,
        paymentMethod: latestTransaction?.paymentMethod || (subscription.stripeSubscriptionId ? 'STRIPE' : 'MANUAL'),
        transactionStatus: latestTransaction?.status || null,
        invoiceUrl: latestTransaction?.receiptUrl || null,
        amountPaid: latestTransaction ? Number(latestTransaction.amount) : Number(subscription.amountPaid || 0),
        currency: latestTransaction ? latestTransaction.currency : (subscription.currency || 'USD'),
        invoiceId: latestTransaction ? latestTransaction.stripeInvoiceId : null,
        planName: subscription.SubscriptionPlan?.name || 'Premium Plan',
        date: latestTransaction ? latestTransaction.createdAt : subscription.createdAt,
      };
    } catch (error) {
      console.error(`[getLatestSuccessfulSubscription] Error fetching for user ${userId}:`, error);
      return null;
    }
  }

  async deletePlan(id: string) {
    return this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }
}
