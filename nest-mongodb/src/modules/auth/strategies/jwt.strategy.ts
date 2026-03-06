import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Auth, AuthDocument } from '../schemas/auth.schema';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Auth.name)
    private authModel: Model<AuthDocument>,
    configService: ConfigService,
  ) {
    console.log(configService.get('ACCESS_TOKEN_SECRET'), 'configService');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET'),
    });
  }
  async validate(payload) {
    // receive payload only due to passReqToCallback: false (default)
    const { userId } = payload;
    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token.');
    }
    return user;
  }
}
