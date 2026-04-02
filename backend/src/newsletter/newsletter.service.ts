import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async getSubscribers() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });
  }

  async sendNewsletter(data: { title: string; subject: string; content: string; type: any }) {
    const newsletter = await this.prisma.newsletter.create({
      data: {
        title: data.title,
        subject: data.subject,
        content: data.content,
        type: data.type,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Notify subscribers asynchronously
    this.processNewsletterDelivery(data.subject, data.content).catch(err => 
      console.error('Failed to deliver newsletter:', err)
    );

    return newsletter;
  }

  private async processNewsletterDelivery(subject: string, content: string) {
    // 1. Fetch Guest Subscribers
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    // 2. Fetch Registered Users with newsletter preferences
    const users = await this.prisma.user.findMany({
      where: { 
        status: 'ACTIVE',
        OR: [
          { NewsletterPreference: { isNot: null } },
          { role: 'NURSE' } // Default nurses to get news
        ]
      },
      select: { id: true, email: true }
    });

    // Create in-app notifications for registered users
    for (const user of users) {
      this.notificationsService.createNotification(
        user.id,
        "Newsletter Release",
        `New update: ${subject}`,
        NotificationType.NEWSLETTER,
        { subject }
      ).catch(e => console.error('Failed to create in-app newsletter notification', e));
    }

    // Combine and Uniquify emails
    const allEmails = Array.from(new Set([
      ...subscribers.map(s => s.email),
      ...users.map(u => u.email)
    ]));

    // Send emails
    for (const email of allEmails) {
      await this.mailService.sendNewsletterEmail(email, subject, content).catch(err => 
        console.error(`Failed to send newsletter to ${email}:`, err)
      );
    }
  }

  async getNewsletterHistory() {
    return this.prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
