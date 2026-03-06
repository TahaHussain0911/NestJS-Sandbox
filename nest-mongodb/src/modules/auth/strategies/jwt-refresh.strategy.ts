import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,// to receive req in my validate function
    });
  }
  validate(req: Request, payload) { // receive req + payload due to passReqToCallback: true
    const refreshToken = req
      .get('Authorization')
      ?.replace('Bearer ', '')
      .trim();
    return {
      ...payload,
      refreshToken,
    };
  }
}
