import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async submitContact(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    // Save to database (remapping name to fullName and subject to serviceType)
    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        serviceType: data.subject,
        message: data.message,
        status: 'PENDING',
      },
    });

    // Notify admins (Email + Notification)
    // 1. Broadly fetch by role
    const adminsByRole = await this.prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN'] } },
      select: { id: true, email: true, role: true }
    });

    // 2. Specifically fetch the primary admin account if not already included
    const primaryAdmin = await this.prisma.user.findFirst({
        where: { email: 'qamerhassan455@gmail.com' },
        select: { id: true, email: true, role: true }
    });

    // Combine and deduplicate
    const adminMap = new Map<string, any>();
    adminsByRole.forEach(a => adminMap.set(a.id, a));
    if (primaryAdmin) adminMap.set(primaryAdmin.id, primaryAdmin);
    
    const admins = Array.from(adminMap.values());
    console.log(`Contact Submission: Notifying ${admins.length} administrators (including primary: ${!!primaryAdmin}).`);

    // We specifically want to ensure qamerhassan455@gmail.com is included 
    // (though naturally it's already a SUPER_ADMIN)
    
    for (const admin of admins) {
      // 1. Send Email
      await this.mailService.sendAdminContactUsEmail(
        admin.email,
        data.name,
        data.email,
        data.subject,
        data.message
      ).catch(e => console.error(`Failed to email admin ${admin.email}:`, e));

      // 2. Create Portal Notification
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'CONTACT_SUBMISSION' as any,
          title: 'New Contact Request',
          message: `Inquiry from ${data.name}: ${data.message}`,
          metadata: { serviceRequestId: serviceRequest.id }
        }
      }).catch(e => console.error(`Failed to create notification for admin ${admin.id}:`, e));
    }

    // 3. Send Confirmation Email to the User
    await this.mailService.sendUserContactConfirmationEmail(
      data.email,
      data.name,
      data.subject
    ).catch(e => console.error(`Failed to send confirmation email to user ${data.email}:`, e));

    return serviceRequest;
  }

  async getById(id: string) {
    return this.prisma.serviceRequest.findUnique({
      where: { id },
    });
  }
}
