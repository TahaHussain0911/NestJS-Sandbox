import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auth } from 'src/modules/auth/schemas/auth.schema';
import { Organization } from 'src/modules/organization/schemas/organization.schema';
import {
  PopulatedProject,
  Project,
} from 'src/modules/project/schemas/project.schema';
import { TaskStatus } from '../enums/task.enum';

export type TaskDocument = Task & Document;

@Schema({
  timestamps: true,
})
export class Task {
  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    default: '',
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: Project.name,
    required: true,
  })
  project: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Auth.name,
    default: null,
  })
  assignedTo: Types.ObjectId;

  @Prop({
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

export interface PopulatedTask extends Omit<TaskDocument, 'project'> {
  project: PopulatedProject;
}
