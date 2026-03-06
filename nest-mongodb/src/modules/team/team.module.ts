import { forwardRef, Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './schemas/team.schema';
import { AuthModule } from '../auth/auth.module';
import { ProjectModule } from '../project/project.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    forwardRef(() => TaskModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      {
        name: Team.name,
        schema: TeamSchema,
      },
    ]),
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [MongooseModule],
})
export class TeamModule {}
