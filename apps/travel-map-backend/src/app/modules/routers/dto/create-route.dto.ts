import { IsNotEmpty, IsString, IsArray, ValidateNested, IsDate, Validate, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { IsEndDateAfterStartDate } from '../validators/is-end-date-after-start-date.validator';

class Point {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;
}

export class CreateRouteDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Point)
  points: Point[];

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  @Validate(IsEndDateAfterStartDate)
  endDate: Date;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color' })
  color?: string;
}
