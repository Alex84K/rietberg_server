export interface RegistrationNotification {
  eventTitle: string;
  slotStartsAt: Date;
  participantEmail: string;
  participantFirstName: string;
  participantLastName: string;
  additionalGuests: number;
  adminEmail: string;
}

export interface NotificationSender {
  sendRegistrationConfirmation(data: RegistrationNotification): Promise<void>;
}
