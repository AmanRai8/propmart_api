import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [PropertyService, PrismaService, UsersService],
  controllers: [PropertyController],
})
export class PropertyModule {}
