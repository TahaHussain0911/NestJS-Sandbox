import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enums/role.enum';

@Schema({
  timestamps: true,
})
export class Auth extends Document {
  @Prop()
  name: string;

  @Prop({
    unique: true,
  })
  email: string;

  @Prop({
    select: false,
  })
  password: string;

  @Prop()
  photo?: string;

  @Prop()
  contact?: string;

  @Prop({
    select: false,
  })
  passwordChangedAt?: Date;

  @Prop({
    select: false,
  })
  otp?: string;

  @Prop({
    select: false,
  })
  otpExpiresAt?: Date;

  @Prop({
    default: false,
  })
  otpVerified?: boolean;

  @Prop({
    type: [{ type: String, enum: Role }],
    default: [Role.User],
    immutable: true,
  })
  role: Role[];
}
export const AuthSchema = SchemaFactory.createForClass(Auth);
