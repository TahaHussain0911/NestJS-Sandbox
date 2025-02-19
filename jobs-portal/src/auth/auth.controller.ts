import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { Auth } from './schemas/auth.schema';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signupuser(
    @Body() body: SignupDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> | null }> {
    return this.authService.signupUser(body);
  }

  @Post('login')
  loginUser(
    @Body() body: LoginDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> }> {
    return this.authService.loginUser(body);
  }

  @Get('get-me')
  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard(), RolesGuard)
  getUser(@Req() req): Auth {
    const { password, passwordChangedAt, ...restUser } = req.user?.toObject();
    return restUser;
  }

  @Patch('change-password')
  @UseGuards(AuthGuard())
  changePassword(
    @Body() body: ChangePasswordDto,
    @Req() req,
  ): Promise<{ token: string }> {
    return this.authService.changePassword(body, req.user);
  }
}
