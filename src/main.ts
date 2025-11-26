import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.ORIGIN_URL,
    methods: process.env.AVAILABLE_METHODS,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3333);
  console.log(`🚀 App running on ${process.env.SOURCE_URL}`);
}
bootstrap();
