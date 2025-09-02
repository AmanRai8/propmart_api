import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { error } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }
  // Upload for Property Images
  async uploadImage(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file is provided');
    }

    // validate MINE type
    const allowedMineType = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMineType.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    // validating the size of the image
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Image size is too large');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'property-images',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: number): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!file) {
      throw new BadRequestException('No file is provided');
    }

    const allowedMimeType = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMimeType.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    const maxSize = 3 * 1024 * 1024; // smaller limit for avatars
    if (file.size > maxSize) {
      throw new BadRequestException('Avatar size is too large');
    }

    const uploaded: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'avatars',
            transformation: [
              { width: 200, height: 200, crop: 'fill', gravity: 'face' }, // auto crop to face
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
    // save avatar url and public_id in DB
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        avatar: uploaded.secure_url,
        avatarPublicId: uploaded.public_id,
      },
    });
    return uploaded;
  }

  // Delete User Avatar
  async deleteUserAvatar(userId: number): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (!user.avatarPublicId) {
      throw new BadRequestException('user does not have an avatar');
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.avatarPublicId, {
      resource_type: 'image',
    });
  }
}
