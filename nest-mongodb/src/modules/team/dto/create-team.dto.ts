import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeam {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsOptional()
  @IsMongoId()
  leaderId?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  memberIds?: string[];
}
