import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateOrganization {
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;
}
