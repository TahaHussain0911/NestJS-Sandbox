import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop()
  otpExpiresAt?: Date;

  @Prop({
    default: false,
  })
  otpVerified?: boolean;

  @Prop({
    default: 'user',
    immutable: true,
  })
  role: string;
}
export const AuthSchema = SchemaFactory.createForClass(Auth);
