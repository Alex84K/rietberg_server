# rietberg_server

Бэкенд корпоративного календаря **CBG-Rietberg**. NestJS + Bun + MongoDB Atlas.

## Стек

| | |
|---|---|
| Runtime | Bun |
| Framework | NestJS 11 |
| БД | MongoDB Atlas (Mongoose) |
| Auth | JWT (access 15 мин / refresh 7 дней) + argon2 |
| Уведомления | SMTP ionos (порт `NotificationSender`; сейчас stub) |
| Документация API | Swagger — `GET /api/docs` |

Архитектура: **DDD + гексагональная (Ports & Adapters)**. Подробности — в `agentic_docs/MVP_ADR.md`.

---

## Переменные окружения

Создай `.env.local` в корне `rietberg_server/`:

```env
PORT=5015
DEV=true

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
MONGODB_NAME=rietberg

JWT_ACCESS_SECRET=замени-на-случайную-строку
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=замени-на-другую-случайную-строку
JWT_REFRESH_EXPIRES=7d

SUPERADMIN_EMAIL=admin@cbg-rietberg.de
SUPERADMIN_PASSWORD=надёжный-пароль
```

> SMTP-креды (когда будут добавлены) — только через env, не коммитить.

---

## Запуск

```bash
# установка зависимостей
bun install

# dev (watch mode)
bun run start:dev

# production build + run
bun run build
bun run start:prod
```

Сервер поднимается на `http://localhost:5015`.  
Swagger UI: `http://localhost:5015/api/docs`.

---

## Структура модулей

```
src/
  shared/                        # Entity/VO базовые классы, DI-токены, DomainError
  modules/
    user/                        # агрегат User, роли, admin CRUD
    auth/                        # login/register/refresh, JWT, guards, seed суперадмина
    calendar/                    # Event + TimeSlot + Registration + Birthday
    notifications/               # порт NotificationSender (stub → SMTP)
  app.module.ts
  main.ts
```

Каждый модуль: `domain/` → `application/` → `infrastructure/` → `interface/http/`.

---

## Seed суперадмина

При старте (`auth.module.ts` → `SeedSuperadmin`) автоматически создаётся пользователь
с ролью `ADMIN` из `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`, если его ещё нет.

---

## API

Полный справочник: [`../project_docs/API.md`](../project_docs/API.md).  
Swagger (интерактивно): `http://localhost:5015/api/docs`.

Базовый префикс всех эндпоинтов: `/api`.  
Формат ошибок: `{ "error": "..." }`.
