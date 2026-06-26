import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Registration } from '../../../domain/registration.entity';
import type { RegistrationRepository } from '../../../domain/registration.repository';
import { RegistrationSchema } from './registration.schema';
import { RegistrationMapper } from './registration.mapper';

@Injectable()
export class RegistrationMongoRepository implements RegistrationRepository {
  constructor(
    @InjectModel(RegistrationSchema.name)
    private readonly registrationModel: Model<RegistrationSchema>,
  ) {}

  async findById(id: string): Promise<Registration | null> {
    const doc = await this.registrationModel.findOne({ id }).exec();
    return doc ? RegistrationMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Registration[]> {
    const docs = await this.registrationModel.find({ userId }).exec();
    return docs.map(RegistrationMapper.toDomain);
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<Registration | null> {
    const doc = await this.registrationModel.findOne({ eventId, userId }).exec();
    return doc ? RegistrationMapper.toDomain(doc) : null;
  }

  async findBySlotId(slotId: string): Promise<Registration[]> {
    const docs = await this.registrationModel.find({ slotId }).exec();
    return docs.map(RegistrationMapper.toDomain);
  }

  async countOccupancy(slotId: string): Promise<number> {
    const result = await this.registrationModel
      .aggregate([
        { $match: { slotId } },
        { $group: { _id: null, total: { $sum: { $add: [1, '$additionalGuests'] } } } },
      ])
      .exec();
    return result[0]?.total ?? 0;
  }

  async save(registration: Registration): Promise<void> {
    const doc = RegistrationMapper.toPersistence(registration);
    await this.registrationModel
      .findOneAndUpdate({ id: registration.id }, doc, { upsert: true, new: true })
      .exec();
  }

  async deleteByEventId(eventId: string): Promise<void> {
    await this.registrationModel.deleteMany({ eventId }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.registrationModel.deleteOne({ id }).exec();
  }
}
