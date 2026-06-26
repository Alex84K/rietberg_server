import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Birthday } from '../../../domain/birthday.entity';
import type { BirthdayRepository } from '../../../domain/birthday.repository';
import { BirthdaySchema } from './birthday.schema';
import { BirthdayMapper } from './birthday.mapper';

@Injectable()
export class BirthdayMongoRepository implements BirthdayRepository {
  constructor(
    @InjectModel(BirthdaySchema.name)
    private readonly birthdayModel: Model<BirthdaySchema>,
  ) {}

  async findAll(): Promise<Birthday[]> {
    const docs = await this.birthdayModel.find().exec();
    return docs.map(BirthdayMapper.toDomain);
  }

  async findById(id: string): Promise<Birthday | null> {
    const doc = await this.birthdayModel.findOne({ id }).exec();
    return doc ? BirthdayMapper.toDomain(doc) : null;
  }

  async save(birthday: Birthday): Promise<void> {
    const doc = BirthdayMapper.toPersistence(birthday);
    await this.birthdayModel
      .findOneAndUpdate({ id: birthday.id }, doc, { upsert: true, new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.birthdayModel.deleteOne({ id }).exec();
  }
}
