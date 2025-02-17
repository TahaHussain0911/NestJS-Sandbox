import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { Auth } from './schemas/auth.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SignupDto } from './dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: mongoose.Model<Auth>,
    private readonly jwtService: JwtService,
  ) {}

  async signupUser(
    body: SignupDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> | null }> {
    const { name, email, password, confirmPassword } = body;
    const userExists = await this.authModel.exists({ email });
    if (userExists) {
      throw new BadRequestException('Email already exists');
    }
    if (password !== confirmPassword) {
      throw new BadRequestException('Password donot match!');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const createdUser = await this.authModel.create({
      name,
      email,
      password: hashPassword,
      //   role: 'user',
    });
    const userObject = await this.authModel.findById(createdUser._id).lean();
    const token = this.jwtService.sign({
      userId: userObject?._id,
      email,
    });
    return {
      token,
      user: userObject,
    };
  }

  async loginUser(
    body: LoginDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> }> {
    const { email, password } = body;
    const user = await this.authModel
      .findOne({ email })
      .select('+password')
      .lean();
    if (!user) {
      throw new BadRequestException('Invalid Credentials');
    }
    const verifyPassword = await bcrypt.compare(password, user?.password);
    if (!verifyPassword) {
      throw new BadRequestException('Invalid Credentials');
    }
    const { password: _, ...userWithoutPass } = user;
    const token = this.jwtService.sign({
      userId: user?._id,
      email,
    });
    return {
      token,
      user: userWithoutPass,
    };
  }
}
