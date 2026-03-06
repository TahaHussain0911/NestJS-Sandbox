import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Auth } from 'src/modules/auth/schemas/auth.schema';
import { Organization } from 'src/modules/organization/schemas/organization.schema';

export type TeamDocument = Team & Document;

@Schema({
  timestamps: true,
})
export class Team {
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
    ref: Organization.name,
  })
  organization: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Auth.name,
    default: null,
  })
  leader: Types.ObjectId;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: Auth.name,
      },
    ],
    default: [],
  })
  members: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);

// TeamSchema.pre('findOneAndDelete', async function () {
//   const team = await this.model.findOne(this.getQuery());
//   if (!team) return;
//   const mongoose = (await import('mongoose')).default; // dynamic import helps in some cases
//   const ProjectModel = mongoose.model('Projects');
//   await ProjectModel.updateMany({ team: team._id }, { $set: { team: null } });
// });
