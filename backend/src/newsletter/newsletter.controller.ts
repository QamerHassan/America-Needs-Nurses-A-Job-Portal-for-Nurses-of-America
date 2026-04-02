import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

@Controller('admin/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Get('subscribers')
  getSubscribers() {
    return this.newsletterService.getSubscribers();
  }

  @Post('send')
  sendNewsletter(@Body() data: any) {
    return this.newsletterService.sendNewsletter(data);
  }

  @Get('history')
  getHistory() {
    return this.newsletterService.getNewsletterHistory();
  }
}
