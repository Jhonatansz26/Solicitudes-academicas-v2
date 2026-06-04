import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { NotificationsService } from './notifications.service';
import { UserCreatedListener } from './listeners/user-created.listener';
import { RequestStatusChangedListener } from './listeners/request-status-changed.listener';
import { OfficialDocumentNotificationListener } from '../official-documents/official-document-notification.listener';
import { OfficialDocumentsModule } from '../official-documents/official-documents.module';

@Module({
  imports: [EmailModule, OfficialDocumentsModule],
  providers: [
    NotificationsService,
    UserCreatedListener,
    RequestStatusChangedListener,
    OfficialDocumentNotificationListener,
  ],
  exports: [NotificationsService, EmailModule],
})
export class NotificationsModule {}
