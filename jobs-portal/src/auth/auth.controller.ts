import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { Auth } from './schemas/auth.schema';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/signup')
  signupuser(
    @Body() body: SignupDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> | null }> {
    return this.authService.signupUser(body);
  }

  @Post('/login')
  loginUser(
    @Body() body: LoginDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> }> {
    return this.authService.loginUser(body);
  }

  @Get('/get-me')
  @Roles(Role.Admin,Role.User)
  @UseGuards(AuthGuard(),RolesGuard)
  getUser(@Req() req): Auth {
    return this.authService.getUser(req.user);
  }
}
