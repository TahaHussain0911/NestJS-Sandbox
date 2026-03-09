import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { userSafeSelect } from './users.constants';
import { Prisma } from '@prisma/client';
@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 12;
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSafeSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany({
      select: userSafeSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailTaken) {
        throw new ConflictException('Email is already taken');
      }
    }
    const updateUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: updateUserDto,
      select: userSafeSelect,
    });
    return updateUser;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponseDto> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const IsPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!IsPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new NotFoundException(
        'New password must be different from the current password',
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
      select: userSafeSelect,
    });
    return updatedUser;
  }

  async remove(userId: string): Promise<{ message: string }> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });

      return { message: 'User account deleted successfully' };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
