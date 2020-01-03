import { IsString, IsEmail } from 'class-validator';

export class AmnesiaDto {
  @IsString()
  @IsEmail()
  email: string;
}
