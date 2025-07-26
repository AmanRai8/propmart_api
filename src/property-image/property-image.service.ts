import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class PropertyImageService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(propertyId: string, imageUrl: string): Promise<any> {
        return this.prismaService.propertyImage.create({
            data: {
                propertyId: Number(propertyId),
                imageUrl,
            },
        });

    }
}
