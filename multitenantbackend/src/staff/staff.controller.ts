import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { StaffService } from './staff.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../common/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { AcceptInviteDto } from '../auth/dto/acccept-invite.dto';
import { AuthService } from '../auth/auth.service';
import { Response } from 'express';
// import { Prisma } from '../generated/prisma/client';

@Controller('staff')
export class StaffController {
  constructor(
    private staff: StaffService,
    private prisma: PrismaService,
    private auth: AuthService,
  ) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles(Role.BUSINESS_OWNER, Role.STAFF_ADMIN)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.staff.findByBusiness(user.businessId!);
  }

  @Get('audit-logs')
  findLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.auditLog.findMany({
      where: { businessId: user.businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  inviteStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { email: string },
  ) {
    return this.staff.inviteStaff(dto.email, user.businessId!, user.userId);
  }

  @Post('accept-invite')
  async acceptInvite(
    @Body() dto: AcceptInviteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const invite = await this.prisma.staffInvitation.findUnique({
      where: { token: dto.token },
    });

    if (!invite || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invite');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invite.email,
          passwordHash: hash,
          role: Role.STAFF,
          businessId: invite.businessId ?? undefined,
          emailVerified: true,
        },
      });

      await tx.staffInvitation.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return user;
    });

    const { accessToken } = this.auth.issueTokens({
      id: user.id,
      role: user.role,
      businessId: user.businessId ?? undefined,
    });

    // ✅ AUTO LOGIN
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      message: 'Invitation accepted',
      user,
    };
  }
}
