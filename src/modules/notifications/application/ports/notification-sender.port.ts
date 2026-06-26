export interface RegistrationNotification {
  eventTitle: string;
  slotStartsAt: Date;
  participantEmail: string;
  participantFirstName: string;
  participantLastName: string;
  additionalGuests: number;
  adminEmail: string;
}

export interface WelcomeNotification {
  recipientEmail: string;
  firstName: string;
  lastName: string;
}

export interface NotificationSender {
  sendRegistrationConfirmation(data: RegistrationNotification): Promise<void>;
  sendWelcome(data: WelcomeNotification): Promise<void>;
}
