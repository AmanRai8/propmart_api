import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';

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

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: number) {
    return this.prismaService.user.findFirst({
      where: { id },
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
