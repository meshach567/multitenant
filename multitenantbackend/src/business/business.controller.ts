import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessesService: BusinessService) {}

  @Roles('BUSINESS_OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('business')
  createBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessesService.create(user.userId, dto);
  }

  @Get('me')
  getMyBusiness(@CurrentUser() user: AuthenticatedUser) {
    return this.businessesService.findMyBusiness(user.businessId!);
  }
}
