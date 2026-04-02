import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';

interface UnreadMessage {
  senderName: string;
  preview: string;
  sentAt: Date;
}

@Injectable()
export class NotificationsTask {
  private readonly logger = new Logger(NotificationsTask.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Runs every hour to check for users who have been inactive for 24+ hours
   * and have unread messages.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleInactiveUserReminders() {
    this.logger.log('Starting check for inactive user messaging reminders...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Find ACTIVE users who haven't been seen for 24 hours
    // (Cast to any to bypass stale IDE types after schema update)
    const inactiveUsers = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { lastSeen: { lte: twentyFourHoursAgo } },
          { lastSeen: null, createdAt: { lte: twentyFourHoursAgo } },
        ] as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    this.logger.log(`Found ${inactiveUsers.length} inactive users to check.`);

    for (const user of inactiveUsers) {
      try {
        const unreadData = await this.getUnreadMessagesForUser(user.id);

        if (unreadData.totalUnread > 0) {
          this.logger.log(`Sending offline digest to ${user.email} (${unreadData.totalUnread} unread messages)`);
          
          await this.mailService.sendCommunityOfflineDigestEmail(
            user.email,
            user.name || 'Nurse',
            unreadData.totalUnread,
            unreadData.previews
          );
        }
      } catch (err) {
        this.logger.error(`Error processing reminder for ${user.email}:`, err);
      }
    }
  }

  private async getUnreadMessagesForUser(userId: string) {
    // 1. Get all conversations the user is a member of
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: {
        conversationId: true,
        lastReadAt: true,
        joinedAt: true,
      },
    });

    let totalUnread = 0;
    const allUnreadMessages: UnreadMessage[] = [];

    for (const member of memberships) {
      const lastRead = member.lastReadAt || member.joinedAt;

      // 2. Count and fetch unread messages in this conversation
      const messages = await this.prisma.message.findMany({
        where: {
          conversationId: member.conversationId,
          senderId: { not: userId },
          createdAt: { gt: lastRead },
        },
        include: {
          User: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (messages.length > 0) {
        // Since we only take 10, we should also get the total count for this conversation
        const count = await this.prisma.message.count({
          where: {
            conversationId: member.conversationId,
            senderId: { not: userId },
            createdAt: { gt: lastRead },
          },
        });

        totalUnread += count;
        allUnreadMessages.push(...messages.map(m => ({
          senderName: m.User.name || 'Someone',
          preview: m.content,
          sentAt: m.createdAt,
        })));
      }
    }

    // Sort all gathered messages by date and take the top 5 for the email preview
    const topPreviews = allUnreadMessages
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, 5);

    return {
      totalUnread,
      previews: topPreviews,
    };
  }

  /**
   * Runs every day to check for subscriptions expiring in exactly 2 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleSubscriptionExpiryReminders() {
    this.logger.log('Checking for subscriptions expiring in 2 days...');

    const twoDaysFromNowStart = new Date();
    twoDaysFromNowStart.setDate(twoDaysFromNowStart.getDate() + 2);
    twoDaysFromNowStart.setHours(0, 0, 0, 0);

    const twoDaysFromNowEnd = new Date(twoDaysFromNowStart);
    twoDaysFromNowEnd.setHours(23, 59, 59, 999);

    const expiringSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: twoDaysFromNowStart,
          lte: twoDaysFromNowEnd,
        },
      },
      include: {
        User: {
          select: { id: true, email: true, name: true }
        }
      },
    });

    this.logger.log(`Found ${expiringSubscriptions.length} subscriptions expiring in 2 days.`);

    for (const sub of expiringSubscriptions) {
      if (sub.User?.email && sub.endDate) {
        await this.mailService.sendSubscriptionExpiryReminderEmail(
          sub.User.email,
          sub.User.name || 'Employer',
          sub.endDate
        ).catch(err => this.logger.error(`Failed to send expiry reminder to ${sub.User.email}:`, err));
      }
    }
  }
}
