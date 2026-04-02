import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller'; // Admin Controller
import { BlogsController } from './blogs.controller'; // Public Controller (For Fixes 404)
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [NotificationsModule, MailModule],
  // Dono controllers ko register karna zaroori hai taake 
  // /admin/blogs aur /blog dono raste (routes) kaam karein.
  controllers: [
    BlogController, 
    BlogsController
  ],
  providers: [BlogService],
  exports: [BlogService], // BlogService ko doosre modules (jaise Mail) mein use karne ke liye
})
export class BlogModule {}