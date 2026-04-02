import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsAdminController } from './payments-admin.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule, NotificationsModule, MailModule],
  controllers: [PaymentsController, PaymentsAdminController],
  providers: [PdfGeneratorService, PaymentsService],
  exports: [PdfGeneratorService, PaymentsService],
})
export class PaymentsModule {}
