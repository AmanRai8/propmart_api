import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { User } from 'generated/prisma';
import { AuthGuard } from 'src/guard/auth/auth.guard';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    await this.checkIfEmailExists(createUserDto.email);
    createUserDto.password = await hash(createUserDto.password, 10);
    return this.prismaService.user.create({
      data: createUserDto,
    });
  }

  async getProfile(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        userName: true,
        avatar: true,
      },
    });
    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async findAll() {
    return this.prismaService.user.findMany({
      select: {
        userName: true,
        avatar: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: {
        userName: true,
        avatar: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.getUser(id);
    if (updateUserDto.email) {
      await this.checkIfEmailExists(updateUserDto.email, id);
    }

    if (updateUserDto.password && user.password !== updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    await this.getUser(id);
    return this.prismaService.user.delete({
      where: { id },
    });
  }

  // Update / Upload Avatar
  async updateUserAvatar(userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId, {
        resource_type: 'image',
      });
    }

    // Upload new avatar
    const streamUpload = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        Readable.from(file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    // Update user record
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        avatarPublicId: result.public_id,
        avatar: result.secure_url,
      },
    });
  }

  async deleteUserAvatar(userId: number) {
    // Fetch user with only avatarPublicId
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    // Ensure user has an avatar
    if (!user.avatarPublicId) {
      throw new BadRequestException('User has no avatar to delete');
    }
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(user.avatarPublicId, {
        resource_type: 'image',
      });

      // Remove avatar info from database
      await this.prismaService.user.update({
        where: { id: userId },
        data: { avatarPublicId: null, avatar: null },
      });

      return { message: 'Avatar deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete avatar');
    }
  }

  private async getUser(id: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('user not found');
    }
    return user;
  }

  private async checkIfEmailExists(email: string, id?: number) {
    const emailExist = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (emailExist) {
      if (id && emailExist.id !== id) {
        throw new BadRequestException(`${email} already exists`);
      } else if (!id) {
        throw new BadRequestException(`user with ${email} already exists`);
      }
    }
  }
}
