import { IsString, IsBoolean } from 'class-validator';

export class AddLinkDto {
  @IsString()
  title: string;

  @IsString()
  original: string;

  @IsBoolean()
  isActive: boolean;
}
