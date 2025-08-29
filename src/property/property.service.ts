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

    return this.prismaService.property.create({
      data: createPropertyDto
    })
    // const { latitude, longitude, ...rest } = createPropertyDto;

    // if (latitude === undefined || longitude === undefined) {
    //   throw new BadRequestException('Latitude and Longitude are required');
    // }

    // const result = await this.prismaService.$queryRawUnsafe<Array<any>>(
    //   `INSERT INTO "properties" ("title", "description", "price", "status", "type", "userId", "latitude", "longitude", "location", "createdAt", "updatedAt")
    // VALUES ($1, $2, $3, $4::"PropertyStatus", $5::"PropertyType", $6, $7, $8,  ST_SetSRID(ST_MakePoint($8, $7), 4326))
    // RETURNING *`,
    //   rest.title,
    //   rest.description || '',
    //   rest.price,
    //   rest.status || 'AVAILABLE',
    //   rest.type || 'HOUSE',
    //   rest.userId,
    //   latitude,
    //   longitude,
    //   //
    // );

    // return result;
  }

  async findAll(
    paginationQuery: PaginationQueryDto & {
      lat?: number;
      lng?: number;
      radiusKm?: number;
    },
  ) {
    const {
      page = 1,
      limit = 10,
      lat,
      lng,
      radiusKm,
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

    // if no lat/lng provided -> fallback to normal prisma query
    if (!lat || !lng || !radiusKm) {
      const where: any = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (type) where.type = type;
      if (status) where.status = status;
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
          include: { images: true },
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

    // with lat/;ng -> run PostGIS haversine query
    const properties = await this.prismaService.$queryRawUnsafe<any>(
      `SELECT p.*,
    ST_DistanceSphere(
    p.location,
    ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
    ) AS distance_m
     FROM "Property" p
     WHERE ST_DWithin(
     p.location::geography,
     ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
     ${radiusKm * 1000}
     )
     ORDER BY distance_m
     LIMIT ${take} OFFSET ${skip};`,
    );

    // count matching
    const [{ count }] = await this.prismaService.$queryRawUnsafe<
      { count: number }[]
    >(
      `SELECT COUNT(*)::int
      FROM "Property" p
      WHERE ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ${radiusKm * 1000})`,
    );

    return {
      totalProperties: count,
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
