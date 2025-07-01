import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async Register(registerDto: RegisterDto) {
    const emailExist = await this.prismaService.user.findFirst({
      where: {
        email: registerDto.email,
      },
    });
    if (emailExist) {
      throw new BadRequestException(
        `user with ${registerDto.email} already exists`,
      );
    }
    registerDto.password = await hash(registerDto.password, 10);
    const user = await this.prismaService.user.create({
      data: registerDto,
    });

    return {message: 'User created successfully', user};

    // const token = await this.jwtService.signAsync({
    //   where: {
    //     user_id: user.id,
    //   },
    // });
    // // console.log({ token });
    // return { token };
  }

  async Login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: loginDto.userName,
      },
    });

    if (!user) {
      throw new BadRequestException(`User with ${loginDto.userName} not found`);
    }

    if (!(await compare(loginDto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    return {message: 'User logged in successfully', user};

    //     const token = await this.jwtService.signAsync({
    //       where: {
    //         user_id: user.id,
    //       },
    //     });
    //     return { token };
    //   }
  }
}
