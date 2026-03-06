import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { TeamModule } from '../team/team.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    forwardRef(() => TaskModule),
    forwardRef(() => TeamModule),
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [MongooseModule],
})
export class ProjectModule {}
