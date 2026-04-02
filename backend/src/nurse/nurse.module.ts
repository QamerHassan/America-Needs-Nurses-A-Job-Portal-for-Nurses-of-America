import { Module } from '@nestjs/common';
import { NurseController } from './nurse.controller';
import { NurseService } from './nurse.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [NurseController],
  providers: [NurseService],
  exports: [NurseService],
})
export class NurseModule {}
