import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PropertyImageService } from './property-image.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('property-image')
export class PropertyImageController {
  constructor(
    private readonly propertyImageService: PropertyImageService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Assuming FileInterceptor is imported from '@nestjs/platform-express'
  async uploadImage(
    @Body() body: { propertyId: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    // const upload = await this.cloudinaryService.uploadImage(file);

    return this.propertyImageService.create(body.propertyId, file);
  }

  @Get()
  async getALl() {
    return this.propertyImageService.getAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.propertyImageService.remove(+id);
  }
}
