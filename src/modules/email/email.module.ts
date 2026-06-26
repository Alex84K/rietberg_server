import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NOTIFICATION_SENDER } from '../../shared/di-tokens';
import { SmtpNotificationSender } from './smtp-notification.sender';

@Module({
  imports: [ConfigModule],
  providers: [
    SmtpNotificationSender,
    { provide: NOTIFICATION_SENDER, useExisting: SmtpNotificationSender },
  ],
  exports: [NOTIFICATION_SENDER],
})
export class EmailModule {}
