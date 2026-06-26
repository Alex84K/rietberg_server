import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EVENT_REPOSITORY, REGISTRATION_REPOSITORY, BIRTHDAY_REPOSITORY } from '../../shared/di-tokens';
import { UserModule } from '../user/user.module';
import { NotificationsModule } from '../notifications/notifications.module';

// Schemas
import { EventSchema, EventSchemaFactory } from './infrastructure/persistence/mongo/event.schema';
import { RegistrationSchema, RegistrationSchemaFactory } from './infrastructure/persistence/mongo/registration.schema';
import { BirthdaySchema, BirthdaySchemaFactory } from './infrastructure/persistence/mongo/birthday.schema';

// Repositories
import { EventMongoRepository } from './infrastructure/persistence/mongo/event.mongo.repository';
import { RegistrationMongoRepository } from './infrastructure/persistence/mongo/registration.mongo.repository';
import { BirthdayMongoRepository } from './infrastructure/persistence/mongo/birthday.mongo.repository';

// Event use cases
import { CreateEventUseCase } from './application/usecases/create-event.usecase';
import { GetEventUseCase } from './application/usecases/get-event.usecase';
import { ListEventsUseCase } from './application/usecases/list-events.usecase';
import { DeleteEventUseCase } from './application/usecases/delete-event.usecase';
import { UpdateEventUseCase } from './application/usecases/update-event.usecase';
import { AddTimeSlotUseCase } from './application/usecases/add-time-slot.usecase';
import { DeleteTimeSlotUseCase } from './application/usecases/delete-time-slot.usecase';
import { RegisterToSlotUseCase } from './application/usecases/register-to-slot.usecase';
import { CancelRegistrationUseCase } from './application/usecases/cancel-registration.usecase';
import { ListSlotRegistrationsUseCase } from './application/usecases/list-slot-registrations.usecase';
import { ListSlotParticipantsUseCase } from './application/usecases/list-slot-participants.usecase';
import { GetMyRegistrationsUseCase } from './application/usecases/get-my-registrations.usecase';

// Birthday use cases
import { ListAllEventsUseCase } from './application/usecases/list-all-events.usecase';
import { ListBirthdaysUseCase } from './application/usecases/list-birthdays.usecase';
import { GetBirthdayUseCase } from './application/usecases/get-birthday.usecase';
import { CreateBirthdayUseCase } from './application/usecases/create-birthday.usecase';
import { UpdateBirthdayUseCase } from './application/usecases/update-birthday.usecase';
import { DeleteBirthdayUseCase } from './application/usecases/delete-birthday.usecase';

// Controllers
import { EventsController } from './interface/http/events.controller';
import { RegistrationsController } from './interface/http/registrations.controller';
import { BirthdaysController } from './interface/http/birthdays.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventSchema.name, schema: EventSchemaFactory },
      { name: RegistrationSchema.name, schema: RegistrationSchemaFactory },
      { name: BirthdaySchema.name, schema: BirthdaySchemaFactory },
    ]),
    UserModule,
    NotificationsModule,
  ],
  providers: [
    { provide: EVENT_REPOSITORY, useClass: EventMongoRepository },
    { provide: REGISTRATION_REPOSITORY, useClass: RegistrationMongoRepository },
    { provide: BIRTHDAY_REPOSITORY, useClass: BirthdayMongoRepository },
    // Event
    CreateEventUseCase,
    ListAllEventsUseCase,
    GetEventUseCase,
    ListEventsUseCase,
    DeleteEventUseCase,
    UpdateEventUseCase,
    AddTimeSlotUseCase,
    DeleteTimeSlotUseCase,
    RegisterToSlotUseCase,
    CancelRegistrationUseCase,
    ListSlotRegistrationsUseCase,
    ListSlotParticipantsUseCase,
    GetMyRegistrationsUseCase,
    // Birthday
    ListBirthdaysUseCase,
    GetBirthdayUseCase,
    CreateBirthdayUseCase,
    UpdateBirthdayUseCase,
    DeleteBirthdayUseCase,
  ],
  controllers: [EventsController, RegistrationsController, BirthdaysController],
})
export class CalendarModule {}
