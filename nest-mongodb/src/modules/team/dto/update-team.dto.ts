import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTeam {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  })
  name?: string;

  @IsOptional()
  @IsMongoId()
  leaderId?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  memberIds?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  deletedMemberIds?: string[];
}
