import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auth } from 'src/modules/auth/schemas/auth.schema';

export type OrganizationDocument = Organization & Document;

@Schema({
  timestamps: true,
})
export class Organization {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
  })
  slug: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Auth',
    required: true,
  })
  owner: Types.ObjectId;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
