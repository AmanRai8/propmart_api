import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from 'src/guard/Admin/admin.guard';
import { AuthGuard } from 'src/guard/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

// @UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    const userId = req.payload?.user;
    return this.usersService.getProfile(userId.id);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  // @UseGuards(AuthGuard)
  // @Get('profile')
  // async getProfile(@Req() req: Request) {
  //   if (!req.user) {
  //     throw new NotFoundException();
  //   }
  //   return this.usersService.getProfile(req.user?.id);
  // }

  @UseGuards(AuthGuard)
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateUserAvatar(+id, file);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/deleteavatar')
  async deleteAvatar(@Param('id') id: string) {
    // const userId = req.user.id; // assuming user ID is attached to request
    return this.usersService.deleteUserAvatar(+id);
  }
}
