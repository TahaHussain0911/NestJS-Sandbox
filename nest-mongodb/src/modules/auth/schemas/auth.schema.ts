import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../enums/roles.enum';
import { Exclude } from 'class-transformer';
import { Organization } from 'src/modules/organization/schemas/organization.schema';

export type AuthDocument = Auth & Document;

@Schema({
  timestamps: true,
})
export class Auth {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: false,
    default: null,
  })
  phone: string;

  @Prop({
    required: true,
    immutable: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    default: [Role.MEMBER],
  })
  role: Role[];

  @Prop({
    select: false,
  })
  refreshToken: string;

  @Prop()
  resetPasswordExpiry?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    default: null,
  })
  organization: Types.ObjectId;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
