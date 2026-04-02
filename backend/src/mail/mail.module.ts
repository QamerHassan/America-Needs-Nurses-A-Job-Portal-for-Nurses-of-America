import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NotificationsTask } from './notifications.task';

@Global()
@Module({
  providers: [MailService, NotificationsTask],
  exports: [MailService],
})
export class MailModule {}
