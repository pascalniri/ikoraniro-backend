import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & Optimization
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [
          process.env.FRONTEND_URL,
          'https://ikoraniro.vercel.app',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'https://ikoraniro.vercel.app',
        ],
    credentials: true,
  });

  // Reliability
  app.enableShutdownHooks();

  const uploadsDir = path.join(process.cwd(), 'uploads');
  const tmpDir = path.join(uploadsDir, 'tmp');
  for (const dir of [uploadsDir, tmpDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ikoraniro API')
    .setDescription('The Ikoraniro API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
