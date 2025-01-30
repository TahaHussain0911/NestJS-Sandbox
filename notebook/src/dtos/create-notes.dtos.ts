import { IsString } from 'class-validator';

export class CreateNotesDto {
  @IsString()
  note: string;
}
