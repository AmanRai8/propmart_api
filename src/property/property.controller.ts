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
  Query,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ownerGuard } from 'src/guard/Owner/owner.guard';
import { PaginationQueryDto } from 'src/Pagination/pagination.dto';
import { AuthGuard } from 'src/guard/auth/auth.guard';
// import { Request } from 'express';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: any) {
    const userId = req.payload?.user.id; //assume jwt middlware setsreq.user
    if (!userId) throw new BadRequestException('Invalid user token');
    return this.propertyService.create(createPropertyDto, userId);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.propertyService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(+id);
  }

  @UseGuards(ownerGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(+id, updatePropertyDto);
  }

  @UseGuards(ownerGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(+id);
  }
}
