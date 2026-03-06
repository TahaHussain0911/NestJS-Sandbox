import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProject {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  name?: string;

  @IsOptional()
  @IsMongoId()
  teamId?: string;
}
