import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../domain/user.entity';
import { UserRepository } from '../../../domain/user.repository';
import { UserSchema } from './user.schema';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserSchema>,
  ) {}

  async create(user: User): Promise<void> {
    const doc = UserMapper.toPersistence(user);
    await this.userModel.create(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ id }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await this.userModel.find().exec();
    return docs.map((doc) => UserMapper.toDomain(doc));
  }

  async update(user: User): Promise<void> {
    const doc = UserMapper.toPersistence(user);
    await this.userModel.findOneAndUpdate({ id: user.id }, doc).exec();
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ id }).exec();
  }
}
