import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogStatus, NotificationType } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService
  ) {}

  // 1. Admin ke liye saare posts
  async getAllPosts() {
    return this.prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Website ke liye sirf Published posts
  async getActivePosts() {
    return this.prisma.blog.findMany({
      where: { status: BlogStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. ID se fetch karna (Admin Edit)
  async getPostById(id: string) {
    const post = await this.prisma.blog.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // 4. Slug se fetch karna (Public View - Fixes 404)
  async getPostBySlug(slug: string) {
    // findFirst use kar rahe hain taake query zyada flexible ho
    const post = await this.prisma.blog.findFirst({ 
      where: { slug: slug } 
    });
    
    if (!post) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }
    return post;
  }

  // 5. Naya Post banana
  async createPost(data: any) {
    const post = await this.prisma.blog.create({
      data: {
        title: data.title,
        author: data.author,
        excerpt: data.excerpt,
        category: data.category,
        status: data.status,
        imageUrl: data.imageUrl,
        content: data.content,
        slug: this.generateSlug(data.title),
      },
    });

    if (post.status === BlogStatus.PUBLISHED) {
      this.notifySubscribers(post.title, post.slug);
    }

    return post;
  }

  // 6. Post update karna
  async updatePost(id: string, data: any) {
    const oldPost = await this.prisma.blog.findUnique({ where: { id } });
    const post = await this.prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        author: data.author,
        excerpt: data.excerpt,
        category: data.category,
        status: data.status,
        imageUrl: data.imageUrl,
        content: data.content,
      },
    });

    if (oldPost && oldPost.status !== BlogStatus.PUBLISHED && post.status === BlogStatus.PUBLISHED) {
      this.notifySubscribers(post.title, post.slug);
    }

    return post;
  }

  // 7. Delete post
  async deletePost(id: string) {
    return this.prisma.blog.delete({ where: { id } });
  }

  // 8. Professional Slug Generator (Khatam karega leading hyphen ka masla)
  private generateSlug(title: string) {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Special characters hatayein
      .replace(/\s+/g, '-')     // Spaces ko hyphen banayein
      .replace(/-+/g, '-')      // Double hyphens '--' ko single '-' karein
      .replace(/^-+|-+$/g, ''); // SHURU aur AAKHIR se hyphens khatam karein

    // Unique random string add karna taake duplicate slugs na hon
    return `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  // 9. Method to notify subscribers and users
  private async notifySubscribers(title: string, slug: string) {
    try {
      const emailedEmails = new Set<string>();

      // 1. Notify external Newsletter Subscribers
      const subscribers = await this.prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true }
      });

      for (const sub of subscribers) {
        if (!emailedEmails.has(sub.email)) {
          this.mailService.sendNewBlogPostNotification(sub.email, 'Reader', title, slug)
            .catch(e => console.error(`Failed to send blog notification to ${sub.email}`, e));
          emailedEmails.add(sub.email);
        }
      }

      // 2. Notify all registered Users (Nurses and Employers)
      const users = await this.prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, email: true, name: true }
      });

      for (const user of users) {
        if (!emailedEmails.has(user.email)) {
          this.mailService.sendNewBlogPostNotification(user.email, user.name || 'User', title, slug)
            .catch(e => console.error(`Failed to send blog notification to ${user.email}`, e));
          
          // In-App Notification
          this.notificationsService.createNotification(
            user.id,
            "New Blog Published",
            `Read our latest article: ${title}`,
            NotificationType.BLOG_PUBLISHED,
            { blogSlug: slug }
          ).catch(e => console.error('Failed to create in-app blog notification', e));

          emailedEmails.add(user.email);
        }
      }
    } catch (err) {
      console.error('Error in notifySubscribers:', err);
    }
  }
}