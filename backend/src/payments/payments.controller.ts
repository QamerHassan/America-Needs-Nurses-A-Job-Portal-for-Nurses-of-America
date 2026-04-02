import { Controller, Get, Post, Body, Param, Headers, Res, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { PaymentsService } from './payments.service';
import * as fs from 'fs';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private prisma: PrismaService,
    private pdfGenerator: PdfGeneratorService,
    private paymentsService: PaymentsService,
  ) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Post('submit-manual')
  async submitManual(
    @Headers() headers: any,
    @Body() data: { 
      subscriptionId: string; 
      receiptUrl: string; 
      paymentMethod: string;
      amount?: number;
      currency?: string;
    }
  ) {
    const userId = this.getUserId(headers);
    return this.paymentsService.submitManualPayment(userId, data);
  }

  @Get('receipt/manual/:transactionId')
  async viewManualReceipt(
    @Param('transactionId') transactionId: string,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ) {
    const userId = this.getUserId(headers);

    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        Subscription: true,
      },
    });

    if (!transaction || !transaction.receiptUrl) {
      throw new NotFoundException('Manual receipt not found');
    }

    // Ownership check or Admin bypass
    const userRole = headers['x-user-role'];
    if (transaction.Subscription.userId !== userId && userRole !== 'SUPER_ADMIN' && userRole !== 'SUPPORT_ADMIN') {
      throw new UnauthorizedException('You do not have permission to view this receipt');
    }

    const filePath = join(process.cwd(), transaction.receiptUrl.replace(/^\//, ''));
    
    // Check if file exists
    try {
      res.sendFile(filePath);
    } catch (err) {
      throw new NotFoundException('Receipt file not found on server');
    }
  }

  @Get('receipt/:transactionId')
  async downloadReceipt(
    @Param('transactionId') transactionId: string,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ) {
    const userId = this.getUserId(headers);
    const userRole = headers['x-user-role'];
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPPORT_ADMIN';

    // 1. Fetch transaction by transactionId (Internal ID like TXN-XXXXXX)
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { transactionId },
      include: {
        Subscription: {
          include: { User: true, SubscriptionPlan: true }
        }
      }
    });

    if (!transaction) {
      // Fallback for Stripe Invoice ID if transactionId not found
      const stripeTx = await this.prisma.paymentTransaction.findUnique({
        where: { stripeInvoiceId: transactionId },
        include: {
          Subscription: {
            include: { User: true, SubscriptionPlan: true }
          }
        }
      });
      if (!stripeTx) throw new NotFoundException('Transaction record not found');
      return this.serveReceiptFile(stripeTx, userId, isAdmin, res);
    }

    return this.serveReceiptFile(transaction, userId, isAdmin, res);
  }

  private async serveReceiptFile(transaction: any, userId: string, isAdmin: boolean, res: Response) {
    // 2. Access Control
    if (transaction.Subscription.userId !== userId && !isAdmin) {
      throw new UnauthorizedException('You do not have permission to view this receipt');
    }

    // 3. Fallback Generation: If invoiceUrl is missing, generate it now
    if (!transaction.invoiceUrl) {
      this.logger.log(`Regenerating missing receipt for ${transaction.transactionId}`);
      const pdfBuffer = await this.pdfGenerator.generateReceipt({
        transactionId: transaction.transactionId || 'TXN-GEN',
        amount: Number(transaction.amount),
        currency: transaction.currency,
        date: transaction.createdAt,
        senderName: transaction.senderName || transaction.Subscription.User.name || 'Valued Customer',
        senderEmail: transaction.senderEmail || transaction.Subscription.User.email || '',
        status: transaction.status === 'SUCCESS' ? 'SUCCESS' : transaction.status === 'FAILED' ? 'FAILED' : 'PENDING',
        planName: transaction.Subscription.SubscriptionPlan.name,
      });

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=receipt-${transaction.transactionId}.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      return res.end(pdfBuffer);
    }

    // 4. Standard File Serving
    const filePath = join(process.cwd(), transaction.invoiceUrl.replace(/^\//, ''));
    try {
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      } else {
        throw new Error('File not found');
      }
    } catch (err) {
      this.logger.error(`Receipt file missing on disk: ${filePath}`);
      // Final fallback to on-the-fly generation if file disappeared
      const pdfBuffer = await this.pdfGenerator.generateReceipt({
        transactionId: transaction.transactionId || 'TXN-GEN',
        amount: Number(transaction.amount),
        currency: transaction.currency,
        date: transaction.createdAt,
        senderName: transaction.senderName,
        senderEmail: transaction.senderEmail,
        status: transaction.status as any,
        planName: transaction.Subscription.SubscriptionPlan.name,
      });
      res.set({ 'Content-Type': 'application/pdf' });
      return res.end(pdfBuffer);
    }
  }
}
