import { IsString } from 'class-validator';

export class RequestResetPassword {
  @IsString()
  email: string;
}
