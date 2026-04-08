import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';
import { json, urlencoded } from 'express'; // 1. Added express imports for limits
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // 2. Increase Payload Limits
  // Exclude stripe webhook from the global JSON parser to preserve raw payload
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 3. Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        
    forbidNonWhitelisted: true, 
    transform: true,        
  }));

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Ensure uploads folder exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files as static assets at /uploads
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();