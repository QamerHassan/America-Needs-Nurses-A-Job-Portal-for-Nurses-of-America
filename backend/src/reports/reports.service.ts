import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createReport(data: {
    category: string;
    message: string;
    reportedById: string;
    reportedUserId?: string;
    jobId?: string;
    companyId?: string;
    postId?: string;
  }) {
    if (!data.reportedById) {
      throw new BadRequestException('Reporter ID is required');
    }

    const report = await this.prisma.issueReport.create({
      data: {
        category: data.category,
        message: data.message,
        reportedById: data.reportedById,
        reportedUserId: data.reportedUserId,
        jobId: data.jobId,
        companyId: data.companyId,
        postId: data.postId,
        status: 'PENDING',
      },
      include: {
        User_IssueReport_reportedByIdToUser: true, // The reporter
      }
    });

    let targetType = 'General';
    if (data.reportedUserId) targetType = `User (ID: ${data.reportedUserId})`;
    else if (data.jobId) targetType = `Job (ID: ${data.jobId})`;
    else if (data.companyId) targetType = `Company (ID: ${data.companyId})`;
    else if (data.postId) targetType = `Post (ID: ${data.postId})`;

    // Notify admins
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'CONTENT_ADMIN'] } },
      select: { email: true }
    });

    const reporterName = report.User_IssueReport_reportedByIdToUser?.name || 'Unknown User';

    for (const admin of admins) {
      await this.mailService.sendAdminNewReportEmail(admin.email, {
        category: data.category,
        message: data.message,
        reporterName,
        targetType
      }).catch(e => console.error('Failed to notify admin of new report:', e));

      // NEW: Create In-App Notification
      const adminUser = await this.prisma.user.findUnique({ where: { email: admin.email } });
      if (adminUser) {
        await this.prisma.notification.create({
          data: {
            userId: adminUser.id,
            type: 'COMMUNITY_REPORT' as any,
            title: `New Issue Report: ${data.category}`,
            message: `New Report: ${data.message}`,
            metadata: { reportId: report.id }
          }
        }).catch(e => console.error('Failed to create in-app notification for admin:', e));
      }
    }

    return report;
  }
}
