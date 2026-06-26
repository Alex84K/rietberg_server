import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'registrations', timestamps: false })
export class RegistrationSchema extends Document {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  slotId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, min: 0, default: 0 })
  additionalGuests: number;

  @Prop({ required: true })
  createdAt: Date;
}

export const RegistrationSchemaFactory = SchemaFactory.createForClass(RegistrationSchema);

// one user per event; prevents duplicate registration
RegistrationSchemaFactory.index({ eventId: 1, userId: 1 }, { unique: true });
