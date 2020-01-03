import { Controller, Get, Param, Logger } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  private logger = new Logger('MailController');

  @Get('confirm/:token')
  verifyEmail(@Param() params) {
    // received params.token
    const { token } = params;
    this.mailService.verifyEmail(token);
  }
}
