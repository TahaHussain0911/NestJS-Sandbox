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
import { ProjectService } from './project.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from 'src/common/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '../auth/enums/roles.enum';
import { CreateProject } from './dtos/create-project.dto';
import { AuthUser } from '../auth/decorators/auth_user.decorator';
import type { Query as QueryParams } from 'express-serve-static-core';
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  createProject(
    @Body() payload: CreateProject,
    @AuthUser('organization') orgId: string,
    @AuthUser('role') role: Role[],
    @AuthUser('_id') userId: string,
  ) {
    return this.projectService.createProject({
      payload,
      orgId,
      role,
      userId,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  updateProject(
    @Param('id') projectId: string,
    @Body() payload: CreateProject,
    @AuthUser('organization') orgId: string,
    @AuthUser('role') role: Role[],
    @AuthUser('_id') userId: string,
  ) {
    return this.projectService.updateProject({
      projectId,
      payload,
      orgId,
      role,
      userId,
    });
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  getProjects(
    @Query() query: QueryParams,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.projectService.getProjects({ query, orgId, userId, role });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  getProject(
    @Param('id') projectId: string,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.projectService.getProject({
      projectId,
      orgId,
      userId,
      role,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  deleteProject(
    @Param('id') projectId: string,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.projectService.deleteProject({
      projectId,
      orgId,
      userId,
      role,
    });
  }
}
