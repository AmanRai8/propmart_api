import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryDto } from 'src/Pagination/pagination.dto';
// import { jwtPayload } from 'src/types/jwt';

@Injectable()
export class PropertyService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createPropertyDto: CreatePropertyDto) {
    return this.prismaService.property.create({
      data: createPropertyDto,
    });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = paginationQuery;

    const take = limit;
    const skip = (page - 1) * take;

    const where = search
    ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { location: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }
    : {};

    const [properties, total] = await Promise.all([
      this.prismaService.property.findMany({
        skip,
        take,
        where,
      }),
      this.prismaService.property.count({where}),
    ]);

    return {
      totalProperties: total,
      currentPage: page,
      limit: take,
      data: properties,
    };
  }

  findOne(id: number) {
    return this.prismaService.property.findFirst({
      where: { id },
    });
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return this.prismaService.property.update({
      where: { id },
      data: updatePropertyDto,
    });
  }

  remove(id: number) {
    return this.prismaService.property.delete({
      where: { id },
    });
  }
}
