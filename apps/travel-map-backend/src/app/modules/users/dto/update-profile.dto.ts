import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { LanguageEnum } from '../enums/language.enum';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;
}
