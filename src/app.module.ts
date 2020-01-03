import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { LinkModule } from './link/link.module';

import config from 'config';

const { type, host, port, synchronize } = config.get('database');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type,
      host,
      port,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize,
    }),
    UserModule,
    AuthModule,
    MailModule,
    LinkModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
