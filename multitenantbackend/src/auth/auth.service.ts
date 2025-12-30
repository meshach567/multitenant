import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { JwtPayload } from './types/jwt-payload.type';
import { AuthTokens } from './types/auth-token.type';
import { User } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(email: string, password: string): Promise<User> {
    const hash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'BUSINESS_OWNER',
      },
    });
  }

  // 🔹 STEP 1: validate credentials
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }

  login(user: { id: string; role: string; businessId?: string }): AuthTokens {
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
