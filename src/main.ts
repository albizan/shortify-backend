import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import config from 'config';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  logger.log('CORS enabled');
  await app.listen(process.env.PORT);
  logger.log(`App listening on port ${process.env.PORT}`);
}
bootstrap();
