import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type {
  NotificationSender,
  RegistrationNotification,
} from '../notifications/application/ports/notification-sender.port';

@Injectable()
export class SmtpNotificationSender implements NotificationSender {
  private readonly logger = new Logger(SmtpNotificationSender.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host')!;
    const port = this.configService.get<number>('mail.port')!;
    const user = this.configService.get<string>('mail.user')!;
    const password = this.configService.get<string>('mail.password')!;

    this.fromAddress = user;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // STARTTLS on port 587
      auth: { user, pass: password },
    });
  }

  async sendRegistrationConfirmation(data: RegistrationNotification): Promise<void> {
    const dateStr = data.slotStartsAt.toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    await Promise.all([
      this.sendParticipantConfirmation(data, dateStr),
      this.sendAdminNotification(data, dateStr),
    ]);
  }

  private async sendParticipantConfirmation(
    data: RegistrationNotification,
    dateStr: string,
  ): Promise<void> {
    const guestLine =
      data.additionalGuests > 0
        ? `<p>Zusätzliche Gäste: <strong>${data.additionalGuests}</strong></p>`
        : '';

    const html = `
      <p>Liebe/r ${data.participantFirstName} ${data.participantLastName},</p>
      <p>Ihre Anmeldung für <strong>${data.eventTitle}</strong> am ${dateStr} wurde erfolgreich registriert.</p>
      ${guestLine}
      <p>Mit freundlichen Grüßen<br>CBG Rietberg</p>
    `;

    try {
      await this.transporter.sendMail({
        from: `"CBG Rietberg" <${this.fromAddress}>`,
        to: data.participantEmail,
        subject: `Anmeldebestätigung – ${data.eventTitle}`,
        html,
      });
      this.logger.log(`Confirmation sent → ${data.participantEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send confirmation to ${data.participantEmail}`, err);
    }
  }

  private async sendAdminNotification(
    data: RegistrationNotification,
    dateStr: string,
  ): Promise<void> {
    const html = `
      <p>Neue Anmeldung eingegangen:</p>
      <table>
        <tr><td><strong>Name:</strong></td><td>${data.participantFirstName} ${data.participantLastName}</td></tr>
        <tr><td><strong>E-Mail:</strong></td><td>${data.participantEmail}</td></tr>
        <tr><td><strong>Veranstaltung:</strong></td><td>${data.eventTitle}</td></tr>
        <tr><td><strong>Datum:</strong></td><td>${dateStr}</td></tr>
        <tr><td><strong>Zusätzliche Gäste:</strong></td><td>${data.additionalGuests}</td></tr>
      </table>
    `;

    try {
      await this.transporter.sendMail({
        from: `"CBG Rietberg" <${this.fromAddress}>`,
        to: data.adminEmail,
        subject: `Neue Anmeldung – ${data.eventTitle}`,
        html,
      });
      this.logger.log(`Admin notification sent → ${data.adminEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send admin notification to ${data.adminEmail}`, err);
    }
  }
}
