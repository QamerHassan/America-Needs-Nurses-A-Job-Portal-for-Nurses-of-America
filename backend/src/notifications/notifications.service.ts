import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, Role } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getNotifications(userId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getNotificationDetail(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id, userId },
    });

    if (!notification || !notification.metadata) return {};

    const metadata = notification.metadata as any;

    // Resolve based on type and metadata keys
    if (metadata.serviceRequestId) {
      return (await this.prisma.serviceRequest.findUnique({ where: { id: metadata.serviceRequestId } })) || {};
    }
    if (metadata.reportId) {
      return (await this.prisma.issueReport.findUnique({ 
        where: { id: metadata.reportId },
        include: { User_IssueReport_reportedByIdToUser: { select: { name: true, email: true } } }
      })) || {};
    }
    if (metadata.companyId) {
      return (await this.prisma.company.findUnique({ 
        where: { id: metadata.companyId },
        include: { User: { select: { name: true, email: true } } }
      })) || {};
    }
    if (metadata.jobId) {
      return (await this.prisma.job.findUnique({ where: { id: metadata.jobId } })) || {};
    }

    return {};
  }

  async createNotification(userId: string, title: string, message: string, type: NotificationType, metadata: any = {}) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        metadata: metadata || {},
      },
    });
  }

  async notifyAdmins(title: string, message: string, type: NotificationType, metadata: any = {}) {
    const admins = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.SUPER_ADMIN, Role.SUPPORT_ADMIN] }
      },
      select: { id: true }
    });

    return Promise.all(
      admins.map(admin => 
        this.createNotification(admin.id, title, message, type, metadata)
      )
    );
  }
}
