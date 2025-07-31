import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PropertyImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(propertyId: string, file: Express.Multer.File): Promise<any> {
    const result = await this.cloudinaryService.uploadImage(file);
    return this.prismaService.propertyImage.create({
      data: {
        propertyId: Number(propertyId),
        imageUrl: result.secure_url,
        publicId: result.public_id,
      },
    });
  }

  async getAll() {
    return this.prismaService.propertyImage.findMany();
  }

  async remove(id: number) {
    const image = await this.prismaService.propertyImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.cloudinaryService.deleteImage(image.publicId);

    return this.prismaService.propertyImage.delete({ where: { id } });
  }
}
