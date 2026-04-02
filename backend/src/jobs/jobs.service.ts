import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: any) {
    const { 
      search, 
      location, 
      specialization, 
      preferredJobTitles,
      page = 1,
      limit = 9
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // For now, in development, we show both APPROVED and PENDING jobs so 
    // the user can see their posted jobs immediately.
    const where: any = { 
      status: { in: ['APPROVED', 'PENDING'] } 
    };

    if (query) {
      if (query.specialty) {
        where.specialty = { contains: query.specialty, mode: 'insensitive' };
      }
      if (query.location) {
        where.location = { contains: query.location, mode: 'insensitive' };
      }
      if (query.jobType) {
        where.jobType = query.jobType;
      }
      if (query.keyword) {
        where.OR = [
          { title: { contains: query.keyword, mode: 'insensitive' } },
          { description: { contains: query.keyword, mode: 'insensitive' } },
        ];
      }
      if (query.companyId) {
        where.companyId = query.companyId;
        delete where.status; 
      }
      if (query.ownerId) {
        where.OR = [
          { Company: { ownerId: query.ownerId } },
          { postedById: query.ownerId }
        ];
        delete where.status;
      }
    }

    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        skip,
        take,
        include: {
          Company: {
            include: {
              CompanyImage: true,
            },
          },
          _count: { select: { Application: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where })
    ]);

    return { jobs, total };
  }

  async findOne(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    return this.prisma.job.findUnique({
      where: isUuid ? { id: identifier } : { slug: identifier },
      include: {
        Company: {
          include: {
            CompanyImage: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    try {
      console.log("Attempting to create job with data:", JSON.stringify(data, null, 2));
      
      // Check for active subscription
      const user = await this.prisma.user.findUnique({
        where: { id: data.postedById },
        include: { Subscription: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });

      if (!user) throw new BadRequestException('User not found');

      // Admins can bypass all checks
      const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'SUPPORT_ADMIN' || user.role === 'CONTENT_ADMIN';

      if (!isAdmin) {
        const latestSub = user.Subscription[0];
        const hasActiveSub = latestSub &&
          (latestSub.status === 'ACTIVE' || latestSub.status === 'PENDING_VERIFICATION');

        if (!hasActiveSub) {
          // Free tier: allow exactly 1 job without a subscription
          const existingJobCount = await this.prisma.job.count({
            where: { postedById: data.postedById }
          });
          if (existingJobCount >= 1) {
            throw new BadRequestException(
              'Free plan allows 1 job listing. Please subscribe to a plan to post more jobs.'
            );
          }
        }
      }

      // ── AUTO-APPROVAL LOGIC ──
      // If the Facility/Company is already APPROVED, we auto-approve the Job
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId }
      });
      
      if (company && company.status === 'APPROVED') {
        data.status = 'APPROVED';
      }

      const job = await this.prisma.job.create({
        data,
        include: { User: true } as any
      });
      
      // Notify Employer via Email and In-App Notification
      const owner = (job as any).User;
      if (owner) {
        this.mailService.sendJobManagementEmail(
          owner.email,
          owner.name || 'Employer',
          job.title,
          'ADDED'
        ).catch(err => console.error('Failed to send job added email:', err));

        this.notificationsService.createNotification(
          owner.id,
          'Job Successfully Posted',
          `Your job listing for "${job.title}" has been created and is live.`,
          NotificationType.JOB_APPROVED,
          { jobId: job.id }
        ).catch(err => console.error('Failed to send job added notification:', err));
      }

      console.log("Job created successfully:", job.id);
      return job;
    } catch (error) {
      console.error("CRITICAL: Job creation failed in Prisma:", error);
      // Propagate error with message if possible
      throw error;
    }
  }

  async saveJob(userId: string, jobId: string) {
    const existing = await this.prisma.savedJob.findFirst({
      where: { userId, jobId }
    });
    if (existing) return existing;
    return this.prisma.savedJob.create({
      data: { userId, jobId }
    });
  }

  async getSavedJobs(userId: string) {
    return this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        Job: {
          include: {
            Company: {
              include: {
                CompanyImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSavedJob(userId: string, savedJobId: string) {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: { id: savedJobId },
    });
    if (!savedJob || savedJob.userId !== userId) {
      throw new Error('Unauthorized or Not Found');
    }
    return this.prisma.savedJob.delete({ where: { id: savedJobId } });
  }

  async getRecommendedJobs(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { NurseProfile: true },
    });

    if (!user || !user.NurseProfile) {
      // If no profile, just return latest jobs
      return this.prisma.job.findMany({
        where: { status: 'APPROVED' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          Company: {
            include: {
              CompanyImage: true,
            },
          },
        },
      });
    }

    const { specialization, preferredJobTitles } = user.NurseProfile;

    // Use specialization or preferred job titles as search text
    // Prisma does full-text search, but simple ILike or contains is easier here
    const orConditions: any[] = [];
    
    if (specialization) {
      orConditions.push({ title: { contains: specialization, mode: 'insensitive' } });
      orConditions.push({ specialty: { contains: specialization, mode: 'insensitive' } });
    }

    if (preferredJobTitles && Array.isArray(preferredJobTitles)) {
      preferredJobTitles.forEach(title => {
        orConditions.push({ title: { contains: title, mode: 'insensitive' } });
      });
    }

    if (orConditions.length === 0) {
      return this.prisma.job.findMany({
        where: { status: 'APPROVED' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          Company: {
            include: {
              CompanyImage: true,
            },
          },
        },
      });
    }

    return this.prisma.job.findMany({
      where: {
        status: 'APPROVED',
        OR: orConditions,
      },
      include: {
        Company: {
          include: {
            CompanyImage: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  }
  async findAllAdmin() {
    return this.prisma.job.findMany({
      include: {
        Company: {
          include: {
            CompanyImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { User: true } as any
    });
    if (!job) throw new BadRequestException('Job not found');

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data,
    });

    const owner = (job as any).User;
    const status = data.status;
    if (owner && (status === 'CLOSED' || status === 'EXPIRED')) {
      this.mailService.sendJobManagementEmail(
        owner.email,
        owner.name || 'Employer',
        job.title,
        status as any
      ).catch(err => console.error(`Failed to send job status email (${status}):`, err));
    }

    return updatedJob;
  }

  async remove(id: string) {
    return this.prisma.job.delete({ where: { id } });
  }

  async updateStatus(id: string, status: any) {
    return this.update(id, { status });
  }
}
