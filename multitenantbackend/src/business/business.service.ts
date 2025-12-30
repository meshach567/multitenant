import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import slugify from 'slugify';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateBusinessDto): Promise<unknown> {
    const slug = slugify(dto.name, { lower: true });

    return this.prisma.business.create({
      data: {
        name: dto.name,
        slug,
        timezone: dto.timezone,
        currency: dto.currency,
        users: {
          connect: { id: ownerId },
        },
      },
    });
  }

  async findMyBusiness(businessId: string): Promise<unknown> {
    if (!businessId) {
      throw new ForbiddenException('User has no business');
    }

    return this.prisma.business.findUnique({
      where: { id: businessId },
    });
  }
}
