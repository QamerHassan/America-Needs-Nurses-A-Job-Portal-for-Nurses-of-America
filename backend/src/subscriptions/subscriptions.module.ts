import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { PlansController } from './plans.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, NotificationsModule, PaymentsModule, MailModule],
  controllers: [SubscriptionsController, PlansController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
