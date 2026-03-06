import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUser {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
