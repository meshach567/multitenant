import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TenantGuard } from '../common/guards/tenant.guard';
import { Role } from '../auth/roles.enum';

@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessesService: BusinessService) {}

  @Roles(Role.BUSINESS_OWNER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('business')
  createBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessesService.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me')
  getBusiness(@CurrentUser() user: AuthenticatedUser) {
    return this.businessesService.findMyBusiness(user.businessId!);
  }
}
