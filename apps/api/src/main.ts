// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for the frontend application
  app.enableCors({
    origin: 'http://localhost:5173', // Vite's default port
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `NestJS API running on: http://localhost:${process.env.PORT ?? 3001}`,
  );
}
void bootstrap();