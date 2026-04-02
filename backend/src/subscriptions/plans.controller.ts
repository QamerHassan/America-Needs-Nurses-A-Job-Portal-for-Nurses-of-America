import * as express from 'express';
import { Controller, Get, Post, Param, Query, Body, Headers, Res, Logger, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('subscriptions')
export class PlansController {
  private readonly logger = new Logger(PlansController.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Get('plans')
  getActivePlans() {
    return this.subscriptionsService.getActivePlans();
  }

  @Get('latest-success/:userId')
  async getLatestSuccess(
    @Param('userId') userId: string,
    @Res() res: express.Response,
    @Query('session_id') sessionId?: string,
    @Query('sub_id') subId?: string
  ) {
    const data = await this.subscriptionsService.getLatestSuccessfulSubscription(userId, sessionId, subId);
    return res.json(data ?? null);
  }

  @Get('invoice-latest/:userId')
  async getLatestInvoice(
    @Param('userId') userId: string,
    @Res() res: express.Response
  ) {
    try {
      const pdfBuffer = await this.paymentsService.generateLatestInvoiceForUser(userId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=ANN-Invoice-Latest.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      
      return res.end(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error delivering latest invoice for user ${userId}:`, error);
      return res.status(error instanceof NotFoundException ? 404 : 500).json({ 
        message: error.message || 'Failed to generate invoice.' 
      });
    }
  }
  @Post('verification/manual-initiate')
  async initiateManual(
    @Headers('x-user-id') userIdHeader: string,
    @Body() body: { planId: string }
  ) {
    this.logger.log(`Initiating manual subscription for user: ${userIdHeader}, plan: ${body.planId}`);
    return this.subscriptionsService.initiateManualSubscription(userIdHeader, body.planId);
  }
}
