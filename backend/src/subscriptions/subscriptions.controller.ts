import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('admin/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('list')
  getAll() {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Post(':id/modify')
  modify(@Param('id') id: string, @Body() data: any) {
    return this.subscriptionsService.updateSubscription(id, data);
  }

  @Get('stats')
  getStats() {
    return this.subscriptionsService.getAdminStats();
  }

  @Post('plans')
  createPlan(@Body() data: any) {
    return this.subscriptionsService.createPlan(data);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() data: any) {
    return this.subscriptionsService.updatePlan(id, data);
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(id);
  }
}
