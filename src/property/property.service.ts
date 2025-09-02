import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryDto } from 'src/Pagination/pagination.dto';
import axios from 'axios';
import { PropertyType } from 'generated/prisma';
// import { jwtPayload } from 'src/types/jwt';

interface GeoData {
  lat: string;
  lng: string;
  display_name: string;
  length: number;
}

@Injectable()
export class PropertyService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPropertyDto: CreatePropertyDto, userId: number) {
    const {
      title,
      description,
      price,
      type,
      status,
      bedrooms,
      bathrooms,
      area,
      location,
    } = createPropertyDto;

    // Geocode the location using OpenStreetMap Nominatim API
    const geoResponse = await axios.get<GeoData>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: location,
          format: 'json',
          limit: 1,
        },
      },
    );

    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new BadRequestException('Invalid location provided');
    }

    const lat = parseFloat(geoResponse.data[0].lat);
    const lng = parseFloat(geoResponse.data[0].lon);

    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('Invalid geocoded coordinates');
    }

    // construct postgis point
    const locationRaw = `SRID=4326;POINT(${lng} ${lat})`;

    // use raw query to insert postgis geography
    await this.prismaService.$executeRawUnsafe(
      `INSERT INTO "properties"
      (title, description, price, type, status, bedrooms, bathrooms, area, location, "userId", longitude, latitude)
      VALUES($1, $2, $3, $4::"PropertyType", $5::"PropertyStatus", $6, $7, $8, ST_GeomFromEWKT($9), $10, $11, $12)`,
      title,
      description ?? null,
      price,
      type,
      status || 'Available',
      bedrooms ?? null,
      bathrooms ?? null,
      area ?? null,
      locationRaw,
      userId,
      lng,
      lat,
    );

    // Optionally return the property with latitude and longitude
    return {
      title,
      description,
      price,
      type,
      status: status || 'Available',
      longitude: lng,
      latitude: lat,
      userId,
    };
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

    // Non-geolocation query
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

    // Geolocation query with postgis
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
