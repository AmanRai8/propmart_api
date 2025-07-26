import { Module } from '@nestjs/common';
import { PropertyImageService } from './property-image.service';
import { PropertyImageController } from './property-image.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [PropertyImageController],
  providers: [PropertyImageService,PrismaService, CloudinaryService],
})
export class PropertyImageModule {}
