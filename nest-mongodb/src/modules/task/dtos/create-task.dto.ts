import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTask {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @IsMongoId()
  projectId: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;
}
