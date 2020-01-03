import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
