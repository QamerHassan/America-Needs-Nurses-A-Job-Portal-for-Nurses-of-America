import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async getMyApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        Job: {
          include: {
            Company: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async deleteApplication(userId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.application.delete({
      where: { id: applicationId },
    });
  }

  async getEmployerApplications(employerId: string) {
    return this.prisma.application.findMany({
      where: {
        Job: {
          OR: [
            { Company: { ownerId: employerId } },
            { postedById: employerId },
          ],
        },
      },
      include: {
        Job: true,
        User: {
          include: {
            NurseProfile: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Apply to a job — sends confirmation email to the nurse
   */
  async applyToJob(
    userId: string,
    jobId: string,
    coverLetter?: string,
    resumeUrl?: string,
    experience?: any,
  ) {
    // Prevent duplicate applications
    const existing = await this.prisma.application.findFirst({
      where: { userId, jobId },
    });
    if (existing) throw new Error('You have already applied to this job.');

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { Company: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    const application = await this.prisma.application.create({
      data: {
        userId,
        jobId,
        coverLetter,
        resumeUrl,
        experience: experience || {},
        status: 'PENDING',
      },
      include: {
        User: true,
      },
    });

    // Send confirmation email to the applicant
    this.mailService
      .sendApplicationSubmittedEmail(
        application.User.email,
        application.User.name || 'Nurse',
        job.title,
        job.Company?.name || 'the employer',
      )
      .catch((err) =>
        console.error('Failed to send application confirmation email:', err),
      );

    // Notify Employer of the new application
    const employerId = job.postedById || job.Company?.ownerId;
    if (employerId) {
      const employer = await this.prisma.user.findUnique({ where: { id: employerId } });
      
      if (employer && employer.email) {
        this.mailService.sendNewApplicationToEmployerEmail(
          employer.email,
          employer.name || 'Employer',
          application.User.name || 'A candidate',
          job.title,
          application.id
        ).catch(e => console.error('Failed to email employer about new application:', e));
      }

      this.notificationsService.createNotification(
        employerId,
        'New Job Application',
        `${application.User.name || 'A candidate'} has applied to your job: ${job.title}`,
        NotificationType.NEW_APPLICATION,
        { jobId: job.id, applicationId: application.id }
      ).catch(e => console.error('Failed to notify employer of new application', e));
    }

    return application;
  }

  /**
   * Update application status — sends status update email to the nurse
   */
  async updateStatus(applicationId: string, status: any, employerId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        Job: { include: { Company: true } },
        User: true,
      },
    });

    if (!application) throw new Error('Application not found');

    const isOwner = application.Job.Company?.ownerId === employerId;
    const isPoster = application.Job.postedById === employerId;

    if (!isOwner && !isPoster) throw new Error('Unauthorized');

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    // Send status update email to the applicant
    this.mailService
      .sendApplicationStatusEmail(
        application.User.email,
        application.User.name || 'Nurse',
        application.Job.title,
        application.Job.Company?.name || 'the employer',
        status,
      )
      .catch((err) =>
        console.error('Failed to send application status email:', err),
      );

    // Track status change in-app
    this.notificationsService.createNotification(
      application.userId,
      'Application Update',
      `Your application for ${application.Job.title} has been moved to ${status}.`,
      NotificationType.APPLICATION_UPDATE,
      { jobId: application.jobId, applicationId: application.id }
    ).catch(e => console.error('Failed to send in-app application status notification:', e));

    return updated;
  }
}