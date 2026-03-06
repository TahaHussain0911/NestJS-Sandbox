import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Organization } from 'src/modules/organization/schemas/organization.schema';
import { Team } from 'src/modules/team/schemas/team.schema';

export type ProjectDocument = Project & Document;

@Schema({
  timestamps: true,
})
export class Project {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  slug: string;

  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
  })
  organization: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Team.name,
    default: null,
  })
  team: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

export interface PopulatedProject extends Omit<ProjectDocument, 'team'> {
  team: Team;
}
