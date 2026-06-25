# Rietberg Server — Backend ADR (MVP)

Architecture Decision Record для бэкенда `rietberg_server`. Фиксирует решения по стеку,
архитектуре (DDD), базе данных и доменной модели. Продуктовый контекст и фронтенд — в
`project_docs/MVP.md`; здесь — только бэкенд.

Формат: каждое решение — `Status / Context / Decision / Consequences`.
Статусы: **Accepted** (принято), **Proposed** (предложено), **Superseded** (заменено).

---

## ADR-001 — Стек бэкенда: NestJS + Bun

**Status:** Accepted

**Context.** Нужен типобезопасный backend для корпоративного календаря (≤500 юзеров).
Команда выбирает TypeScript. Существует пустой скаффолд `rietberg_server` (NestJS 11,
`@nestjs/swagger`, class-validator) под Bun.

**Decision.** **NestJS + Bun**. NestJS даёт модульность, DI и структуру под DDD; Bun —
быстрый рантайм и тулинг. Swagger (`@nestjs/swagger`) — для документации API.

**Consequences.**
- DI-контейнер NestJS используем для подключения адаптеров к портам (см. ADR-002/003).
- Зависимости должны быть Bun-совместимы (Mongoose — ок).
- Нагрузки нет (≤500 юзеров) — оптимизируем простоту и скорость разработки, не масштаб.

---

## ADR-002 — Архитектура: DDD + гексагональная (Ports & Adapters)

**Status:** Accepted

**Context.** Приложение должно переживать смену БД и обрастание функциями (события, записи,
ДР, позже — интеграции и трансляция) без переписывания ядра. Legacy (Go) смешивал HTTP,
бизнес-логику и SQL в одном слое — это повторять нельзя.

**Decision.** Слоистая гексагональная архитектура. Зависимости направлены **внутрь, к домену**:

```
Interface (HTTP)  →  Application (use-cases)  →  Domain (ядро)
                            ↘ Ports ↙
                     Infrastructure (адаптеры: Mongo, SMTP, JWT, Google)
```

- **Domain** — сущности, value objects, доменные правила, **интерфейсы репозиториев (порты)**.
  Чистый TypeScript: без декораторов NestJS, без Mongoose, без HTTP.
- **Application** — use-cases (команды/запросы), оркестрация, **порты внешних сервисов**
  (`NotificationSender`, `TokenService`, `CalendarSyncPort`). Зависит только от Domain.
- **Infrastructure** — адаптеры, реализующие порты: Mongo-репозитории, SMTP, JWT, хеш паролей.
- **Interface** — NestJS-контроллеры, HTTP-DTO (class-validator), guards.

**Consequences.**
- Порты объявляются в Domain/Application, реализации инжектятся через NestJS-токены (ADR-003).
- Тестируемость: use-cases тестируются с in-memory реализациями портов.
- Дисциплина обязательна: запрещены утечки инфраструктурных типов в домен (ADR-004).

---

## ADR-003 — База данных: MongoDB на старте, готовность к PostgreSQL

**Status:** Accepted

**Context.** Рассматривались SQLite (просто, но плохо для прода/конкурентности/фоновых джоб),
MongoDB (Atlas free tier — беззаботная инфраструктура) и PostgreSQL (лучшая технология для
реляционной природы домена: события↔слоты↔записи). Объём данных мал.

**Decision.** **Стартуем на MongoDB Atlas (free)** через Mongoose ради бесплатной беззаботной
инфраструктуры. Но БД **изолирована за портами репозиториев**, чтобы перейти на PostgreSQL
без изменений в домене и application.

```ts
// domain/user.repository.ts
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
export const USER_REPOSITORY = Symbol('UserRepository');

// identity.module.ts — единственное место, где «торчит» Mongo
providers: [
  { provide: USER_REPOSITORY, useClass: UserMongoRepository },
  RegisterUseCase,
]
```

**Переход Mongo → Postgres** (домен/application не трогаются):
1. Написать `*PostgresRepository`, реализующие те же порты (Drizzle/TypeORM или `pg`).
2. Поменять `useClass` в провайдерах (или флаг `DB_DRIVER=mongo|postgres`).
3. Перенести данные миграционным скриптом.

**Consequences.**
- Цена выбора нереляционной БД для реляционных данных **гасится** абстракцией — но только при
  строгом соблюдении ADR-004. Дисциплина обязательна, не опциональна.
- Транзакционные инварианты (вместимость слота) формулируются на уровне application, а не на
  особенностях Mongo.

---

## ADR-004 — Правила изоляции персистентности (чтобы переход на Postgres был дешёвым)

**Status:** Accepted

**Context.** Абстракция из ADR-003 ломается, если в домен протекают mongo-специфичные типы.

**Decision.** Обязательные правила:
- **ID — строковый UUID, генерируется в домене**, а не БД. Никаких `ObjectId` в домене.
- Никаких mongo-специфичных запросов в use-case — всё через методы порта.
- **Мапперы (`*.mapper.ts`)** — единственное место конвертации domain ↔ хранилище.
- **Datetime — всегда UTC + таймзона** (не «наивные» локальные строки, как в legacy). Нужно и
  для Postgres `timestamptz`, и для будущей интеграции с календарями (ADR-010).
- На сущностях — `updatedAt`/версия (для инкрементальной синхронизации в будущем).

**Consequences.** Код домена остаётся переносимым; стоимость миграции БД — написание адаптеров,
а не правка бизнес-логики.

---

## ADR-005 — Bounded Contexts и структура модулей

**Status:** Accepted

**Context.** Нужно разделить ответственность, чтобы контексты развивались независимо.

**Decision.** Три bounded context'а:
- **Identity & Access** — реализован **двумя модулями** (ADR-005a): `UserModule` (агрегат
  `User`, роли, управление пользователями) и `AuthModule` (логинизация: register/login/refresh/me,
  JWT, хеш паролей, guards). Зависимость: `AuthModule → UserModule`.
- **Calendar** — события, слоты, записи (календарь #1).
- **Notifications** — отправка писем (позже Telegram).

Дни рождения (календарь #2) — лёгкий агрегат (ADR-009); Google Calendar (#3) — адаптер (ADR-010).

Структура каталогов (`rietberg_server/src`):
```
src/
  shared/                       # ядро: базовые классы (entity.base, value-object.base), DI-токены, domain-error, result
  modules/
    user/                          # агрегат User: данные, роли, управление (admin CRUD)
      domain/        (user.entity, role.vo, user.repository [ПОРТ])
      application/   (create/update/delete/get/list user usecases)
      infrastructure/(persistence/mongo/{user.schema, user.mongo.repository, user.mapper})
      interface/http/(users.controller, dto/)
      user.module.ts               # экспортирует USER_REPOSITORY
    auth/                          # логинизация: аутентификация и выдача токенов
      application/   (register, login, refresh, get-me usecases; ports/{token-service, password-hasher})
      infrastructure/(argon2.hasher, jwt-token.service, jwt.strategy, jwt-auth.guard, roles.guard)
      interface/http/(auth.controller, dto/)
      auth.module.ts               # imports UserModule (работает через USER_REPOSITORY)
    calendar/
      domain/        (event.aggregate, time-slot.entity, registration.entity, birthday.entity,
                      event.repository [ПОРТ], registration.repository [ПОРТ], birthday.repository [ПОРТ])
      application/   (create-event, add-time-slot, register-to-slot, list-events, manage-birthdays usecases)
      infrastructure/persistence/mongo/(event.schema, event.mongo.repository, registration.*, birthday.*)
      interface/http/(events.controller, registrations.controller, birthdays.controller)
      calendar.module.ts
    notifications/
      application/ports/notification-sender.port.ts
      infrastructure/(smtp.sender.ts, templates/{confirmation.de, admin-notify})  # telegram.sender — позже
      notifications.module.ts
  app.module.ts
  main.ts
```

**Consequences.** Контексты слабо связаны; общий код — только в `shared/`.

---

## ADR-005a — Разделение Identity на UserModule и AuthModule

**Status:** Accepted (уточняет ADR-005)

**Context.** Изначально ADR-005 держал auth, пользователей и роли в одном модуле `identity`.
На практике у них разные причины меняться: управление пользователями (admin-CRUD, профиль, роли) —
это про *данные*, а логинизация (пароли, токены, сессии, guards) — про *аутентификацию*. Их
смешение раздувает один модуль и путает границы.

**Decision.** Два отдельных NestJS-модуля внутри контекста Identity & Access:

- **UserModule** — владелец агрегата `User`: `user.entity`, `Role` VO, порт `UserRepository` и его
  Mongo-адаптер, use-cases управления пользователями, `users.controller` (admin). Поле
  `passwordHash` хранится на `User`, но модуль **не знает, как** оно вычисляется. **Экспортирует**
  `USER_REPOSITORY`.
- **AuthModule** — логинизация: use-cases `register/login/refresh/get-me`, порты `PasswordHasher`
  (argon2) и `TokenService` (JWT), `jwt.strategy`, `JwtAuthGuard`, `RolesGuard` + `@Roles()`,
  `auth.controller`. **Импортирует** `UserModule` и обращается к пользователям только через
  `USER_REPOSITORY` — без прямого доступа к Mongo-схеме User.

Граница: *что есть пользователь* — UserModule; *как он доказывает свою личность* — AuthModule.
Зависимость строго односторонняя: `AuthModule → UserModule` (User ничего не знает про auth).

**Consequences.**
- `Role` VO живёт в UserModule (часть `User`); `RolesGuard`, читающий роль, — в AuthModule.
- `register` создаёт `User` через `USER_REPOSITORY` и хеширует пароль `PasswordHasher` — оба
  механизма в Auth; UserModule остаётся независимым от способа аутентификации.
- Незначительная цена: одна явная межмодульная зависимость и контракт `USER_REPOSITORY`.

---

## ADR-006 — Доменная модель: Event (kind + schedule), TimeSlot, Registration

**Status:** Accepted

**Context.** События бывают разных типов (объявление vs с записью) и разной длительности
(короткие как в legacy vs многодневные). Нельзя плодить типы или анемичную модель с кучей
nullable-полей.

**Decision.** Один агрегат **Event** с двумя ортогональными измерениями:

```
Event (aggregate root)
  id, title, description
  kind:     ANNOUNCEMENT | REGISTRABLE          # дискриминатор: способность записи
  schedule: { startsAt, endsAt, allDay }        # VO: короткое (один день) ИЛИ многодневное (диапазон)
  slots:    TimeSlot[]                           # только REGISTRABLE; у ANNOUNCEMENT — []
  createdBy, createdAt

TimeSlot (entity внутри Event)                   # только REGISTRABLE
  id, startsAt, endsAt?, capacity (≥1), label?   # полный datetime → работает на любой день многодневного

Registration (отдельный агрегат)
  id, eventId, slotId, userId, additionalGuests, createdAt
```

**Решения по моделированию:**
- *Объявление vs запись* — это `kind` (дискриминатор), а **не** отдельные классы. Запись —
  опциональная способность; гард-методы `addSlot()` / `register()` кидают доменную ошибку при
  `kind != REGISTRABLE`. Подклассы — только если поведение сильно разойдётся (пока нет).
- *Короткое vs многодневное* — это **не типы, а длина `schedule`**. Слот несёт полный datetime
  (день+время), а не голую строку времени (как было в legacy) → работает на любой день диапазона.
- **Registration вынесена из Event** в отдельный агрегат: записи растут/меняются независимо,
  конкурентная запись в один Event-документ неудобна.

**Инварианты:**
- `schedule.endsAt ≥ startsAt`.
- `ANNOUNCEMENT`: `slots` пуст, запись запрещена (доменная ошибка → HTTP 400).
- `REGISTRABLE`: ≥1 слот; `capacity ≥ 1`; datetime слота внутри `schedule`.
- Запись допустима только если `занятость + (1 + guests) ≤ capacity`; занятость = `Σ(1 + guests)`
  по слоту. Проверка — в application (читает текущую занятость), запись атомарна.
- Удаление события каскадит на слоты и записи (в use-case).
- Один пользователь — одна запись на событие (уникальный индекс `(eventId, userId)`).

**Consequences.** Расширяемость `kind` (внешняя ссылка, RSVP без лимита) заложена, но в MVP —
только `ANNOUNCEMENT`/`REGISTRABLE`. `REGISTRABLE` без выбора времени моделируется как один слот
на весь `schedule` (единый путь записи).

---

## ADR-007 — Аутентификация и роли

**Status:** Accepted

**Context.** Legacy был полностью публичным. Нужна авторизация и простая админка без оверинжиниринга.

**Decision.**
- **JWT**: access (~15 мин) + refresh (~7–30 дней), стратегия `passport-jwt`.
- **Пароли**: `argon2` (или `bcrypt`).
- **Роли**: VO `Role` со значениями `USER | ADMIN` на `User`. `RolesGuard` + `@Roles('ADMIN')`.
- **Суперадмин**: посеять seed-скриптом (env `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`).
- **Без полноценного RBAC** (таблицы прав) в MVP — добавим при появлении третьей роли.

**Consequences.** Минимум кода, понятная админка (страницы под ролью ADMIN). Подтверждение
email / сброс пароля — через email-канал, опционально в MVP.

---

## ADR-008 — Уведомления: порт + SMTP + планировщик

**Status:** Accepted

**Context.** Legacy слал письма хардкодом в утилите (SMTP ionos, шаблоны DE). Нужны
расширяемость (позже Telegram) и напоминания о событиях.

**Decision.**
- Порт `NotificationSender` в application; реализация `SmtpSender` (ionos) в infrastructure.
  Письма (перенос из legacy): подтверждение участнику (шаблон DE `Anmeldebestätigung`) +
  уведомление администратору о записи.
- **Напоминания**: `@nestjs/schedule` cron раз в N минут проверяет предстоящие события и шлёт
  напоминания (за день/час). Очередь (BullMQ/Redis) на этом объёме **не нужна**.
- Telegram — позже, как ещё одна реализация того же порта.

**Consequences.**
- **Безопасность:** SMTP-креды только через переменные окружения/секреты (в legacy `.env` они
  лежали в открытом виде — так нельзя). Не коммитить.

---

## ADR-009 — Дни рождения (календарь #2): отдельный агрегат, админ-список

**Status:** Accepted

**Context.** Нужен второй календарь — дни рождения. Изначально предполагалась проекция
`User.birthDate`, но: админ ведёт их **отдельным списком**, и **один аккаунт может
соответствовать нескольким ДР** (супруги на одном аккаунте).

**Decision.** `Birthday` — **самостоятельный лёгкий агрегат**, не привязанный к `User`:
```
Birthday { id, firstName, lastName, birthDate, note? }   # своя коллекция, не связана с users
```
- ADMIN — CRUD по списку (`/birthdays`).
- Календарь — проекция на чтении: `GET /birthdays?from=&to=` проецирует `birthDate` на год(а)
  диапазона. **Годовые экземпляры не хранятся** (ежегодная повторяемость считается на чтении).
- Правила (зафиксированы): 29 февраля в невисокосный год → **01.03**; год и возраст в календаре
  **показываем**.

**Consequences.** `birthDate` **НЕ** на `User`. Запись о ДР независима от аккаунтов.

---

## ADR-010 — Календарь #3: интеграция с Google Calendar (поздний этап)

**Status:** Proposed (вне MVP; делается после #1 и #2)

**Context.** Нужно отдавать события (#1) и ДР (#2) в Google Calendar — персональный и
корпоративный (Workspace).

**Decision.** Интеграция — **адаптер в infrastructure** за портом; домен не меняется.
Способы (от простого к мощному):

| Способ | Аккаунты | Направление | Auth |
|--------|----------|-------------|------|
| ICS-фид `GET /calendar/{token}.ics` | любые | только чтение (→ юзер) | секретный токен в URL |
| OAuth2 per-user | персональные Gmail | дву-/одностороннее | согласие + refresh token (+верификация) |
| Service account → общий календарь | Workspace | запись (→ общий) | ключ сервис-аккаунта |
| Service account + Domain-Wide Delegation | Workspace | каждому в личный | авторизация домена админом |

- **Первый шаг** — ICS-фид (часов работы, без OAuth). Минус: Google обновляет внешние ICS редко
  (8–24 ч). События → `VEVENT`, ДР → `VEVENT`+`RRULE:FREQ=YEARLY`, многодневные через `DTSTART`/`DTEND`.
- **Корпоратив** — service account → один общий календарь (записываемо, без per-user возни).
  Внутреннее приложение в своём Workspace-домене не требует Google-верификации.

План адаптера:
```
application/ports/calendar-sync.port.ts          # publishEvent/updateEvent/deleteEvent
infrastructure/google/google-calendar.adapter.ts # Calendar API (events.insert/update/delete/watch)
infrastructure/google/ics-feed.controller.ts     # ICS-фид
```
Outbox-паттерн (на create/update/delete — задача в очередь синхронизации, ретраи); маппинг
`{ ourId, googleEventId, googleCalendarId, etag }`; наш UUID → `iCalUID`; `events.watch` +
`syncToken` для двусторонней синхронизации.

**Consequences.** Требования ADR-004 (UTC+TZ, стабильный UUID, `RRULE`, `updatedAt`) — это
ровно то, что нужно адаптеру; поэтому соблюдаем их **уже в MVP**, чтобы #3 был дешёвым.

---

## ADR-011 — API (бэкенд-контракт)

**Status:** Accepted

**Context.** Контракт переносим из legacy + добавляем auth, ДР, фильтры по периоду.

**Decision.** Префикс `/api`, JSON, ошибки `{ "error": "..." }`.

- **Auth:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`.
- **Events:** `GET /events?from=&to=`, `GET /events/:id`, `POST /events` (admin, `kind`+`schedule`),
  `DELETE /events/:id` (admin), `POST /events/:id/slots` (admin), `DELETE /events/slots/:slotId` (admin),
  `GET /events/slots/:slotId/registrations` (admin).
- **Registrations:** `POST /events/:id/register` (`{slotId, additionalGuests}`; 400 если ANNOUNCEMENT),
  `DELETE /events/:id/register`.
- **Birthdays:** `GET /birthdays?from=&to=` (user), `POST|PATCH|DELETE /birthdays[/:id]` (admin).
- **Users (админка):** `GET /users`, `GET /users/:id`, `PATCH /users/:id` (профиль/`role`),
  `DELETE /users/:id` — все admin.

Календарный запрос по пересечению диапазона: вернуть события с
`schedule.startsAt ≤ to AND schedule.endsAt ≥ from`.

**Consequences.** Контракт документируется через `@nestjs/swagger`.

---

## ADR-012 — Модель хранения (MongoDB-коллекции на старте)

**Status:** Accepted

**Decision.** `id` — строковый UUID из домена (ADR-004), не `_id`.

```
users      { id, email, passwordHash, role, firstName, lastName, phone, createdAt }
events     { id, title, description, kind, schedule:{startsAt,endsAt,allDay},
             slots:[{id,startsAt,endsAt,capacity,label}], createdBy, createdAt }   # slots embedded (часть агрегата)
registrations { id, eventId, slotId, userId, additionalGuests, createdAt }
birthdays  { id, firstName, lastName, birthDate, note, createdAt }                 # не связан с users
```

Индексы: `registrations` по `(slotId)` и уникальный `(eventId, userId)`. Занятость слота —
агрегирование `Σ(1 + additionalGuests)` по `slotId`. Годовые ДР не хранятся (проекция на чтении).

**Consequences.** В Postgres: `events` + `event_slots` (1:N), `registrations`, `birthdays`;
datetime → `timestamptz`. Маппинг — в `*.mapper.ts`.
