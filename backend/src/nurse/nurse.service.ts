import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NurseService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { NurseProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.NurseProfile) {
      // Create a default profile if it doesn't exist
      return this.prisma.nurseProfile.create({
        data: { userId },
      });
    }

    return user.NurseProfile;
  }

  async getPublicProfile(userId: string, viewerId?: string) {
    const profile = await this.prisma.nurseProfile.findUnique({
      where: { userId },
      include: {
        User: {
          select: { name: true, image: true, email: true, createdAt: true }
        }
      }
    });

    if (viewerId && viewerId !== userId) {
      // Find out who viewed it to provide context
      const viewer = await this.prisma.user.findUnique({ where: { id: viewerId } });
      if (viewer && viewer.role === 'EMPLOYER') {
        const company = await this.prisma.company.findFirst({ where: { ownerId: viewerId } });
        const viewerName = company ? company.name : viewer.name || 'An Employer';
        
        this.notificationsService.createNotification(
          userId,
          'Profile Viewed',
          `${viewerName} has viewed your profile lately.`,
          NotificationType.PROFILE_VIEWED,
          { viewerId, companyId: company?.id }
        ).catch(e => console.error('Failed to notify Profile Viewed', e));
      }
    }
    
    if (!profile) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true, email: true, createdAt: true }
      });

      if (!user) {
        throw new NotFoundException('Candidate not found');
      }

      // Return a skeleton profile for users who haven't set up their nurse profile yet
      return {
        userId,
        fullName: user.name,
        User: user,
        specialization: "Nursing Professional",
        location: "Location Not Set",
        bio: "This candidate hasn't completed their profile yet.",
        skills: [],
        experience: [],
        education: [],
        createdAt: user.createdAt,
      };
    }
    
    return profile;
  }

  async updateProfile(userId: string, updateData: any) {
    // Upsert to create or update the profile
    return this.prisma.nurseProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });
  }

  async addDocument(userId: string, fileRecord: any) {
    // Get existing documents and append new one
    const profile = await this.prisma.nurseProfile.findUnique({ where: { userId } });
    const existingDocs: any[] = (profile?.documents as any[]) || [];
    const updatedDocs = [...existingDocs, fileRecord];

    return this.prisma.nurseProfile.upsert({
      where: { userId },
      update: { documents: updatedDocs },
      create: { userId, documents: updatedDocs },
    });
  }

  async updateAvatar(userId: string, imageUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });
  }
}
