import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStudent {
  @IsString()
  @MinLength(3)
  name: string;

  @IsInt()
  age: number;

  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;
}
