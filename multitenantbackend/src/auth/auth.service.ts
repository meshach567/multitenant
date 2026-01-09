import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Post,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { JwtPayload } from './types/jwt-payload.type';
import { AuthTokens } from './types/auth-token.type';
import { Prisma } from '../generated/prisma/client';
import { randomBytes, randomInt } from 'crypto';
import { RegisterResponse } from './types/register-response.type';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(email: string, password: string): Promise<RegisterResponse> {
    const hash = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          role: 'BUSINESS_OWNER',
        },
      });

      const otp = randomInt(100000, 999999).toString();

      await this.prisma.emailVerification.create({
        data: {
          otp,
          userId: user.id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      // TODO: send email here
      console.log('OTP:', otp);

      return {
        message: 'Verification code sent to your email',
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }

      throw error;
    }
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        user: { email: dto.email },
      },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification request');
    }

    if (verification.user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (verification.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerification.delete({
        where: { userId: verification.userId },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async loginWithCredentials(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwt.sign({
      id: user.id,
      role: user.role,
      businessId: user.businessId ?? undefined,
    });

    return { accessToken, user };
  }

  async forgotPassword(email: string) {
    console.log('FORGOT PASSWORD HIT:', email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Security: do NOT reveal user existence
      return { message: 'If the email exists, a reset link was sent' };
    }

    const token = randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(token, 10);

    await this.prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      create: {
        userId: user.id,
        token: hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await this.mail.sendPasswordReset(email, token);

    return { message: 'If the email exists, a reset link was sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: { token: string; password: string }) {
    const reset = await this.prisma.passwordReset.findFirst({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!reset) {
      throw new BadRequestException('Invalid or expired token');
    }

    const isValid = await bcrypt.compare(dto.token, reset.token);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: hash },
      }),
      this.prisma.passwordReset.delete({
        where: { userId: reset.userId },
      }),
    ]);

    return { message: 'Password reset successful' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.emailVerification.upsert({
      where: { userId: user.id },
      update: {
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      create: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // send email using MailService
    await this.mail.sendVerificationEmail(email, otp);

    console.log(`📧 Resent OTP ${otp} to ${email}`);

    return { message: 'Verification email resent' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    if (!user.emailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    return user;
  }

  issueTokens(user: {
    id: string;
    role: string;
    businessId?: string;
  }): AuthTokens {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      businessId: user.businessId,
    };

    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: Number(
          this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
        ),
      }),
    };
  }
}
