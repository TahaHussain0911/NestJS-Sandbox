import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUser } from './dto/register-user.dto';
import { SignInUser } from './dto/signin-user.dto';
import { Request } from 'express';
import { Auth } from './schemas/auth.schema';
import { AuthUser } from './decorators/auth_user.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Role } from './enums/roles.enum';
import { UpdateUser } from './dto/update-user.dto';
import { Roles } from './decorators/roles.decorators';
import { RequestResetPassword } from './dto/request-reset-password.dto';
import { ResetPassword } from './dto/reset-password.dto';
import { ChangeUserRole } from './dto/change-user-role.dto';
import { OrganizationGuard } from 'src/common/guards/organization.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  registerUser(@Body() data: RegisterUser) {
    return this.authService.registerUser(data);
  }

  @Post('login')
  signInUser(@Body() data: SignInUser) {
    return this.authService.signInUser(data);
  }

  @Post('forgot-password')
  requestResetPassword(@Body() payload: RequestResetPassword) {
    return this.authService.requestResetPassword(payload.email);
  }

  @Post('reset-password')
  resetPassword(@Body() payload: ResetPassword) {
    return this.authService.resetPassword(payload);
  }

  @Patch('update-me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.MEMBER)
  updateUser(@AuthUser('_id') userId: string, @Body() payload: UpdateUser) {
    return this.authService.updateUser(userId, payload);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('refresh-token')
  refreshTokens(
    @AuthUser('_id') userId: string,
    @AuthUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Patch('change-role')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER)
  changeUserRole(
    @Body() payload: ChangeUserRole,
    @AuthUser('organization') orgId: string,
  ) {
    return this.authService.changeUserRole(payload, orgId);
  }
}
