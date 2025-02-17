import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { Auth } from './schemas/auth.schema';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  registerUser(
    @Body() body: SignupDto,
  ): Promise<{ token: string; user: Omit<Auth, 'password'> | null }> {
    return this.authService.registerUser(body);
  }

  @Post('/login')
  loginUser(@Body() body: LoginDto) {
    return this.authService.loginUser(body);
  }
}
