import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query as QueryParams } from 'express-serve-static-core';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  convertStringIdsToMongoIds,
  createSlug,
} from 'src/common/utils/helper';
import { Role } from '../auth/enums/roles.enum';
import { Auth, AuthDocument } from '../auth/schemas/auth.schema';
import { CreateTeam } from './dto/create-team.dto';
import { UpdateTeam } from './dto/update-team.dto';
import { Team, TeamDocument } from './schemas/team.schema';
import { Project, ProjectDocument } from '../project/schemas/project.schema';
import { Task, TaskDocument } from '../task/schemas/task.schema';
import { TaskStatus } from '../task/enums/task.enum';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async createTeam(
    payload: CreateTeam,
    orgId: string,
  ): Promise<{ team: Team; message: string }> {
    const { name, leaderId, memberIds = [] } = payload;
    const teamSlug = createSlug(name);
    const team = await this.teamModel.findOne({
      slug: teamSlug,
      organization: orgId,
    });
    if (team)
      throw new BadRequestException(
        `Use a different team name for your organization!`,
      );
    const createdTeam = new this.teamModel({
      name,
      slug: teamSlug,
      organization: orgId,
    });
    if (leaderId) {
      createdTeam.leader = await this.validateLeader(leaderId, orgId);
      memberIds?.push(leaderId);
    }
    if (memberIds?.length) {
      createdTeam.members = await this.validateMembers(memberIds, orgId);
    }
    await createdTeam.save();
    return {
      team: createdTeam,
      message: 'Team created successfully',
    };
  }

  async updateTeam(
    teamId: string,
    payload: UpdateTeam,
    orgId: string,
    role: Role[],
    userId: string,
  ): Promise<{ team: Team; message: string }> {
    const { name, leaderId, memberIds = [], deletedMemberIds = [] } = payload;
    const team = await this.teamModel.findOne({
      _id: teamId,
      organization: orgId,
    });
    if (!team)
      throw new BadRequestException('Team doesnot exist in this organization');
    if (name) {
      team.name = name;
      team.slug = createSlug(name);
    }
    if (role.includes(Role.OWNER)) {
      // if leaderId exists and team doesnot have a leader
      // if leaderId exists and team leader is not same as leaderId
      if (leaderId && (!team.leader || String(team.leader) !== leaderId)) {
        team.leader = await this.validateLeader(leaderId, orgId);
        if (!memberIds.includes(leaderId)) {
          memberIds?.push(leaderId);
        }
      }
    } else {
      // if team has no leader or you are not the team leader
      if (!team.leader || String(team.leader) !== String(userId))
        throw new BadRequestException(
          'Only team leader or organization owner can edit his team',
        );
      // if leader wants to change team leader
      if (leaderId) throw new BadRequestException('Only owner can edit leader');
    }
    const leaderFilteredDeletedMembers = deletedMemberIds.filter(
      (id) => String(id) !== (leaderId || String(team.leader)),
    );
    const teamMembers = await this.setTeamMembers({
      members: team.members.map((m) => String(m)),
      deletedMemberIds: leaderFilteredDeletedMembers,
      memberIds,
      orgId,
    });
    team.members = teamMembers;
    await team.save();
    if (leaderFilteredDeletedMembers.length > 0) {
      const projects = await this.projectModel.find({
        team: team._id,
      });
      const projectIds = projects.map((p) => p._id);
      await this.taskModel.updateMany(
        {
          project: { $in: projectIds },
          assignedTo: {
            $in: convertStringIdsToMongoIds(leaderFilteredDeletedMembers),
          },
        },
        {
          $set: {
            assignedTo: null,
          },
        },
      );
    }
    return {
      team: team,
      message: 'Team updated successfully!',
    };
  }

  async getTeams(
    query: QueryParams,
    orgId: string,
    userId: string,
    role: Role[],
  ): Promise<{ teams: Team[]; totalCount: number }> {
    const { search, page = '1', limit = '40', leader, members = '' } = query;
    const pageNumber = Math.max(Number(page), 1);
    const pageLimit = Math.max(Number(limit), 1);
    const pipeline: PipelineStage[] = [];
    const matchStage: any = {
      organization: orgId,
    };
    if (search) {
      matchStage.name = {
        $regex: search,
        $options: 'i',
      };
    }
    if (members && typeof members === 'string') {
      const memberIds = convertStringIdsToMongoIds(members.split(','));
      matchStage.members = { $all: memberIds }; // checks all memberIds found
      // matchStage.members = { $in: memberIds }; checks if any one of memberIds found
    }
    if (role.includes(Role.ADMIN)) {
      matchStage.leader = userId;
    } else if (leader && typeof leader === 'string') {
      matchStage.leader = convertStringIdsToMongoIds(leader);
    }
    pipeline.push(
      { $match: matchStage },
      {
        $facet: {
          data: [
            {
              $skip: (pageNumber - 1) * pageLimit,
            },
            {
              $limit: pageLimit,
            },
            {
              $lookup: {
                from: 'auths',
                localField: 'leader',
                foreignField: '_id',
                as: 'leader',
              },
            },
            {
              $lookup: {
                from: 'auths',
                localField: 'members',
                foreignField: '_id',
                as: 'members',
              },
            },
            {
              $unwind: {
                path: '$leader',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
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
          ],
          metadata: [{ $count: 'total' }],
        },
      },
    );
    const result = await this.teamModel.aggregate(pipeline);
    return {
      teams: result?.[0].data,
      totalCount: result?.[0].metadata?.[0]?.total || 0,
    };
  }

  async getTeam(
    teamId: string,
    orgId: string,
    userId: string,
    role: Role[],
  ): Promise<{ team: Team }> {
    const team = await this.teamModel
      .findOne({
        _id: teamId,
        organization: orgId,
        ...(!role.includes(Role.OWNER) ? { members: userId } : {}),
      })
      .populate('leader members');
    if (!team) {
      throw new BadRequestException(`Team not found in this organization`);
    }
    return { team };
  }

  async deleteTeam(
    teamId: string,
    orgId: string,
    role: Role[],
    userId: string,
  ): Promise<{ team: Team; message: string }> {
    const team = await this.teamModel.findOne({
      _id: teamId,
      organization: orgId,
      ...(role.includes(Role.ADMIN) ? { leader: userId } : {}),
    });
    if (!team)
      throw new BadRequestException('Team doesnot exists in your organization');
    const projects = await this.projectModel.find({
      team: teamId,
    });
    const projectIds = projects.map((p) => p._id);
    const pendingTasks = await this.taskModel.exists({
      project: { $in: projectIds },
      status: { $ne: TaskStatus.COMPLETED },
    });
    if (pendingTasks) {
      throw new BadRequestException(
        'Cannot delete team - some projects have pending tasks',
      );
    }
    await this.taskModel.deleteMany({
      project: { $in: projectIds },
    });
    await this.teamModel.deleteOne({
      _id: teamId,
    });

    await this.projectModel.updateMany(
      {
        team: convertStringIdsToMongoIds(teamId),
      },
      {
        $set: {
          team: null,
        },
      },
    );
    return {
      team,
      message: 'Team and its completed tasks were deleted successfully!',
    };
  }

  private async setTeamMembers({
    members,
    orgId,
    deletedMemberIds,
    memberIds,
  }: {
    members: string[];
    orgId: string;
    deletedMemberIds?: string[];
    memberIds?: string[];
  }): Promise<Types.ObjectId[]> {
    let allMembers = new Set(members);
    if (deletedMemberIds?.length) {
      deletedMemberIds.forEach((id) => allMembers.delete(id));
    }
    if (memberIds?.length) {
      const newMembers = await this.validateMembers(memberIds, orgId);
      newMembers.forEach((id) => allMembers.add(String(id)));
    }
    return convertStringIdsToMongoIds(Array.from(allMembers));
  }

  private async validateLeader(
    leaderId: string,
    orgId: string,
  ): Promise<Types.ObjectId> {
    const leader = await this.authModel.findOne({
      _id: leaderId,
      organization: orgId,
      role: Role.ADMIN, // only admins can be team leader
    });

    if (!leader) {
      throw new BadRequestException(
        'Leader must exist in your organization and must be an admin.',
      );
    }

    return leader._id;
  }

  private async validateMembers(memberIds: string[], orgId: string) {
    const membersExists = await this.authModel.find({
      _id: { $in: memberIds },
      organization: orgId,
      role: { $in: [Role.MEMBER, Role.ADMIN] },
    });
    if (membersExists.length !== memberIds.length)
      throw new BadRequestException(
        `Some members do not exist in your organization or are at owner level`,
      );
    return membersExists.map((m) => m._id);
  }
}
