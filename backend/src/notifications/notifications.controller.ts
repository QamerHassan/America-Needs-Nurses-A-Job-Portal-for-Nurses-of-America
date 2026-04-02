import { Controller, Patch, Post, Param, Headers, Req, Get, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Get()
  async getNotifications(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.notificationsService.getNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('read-all')
  async markAllAsRead(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get(':id/detail')
  async getDetail(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.notificationsService.getNotificationDetail(id, userId);
  }
}
