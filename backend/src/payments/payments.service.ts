import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { NotificationType, SubscriptionStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private pdfGenerator: PdfGeneratorService,
  ) {}

  private async generateTransactionId(): Promise<string> {
    let transactionId = '';
    let exists = true;
    while (exists) {
      transactionId = 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const duplicate = await this.prisma.paymentTransaction.findUnique({
        where: { transactionId }
      });
      if (!duplicate) exists = false;
    }
    return transactionId;
  }

  private async saveReceipt(transactionId: string, buffer: Buffer): Promise<string> {
    const fileName = `${transactionId}.pdf`;
    const uploadDir = path.join(process.cwd(), 'uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/receipts/${fileName}`;
  }

  async submitManualPayment(userId: string, data: { subscriptionId: string; receiptUrl: string; paymentMethod: string; amount?: number; currency?: string }) {
    // 1. Validate subscription ownership
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
      include: { User: true, SubscriptionPlan: true }
    });

    if (!subscription || subscription.userId !== userId) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Your subscription is already active.');
    }

    // 2. Create unique Transaction ID
    const transactionId = await this.generateTransactionId();

    // 3. Create unified PaymentTransaction
    const transaction = await (this.prisma.paymentTransaction.create({
      data: {
        transactionId,
        subscriptionId: data.subscriptionId,
        amount: (data.amount || subscription.SubscriptionPlan.price) as any,
        currency: data.currency || subscription.currency || 'USD',
        paymentMethod: data.paymentMethod || 'MANUAL',
        senderName: subscription.User.name || 'Unknown Employer',
        senderEmail: subscription.User.email,
        receiptUrl: data.receiptUrl,
        status: 'PENDING',
        isVerified: false,
      },
      include: { Subscription: { include: { SubscriptionPlan: true } } }
    }) as any);

    // 4. Generate PENDING Receipt PDF
    const pdfBuffer = await this.pdfGenerator.generateReceipt({
      transactionId,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      date: new Date(),
      senderName: transaction.senderName,
      senderEmail: transaction.senderEmail,
      status: 'PENDING',
      planName: transaction.Subscription.SubscriptionPlan.name,
    });

    const invoiceUrl = await this.saveReceipt(transactionId, pdfBuffer);
    
    // Update transaction with invoiceUrl
    const updatedTransaction = await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { invoiceUrl }
    });

    // 5. Update subscription status
    await this.prisma.subscription.update({
      where: { id: data.subscriptionId },
      data: { status: SubscriptionStatus.PENDING_VERIFICATION }
    });

    // 6. Notify Admin
    await this.notificationsService.notifyAdmins(
      'Manual Payment Submitted',
      `Employer ${subscription.User.name || subscription.User.email} uploaded a receipt.`,
      NotificationType.SUBSCRIPTION_EXPIRY,
      { transactionId: updatedTransaction.id, userId }
    );

    return updatedTransaction;
  }

  async verifyPayment(transactionId: string, adminIdOrName: string, status: 'SUCCESS' | 'FAILED', note?: string) {
    const transaction = await (this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId } as any,
      include: { 
        Subscription: { 
          include: { User: true, SubscriptionPlan: true } 
        } 
      }
    }) as any);

    if (!transaction) throw new NotFoundException('Transaction not found');
    
    if (transaction.status === 'SUCCESS' || transaction.status === 'FAILED') {
      throw new BadRequestException(`This transaction is already in a terminal state (${transaction.status}).`);
    }

    // 1. Regenerate Receipt with Final Status
    const pdfBuffer = await this.pdfGenerator.generateReceipt({
      transactionId: transaction.transactionId,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      date: transaction.createdAt,
      senderName: transaction.senderName,
      senderEmail: transaction.senderEmail,
      status: status,
      planName: transaction.Subscription.SubscriptionPlan.name,
    });

    const invoiceUrl = await this.saveReceipt(transaction.transactionId, pdfBuffer);

    // 2. Update Transaction
    const updatedTransaction = await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: status,
        isVerified: status === 'SUCCESS',
        invoiceUrl: invoiceUrl,
        verifiedAt: new Date(),
        verifiedBy: adminIdOrName,
        metadata: note ? { adminNote: note } : undefined
      }
    });

    // 3. Sync Subscription Status
    if (status === 'SUCCESS') {
      await this.prisma.subscription.update({
        where: { id: transaction.subscriptionId },
        data: { 
          status: SubscriptionStatus.ACTIVE,
          updatedAt: new Date()
        }
      });
    } else {
      await this.prisma.subscription.update({
        where: { id: transaction.subscriptionId },
        data: { 
          status: SubscriptionStatus.REJECTED,
          updatedAt: new Date()
        }
      });
    }

    // 4. Notifications
    const notificationType = status === 'SUCCESS' ? NotificationType.PAYMENT_VERIFIED : NotificationType.PAYMENT_FAILED;
    await this.notificationsService.createNotification(
      transaction.Subscription.userId,
      `Payment ${status}`,
      status === 'SUCCESS' ? 'Your payment has been verified!' : `Verification failed: ${note}`,
      notificationType,
      { transactionId, subscriptionId: transaction.subscriptionId }
    );

    return updatedTransaction;
  }

  async handleStripeSuccess(stripeData: { 
    stripeInvoiceId: string; 
    subscriptionId: string; 
    amount: number; 
    currency: string;
    senderName: string;
    senderEmail: string;
    planName: string;
  }) {
    const transactionId = await this.generateTransactionId();
    
    // Generate SUCCESS PDF
    const pdfBuffer = await this.pdfGenerator.generateReceipt({
      transactionId,
      amount: stripeData.amount,
      currency: stripeData.currency,
      date: new Date(),
      senderName: stripeData.senderName,
      senderEmail: stripeData.senderEmail,
      status: 'SUCCESS',
      planName: stripeData.planName,
    });

    const invoiceUrl = await this.saveReceipt(transactionId, pdfBuffer);

    return (this.prisma.paymentTransaction.create({
      data: {
        transactionId,
        subscriptionId: stripeData.subscriptionId,
        stripeInvoiceId: stripeData.stripeInvoiceId,
        amount: stripeData.amount as any,
        currency: stripeData.currency,
        paymentMethod: 'STRIPE',
        senderName: stripeData.senderName,
        senderEmail: stripeData.senderEmail,
        status: 'SUCCESS',
        isVerified: true,
        invoiceUrl,
      }
    }) as any);
  }

  async getAdminPayments(status?: string) {
    return (this.prisma.paymentTransaction.findMany({
      where: status && status !== 'ALL' ? { status: status.toUpperCase() } : {},
      include: {
        Subscription: {
          include: {
            User: { 
              select: { 
                name: true, 
                email: true,
                EmployerProfile: true
              } 
            },
            SubscriptionPlan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any);
  }

  async getLatestTransactionForUser(userId: string) {
    return (this.prisma.paymentTransaction.findFirst({
      where: {
        Subscription: { userId }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        Subscription: {
          include: { SubscriptionPlan: true, User: true }
        }
      }
    }) as any);
  }

  async generateLatestInvoiceForUser(userId: string): Promise<Buffer> {
    // 1. Try Transactions (Completed payments)
    const transaction = await this.getLatestTransactionForUser(userId);

    if (transaction) {
      return await this.pdfGenerator.generateReceipt({
        transactionId: transaction.transactionId,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        date: transaction.createdAt,
        senderName: transaction.senderName || transaction.Subscription?.User?.name || 'Valued Customer',
        senderEmail: transaction.senderEmail || transaction.Subscription?.User?.email || '',
        status: transaction.status as any,
        planName: transaction.Subscription?.SubscriptionPlan?.name || 'Premium Plan',
      });
    }

    // 2. FALLBACK: Subscriptions (Initiated but not yet verified)
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId: userId },
      include: { 
        SubscriptionPlan: true, 
        User: { select: { name: true, email: true } } 
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    const subscription = subscriptions[0] || null;

    if (!subscription) {
      this.logger.error(`[PDF_FAIL] No subscription history found for User: ${userId}`);
      throw new NotFoundException(`No subscription history found for User ID: ${userId}. Please ensure you have selected a plan.`);
    }

    if (!subscription.SubscriptionPlan) {
       throw new NotFoundException('Your selected plan details are missing. Please try selecting the plan again.');
    }

    return await this.pdfGenerator.generateReceipt({
      transactionId: `PRO-FORMA-${subscription.id.substring(0, 8).toUpperCase()}`,
      amount: Number(subscription.SubscriptionPlan.price),
      currency: subscription.currency || 'USD',
      date: subscription.createdAt,
      senderName: subscription.User?.name || 'Valued Customer',
      senderEmail: subscription.User?.email || '',
      status: 'PENDING',
      planName: subscription.SubscriptionPlan.name,
    });
  }

  /**
   * Generates an invoice directly from provided data to avoid DB indexing race conditions
   */
  async generateInvoiceForSubscription(userId: string, subscription: any, user: any): Promise<Buffer> {
    if (!subscription || !subscription.SubscriptionPlan) {
      return this.generateLatestInvoiceForUser(userId);
    }

    return await this.pdfGenerator.generateReceipt({
      transactionId: `PRO-FORMA-${subscription.id.substring(0, 8).toUpperCase()}`,
      amount: Number(subscription.SubscriptionPlan.price),
      currency: subscription.currency || 'USD',
      date: subscription.createdAt || new Date(),
      senderName: user?.name || 'Valued Customer',
      senderEmail: user?.email || '',
      status: 'PENDING',
      planName: subscription.SubscriptionPlan.name,
    });
  }

  async generateReceipt(transactionId: string): Promise<string> {
    const transaction = await (this.prisma.paymentTransaction.findFirst({
      where: { 
        OR: [
          { id: transactionId },
          { transactionId: transactionId }
        ]
      },
      include: {
        Subscription: {
          include: { User: true, SubscriptionPlan: true }
        }
      }
    }) as any);

    if (!transaction) throw new NotFoundException('Transaction not found');

    const pdfBuffer = await this.pdfGenerator.generateReceipt({
      transactionId: transaction.transactionId,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      date: transaction.createdAt,
      senderName: transaction.senderName || transaction.Subscription.User.name || 'Valued Customer',
      senderEmail: transaction.senderEmail || transaction.Subscription.User.email || '',
      status: transaction.status as any,
      planName: transaction.Subscription.SubscriptionPlan.name,
    });

    const fileName = `${transaction.transactionId}.pdf`;
    const uploadDir = path.join(process.cwd(), 'uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    
    return filePath;
  }
}
