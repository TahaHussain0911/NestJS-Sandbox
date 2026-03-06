import { IsEmail, IsString } from 'class-validator';

export class CreateInvitation {
  @IsString()
  @IsEmail()
  email: string;
}
