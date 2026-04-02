import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll() {
    return this.prisma.company.findMany({
      where: { status: 'APPROVED' },
      include: {
        CompanyImage: true,
      },
    });
  }

  async findOne(slug: string) {
    return this.prisma.company.findUnique({
      where: { slug },
      include: {
        CompanyImage: true,
        Job: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' }
        },
        User: {
          include: {
            EmployerProfile: true
          }
        }
      },
    });
  }

  async create(data: any) {
    const company = await this.prisma.company.create({
      data,
      include: { User: true } as any
    });

    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'CONTENT_ADMIN'] } },
      select: { email: true }
    });

    for (const admin of admins) {
      await this.mailService.sendAdminNewCompanyEmail(
        admin.email,
        company.name
      ).catch(e => console.error('Failed to notify admin of new company:', e));

      // NEW: Create In-App Notification
      const adminUser = await this.prisma.user.findUnique({ where: { email: admin.email } });
      if (adminUser) {
        await this.prisma.notification.create({
          data: {
            userId: adminUser.id,
            type: 'COMPANY_APPROVED' as any, // Reusing existing enum type for new company alerts
            title: 'New Company Registration',
            message: `New company: ${company.name} is awaiting review.`,
            metadata: { companyId: company.id }
          }
        }).catch(e => console.error('Failed to create in-app notification for admin:', e));
      }
    }

    return company;
  }

  async addReview(companyId: string, reviewerId: string, reviewData: any) {
    // Basic verification to ensure company exists
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Company not found');

    return this.prisma.review.create({
      data: {
        rating: reviewData.rating,
        comment: reviewData.comment,
        metadata: reviewData.metadata,
        companyId,
        reviewerId,
      }
    });
  }

  async getSavedCompanies(userId: string) {
    return this.prisma.savedCompany.findMany({
      where: { userId },
      include: {
        Company: {
          include: {
            Job: { where: { status: 'APPROVED' } },
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSavedCompany(userId: string, savedCompanyId: string) {
    const savedCompany = await this.prisma.savedCompany.findUnique({
      where: { id: savedCompanyId },
    });
    if (!savedCompany || savedCompany.userId !== userId) {
      throw new Error('Unauthorized or Not Found');
    }
    return this.prisma.savedCompany.delete({ where: { id: savedCompanyId } });
  }
  async findAllAdmin() {
    const companies = await this.prisma.company.findMany({
      include: {
        CompanyImage: true,
        User: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return companies.map(company => ({
      id: company.id,
      name: company.name,
      logoUrl: company.logoUrl || company.CompanyImage?.[0]?.url || null, // Fallbacks
      email: (company as any).User?.email || null,
      status: company.status,
      slug: company.slug,
      isFeatured: company.isFeatured,
      createdAt: company.createdAt
    }));
  }

  async findOneAdmin(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        User: {
          include: { EmployerProfile: true }
        }
      }
    });

    if (!company) return null;

    let staffCount = 0;
    const sizeStr = (company as any).User?.EmployerProfile?.companySize;
    if (sizeStr) {
      if (sizeStr.includes('-')) {
        staffCount = parseInt(sizeStr.split('-')[1]) || 0;
      } else if (sizeStr.includes('+')) {
        staffCount = parseInt(sizeStr.replace('+', '')) || 0;
      } else {
        staffCount = parseInt(sizeStr) || 0;
      }
    }

    const result = {
      id: company.id,
      name: company.name,
      logoUrl: company.logoUrl || null,
      description: company.description || null,
      staffCount: staffCount,
      email: (company as any).User?.email || null,
      createdAt: company.createdAt
    };
    
    console.log("ADMIN COMPANY DATA:", result);
    return result;
  }

  async updateStatus(id: string, status: any) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { User: true } as any
    });

    if (!company) throw new Error('Company not found');

    const cleanStatus = String(status).trim();
    const fromClient = require('@prisma/client');
    const CompanyStatus = fromClient.CompanyStatus;
    
    if (!CompanyStatus || !CompanyStatus[cleanStatus]) {
      throw new Error(`Invalid status enum value provided: ${cleanStatus}`);
    }

    const updated = await this.prisma.company.update({
      where: { id },
      data: { status: CompanyStatus[cleanStatus] },
    });

  // If status is being updated to APPROVED, notify the owner and activate their account
    if (status === 'APPROVED' && company.status !== 'APPROVED') {
      const owner = (company as any).User;
      if (owner) {
        // Auto-activate the owner's user account if it's PENDING
        if (owner.status === 'PENDING') {
          await this.prisma.user.update({
            where: { id: owner.id },
            data: { status: 'ACTIVE' }
          }).catch(err => console.error(`Failed to auto-activate user ${owner.id}:`, err));
        }

        if (owner.email) {
          this.mailService.sendEmployerApprovedEmail(owner.email, owner.name || 'Employer').catch(err => 
            console.error(`Failed to send approval email for company ${id}:`, err)
          );
        }
      }
    } else if (status === 'REJECTED' && (company.status as string) !== 'REJECTED') {
      const owner = (company as any).User;
      if (owner && owner.email) {
         this.mailService.sendEmployerRejectedEmail(owner.email, owner.name || 'Employer').catch(err => 
           console.error(`Failed to send rejection email for company ${id}:`, err)
         );
      }
    }

    return updated;
  }

  async toggleFeatured(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new Error('Company not found');
    
    return this.prisma.company.update({
      where: { id },
      data: { 
        isFeatured: !company.isFeatured,
        featuredAt: !company.isFeatured ? new Date() : null
      },
    });
  }

  async deleteCompanyAdmin(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new Error('Company not found');
    
    return this.prisma.company.delete({
      where: { id }
    });
  }
}
