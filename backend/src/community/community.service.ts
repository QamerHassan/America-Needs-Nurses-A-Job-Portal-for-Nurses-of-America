import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunityService {
  private readonly GLOBAL_CHAT_NAME = 'Nurse Community Global Chat';

  constructor(private prisma: PrismaService) {}

  /**
   * Get or create the global nurse community chat
   */
  async getOrCreateGlobalChat() {
    let chat = await this.prisma.conversation.findFirst({
      where: {
        name: this.GLOBAL_CHAT_NAME,
        isGroup: true,
      } as any,
    });

    if (!chat) {
      chat = await this.prisma.conversation.create({
        data: {
          name: this.GLOBAL_CHAT_NAME,
          isGroup: true,
        } as any,
      });
    }

    return chat;
  }

  /**
   * Ensure a nurse is a member of the global chat
   */
  async joinGlobalChat(userId: string) {
    const chat = await this.getOrCreateGlobalChat();

    const existingMember = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: chat.id,
          userId,
        },
      },
    });

    if (!existingMember) {
      await this.prisma.conversationMember.create({
        data: {
          conversationId: chat.id,
          userId,
        },
      });
    }

    return chat;
  }

  /**
   * Get all community posts with author and basic stats
   */
  async getCommunityPosts() {
    return this.prisma.communityPost.findMany({
      include: {
        User: {
          select: { id: true, name: true, image: true, role: true },
        },
        _count: {
          select: { PostComment: true, PostReaction: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new community post
   */
  async createPost(userId: string, title: string, content: string) {
    return this.prisma.communityPost.create({
      data: {
        title,
        content,
        authorId: userId,
      },
      include: {
        User: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  /**
   * Get a single post with comments
   */
  async getPostDetails(postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        User: {
          select: { id: true, name: true, image: true },
        },
        PostComment: {
          include: {
            User: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        PostReaction: true,
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
