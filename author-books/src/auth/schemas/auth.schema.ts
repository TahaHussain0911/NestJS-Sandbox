import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Auth extends Document {
  @Prop({ unique: [true, 'Duplicate email entered'] })
  email: string;

  @Prop()
  name: string;

  @Prop({ select: false })
  password: string;
}
export const AuthSchema = SchemaFactory.createForClass(Auth);
