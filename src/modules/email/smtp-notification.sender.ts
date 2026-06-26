import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type {
  NotificationSender,
  RegistrationNotification,
  WelcomeNotification,
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

  async sendWelcome(data: WelcomeNotification): Promise<void> {
    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

        <tr>
          <td style="background:#1a3a5c;padding:28px 40px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.5px;">CBG Rietberg</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 16px;font-size:16px;color:#222;">Liebe/r ${data.firstName} ${data.lastName},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
              herzlich willkommen! Ihr Konto wurde erfolgreich erstellt.
              Ab sofort können Sie sich für Veranstaltungen anmelden.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 36px;">
            <hr style="border:none;border-top:1px solid #e8e8e8;margin:0 0 24px;">
            <p style="margin:0;font-size:13px;color:#999;">Mit freundlichen Grüßen &mdash; CBG Rietberg</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from: `"CBG Rietberg" <${this.fromAddress}>`,
        to: data.recipientEmail,
        subject: 'Willkommen bei CBG Rietberg',
        html,
      });
      this.logger.log(`Welcome email sent → ${data.recipientEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${data.recipientEmail}`, err);
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
