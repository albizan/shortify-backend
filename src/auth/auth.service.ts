import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from 'config';

const { host } = config.get('frontend');

// Auth Module
import { RegisterDto } from './dto/register.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
// User Module
import { UserService } from '../user/user.service';
import { AuthResponseObject } from './ro/auth.ro';
import { UserResponseObject } from '../user/ro/user.ro';
import { MailService } from '../mail/mail.service';
import { AmnesiaDto } from './dto/amnesia.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { JwtDecoded } from './jwt-decoded.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  private logger = new Logger('AuthService');

  sendConfirmationMail(user) {
    const payload: JwtPayload = {
      sub: user.id,
    };
    console.log(host)
    jwt.sign(
      payload,
      process.env.MAIL_SECRET,
      { expiresIn: '1d' },
      (error, token) => {
        if (error) {
          throw new InternalServerErrorException('e-mail was not sent');
        }
        const url = `${host}/confirm-email/${token}`;
        this.mailService.sendConfirmationToken(user.email, url);
      },
    );
  }
  sendNewPasswordMail(id, email) {
    const payload = {
      sub: id,
    };
    jwt.sign(
      payload,
      process.env.AMNESIA_SECRET,
      { expiresIn: 600 },
      (error, token) => {
        if (error) {
          throw new InternalServerErrorException('e-mail was not sent');
        }
        const url = `${host}/new-password/${token}`;
        this.mailService.sendNewPasswordEmail(email, url);
      },
    );
  }

  async register(registerDto: RegisterDto): Promise<UserResponseObject> {
    // Hash the password
    const { password } = registerDto;
    const hash: string = await bcrypt.hash(password, await bcrypt.genSalt());
    try {
      const user = await this.userService.register({
        ...registerDto,
        password: hash,
      });
      // Send verification mail
      this.sendConfirmationMail(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Login function receives credentials, verifies user identity and send signed jwt if validation on user is successful
  async login(credentialsDto: CredentialsDto): Promise<AuthResponseObject> {
    const { email, password } = credentialsDto;
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const isUserValid: boolean = await bcrypt.compare(password, user.password);
    if (!isUserValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Activate your account before log in');
    }

    // Build the jwt payload
    const jwtPayload: JwtPayload = {
      sub: user.id,
    };
    const token = await this.jwtService.sign(jwtPayload);
    return {
      accessToken: token,
    };
  }

  async amnesia(amnesiaDto: AmnesiaDto) {
    const { email } = amnesiaDto;
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      this.sendNewPasswordMail(user.id, email);
    }
  }

  async resendConfirmationMail(email) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      console.log('User not found')
      throw new UnauthorizedException('User not Found');
    }
    console.log(user)
    if (!user.isActive) {
      this.sendConfirmationMail(user);
    }
  }


  async changePassword(newPasswordDto: NewPasswordDto) {
    const { token, password_1, password_2 } = newPasswordDto;
    if (password_1 !== password_2) {
      throw new BadRequestException("Invalid Token - Passwords don't match");
    }
    try {
      const decoded: any = jwt.verify(token, process.env.AMNESIA_SECRET);
      let user = await this.userService.findUserById(
        (decoded as JwtDecoded).sub,
      );
      const hash: string = await bcrypt.hash(
        password_1,
        await bcrypt.genSalt(),
      );
      const newUser: UserResponseObject = await this.userService.changePassword(
        user,
        hash,
      );
      return newUser;
    } catch (error) {
      throw new BadRequestException('Invalid Token');
    }
  }
}
