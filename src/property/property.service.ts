import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryDto } from 'src/Pagination/pagination.dto';
// import { jwtPayload } from 'src/types/jwt';

@Injectable()
export class PropertyService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPropertyDto: CreatePropertyDto) {
    const existing = await this.prismaService.property.findFirst({
      where: {
        title: createPropertyDto.title,
        userId: createPropertyDto.userId,
      },
    });
    if (existing) {
      throw new BadRequestException('Duplicate property title ');
    }
    return this.prismaService.property.create({
      data: createPropertyDto,
    });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      minPrice,
      maxPrice,
    } = paginationQuery;

    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }

    if (minPrice !== undefined && minPrice < 0) {
      throw new BadRequestException('Minimum price cannot be negative');
    }

    if (maxPrice !== undefined && maxPrice < 0) {
      throw new BadRequestException('Maximum price cannot be negative');
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException(
        'Minimum price cannot be greater than maximum price',
      );
    }

    if (isNaN(page) || isNaN(limit)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }

    const take = limit;
    const skip = (page - 1) * take;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [properties, total] = await Promise.all([
      this.prismaService.property.findMany({
        skip,
        take,
        where,
        include: {
          images: true, // Include related property images
        },
      }),
      this.prismaService.property.count({ where }),
    ]);

    return {
      totalProperties: total,
      currentPage: page,
      limit: take,
      data: properties,
    };
  }

  async findOne(id: number) {
    return this.ensurePropertyExists(id);
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    await this.ensurePropertyExists(id);
    return this.prismaService.property.update({
      where: { id },
      data: updatePropertyDto,
    });
  }

  async remove(id: number) {
    await this.ensurePropertyExists(id);
    return this.prismaService.property.delete({
      where: { id },
    });
  }

  private async ensurePropertyExists(id: number) {
    const property = await this.prismaService.property.findUnique({
      where: { id },
    });
    if (!property) {
      throw new BadRequestException(`Property does not exist`);
    }
    return property;
  }
}
