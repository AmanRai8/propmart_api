import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('user already exist');
    }
    registerDto.password = await hash(registerDto.password, 10);

    const user = await this.prismaService.user.create({
      data: registerDto,
    });
    const token = await this.jwtService.signAsync({
      user: {
        id: user.id,
        role: user.role,
      },
    });
    return {
      token,
      user: {
        id: user.id,
        name: user.userName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: loginDto.userName,
      },
    });
    if (!user) {
      throw new BadRequestException('user not found');
    }

    if (!(await compare(loginDto.password, user.password))) {
      throw new BadRequestException('Invalid Credentials');
    }

    const token = await this.jwtService.signAsync({
      user: {
        id: user.id,
        role: user.role,
      },
    });
    return {
      token,
      user: {
        id: user.id,
        name: user.userName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }
}
