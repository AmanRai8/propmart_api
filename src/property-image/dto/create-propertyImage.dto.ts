import { IsNotEmpty, IsNumber, IsPositive, IsUrl } from 'class-validator';

export class PropertyImageDto {
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  propertyId: number;

  publicId: string;
}
