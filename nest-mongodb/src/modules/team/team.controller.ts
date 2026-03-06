import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from 'src/common/guards/organization.guard';
import { Role } from '../auth/enums/roles.enum';
import { Roles } from '../auth/decorators/roles.decorators';
import { CreateTeam } from './dto/create-team.dto';
import { AuthUser } from '../auth/decorators/auth_user.decorator';
import { UpdateTeam } from './dto/update-team.dto';
import type { Query as QueryParams } from 'express-serve-static-core';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  getTeams(
    @Query() query: QueryParams,
    @AuthUser('organization') orgId: string,
    @AuthUser('role') role: Role[],
    @AuthUser('_id') userId: string,
  ) {
    return this.teamService.getTeams(query, orgId, userId, role);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  getTeam(
    @Param('id') teamId: string,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.teamService.getTeam(teamId, orgId, userId, role);
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER)
  createTeam(
    @Body() payload: CreateTeam,
    @AuthUser('organization') orgId: string,
  ) {
    return this.teamService.createTeam(payload, orgId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  updateTeam(
    @Param('id') teamId: string,
    @Body() payload: UpdateTeam,
    @AuthUser('organization') orgId: string,
    @AuthUser('role') role: Role[],
    @AuthUser('_id') userId: string,
  ) {
    return this.teamService.updateTeam(teamId, payload, orgId, role, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  deleteTeam(
    @Param('id') teamId: string,
    @AuthUser('organization') orgId: string,
    @AuthUser('role') role: Role[],
    @AuthUser('_id') userId: string,
  ) {
    return this.teamService.deleteTeam(teamId, orgId, role, userId);
  }
}
