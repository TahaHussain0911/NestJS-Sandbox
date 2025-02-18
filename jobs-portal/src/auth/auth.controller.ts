import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { Auth } from './schemas/auth.schema';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard())
  @Get('/get-me')
  getUser(@Req() req): Auth {
    return this.authService.getUser(req.user);
  }
}
