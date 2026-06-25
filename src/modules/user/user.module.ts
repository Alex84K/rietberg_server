import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserSchemaFactory } from './infrastructure/persistence/mongo/user.schema';
import { UserMongoRepository } from './infrastructure/persistence/mongo/user.mongo.repository';
import { USER_REPOSITORY } from '../../shared/di-tokens';
import { ListUsersUseCase } from './application/usecases/list-users.usecase';
import { GetUserUseCase } from './application/usecases/get-user.usecase';
import { UpdateUserUseCase } from './application/usecases/update-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { UsersController } from './interface/http/users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSchema.name, schema: UserSchemaFactory }]),
  ],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserMongoRepository },
    ListUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  controllers: [UsersController],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
