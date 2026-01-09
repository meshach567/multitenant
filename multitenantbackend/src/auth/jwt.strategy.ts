import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwt-payload.type';
//import { AuthenticatedUser } from './types/authenticated-user.type';
//import { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Role } from './roles.enum';
import { AuthenticatedUser } from './types/authenticated-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.accessToken,
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    };
    super(options);
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      role: payload.role as Role,
      businessId: payload.businessId,
    };
  }
}
