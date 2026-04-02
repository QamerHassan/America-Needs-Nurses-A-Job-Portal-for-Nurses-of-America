import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async findByEmail(email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        NurseProfile: true,
        EmployerProfile: true,
      },
    });

    // Auto-create/promote designated admin
    if (email === 'qamerhassan455@gmail.com') {
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            name: 'Qamer Hassan',
            password: '8ETj7@Zv',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            isOnboarded: true,
          },
          include: {
            NurseProfile: true,
            EmployerProfile: true,
          },
        });
      } else if (user.role !== 'SUPER_ADMIN') {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
          include: {
            NurseProfile: true,
            EmployerProfile: true,
          },
        });
      }
    }

    return user;
  }

  async findOrCreateByGoogle(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { email, name, picture } = payload;

      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { NurseProfile: true, EmployerProfile: true }
      });

      if (!user) {
        // Create user with GUEST role or handle redirection to onboarding
        user = await this.prisma.user.create({
          data: {
            email,
            name: name || '',
            image: picture,
            role: 'NURSE', // Defaulting to Nurse for now, can be updated during onboarding
            status: 'ACTIVE',
            isOnboarded: false,
          },
          include: { NurseProfile: true, EmployerProfile: true }
        });

        // Send Welcome Email
        this.mailService.sendWelcomeEmail(user.email, user.name || 'User').catch(err => 
          console.error('Failed to send welcome email (Google):', err)
        );
      }

      return user;
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async findById(id: string) {
    // Update lastSeen asynchronously so we don't slow down the main query
    this.updateLastSeen(id).catch(err => 
      console.error(`Failed to update lastSeen for user ${id}:`, err)
    );

    return this.prisma.user.findUnique({
      where: { id },
      include: {
        NurseProfile: true,
        EmployerProfile: true,
      },
    });
  }

  /**
   * Update the user's last activity timestamp
   */
  async updateLastSeen(id: string) {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { lastSeen: new Date() } as any
      });
    } catch (error) {
      console.error(`Error updating lastSeen for user ${id}:`, error);
    }
  }

  async updateEmployerProfile(userId: string, data: any) {
    const { 
      hospitalName, hospitalId, companyCategory, about, phone, location, 
      logoUrl, bannerUrl, companySize, foundedYear, revenue, videoUrl, tags,
      address, addressLine2, city, state, zipCode, country,
      latitude, longitude, twitter, instagram, linkedin, googlePlus, facebook,
      website, ...rest 
    } = data;

    // 1. Update User (Name and Image)
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: hospitalName || undefined,
        image: logoUrl || undefined,
      },
    });

    // 2. Update or Create EmployerProfile
    await this.prisma.employerProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: hospitalName,
        about,
        companyCategory,
        companySize,
        foundedYear,
        revenue,
        videoUrl,
        bannerUrl,
        tags: Array.isArray(tags) ? tags : [],
        phone,
        website,
        location,
        address,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        facebook,
        twitter,
        instagram,
        linkedin,
        googlePlus,
      } as any,
      update: {
        companyName: hospitalName || undefined,
        about: about || undefined,
        companyCategory: companyCategory || undefined,
        companySize: companySize || undefined,
        foundedYear: foundedYear || undefined,
        revenue: revenue || undefined,
        videoUrl: videoUrl || undefined,
        bannerUrl: bannerUrl === "" ? null : (bannerUrl || undefined),
        tags: Array.isArray(tags) ? tags : undefined,
        phone: phone || undefined,
        website: website || undefined,
        location: location || undefined,
        address: address || undefined,
        addressLine2: addressLine2 || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        facebook: facebook || undefined,
        twitter: twitter || undefined,
        instagram: instagram || undefined,
        linkedin: linkedin || undefined,
        googlePlus: googlePlus || undefined,
      } as any
    });

    // 3. Update or Create Company (Critical for Job Linkage)
    // We try to find a company owned by this user
    const existingCompany = await this.prisma.company.findFirst({
      where: { ownerId: userId }
    });

    if (existingCompany) {
      await this.prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          name: hospitalName || existingCompany.name,
          description: about || existingCompany.description,
          logoUrl: logoUrl === "" ? null : (logoUrl || existingCompany.logoUrl),
          bannerUrl: bannerUrl === "" ? null : (bannerUrl || existingCompany.bannerUrl),
          category: companyCategory || existingCompany.category,
          phone: phone || existingCompany.phone,
          address: location || existingCompany.address,
          website: website || existingCompany.website,
        } as any
      });
    } else {
      await this.prisma.company.create({
        data: {
          name: hospitalName || "My Hospital",
          slug: (hospitalName || "hospital").toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
          category: companyCategory || "Healthcare",
          description: about || "No description provided.",
          logoUrl,
          bannerUrl,
          phone,
          address: location,
          website,
          ownerId: userId,
          status: 'APPROVED'
        } as any
      });
    }

    // 4. Return Final Refetched User (Guaranteeing data consistency)
    const finalUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { EmployerProfile: true }
    });
    
    return { message: 'Profile updated successfully', user: finalUser };
  }

  async create(data: any) {
    const { 
      hospitalName, location, website, logoUrl, imageUrl, phone, 
      fullName, licenseType, licenseNumber, specialization,
      ...userData 
    } = data;

    let user;

    if (userData.role === 'EMPLOYER') {
      user = await this.prisma.user.create({
        data: {
          ...userData,
          image: logoUrl,
          status: 'PENDING',
          EmployerProfile: {
            create: {
              companyName: hospitalName,
              location,
              website,
              phone,
              bannerUrl: imageUrl || undefined,
            } as any
          }
        } as any,
        include: {
          EmployerProfile: true,
        }
      });
    } else if (userData.role === 'NURSE') {
      user = await this.prisma.user.create({
        data: {
          ...userData,
          status: 'ACTIVE',
          NurseProfile: {
            create: {
              fullName: userData.name || fullName,
              phone,
              location,
              licenseType,
              licenseNumber,
              specialization,
            }
          }
        },
        include: {
          NurseProfile: true,
        }
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          ...userData,
          status: 'ACTIVE',
        },
      });
    }

    // Send Welcome Email
    try {
      if (user.role === 'EMPLOYER') {
        const adminUsers = await this.prisma.user.findMany({
          where: { role: { in: ['SUPER_ADMIN', 'CONTENT_ADMIN'] } },
          select: { id: true, email: true }
        });
        
        await this.mailService.sendEmployerWelcomeEmail(
          user.email, 
          user.name || 'Employer'
        );

        // Notify admins via email & in-app notification
        for (const admin of adminUsers) {
          await this.mailService.sendAdminNewEmployerEmail(
            admin.email,
            user.name || 'Employer'
          ).catch(e => console.error('Failed to send admin alert:', e));

          // In-App Notification
          await this.prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'COMPANY_APPROVED' as any, // Reuse enum type
              title: 'New Employer Registration',
              message: `${user.EmployerProfile?.companyName || 'A new healthcare facility'} just registered and is awaiting your review.`,
              metadata: { userId: user.id }
            }
          }).catch(e => console.error('Failed to create in-app notification for admin:', e));
        }

      } else {
        await this.mailService.sendWelcomeEmail(user.email, user.name || 'User');
      }
    } catch (err) {
      console.error('❌ Registration Email Failed:', err.message);
    }

    return user;
  }

  async getDashboardData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        NurseProfile: true,
        EmployerProfile: true,
        Subscription: {
          include: { SubscriptionPlan: true },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!user) return null;

    const applicationsCount = await this.prisma.application.count({
      where: { userId },
    });

    const savedJobsCount = await this.prisma.savedJob.count({
      where: { userId },
    });

    const notifMessages: Record<string, string> = {
      APPLICATION_UPDATE: 'Your job application status has been updated.',
      NEW_MESSAGE: 'You have a new message from a recruiter.',
      JOB_APPROVED: 'A job you were interested in has been approved.',
      JOB_EXPIRED: 'A job posting has expired.',
      COMPANY_APPROVED: 'A healthcare company you follow has been approved.',
      NEWSLETTER: 'You have a new ANN newsletter.',
      SUBSCRIPTION_EXPIRY: 'Your subscription is expiring soon.',
      COMMUNITY_REPORT: 'There is a new community update for you.',
      CONTACT_SUBMISSION: 'New contact message received.',
    };

    const recentNotifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const enrichedNotifications = recentNotifications.map(n => ({
      ...n,
      message: n.message || notifMessages[n.type] || 'You have a new notification.',
    }));

    const reviewCount = await this.prisma.review.count({
      where: { nurseId: userId },
    });

    const alertCount = await this.prisma.job.count({
      where: { status: 'APPROVED' },
    });

    const unreadMessagesCount = await this.prisma.message.count({
      where: { 
        Conversation: {
          ConversationMember: {
            some: { userId }
          }
        },
        NOT: { senderId: userId },
        status: 'SENT'
      },
    });

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'CONTENT_ADMIN' || user.role === 'SUPPORT_ADMIN';

    if (isAdmin) {
      const companyCount = await this.prisma.company.count();
      const jobCount = await this.prisma.job.count();
      const nurseCount = await this.prisma.user.count({ where: { role: 'NURSE' } });
      const pendingCompanies = await this.prisma.company.count({ where: { status: 'PENDING' } });
      const pendingJobs = await this.prisma.job.count({ where: { status: 'PENDING' } });
      const pendingSubscriptions = await this.prisma.subscription.count({ where: { status: 'PENDING_VERIFICATION' } });

      const recentPendingCompanies = await this.prisma.company.findMany({
        where: { status: 'PENDING' },
        include: { User: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const recentPendingJobs = await this.prisma.job.findMany({
        where: { status: 'PENDING' },
        include: { Company: { select: { name: true, logoUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return {
        user,
        stats: {
          companyCount,
          jobCount,
          nurseCount,
          pendingCompanies,
          pendingJobs,
          pendingSubscriptions,
          alertCount,
          unreadMessagesCount,
        },
        recentPendingCompanies,
        recentPendingJobs,
        notifications: enrichedNotifications,
      };
    }

    if (user.role === 'EMPLOYER') {
      const employerWithProfile = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { 
          EmployerProfile: true,
          Subscription: {
            include: { SubscriptionPlan: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      if (!employerWithProfile) throw new Error('User not found');

      // Ensure EmployerProfile exists (Self-Healing Phase 1)
      if (!employerWithProfile.EmployerProfile) {
        console.log(`Auto-creating EmployerProfile for user ${userId}`);
        const newProfile = await this.prisma.employerProfile.create({
          data: {
            userId: userId,
            companyName: employerWithProfile.name || 'New Healthcare Group',
          }
        });
        employerWithProfile.EmployerProfile = newProfile;
      }

      let companies = await this.prisma.company.findMany({
        where: { ownerId: userId },
        include: { CompanyImage: true }
      });

      // Ensure Company exists (Self-Healing Phase 2)
      if (companies.length === 0) {
        console.log(`Auto-creating Company for employer ${userId}`);
        const newCompany = await this.prisma.company.create({
          data: {
            name: user.EmployerProfile?.companyName || user.name || 'My Healthcare Facility',
            slug: (user.EmployerProfile?.companyName || user.name || 'facility').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 7),
            category: 'Hospital',
            description: 'Healthcare facility profile.',
            ownerId: userId,
            status: 'PENDING',
            address: employerWithProfile.EmployerProfile?.location,
            phone: employerWithProfile.EmployerProfile?.phone,
            website: employerWithProfile.EmployerProfile?.website,
          },
          include: { CompanyImage: true }
        });
        companies = [newCompany];
      }

      // Sync user object for return
      const finalEmployerUser = { ...user, ...employerWithProfile };

      const companyIds = companies.map(c => c.id);
      
      const jobsCount = await this.prisma.job.count({
        where: { 
          OR: [
            { companyId: { in: companyIds } },
            { postedById: userId }
          ]
        }
      });
      
      const totalApplicationsCount = await this.prisma.application.count({
        where: { 
          Job: { 
            OR: [
              { companyId: { in: companyIds } },
              { postedById: userId }
            ]
          } 
        }
      });
      
      const shortlistedCount = await this.prisma.application.count({
        where: { 
          Job: { 
            OR: [
              { companyId: { in: companyIds } },
              { postedById: userId }
            ]
          },
          status: 'SHORTLISTED'
        }
      });
 
      const recentJobs = await this.prisma.job.findMany({
        where: { 
          OR: [
            { companyId: { in: companyIds } },
            { postedById: userId }
          ]
        },
        include: { 
          Company: { include: { CompanyImage: true } },
          _count: { select: { Application: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      // Calculate 14-day Analytics Time-Series
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const [historyApps, historyJobs] = await Promise.all([
        this.prisma.application.findMany({
          where: {
            Job: { OR: [{ companyId: { in: companyIds } }, { postedById: userId }] },
            appliedAt: { gte: fourteenDaysAgo }
          },
          select: { appliedAt: true, status: true, updatedAt: true }
        }),
        this.prisma.job.findMany({
          where: {
            OR: [{ companyId: { in: companyIds } }, { postedById: userId }],
            createdAt: { gte: fourteenDaysAgo }
          },
          select: { createdAt: true }
        })
      ]);

      const dailyAnalytics = {
        dates: [] as string[],
        applications: new Array(14).fill(0),
        shortlisted: new Array(14).fill(0),
        jobs: new Array(14).fill(0),
      };

      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        const dateStr = d.toISOString().split('T')[0];
        const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyAnalytics.dates.push(displayDate);
        
        dailyAnalytics.applications[i] = historyApps.filter(a => a.appliedAt.toISOString().split('T')[0] === dateStr).length;
        dailyAnalytics.shortlisted[i] = historyApps.filter(a => a.status === 'SHORTLISTED' && a.updatedAt.toISOString().split('T')[0] === dateStr).length;
        dailyAnalytics.jobs[i] = historyJobs.filter(j => j.createdAt.toISOString().split('T')[0] === dateStr).length;
      }
 
      return {
        user: finalEmployerUser,
        companies,
        recentJobs,
        stats: {
          jobsCount,
          totalApplicationsCount,
          shortlistedCount,
          unreadMessagesCount,
          alertCount
        },
        dailyAnalytics,
        notifications: enrichedNotifications,
      };
    }

    return {
      user,
      stats: {
        applicationsCount,
        savedJobsCount,
        viewedJobsCount: 0,
        reviewCount,
        alertCount,
        unreadMessagesCount,
      },
      notifications: enrichedNotifications,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== oldPassword) {
      throw new ConflictException('Incorrect current password.');
    }

    // In a real application, hash the newPassword with bcrypt before saving
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    // Always return a generic success message to prevent email enumeration
    const successMessage = { message: 'If an account with this email exists, a password reset link has been sent.' };
    
    if (!user) {
      return successMessage;
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 15 minutes expiry
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    // Save hashed token
    await this.prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        type: 'PASSWORD_RESET',
        expires,
      }
    });

    // Send email with RAW token
    await this.mailService.sendPasswordResetEmail(email, rawToken);

    return successMessage;
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const verifyToken = await this.prisma.verificationToken.findUnique({
      where: { token: hashedToken }
    });

    if (!verifyToken || verifyToken.type !== 'PASSWORD_RESET') {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (new Date() > verifyToken.expires) {
      // Invalidate expired token
      await this.prisma.verificationToken.delete({ where: { id: verifyToken.id } });
      throw new BadRequestException('Invalid or expired reset token.');
    }

    // Update password
    await this.prisma.user.update({
      where: { email: verifyToken.identifier },
      data: { password: newPassword }
    });

    // Invalidate the token
    await this.prisma.verificationToken.delete({ where: { id: verifyToken.id } });

    return { message: 'Password has been reset successfully.' };
  }

  async findAllNurses() {
    return this.prisma.user.findMany({
      where: { role: 'NURSE' },
      include: {
        NurseProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmins() {
    return this.prisma.user.findMany({
      where: { 
        role: { in: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN'] } 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRole(id: string, role: any) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updateStatus(id: string, status: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    // If Employer is approved, send email
    if (user.role === 'EMPLOYER' && status === 'ACTIVE' && user.status !== 'ACTIVE') {
      this.mailService.sendEmployerApprovedEmail(user.email, user.name || 'Employer').catch(err => 
        console.error('Failed to send approval email:', err)
      );
    }

    // If Employer is suspended or banned, send notification
    if (user.role === 'EMPLOYER' && (status === 'SUSPENDED' || status === 'BANNED')) {
      this.mailService.sendAccountStatusNotificationEmail(
        user.email,
        user.name || 'Employer',
        status
      ).catch(err => console.error(`Failed to send status update email (${status}):`, err));
    }

    return updatedUser;
  }



  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
