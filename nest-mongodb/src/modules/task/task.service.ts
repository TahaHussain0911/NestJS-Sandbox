import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Role } from '../auth/enums/roles.enum';
import {
  PopulatedProject,
  Project,
  ProjectDocument,
} from '../project/schemas/project.schema';
import { CreateTask } from './dtos/create-task.dto';
import { UpdateTask } from './dtos/update-task.dto';
import { TaskStatus } from './enums/task.enum';
import { PopulatedTask, Task, TaskDocument } from './schemas/task.schema';
import { Query as QueryParams } from 'express-serve-static-core';
import { Team, TeamDocument } from '../team/schemas/team.schema';
import { convertStringIdsToMongoIds } from 'src/common/utils/helper';
@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,
  ) {}

  async getTasks({
    query,
    orgId,
    userId,
    role,
  }: {
    query: QueryParams;
    orgId: string;
    userId: string;
    role: Role[];
  }): Promise<{ tasks: Task[]; totalCount: number }> {
    const {
      page = '1',
      limit = '40',
      search,
      projectId = '',
      teamId = '',
    } = query;
    const pageNumber = Math.max(Number(page), 1);
    const pageLimit = Math.max(Number(limit), 1);
    const matchStage: any = {};
    const pipeline: PipelineStage[] = [];
    if (!projectId || typeof projectId !== 'string') {
      const allTeams = await this.teamModel.find({
        ...(teamId && typeof teamId === 'string'
          ? {
              _id: teamId,
            }
          : {}),
        organization: orgId,
        ...(!role.includes(Role.OWNER) ? { members: userId } : {}),
      });
      console.log(allTeams, 'allTeams', teamId);
      if (!allTeams.length)
        return {
          tasks: [],
          totalCount: 0,
        };
      const allProjects = await this.projectModel.find({
        team: { $in: allTeams.map((team) => team?._id) },
      });
      if (!allProjects.length)
        return {
          tasks: [],
          totalCount: 0,
        };
      matchStage.project = { $in: allProjects.map((project) => project._id) };
    }

    if (projectId && typeof projectId === 'string') {
      matchStage.project = convertStringIdsToMongoIds(projectId);
    }
    if (search) {
      matchStage['$or'] = [
        {
          title: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    pipeline.push(
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: (pageNumber - 1) * pageLimit },
            {
              $limit: pageLimit,
            },
            {
              $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'project',
              },
            },
            {
              $unwind: {
                path: '$project',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
    );
    const result = await this.taskModel.aggregate(pipeline);
    console.log(result, 'result');
    return {
      tasks: result[0].data,
      totalCount: result[0].metadata?.[0]?.total || 0,
    };
  }

  async getTask({
    taskId,
    orgId,
    userId,
    role,
  }: {
    taskId: string;
    orgId: string;
    userId: string;
    role: Role[];
  }): Promise<{ task: PopulatedTask }> {
    const task = (await this.taskModel.findById(taskId).populate({
      path: 'project',
      populate: {
        path: 'team',
      },
    })) as unknown as PopulatedTask;
    if (!task) throw new BadRequestException(`Task not found`);
    if (String(task.project.organization) !== String(orgId))
      throw new BadRequestException('Task doesnot exist in this organization');
    const isOwner = role.includes(Role.OWNER);
    if (!isOwner) {
      if (!task.project.team.members.map(String).includes(String(userId))) {
        throw new ForbiddenException(`Cannot access this task`);
      }
    }
    return { task };
  }

  async createTask({
    payload,
    orgId,
    userId,
    role,
  }: {
    payload: CreateTask;
    orgId: string;
    userId: string;
    role: Role[];
  }): Promise<{ task: Task; message: string }> {
    const { title, description = '', projectId, assignedTo } = payload;
    const isOwner = role.includes(Role.OWNER);
    const task = new this.taskModel({
      title,
      description,
    });
    const project = await this.validateProject({
      projectId,
      orgId,
      userId,
      isOwner,
    });
    task.project = project._id;
    if (assignedTo) {
      task.assignedTo = await this.validateAssignedToMember({
        assignedTo,
        project,
      });
      task.status = TaskStatus.ASSIGNED;
    }
    await task.save();
    return {
      task,
      message: 'Task created successfully',
    };
  }

  async updateTask({
    taskId,
    payload,
    orgId,
    userId,
    role,
  }: {
    taskId: string;
    payload: UpdateTask;
    orgId: string;
    userId: string;
    role: Role[];
  }): Promise<{ task: Task | null; message: string }> {
    const task = (await this.taskModel.findById(taskId).populate({
      path: 'project',
      populate: {
        path: 'team',
      },
    })) as unknown as PopulatedTask;
    if (!task) throw new BadRequestException(`Task not found`);
    if (String(task.project.organization) !== String(orgId))
      throw new BadRequestException('Task doesnot exist in this organization');
    console.log(task, 'task');
    const { title, description, projectId, assignedTo, status } = payload;
    const isOwner = role.includes(Role.OWNER);
    let project = task.project;
    if (!isOwner) {
      if (String(task.project.team.leader) !== String(userId)) {
        throw new ForbiddenException(
          `Only team leader or owner can update task`,
        );
      }
    }
    const updatedTaskValues: Partial<Task> = {};
    updatedTaskValues.title = title || task.title;
    updatedTaskValues.status = status || task.status;
    if (description) {
      updatedTaskValues.description = description;
    }
    const newIncomingProject =
      projectId && String(task.project._id) !== projectId;
    if (newIncomingProject) {
      project = await this.validateProject({
        projectId,
        orgId,
        userId,
        isOwner,
      });
      updatedTaskValues.project = project._id;
    }
    if (
      assignedTo &&
      (!task.assignedTo ||
        newIncomingProject ||
        String(task.assignedTo) !== String(assignedTo))
    ) {
      updatedTaskValues.assignedTo = await this.validateAssignedToMember({
        assignedTo,
        project,
      });
      updatedTaskValues.status = TaskStatus.ASSIGNED;
    }
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      updatedTaskValues,
      {
        returnDocument: 'after',
      },
    );
    return {
      task: updatedTask,
      message: 'Task updated successfully',
    };
  }

  async validateAssignedToMember({
    assignedTo,
    project,
  }: {
    assignedTo: string;
    project: PopulatedProject;
  }): Promise<Types.ObjectId> {
    const memberExistId = project.team.members.find(
      (id) => String(id) === String(assignedTo),
    );
    if (!memberExistId)
      throw new BadRequestException('Member doesnot exists in this team');
    return memberExistId;
  }

  async validateProject({
    projectId,
    orgId,
    userId,
    isOwner,
  }: {
    projectId: string;
    orgId: string;
    userId: string;
    isOwner: boolean;
  }): Promise<PopulatedProject> {
    const project = (await this.projectModel
      .findOne({ _id: projectId, organization: orgId })
      .populate('team')) as unknown as PopulatedProject;
    if (!project) throw new BadRequestException(`Project not found`);
    if (!project.team)
      throw new BadRequestException(
        `Please assign a team to this project before creating/updating task`,
      );
    if (!isOwner) {
      if (String(project.team.leader) !== String(userId)) {
        throw new ForbiddenException(`You are not the leader of this project`);
      }
    }
    return project;
  }
  async deleteTask({
    taskId,
    orgId,
    userId,
    role,
  }: {
    taskId: string;
    orgId: string;
    userId: string;
    role: Role[];
  }): Promise<{ task: PopulatedTask }> {
    const task = (await this.taskModel.findById(taskId).populate({
      path: 'project',
      populate: {
        path: 'team',
      },
    })) as unknown as PopulatedTask;
    if (!task) throw new BadRequestException(`Task not found`);
    if (String(task.project.organization) !== String(orgId))
      throw new BadRequestException('Task doesnot exist in this organization');
    const isOwner = role.includes(Role.OWNER);
    if (!isOwner) {
      if (String(task.project.team.leader) !== String(userId)) {
        throw new ForbiddenException(`Cannot access this task`);
      }
    }
    await this.taskModel.findByIdAndDelete(task._id);
    return { task };
  }
}
