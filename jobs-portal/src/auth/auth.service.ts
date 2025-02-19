import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';
import { Auth } from './schemas/auth.schema';
import { ChangePasswordDto } from './dtos/change-password.dto';
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
    const createdUser = await this.authModel.create({
      name,
      email,
      password,
    });
    const userObject = await this.authModel.findById(createdUser._id).lean();

    const token = this.generateToken(userObject);
    return {
      token,
      user: userObject,
    };
  }

  async loginUser(
    body: LoginDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> }> {
    const { email, password } = body;
    const user = await this.authModel.findOne({ email }).select('+password');

    if (!user) {
      throw new BadRequestException('Invalid Credentials');
    }
    const verifyPassword = await user.comparePassword(password);
    if (!verifyPassword) {
      throw new BadRequestException('Invalid Credentials');
    }
    const userWithoutPass = user.toObject() as any;
    delete userWithoutPass.password;
    const token = this.generateToken(userWithoutPass);

    return {
      token,
      user: userWithoutPass,
    };
  }

  async changePassword(
    body: ChangePasswordDto,
    user: Auth,
  ): Promise<{ token: string }> {
    // const { userId } = user;
    const { currentPassword, newPassword, confirmNewPassword } = body;
    const verifyPassword = await user.comparePassword(currentPassword);
    if (!verifyPassword) {
      throw new BadRequestException('Current Password Not Correct');
    }
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Password donot match!');
    }
    user.password = newPassword;
    await user.save();
    const token = this.generateToken(user);
    return {
      token,
    };
  }

  private generateToken(user: Auth | null): string {
    const token = this.jwtService.sign({
      userId: user?._id,
      email: user?.email,
    });
    return token;
  }
}
