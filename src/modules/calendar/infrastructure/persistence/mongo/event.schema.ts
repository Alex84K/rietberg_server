import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class TimeSlotSubSchema {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: false, default: null, type: Date })
  endsAt: Date | null;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: false, default: null, type: String })
  label: string | null;

  @Prop({ required: true })
  createdAt: Date;
}

export const TimeSlotSubSchemaFactory = SchemaFactory.createForClass(TimeSlotSubSchema);

@Schema({ collection: 'events', timestamps: false })
export class EventSchema extends Document {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: true, enum: ['ANNOUNCEMENT', 'REGISTRABLE'] })
  kind: string;

  @Prop({
    required: true,
    type: {
      startsAt: Date,
      endsAt: Date,
      allDay: Boolean,
    },
  })
  schedule: {
    startsAt: Date;
    endsAt: Date;
    allDay: boolean;
  };

  @Prop({ type: [TimeSlotSubSchemaFactory], default: [] })
  slots: TimeSlotSubSchema[];

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const EventSchemaFactory = SchemaFactory.createForClass(EventSchema);

EventSchemaFactory.index({ 'schedule.startsAt': 1, 'schedule.endsAt': 1 });
