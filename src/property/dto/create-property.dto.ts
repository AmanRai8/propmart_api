import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PropertyStatus, PropertyType } from 'generated/prisma';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price: number;

  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  bathrooms?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  area?: number; // in square feet or square meters

  @IsString()
  location: string;

}
