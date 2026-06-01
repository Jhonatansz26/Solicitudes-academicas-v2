import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { NotificationsService } from './notifications.service';
import { UserCreatedListener } from './listeners/user-created.listener';
import { RequestStatusChangedListener } from './listeners/request-status-changed.listener';

@Module({
  imports: [EmailModule],
  providers: [
    NotificationsService,
    UserCreatedListener,
    RequestStatusChangedListener,
  ],
  exports: [NotificationsService, EmailModule],
})
export class NotificationsModule {}
