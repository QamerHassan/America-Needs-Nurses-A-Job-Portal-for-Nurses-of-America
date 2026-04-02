import { Controller, Post, Body, Req, Headers, RawBodyRequest, BadRequestException, Logger } from '@nestjs/common';
import { StripeService } from './stripe.service';
import * as express from 'express';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async createCheckout(@Body() body: { userId: string, planId: string }) {
    return this.stripeService.createCheckoutSession(body.userId, body.planId);
  }

  @Post('create-subscription')
  async createSubscription(@Body() body: { userId: string, planId: string, email: string, name: string }) {
    try {
      if (!body.userId || !body.planId) {
        throw new BadRequestException('userId and planId are required');
      }
      return await this.stripeService.createSubscription(body.userId, body.planId, body.email, body.name);
    } catch (err: any) {
      this.logger.error(`Error in createSubscription controller: ${err.message}`);
      throw new BadRequestException(err.message || 'Subscription initialization failed');
    }
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any
  ) {
    // Because we used bodyParser.raw, the payload exists natively on req.body as a Buffer
    const rawBodyBuffer = req.body;
    
    if (!signature) {
      this.logger.error('Webhook Error: Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }
    
    if (!rawBodyBuffer || !Buffer.isBuffer(rawBodyBuffer)) {
      this.logger.error('Webhook Error: Missing or invalid raw request body');
      throw new BadRequestException('Missing or invalid raw body');
    }

    try {
      return await this.stripeService.handleWebhook(signature, rawBodyBuffer);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
