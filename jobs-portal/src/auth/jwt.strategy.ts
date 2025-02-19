import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import mongoose from 'mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Auth } from './schemas/auth.schema';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: mongoose.Model<Auth>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }
  async validate(payload): Promise<Auth> {
    const { userId, iat, exp } = payload;
    console.log(iat, 'iat', exp, 'exp');
    if (exp < Date.now() / 1000) {
      throw new UnauthorizedException('Token expired! Please login again.');
    }
    const user = await this.authModel
      .findById(userId)
      .select('+password +passwordChangedAt');
    if (!user) {
      throw new UnauthorizedException('Invalid Token. Please Login!');
    }
    const passwordChangedInMs = new Date(
      user?.passwordChangedAt ?? 0,
    ).getTime();
    if (iat < Math.floor(passwordChangedInMs / 1000)) {
      throw new UnauthorizedException(
        'Password has been recently changed. Please login again!',
      );
    }

    return user;
  }
}
