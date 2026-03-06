import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPassword {
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  token: string;
}
