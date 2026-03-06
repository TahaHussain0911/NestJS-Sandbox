import { IsEmail, MinLength } from 'class-validator';

export class SignInUser {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
