import { Injectable, Logger } from '@nestjs/common';
import type {
  NotificationSender,
  RegistrationNotification,
} from '../application/ports/notification-sender.port';

/** Temporary stub — replace with SmtpSender when SMTP is configured */
@Injectable()
export class StubNotificationSender implements NotificationSender {
  private readonly logger = new Logger(StubNotificationSender.name);

  async sendRegistrationConfirmation(data: RegistrationNotification): Promise<void> {
    this.logger.log(
      `[STUB] Registration confirmation → ${data.participantEmail} for "${data.eventTitle}"`,
    );
  }
}
