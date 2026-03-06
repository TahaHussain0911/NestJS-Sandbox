import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStudent {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  email: string;
}
