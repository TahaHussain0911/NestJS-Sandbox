import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enums/role.enum';
import * as bcrypt from 'bcryptjs';

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
    select: false,
    default: false,
  })
  otpVerified?: boolean;

  @Prop({
    type: [{ type: String, enum: Role }],
    default: [Role.User],
    immutable: true,
  })
  role: Role[];

  comparePassword: Function;
}
const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
  } catch (error) {
    next(error);
  }
});

AuthSchema.methods.comparePassword = async function (
  plainPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.password);
};

export { AuthSchema };
