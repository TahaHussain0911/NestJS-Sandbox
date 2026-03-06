import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Department, Position } from '../enums/employees.enum';

export class CreateEmployee {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase?.())
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsEnum(Department)
  department?: Department;
}
