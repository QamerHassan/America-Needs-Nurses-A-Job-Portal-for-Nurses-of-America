import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly debugLogPath = path.join(process.cwd(), 'mail-debug.log');

  constructor() {
    this.logDebug('MailService initialized');
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('Mail server connection established successfully');
      this.logDebug('âœ… SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('Failed to connect to mail server', error);
      this.logDebug(`âŒ SMTP connection failed: ${error.message}`);
    }
  }

  private logDebug(message: string) {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.debugLogPath, log);
  }

  // â”€â”€â”€ Shared Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private wrapInLayout(content: string, previewText = ''): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ANN Platform</title>
  <style>
    body { margin:0; padding:0; background:#f4f6fb; font-family:'Segoe UI',Arial,sans-serif; }
    .email-wrapper { width:100%; background:#f4f6fb; padding:32px 0; }
    .email-card { max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,40,104,0.10); }
    .email-header { background:linear-gradient(135deg,#002868 0%,#001f5b 100%); padding:32px 40px 28px; text-align:center; }
    .email-header .logo-text { font-size:22px; font-weight:900; color:#ffffff; letter-spacing:1px; }
    .email-header .logo-sub { font-size:11px; color:rgba(255,255,255,0.65); letter-spacing:3px; text-transform:uppercase; margin-top:4px; }
    .accent-bar { height:4px; background:linear-gradient(90deg,#C8102E 0%,#e63c5e 50%,#C8102E 100%); }
    .email-body { padding:36px 40px 28px; }
    .email-footer { background:#f8f9fc; border-top:1px solid #e8ecf2; padding:20px 40px; text-align:center; }
    .email-footer p { font-size:11px; color:#aab0bc; margin:4px 0; line-height:1.6; }
    .email-footer a { color:#C8102E; text-decoration:none; }
    h1 { font-size:22px; color:#002868; font-weight:800; margin:0 0 12px; line-height:1.3; }
    h2 { font-size:18px; color:#002868; font-weight:700; margin:0 0 10px; }
    p { font-size:14px; color:#4a5568; line-height:1.7; margin:0 0 14px; }
    .btn { display:inline-block; background:linear-gradient(135deg,#C8102E,#a50d26); color:#ffffff!important; padding:13px 28px; border-radius:8px; text-decoration:none; font-size:14px; font-weight:700; letter-spacing:0.04em; margin:8px 0 18px; }
    .btn-blue { background:linear-gradient(135deg,#002868,#001f5b); }
    .info-box { background:#f0f4ff; border-left:4px solid #002868; border-radius:0 8px 8px 0; padding:14px 18px; margin:16px 0; }
    .info-box p { margin:0; font-size:13px; color:#2d3748; }
    .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; letter-spacing:0.04em; }
    .badge-green { background:#e6f9f0; color:#22863a; }
    .badge-red { background:#fff0f3; color:#C8102E; }
    .badge-blue { background:#e8eeff; color:#002868; }
    .badge-yellow { background:#fffbea; color:#b7791f; }
    .divider { height:1px; background:#e8ecf2; margin:20px 0; }
    .stat-row { display:flex; gap:12px; margin:18px 0; }
    .stat-box { flex:1; background:#f8f9fc; border-radius:10px; padding:14px; text-align:center; }
    .stat-box .stat-val { font-size:22px; font-weight:900; color:#002868; }
    .stat-box .stat-label { font-size:11px; color:#8a94a6; margin-top:2px; }
    @media(max-width:600px){
      .email-body{ padding:24px 20px 20px; }
      .email-header{ padding:24px 20px 20px; }
      .email-footer{ padding:16px 20px; }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>` : ''}
  <div class="email-wrapper">
    <div class="email-card">
      <div class="email-header">
        <div class="logo-text">ðŸ¥ ANN Platform</div>
        <div class="logo-sub">America Needs Nurses</div>
      </div>
      <div class="accent-bar"></div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <p>Â© 2026 America Needs Nurses Platform. All rights reserved.</p>
        <p>You are receiving this email because you have an account on <a href="${process.env.FRONTEND_URL}">ANN Platform</a>.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  // â”€â”€â”€ Core Send â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendMail(to: string, subject: string, html: string, text?: string, attachments?: any[]): Promise<void> {
    this.logger.log(`Attempting to send email to: ${to} | Subject: ${subject}`);
    try {
      const from = process.env.MAIL_FROM || `ANN Platform <${process.env.MAIL_USER}>`;
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ''),
        html,
        attachments,
      });
      this.logger.log(`âœ… Email sent to ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`âŒ Failed to send email to ${to}: ${error.message}`);
      // Log failure but don't crash the app - as per requirements
    }
  }

  // â”€â”€â”€ 1. Welcome Email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'ðŸŽ‰ Welcome to America Needs Nurses!';
    const html = this.wrapInLayout(`
      <h1>Welcome aboard, ${name}! ðŸ‘‹</h1>
      <p>Thank you for joining <strong>America Needs Nurses</strong>. We're excited to have you as part of our community.</p>
      <div class="info-box">
        <p>Complete your profile to start connecting with top healthcare facilities.</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/nurse" class="btn">Get Started â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  async sendEmployerWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'ðŸ¥ Welcome to the ANN Employer Network!';
    const html = this.wrapInLayout(`
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for choosing <strong>America Needs Nurses</strong> for your recruitment needs.</p>
      <div class="info-box">
        <p>Your account is currently being reviewed. You'll receive another notification once you're approved to post jobs.</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/employer/dashboard" class="btn btn-blue">Go to Dashboard â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ 2. Job Application Submitted â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendApplicationSubmittedEmail(to: string, name: string, jobTitle: string, companyName: string) {
    const subject = `âœ… Application Submitted â€” ${jobTitle}`;
    const html = this.wrapInLayout(`
      <h1>Application Received!</h1>
      <p>Hi ${name}, your application for ${jobTitle} at ${companyName} was received.</p>
      <a href="${process.env.FRONTEND_URL}/nurse/applications" class="btn btn-blue">View My Applications â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ 3. Application Status Updated â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendNewApplicationToEmployerEmail(to: string, employerName: string, applicantName: string, jobTitle: string, applicationId: string) {
    const subject = `ðŸ“¬ New Applicant for ${jobTitle}`;
    const html = this.wrapInLayout(`
      <h1>New Job Application</h1>
      <p>Hi ${employerName}, ${applicantName} applied for ${jobTitle}.</p>
      <a href="${process.env.FRONTEND_URL}/employer/applicants" class="btn btn-blue">Review Application â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  async sendApplicationStatusEmail(to: string, name: string, jobTitle: string, companyName: string, status: string) {
    const subject = `ðŸ“‹ Application Update â€” ${jobTitle}`;
    const html = this.wrapInLayout(`
      <h1>Application Status Update</h1>
      <p>Hi ${name}, your application for ${jobTitle} status is now ${status}.</p>
      <a href="${process.env.FRONTEND_URL}/nurse/applications" class="btn btn-blue">View Application â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ 4. Employer Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendEmployerApprovedEmail(to: string, name: string): Promise<void> {
    const subject = 'âœ… Your Employer Account is Approved!';
    const html = this.wrapInLayout(`
      <h1>You're Approved, ${name}!</h1>
      <p>Your employer account has been verified. You can now start posting jobs and reviewing applicants.</p>
      <a href="${process.env.FRONTEND_URL}/employer/dashboard" class="btn btn-blue">Start Recruiting â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  async sendEmployerRejectedEmail(to: string, name: string): Promise<void> {
    const subject = 'âš ï¸ Update on Your Employer Account Application';
    const html = this.wrapInLayout(`
      <h1>Update on Your Application, ${name}</h1>
      <p>Unfortunately, we are unable to approve your account at this time.</p>
      <div class="info-box">
        <p>If you believe this is an error, please respond to this email with additional documentation.</p>
      </div>
    `);
    return this.sendMail(to, subject, html);
  }

  async sendAccountStatusNotificationEmail(to: string, name: string, status: string, reason?: string): Promise<void> {
    const isActive = status.toUpperCase() === 'ACTIVE' || status.toUpperCase() === 'APPROVED';
    const subject = `ðŸ”” Account Status Updated: ${status}`;
    const html = this.wrapInLayout(`
      <h1>Account Update</h1>
      <p>Hi ${name}, your account status has been updated to <strong>${status}</strong>.</p>
      ${reason ? `<div class="info-box"><p><strong>Note:</strong> ${reason}</p></div>` : ''}
      ${isActive ? `<a href="${process.env.FRONTEND_URL}/login" class="btn btn-blue">Sign In â†’</a>` : ''}
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ 5. Messaging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendNewMessageEmail(to: string, recipientName: string, senderName: string, senderRole: string, preview: string, conversationId: string) {
    const subject = `ðŸ’¬ New message from ${senderName}`;
    const html = this.wrapInLayout(`
      <h1>You have a new message</h1>
      <p>Hi ${recipientName}, ${senderName} sent you a message.</p>
      <a href="${process.env.FRONTEND_URL}/messages/${conversationId}" class="btn">Reply Now â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ 6. Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendNewBlogPostNotification(to: string, userName: string, postTitle: string, postSlug: string) {
    const subject = `ðŸ“– New Article: ${postTitle}`;
    const html = this.wrapInLayout(`
      <h1>New Story on the ANN Blog</h1>
      <p>Hi ${userName}, we just published: ${postTitle}</p>
      <a href="${process.env.FRONTEND_URL}/blog/${postSlug}" class="btn">Read the Article â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ 7. Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const subject = 'ðŸ”‘ Reset Your ANN Password';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = this.wrapInLayout(`
      <h1>Password Reset Request</h1>
      <a href="${resetUrl}" class="btn">Reset My Password â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ 8. Billing & Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendCompanyPaymentReceivedEmail(to: string, name: string, planName: string) {
    const subject = 'âœ… Payment Received â€” Account Activated';
    const html = this.wrapInLayout(`
      <h1>Payment Confirmed!</h1>
      <p>Hi ${name}, payment received for <strong>${planName}</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/employer/dashboard" class="btn">Start Recruiting â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }


  async sendNewsletterEmail(to: string, subject: string, content: string): Promise<void> {
    const html = this.wrapInLayout(`
      <h1>ANN Weekly Update</h1>
      <div style="margin-top: 20px;">
        ${content}
      </div>
      <div class="divider"></div>
      <p style="font-size: 11px; color: #aab0bc; text-align: center;">
        You are receiving this as a subscriber to the ANN Newsletter. 
        <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
      </p>
    `, "Our latest news and updates from America Needs Nurses");
    return this.sendMail(to, subject, html);
  }

  async sendJobManagementEmail(to: string, name: string, jobTitle: string, action: string): Promise<void> {
    const subject = `ðŸ“¢ Job Post ${action.charAt(0) + action.slice(1).toLowerCase()}: ${jobTitle}`;
    const html = this.wrapInLayout(`
      <h1>Job Management Update</h1>
      <p>Hi ${name},</p>
      <p>Your job posting <strong>${jobTitle}</strong> has been updated to: <span class="badge badge-blue">${action}</span></p>
      <a href="${process.env.FRONTEND_URL}/employer/jobs" class="btn btn-blue">Manage Your Jobs â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  async sendCommunityOfflineDigestEmail(to: string, name: string, totalUnread: number, previews: any[]): Promise<void> {
    const subject = `ðŸ’¬ While you were away: ANN Digest (${totalUnread} new messages)`;
    const previewsHtml = previews.length > 0 
      ? previews.map(m => `
          <div style="border-bottom: 1px solid #f0f0f0; padding: 12px 0;">
            <p style="margin: 0; font-weight: 700; color: #002868;">${m.senderName}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #718096; font-style: italic;">"${m.preview}"</p>
          </div>
        `).join('')
      : '<p style="color: #718096; text-align: center; padding: 20px 0;">Join the conversation today!</p>';

    const html = this.wrapInLayout(`
      <h1>Community Digest</h1>
      <p>Hi ${name}, you have <strong>${totalUnread}</strong> unread messages waiting for you.</p>
      <div class="info-box">
        ${previewsHtml}
      </div>
      <a href="${process.env.FRONTEND_URL}/community" class="btn">Join the Conversation â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  async sendSubscriptionExpiryReminderEmail(to: string, name: string, expiryDate: Date): Promise<void> {
    const dateStr = new Date(expiryDate).toLocaleDateString(undefined, { dateStyle: 'long' });
    const subject = `âŒ› Action Required: Subscription Expiring`;
    const html = this.wrapInLayout(`
      <h1>Subscription Reminder</h1>
      <p>Hi ${name}, your current subscription is set to expire on <strong>${dateStr}</strong>.</p>
      <div class="info-box">
        <p>Renew now to keep your active job postings and access to the candidate database.</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/employer/billing" class="btn">Renew Subscription â†’</a>
    `);
    return this.sendMail(to, subject, html);
  }

  async sendUserContactConfirmationEmail(to: string, name: string, originalQuery: string): Promise<void> {
    const subject = 'ðŸ“« We received your message!';
    const html = this.wrapInLayout(`
      <h1>Message Received</h1>
      <p>Hi ${name}, thank you for reaching out to America Needs Nurses.</p>
      <p>Our team has received your inquiry and will get back to you shortly.</p>
      <div class="info-box">
        <p><strong>Your Message:</strong></p>
        <p style="font-style: italic;">"${originalQuery}"</p>
      </div>
    `);
    return this.sendMail(to, subject, html);
  }

  // â”€â”€â”€ Admin Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendAdminContactUsEmail(adminEmail: string, senderName: string, senderEmail: string, subject: string, message: string): Promise<void> {
    const emailSubject = `ðŸ“¬ [CONTACT] ${subject} from ${senderName}`;
    const html = this.wrapInLayout(`
      <h1>New Contact Submission</h1>
      <div class="info-box">
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Subject:</strong> ${subject}</p>
      </div>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `, `New inquiry from ${senderName}`);
    return this.sendMail(adminEmail, emailSubject, html);
  }

  async sendAdminNewEmployerEmail(adminEmail: string, employerName: string): Promise<void> {
    const subject = `ðŸš€ New Employer Registration: ${employerName}`;
    const html = this.wrapInLayout(`
      <h1>New Employer Registration</h1>
      <p>A new employer has registered: <strong>${employerName}</strong></p>
      <a href="${process.env.FRONTEND_URL}/admin/employers" class="btn btn-blue">Review Enrollment â†’</a>
    `);
    return this.sendMail(adminEmail, subject, html);
  }

  async sendAdminNewCompanyEmail(adminEmail: string, companyName: string): Promise<void> {
    const subject = `ðŸ¢ New Company Registration: ${companyName}`;
    const html = this.wrapInLayout(`
      <h1>New Company Created</h1>
      <p>A new company profile has been created: <strong>${companyName}</strong></p>
      <a href="${process.env.FRONTEND_URL}/admin/companies" class="btn">Manage Companies â†’</a>
    `);
    return this.sendMail(adminEmail, subject, html);
  }

  async sendAdminNewReportEmail(adminEmail: string, data: any): Promise<void> {
    const subject = `ðŸš© New Community Report`;
    const html = this.wrapInLayout(`
      <h1>Community Flag Alert</h1>
      <p>A new issue has been reported in the community.</p>
      <div class="info-box">
        <p><strong>Category:</strong> ${data.category || 'N/A'}</p>
        <p><strong>Target:</strong> ${data.targetType || 'General'}</p>
        <p><strong>Reporter:</strong> ${data.reporterName || 'Anonymous'}</p>
        <div class="divider"></div>
        <p><strong>Message:</strong></p>
        <p style="font-style: italic;">"${data.message || 'No details provided'}"</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/admin/reports" class="btn badge-red">View Reports â†’</a>
    `);
    return this.sendMail(adminEmail, subject, html);
  }

  // â”€â”€â”€ 10. Billing & Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendPaymentReceiptEmail(to: string, name: string, invoiceId: string, amount: string, currency: string, pdfBuffer: Buffer): Promise<void> {
    const subject = `ðŸ“„ Your Payment Receipt: #${invoiceId}`;
    const html = this.wrapInLayout(`
      <h1>Payment Receipt</h1>
      <p>Hi ${name}, thank you for your payment!</p>
      <div class="info-box">
        <p><strong>Order ID:</strong> #${invoiceId}</p>
        <p><strong>Total Amount:</strong> ${amount} ${currency}</p>
      </div>
      <p>Please find your official PDF receipt attached for your records.</p>
      <p>Ready to get started? Log in to your dashboard to manage your jobs.</p>
      <a href="${process.env.FRONTEND_URL}/login" class="btn">Access Your Dashboard â†’</a>
    `);

    return this.sendMail(to, subject, html, undefined, [
      {
        filename: `receipt-${invoiceId}.pdf`,
        content: pdfBuffer,
      },
    ]);
  }

  async sendPaymentStatusUpdateEmail(to: string, name: string, status: 'APPROVED' | 'REJECTED', reason?: string): Promise<void> {
    const isApproved = status === 'APPROVED';
    const subject = isApproved ? 'âœ… Payment Verified: Your account is ACTIVE' : 'âŒ Payment Verification Failed';
    
    const html = this.wrapInLayout(`
      <h1>Payment Verification: ${status}</h1>
      <p>Hi ${name},</p>
      <p>The manual payment proof you submitted has been <strong>${status.toLowerCase()}</strong> by our billing team.</p>
      
      <div class="info-box">
        ${isApproved 
          ? '<p>Great news! Your subscription is now <strong>active</strong>. You can now post jobs and access all premium features.</p>'
          : `<p>Unfortunately, we could not verify your payment at this time. ${reason ? `<br><br><strong>Reason:</strong> ${reason}` : ''}</p>`
        }
      </div>

      ${isApproved 
        ? `<a href="${process.env.FRONTEND_URL}/employer/dashboard" class="btn btn-blue">Start Recruiting â†’</a>`
        : `<a href="${process.env.FRONTEND_URL}/subscriptions/success" class="btn badge-red">Provide Correct Proof â†’</a>`
      }
    `);

    return this.sendMail(to, subject, html);
  }

  async sendPaymentVerificationAdminAlert(adminEmail: string, employerName: string, transactionId: string): Promise<void> {
    const subject = `ðŸ” Manual Payment for Review: #${transactionId.substring(0, 8)}`;
    const html = this.wrapInLayout(`
      <h1>Manual Receipt Pending Review</h1>
      <p>Employer <strong>${employerName}</strong> has submitted a manual payment receipt.</p>
      <div class="info-box">
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p>Please review the uploaded proof and verify the transaction in the admin dashboard.</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/admin/payments" class="btn btn-blue">Review Now â†’</a>
    `);
    return this.sendMail(adminEmail, subject, html);
  }
 
   async sendAdminManualPaymentInvoiceEmail(employerName: string, planName: string, amount: string, currency: string, pdfBuffer: Buffer, logoUrl?: string): Promise<void> {
     const adminEmail = 'qamerhassan455@gmail.com';
     const subject = `ðŸ”” Manual Payment Pending Review: ${employerName}`;
     
     const html = this.wrapInLayout(`
       <div style="text-align: center; margin-bottom: 20px;">
         ${logoUrl ? `<img src="${logoUrl}" alt="${employerName}" style="max-height: 80px; border-radius: 8px; margin-bottom: 15px;">` : ''}
         <h1>Manual Payment Alert</h1>
       </div>
       <p>A manual bank transfer has been initiated by <strong>${employerName}</strong>.</p>
       
       <div class="info-box">
         <p><strong>Plan:</strong> ${planName}</p>
         <p><strong>Amount:</strong> ${amount} ${currency}</p>
         <p><strong>Status:</strong> PENDING_VERIFICATION</p>
       </div>
 
       <p>The Pro-forma invoice is attached to this email. Please verify the payment in the bank account and then approve the subscription in the admin dashboard.</p>
       <a href="${process.env.FRONTEND_URL}/admin/payments" class="btn btn-blue">Manage Subscriptions â†’</a>
     `);
 
     return this.sendMail(adminEmail, subject, html, undefined, [
       {
         filename: `pro-forma-invoice.pdf`,
         content: pdfBuffer,
       },
     ]);
   }
 }
