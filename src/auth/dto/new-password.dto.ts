import { Length, IsString } from 'class-validator';

export class NewPasswordDto {
  @Length(6)
  password: string;

  @Length(6)
  retypedPassword: string;

  @IsString()
  token: string;
}
