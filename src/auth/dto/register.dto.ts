import { IsString, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
