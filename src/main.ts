// Load env variables from .env file if NODE_ENV is set to 'development'
import * as dotenv from 'dotenv';
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}

import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

// Read certificates to enable HTTPS protocol
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
  await app.listen(process.env.PORT);
  logger.log(`App listening on port ${process.env.PORT}`);
}
bootstrap();
