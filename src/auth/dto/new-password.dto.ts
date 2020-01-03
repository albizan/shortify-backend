import { Length, IsString } from 'class-validator';

export class NewPasswordDto {
  @Length(6)
  password_1: string;

  @Length(6)
  password_2: string;

  @IsString()
  token: string;
}
