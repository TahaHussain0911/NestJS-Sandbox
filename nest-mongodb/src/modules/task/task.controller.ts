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
import { TaskService } from './task.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from 'src/common/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '../auth/enums/roles.enum';
import { CreateTask } from './dtos/create-task.dto';
import { AuthUser } from '../auth/decorators/auth_user.decorator';
import { UpdateTask } from './dtos/update-task.dto';
import type { Query as QueryParams } from 'express-serve-static-core';
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  getTasks(
    @Query() query: QueryParams,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.taskService.getTasks({
      query,
      orgId,
      userId,
      role,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  getTask(
    @Param('id') taskId: string,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.taskService.getTask({
      taskId,
      orgId,
      userId,
      role,
    });
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  createTask(
    @Body() payload: CreateTask,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.taskService.createTask({
      payload,
      orgId,
      userId,
      role,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  updateTask(
    @Param('id') taskId: string,
    @Body() payload: UpdateTask,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.taskService.updateTask({
      taskId,
      payload,
      orgId,
      userId,
      role,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, OrganizationGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  deleteTask(
    @Param('id') taskId: string,
    @AuthUser('organization') orgId: string,
    @AuthUser('_id') userId: string,
    @AuthUser('role') role: Role[],
  ) {
    return this.taskService.deleteTask({
      taskId,
      orgId,
      userId,
      role,
    });
  }
}
