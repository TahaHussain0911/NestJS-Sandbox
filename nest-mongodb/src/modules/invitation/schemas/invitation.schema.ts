import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auth, AuthSchema } from 'src/modules/auth/schemas/auth.schema';
import { Organization } from 'src/modules/organization/schemas/organization.schema';
import { InvitationStatus } from '../enums/invitation.enum';

export type InvitationDocument = Invitation & Document;

@Schema({
  timestamps: true,
})
export class Invitation {
  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
  })
  organization: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Auth.name,
  })
  invitedBy: Types.ObjectId;

  @Prop({
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Prop({
    type: Types.ObjectId,
    ref: Auth.name,
  })
  user: Types.ObjectId;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
