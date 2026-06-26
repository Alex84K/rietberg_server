# Coding Conventions — rietberg_server

Соглашения, которых придерживается этот проект. Обязательны для всего нового кода.
Подробные архитектурные решения — в `MVP_ADR.md`.

---

## 1. Слои и зависимости

Зависимости направлены **внутрь, к домену**. Нарушение этого правила — ошибка архитектуры.

```
Interface → Application → Domain
                 ↑
          Infrastructure (реализует порты)
```

- **Domain** — чистый TypeScript. Без `@Injectable`, без Mongoose, без `@nestjs/*`.
- **Application** — use-cases. Зависит только от домена и портов (интерфейсов).
- **Infrastructure** — реализует порты. Только здесь живут Mongoose-схемы, argon2, JWT.
- **Interface** — контроллеры NestJS, class-validator DTO, guards.

---

## 2. Сущности и агрегаты

- Наследуй от `Entity` (`shared/domain/entity.base.ts`).
- Конструктор **приватный**. Два статических фабричных метода: `create(props)` и `reconstitute(props)`.
- Сущности **иммутабельны**: методы изменения возвращают **новый** экземпляр, не мутируют `this`.
- `id` — строковый UUID, генерируется в домене через `uuid()`. Никогда не `ObjectId`.
- Доменные инварианты защищает **агрегат** через `DomainError` — не контроллер.

```ts
// ✅ правильно
addSlot(props: CreateTimeSlotProps): Event {
  if (this.kind !== EventKind.REGISTRABLE) throw new DomainError('...');
  return new Event(...);
}

// ❌ неправильно — инвариант в контроллере
if (event.kind !== 'REGISTRABLE') throw new BadRequestException('...');
```

---

## 3. Value Objects

- Наследуй от `ValueObject` (`shared/domain/value-object.base.ts`).
- Реализуй `equals()` и `toString()`.
- Валидация при создании — в `static create()`, бросай `DomainError`.
- Для восстановления из хранилища без валидации — `static fromPersistence()`.

---

## 4. Use-cases

- Один файл — один use-case (`*.usecase.ts`).
- Класс декорирован `@Injectable()`.
- Зависимости инжектируются через `@Inject(DI_TOKEN)` с типом-интерфейсом порта.
- `DomainError` из use-case → контроллер перехватывает и бросает `BadRequestException`.
- Не возвращай persistence-типы (Mongoose-документы) из use-case — только доменные объекты.

```ts
@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,  // интерфейс, не класс
  ) {}
  async execute(command: CreateEventCommand): Promise<Event> { ... }
}
```

---

## 5. Репозитории (порты)

- Интерфейс объявляется в **домене** (`*.repository.ts`).
- DI-токен — в `shared/di-tokens.ts` (Symbol).
- Реализация (Mongo) — в `infrastructure/persistence/mongo/`.
- Метод `save()` работает как upsert (findOneAndUpdate + upsert: true).
- Маппинг domain ↔ persistence — **только в `*.mapper.ts`**. Нигде больше.

---

## 6. Mongoose-схемы

- `@Prop` с union-типом (`Date | null`, `string | null`) **всегда** указывает `type:` явно:
  ```ts
  @Prop({ required: false, default: null, type: Date })
  endsAt: Date | null;
  ```
- `id` — строковое поле с `unique: true, index: true`. Не используем `_id` как доменный идентификатор.
- Маппер (`*.mapper.ts`) — единственное место, где допустимо обращение к полям схемы.

---

## 7. Контроллеры

- Тонкие: только HTTP-маппинг и вызов use-case.
- Перехватывают `DomainError` → `BadRequestException`.
- `@Query()` с DTO-классом (class-validator) — никаких `@Query('param') p: string` без валидации.
- Числовые query-параметры декорируются `@Type(() => Number)` (из `class-transformer`).
- Статические пути объявляются **до** параметрических: `GET /events/all` до `GET /events/:id`.

---

## 8. DI-токены

Все символы — в `shared/di-tokens.ts`. Новые токены добавляются туда, а не локально в модуле.

```ts
export const EVENT_REPOSITORY = Symbol('EventRepository');
```

---

## 9. Datetime

- Все даты хранятся и передаются в **UTC**.
- В коде используй `new Date(isoString)` для парсинга; не используй локальные строки.
- Для проекции дат (ДР) используй `Date.UTC(year, month, day)` — без локального смещения.

---

## 10. Ошибки

- HTTP-ответ при ошибке всегда: `{ "error": "string" }` — не массив, не вложенный объект.
  Это гарантирует `AllExceptionsFilter` в `main.ts` (массив сообщений от `ValidationPipe` → join '; ').
- `DomainError` → контроллер → `BadRequestException` → 400.
- `NotFoundException` → 404 (бросается прямо из use-case или контроллера).

---

## 11. Именование файлов

```
<name>.<type>.ts

entity.base.ts         # базовый класс
user.entity.ts         # сущность / агрегат
role.vo.ts             # value object
schedule.vo.ts
user.repository.ts     # порт (интерфейс)
user.mongo.repository.ts  # адаптер (реализация)
user.schema.ts         # Mongoose-схема
user.mapper.ts         # маппер domain <-> persistence
create-user.usecase.ts # use-case
user-response.dto.ts   # DTO
users.controller.ts    # контроллер
user.module.ts         # NestJS-модуль
```
