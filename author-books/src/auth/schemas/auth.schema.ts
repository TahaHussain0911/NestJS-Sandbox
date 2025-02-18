import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enums/roles.enum';

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

  @Prop({
    type: [{ type: String, enum: Role }],
    default: [Role.User],
    immutable: true,
  })
  role: Role[];
}
export const AuthSchema = SchemaFactory.createForClass(Auth);
