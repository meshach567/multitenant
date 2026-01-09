import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import bcrypt from 'bcrypt';
import { Role } from '../auth/roles.enum';
import { AcceptInviteDto } from '../auth/dto/acccept-invite.dto';
//import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { User } from '../generated/prisma/client';
//import { JwtPayload } from '../auth/types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private jwt: JwtService,
  ) {}

  async inviteStaff(email: string, businessId: string, inviterId: string) {
    const token = crypto.randomUUID();

    await this.prisma.staffInvitation.create({
      data: {
        email,
        token,
        businessId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'STAFF_INVITED',
        userId: inviterId,
        businessId,
        metadata: { email },
      },
    });

    await this.mail.sendStaffInvite(email, token);

    return { message: 'Staff invitation sent' };
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const invite = await this.prisma.staffInvitation.findUnique({
      where: { token: dto.token },
    });

    if (!invite || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });

    const hash = await bcrypt.hash(dto.password, 10);

    await this.prisma.$transaction(async (tx) => {
      if (existingUser) {
        // ✅ User already exists → attach to business
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            businessId: invite.businessId,
            role: Role.STAFF,
          },
        });
      } else {
        // ✅ New user → create
        await tx.user.create({
          data: {
            email: invite.email,
            passwordHash: hash,
            role: Role.STAFF,
            businessId: invite.businessId,
            emailVerified: true,
          },
        });
      }

      // ✅ Delete invite
      await tx.staffInvitation.delete({
        where: { id: invite.id },
      });
    });

    return {
      message: 'Staff invitation accepted successfully',
      email: invite.email,
    };
  }

  issueTokens(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
      businessId: user.businessId ?? undefined,
    };

    return {
      accessToken: this.jwt.sign(payload),
    };
  }

  findByBusiness(businessId: string) {
    return this.prisma.user.findMany({
      where: { businessId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
