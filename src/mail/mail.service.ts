import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import nmt from 'nodemailer-mailgun-transport';
import jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { JwtDecoded } from '../auth/jwt-decoded.interface';

@Injectable()
export class MailService {
  constructor(private userService: UserService) {}

  private auth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: 'albertozanotti.it',
    },
  };

  private nodemailerMailgun = createTransport(nmt(this.auth));

  private logger = new Logger('MailService');

  sendConfirmationToken(recipient: string, url: string): void {
    const message = {
      from: 'Activation <activation@shortify.com>',
      to: recipient,
      subject: 'Confirm your email',
      html: `Please click on this link to confirm your email: <a href="${url}">${url}</a>`,
    };
    try {
      this.nodemailerMailgun.sendMail(message, (err, info) => {
        if (err) {
          this.logger.log(`Error: ${err}`);
        } else {
          this.logger.log(`Response: ${info}`);
        }
      });
    } catch (error) {
      this.logger.log('Cannot send email');
    }
  }
  sendNewPasswordEmail(recipient: string, url: string): void {
    const message = {
      from: 'Activation <activation@shortify.com',
      to: recipient,
      subject: 'Set your new password',
      html: `Please follow this link to set a new password: <a href="${url}">${url}</a>`,
    };
    this.nodemailerMailgun.sendMail(message, (err, info) => {
      if (err) {
        this.logger.log(`Error: ${err}`);
      } else {
        this.logger.log(`Response: ${info}`);
      }
    });
  }

  verifyEmail(token: string) {
    try {
      const decoded: any = jwt.verify(token, process.env.MAIL_SECRET);
      this.userService.activateUser((decoded as JwtDecoded).sub);
    } catch (error) {
      throw new NotFoundException('Invalid Confirmation Token');
    }
  }
}
