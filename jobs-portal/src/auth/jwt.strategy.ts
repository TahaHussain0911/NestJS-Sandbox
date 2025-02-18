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
    const { userId } = payload;
    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid Token. Please Login!');
    }
    return user;
  }
}
