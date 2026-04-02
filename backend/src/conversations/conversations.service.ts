import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        ConversationMember: {
          some: { userId },
        },
      },
      include: {
        ConversationMember: {
          include: {
            User: {
              select: { 
                id: true, 
                name: true, 
                image: true, 
                role: true,
                Company: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true
                  },
                  take: 1
                }
              },
            },
          },
        },
        Message: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async deleteConversation(userId: string, conversationId: string) {
    // 1. Verify membership
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!member) {
      throw new UnauthorizedException('You do not have permission to delete this conversation');
    }

    // 2. Delete the conversation (cascade will handle messages and members)
    // Note: In some systems you might want to "hide" it for one user, 
    // but here we perform a full deletion for simplicity as requested.
    return this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    // Get all conversation memberships for this user
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });

    if (memberships.length === 0) return 0;

    // Count messages in those conversations that are:
    // - newer than lastReadAt (or lastReadAt is null → all messages count)
    // - NOT sent by the user themselves
    let total = 0;
    for (const m of memberships) {
      const count = await this.prisma.message.count({
        where: {
          conversationId: m.conversationId,
          senderId: { not: userId },
          ...(m.lastReadAt ? { createdAt: { gt: m.lastReadAt } } : {}),
        },
      });
      total += count;
    }
    return total;
  }

  async getMessages(userId: string, conversationId: string) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!member) throw new UnauthorizedException('Not a member of this conversation');

    // Update lastReadAt asynchronously
    this.prisma.conversationMember
      .update({
        where: { id: member.id },
        data: { lastReadAt: new Date() },
      })
      .catch((err) => console.error('Failed to update lastReadAt:', err));

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        User: { select: { id: true, name: true, image: true } },
      },
    });
  }

  /**
   * Send a message — also emails the recipient if they are not the sender
   * (employer ↔ nurse private messaging)
   */
  async sendMessage(userId: string, conversationId: string, content: string) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!member) throw new UnauthorizedException('Not a member of this conversation');

    const [message] = await Promise.all([
      this.prisma.message.create({
        data: { content, senderId: userId, conversationId },
        include: {
          User: { select: { id: true, name: true, image: true, role: true } },
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Notify all OTHER members of the conversation via email
    this.notifyOtherMembers(conversationId, userId, message).catch((err) =>
      console.error('Failed to send message notification emails:', err),
    );

    return message;
  }

  async getOrCreatePrivateConversation(userId1: string, userId2: string) {
    if (userId1 === userId2) throw new Error('Cannot create conversation with yourself');

    // 1. Check if a private conversation already exists between these two
    // This is a bit complex in Prisma for AND across relations, so we find conversations 
    // where BOTH are members and the conversation is NOT a group.
    const existing = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { ConversationMember: { some: { userId: userId1 } } },
          { ConversationMember: { some: { userId: userId2 } } },
        ],
      },
      include: {
        ConversationMember: {
          include: {
            User: { select: { id: true, name: true, image: true, role: true } },
          },
        },
        Message: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { User: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    if (existing) {
      // Reverse messages for front-end (asc)
      existing.Message = existing.Message.reverse();
      return existing;
    }

    // 2. Create a new private conversation
    return this.prisma.conversation.create({
      data: {
        isGroup: false,
        ConversationMember: {
          createMany: {
            data: [
              { userId: userId1 },
              { userId: userId2 },
            ],
          },
        },
      },
      include: {
        ConversationMember: {
          include: {
            User: { select: { id: true, name: true, image: true, role: true } },
          },
        },
        Message: {
          orderBy: { createdAt: 'asc' }, // New will have 0 messages anyway
          include: { User: { select: { id: true, name: true, image: true } } },
        },
      },
    });
  }

  private async notifyOtherMembers(
    conversationId: string,
    senderId: string,
    message: any,
  ) {
    // Fetch all other members of this conversation
    const otherMembers = await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
        userId: { not: senderId },
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
      },
    });

    for (const member of otherMembers) {
      this.mailService
        .sendNewMessageEmail(
          member.User.email,
          member.User.name || 'User',
          message.User.name || 'Someone',
          message.User.role || 'USER',
          message.content,
          conversationId,
        )
        .catch((err) =>
          console.error(
            `Failed to send message email to ${member.User.email}:`,
            err,
          ),
        );

      // Create In-App Notification
      this.notificationsService.createNotification(
        member.userId,
        'New Message Recieved',
        `You have a new message from ${message.User.name || 'Someone'}: "${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}"`,
        NotificationType.NEW_MESSAGE,
        { conversationId, messageId: message.id }
      ).catch(e => console.error('Failed to create in-app message notification', e));
    }
  }
}