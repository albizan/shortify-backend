import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

const httpsOptions = {
  key: fs.readFileSync('./secrets/privkey.pem'),
  cert: fs.readFileSync('./secrets/fullchain.pem'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors({
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  logger.log('CORS enabled');
  await app.listen(process.env.PORT);
  logger.log(`App listening on port ${process.env.PORT}`);
}
bootstrap();
