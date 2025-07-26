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
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price: number;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsEnum(PropertyStatus)
  status: PropertyStatus;

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
}
