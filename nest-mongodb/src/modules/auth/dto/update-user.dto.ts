import {
  IsMobilePhone,
  IsOptional,
  isString,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUser {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsMobilePhone()
  @IsString()
  phone?: String;
}
