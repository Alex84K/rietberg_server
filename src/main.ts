import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
  HttpException,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json({
        error:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || 'An error occurred',
      });
    }

    if (exception instanceof Error) {
      return response.status(500).json({
        error: exception.message || 'Internal server error',
      });
    }

    response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 5015;
  const isDev = configService.get<boolean>('dev') || false;

  app.setGlobalPrefix('api');
  app.getHttpAdapter().get('/', (_req, res) => res.json({ status: 'ok' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: isDev
      ? (origin, callback) => callback(null, true)
      : ['https://rietberg-cbg-serv.smartsoftsystem.de', 'http://localhost:5173'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('CBG-Rietberg Calendar API')
    .setDescription(
      'REST API корпоративного календаря CBG-Rietberg.\n\n' +
      '**Аутентификация:** Bearer JWT (access-токен, 15 мин). ' +
      'Получите токены через `POST /api/auth/register` или `POST /api/auth/login`. ' +
      'Обновляйте через `POST /api/auth/refresh`.\n\n' +
      '**Роли:** USER — обычный пользователь; ADMIN — полный доступ к /api/users.',
    )
    .setVersion('1.0.0')
    .setContact('CBG-Rietberg Dev', '', 'al.k.84.de@gmail.com')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT Access Token' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, () => {
    console.log(`[${isDev ? 'DEV' : 'PROD'}] Server running on http://localhost:${port}/api`);
  });
}

bootstrap();
