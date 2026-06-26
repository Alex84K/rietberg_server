import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../../../domain/event.aggregate';
import type { EventRepository, PaginatedEvents } from '../../../domain/event.repository';
import { EventSchema } from './event.schema';
import { EventMapper } from './event.mapper';

@Injectable()
export class EventMongoRepository implements EventRepository {
  constructor(
    @InjectModel(EventSchema.name)
    private readonly eventModel: Model<EventSchema>,
  ) {}

  async findById(id: string): Promise<Event | null> {
    const doc = await this.eventModel.findOne({ id }).exec();
    return doc ? EventMapper.toDomain(doc) : null;
  }

  async findByDateRange(from: Date, to: Date): Promise<Event[]> {
    const docs = await this.eventModel
      .find({
        'schedule.startsAt': { $lte: to },
        'schedule.endsAt': { $gte: from },
      })
      .sort({ 'schedule.startsAt': 1 })
      .exec();
    return docs.map(EventMapper.toDomain);
  }

  async findAllPaginated(skip: number, limit: number): Promise<PaginatedEvents> {
    const [docs, total] = await Promise.all([
      this.eventModel
        .find()
        .sort({ 'schedule.startsAt': -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments().exec(),
    ]);
    return { items: docs.map(EventMapper.toDomain), total };
  }

  async save(event: Event): Promise<void> {
    const doc = EventMapper.toPersistence(event);
    await this.eventModel
      .findOneAndUpdate({ id: event.id }, doc, { upsert: true, new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.eventModel.deleteOne({ id }).exec();
  }
}
