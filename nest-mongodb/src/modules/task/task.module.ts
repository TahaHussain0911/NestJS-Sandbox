import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { ProjectModule } from '../project/project.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    forwardRef(() => TeamModule),
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema,
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [MongooseModule],
})
export class TaskModule {}
