import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth } from './schemas/auth.schema';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: mongoose.Model<Auth>,
    private readonly jwtService: JwtService,
  ) {}
  async registerUser(
    payload: SignupDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> }> {
    const { name, email, password } = payload;
    const userExists = await this.authModel.exists({ email });
    if (userExists) {
      throw new BadRequestException();
    }
    const hash = await bcrypt.hash(password, 10);
    const createdUser = await this.authModel.create({
      name,
      email,
      password: hash,
    });
    const token = this.jwtService.sign({
      userId: createdUser?._id,
      email,
    });
    const { password: _, ...userWithoutPass } = createdUser?.toObject();
    return {
      token,
      user: userWithoutPass,
    };
  }
  async loginUser(
    payload: LoginDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> }> {
    console.log(payload, 'payload');

    const { email, password } = payload;
    const user = await this.authModel
      .findOne({ email })
      .select('+password')
      .lean();
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = this.jwtService.sign({
      userId: user?._id?.toString(),
      email,
    });
    const { password: _, ...userWithoutPass } = user;
    return {
      token,
      user: userWithoutPass,
    };
  }
}
