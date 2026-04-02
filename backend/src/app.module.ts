import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';
import { UsersModule } from './users/users.module';
import { NurseModule } from './nurse/nurse.module';
import { ApplicationsModule } from './applications/applications.module';
import { ConversationsModule } from './conversations/conversations.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BlogModule } from './blog/blog.module';
import { StripeModule } from './stripe/stripe.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommunityModule } from './community/community.module';
import { StorageController } from './storage/storage.controller';
import { ContactModule } from './contact/contact.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    CommunityModule,
    PrismaModule,
    CompaniesModule,
    JobsModule,
    UsersModule,
    NurseModule,
    ApplicationsModule,
    ConversationsModule,
    NewsletterModule,
    SubscriptionsModule,
    BlogModule,
    StripeModule,
    MailModule,
    ContactModule,
    ReportsModule,
    NotificationsModule,
    UploadsModule,
    PaymentsModule
  ],
  controllers: [AppController, StorageController],
  providers: [AppService],
})
export class AppModule {}



