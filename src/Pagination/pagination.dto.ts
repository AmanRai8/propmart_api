import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { PropertyStatus, PropertyType } from 'generated/prisma';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  // @IsEnum(PropertyType)
  @IsString()
  type?: string;

  @IsOptional()
  // @IsEnum(PropertyStatus)
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  radiuskm?: number;
}
