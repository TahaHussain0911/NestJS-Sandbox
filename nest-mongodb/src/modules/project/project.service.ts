import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import {
  convertStringIdsToMongoIds,
  createSlug,
} from 'src/common/utils/helper';
import { Role } from '../auth/enums/roles.enum';
import { Team, TeamDocument } from '../team/schemas/team.schema';
import { CreateProject } from './dtos/create-project.dto';
import {
  PopulatedProject,
  Project,
  ProjectDocument,
} from './schemas/project.schema';
import { UpdateProject } from './dtos/update-project.dto';
import { Query as QueryParams } from 'express-serve-static-core';
import { Task, TaskDocument } from '../task/schemas/task.schema';
import { TaskStatus } from '../task/enums/task.enum';
@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  private async validateTeam({
    teamId,
    orgId,
    userId,
    role,
  }: {
    teamId: string;
    orgId: string;
    userId: string;
    role: Role[];
  }) {
    const teamExists = await this.teamModel.findOne({
      _id: teamId,
      organization: orgId,
      ...(role.includes(Role.ADMIN) ? { leader: userId } : {}),
    });
    console.log(teamExists, 'teamExists', userId, teamId);
    if (!teamExists)
      throw new BadRequestException(
        `Team doesnot exist in your organization or you are not the leader of team`,
      );
    return teamExists;
  }

  async getProjects({
    query,
    orgId,
    userId,
    role,
  }: {
    query: QueryParams;
    orgId: string;
    userId: string;
    role: Role[];
  }): Promise<{ projects: Project[]; totalCount: number }> {
    const { page = '1', limit = '40', search, teamId } = query;
    const pageNumber = Math.max(Number(page), 1);
    const pageLimit = Math.max(Number(limit), 1);
    const matchStage: any = {
      organization: orgId,
    };
    const pipeline: PipelineStage[] = [];
    if (search) {
      matchStage.name = {
        $regex: search,
        $options: 'i',
      };
    }
    if (teamId && typeof teamId === 'string' && role.includes(Role.OWNER)) {
      matchStage.team = convertStringIdsToMongoIds(teamId);
    }
    pipeline.push({
      $match: matchStage,
    });
    pipeline.push(
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'team',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
          preserveNullAndEmptyArrays: true,
        },
      },
    );
    if (!role.includes(Role.OWNER)) {
      pipeline.push({
        $match: {
          'team.members': userId,
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        projects: [
          {
            $skip: (pageNumber - 1) * pageLimit,
          },
          {
            $limit: pageLimit,
          },
        ],
      },
    });
    const result = await this.projectModel.aggregate(pipeline);
    return {
      projects: result?.[0]?.projects,
      totalCount: result?.[0]?.metadata?.[0]?.total || 0,
    };
  }

  async getProject({
    projectId,
    orgId,
    userId,
    role,
  }: {
    projectId: string;
    orgId: string;
    userId: string;
    role: Role[];
  }): Promise<{ project: Project }> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: convertStringIdsToMongoIds(projectId),
          organization: orgId,
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'team',
          foreignField: '_id',
          as: 'team',
        },
      },
      {
        $unwind: {
          path: '$team',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (!role.includes(Role.OWNER)) {
      pipeline.push({
        $match: {
          'team.members': userId,
        },
      });
    }
    pipeline.push(
      {
        $lookup: {
          from: 'auths',
          localField: 'team.leader',
          foreignField: '_id',
          as: 'team.leader',
        },
      },
      {
        $unwind: {
          path: '$team.leader',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'auths',
          localField: 'team.members',
          foreignField: '_id',
          as: 'team.members',
        },
      },
      {
        $project: {
          team: {
            leader: {
              password: 0,
              refreshToken: 0,
            },
            members: {
              password: 0,
              refreshToken: 0,
            },
          },
        },
      },
    );
    const project = (await this.projectModel.aggregate(pipeline))?.[0];
    if (!project) {
      throw new BadRequestException('Project not found in this organization');
    }

    return {
      project,
    };
  }

  async createProject({
    payload,
    orgId,
    role,
    userId,
  }: {
    payload: CreateProject;
    orgId: string;
    role: Role[];
    userId: string;
  }): Promise<{ project: Project }> {
    const { name, teamId } = payload;
    const createdProject = new this.projectModel({
      name,
      slug: createSlug(name),
      organization: orgId,
    });
    if (teamId) {
      createdProject.team = (
        await this.validateTeam({
          teamId,
          orgId,
          role,
          userId,
        })
      )._id;
    }
    await createdProject.save();
    return {
      project: createdProject,
    };
  }

  async updateProject({
    projectId,
    payload,
    orgId,
    role,
    userId,
  }: {
    projectId: string;
    payload: UpdateProject;
    orgId: string;
    role: Role[];
    userId: string;
  }): Promise<{ project: Project }> {
    const { name, teamId } = payload;
    const project = await this.projectModel.findOne({
      _id: projectId,
      organization: orgId,
    });
    if (!project) {
      throw new BadRequestException('Project not found in this organization');
    }
    if (name) {
      project.name = name;
      project.slug = createSlug(name);
    }
    if (teamId && (!project.team || String(project.team) !== teamId)) {
      const newTeam = await this.validateTeam({
        teamId,
        orgId,
        role,
        userId,
      });
      project.team = newTeam._id;
      await this.taskModel.updateMany(
        {
          project: project._id,
          assignedTo: { $nin: newTeam.members }, // assigned user not in team
        },
        {
          $set: { assignedTo: null },
        },
      );
    }
    await project.save();
    return {
      project,
    };
  }

  async deleteProject({
    projectId,
    orgId,
    role,
    userId,
  }: {
    projectId: string;
    orgId: string;
    role: Role[];
    userId: string;
  }): Promise<{ project: PopulatedProject; message: string }> {
    const isOwner = role.includes(Role.OWNER);
    const project = (await this.projectModel
      .findOne({
        _id: projectId,
        organization: orgId,
      })
      .populate('team')) as unknown as PopulatedProject;
    if (!project)
      throw new BadRequestException('Project not found in your organization');
    if (!isOwner && String(project.team?.leader) !== String(userId))
      throw new ForbiddenException('Only team leader can delete a project');
    const pendingTask = await this.taskModel.exists({
      project: project._id,
      status: { $ne: TaskStatus.COMPLETED },
    });
    if (pendingTask) {
      throw new BadRequestException(
        'Cannot delete project - some tasks are pending',
      );
    }
    await this.taskModel.deleteMany({
      project: project._id,
    });
    await this.projectModel.deleteOne({
      _id: project._id,
    });

    return {
      project,
      message: 'Project deleted successfully',
    };
  }
}
