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
import { StudentService } from './student.service';
import { Student } from './schemas/student.schema';
import { CreateStudent } from './dto/create-student.dto';
import { UpdateStudent } from './dto/update-student.dto';
import type { Query as QueryParams } from 'express-serve-static-core';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '../auth/enums/roles.enum';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.MEMBER)
  getStudents(@Query() query: QueryParams) {
    return this.studentService.allStudents(query);
  }

  @Get(':id')
  getSingleStudent(@Param('id') id: string) {
    return this.studentService.studentById(id);
  }

  @Post()
  createStudent(@Body() data: CreateStudent) {
    return this.studentService.createStudent(data);
  }

  @Patch(':id')
  updateStudent(@Param('id') id: string, @Body() data: UpdateStudent) {
    return this.studentService.updateStudent(id, data);
  }

  @Delete(':id')
  deleteStudent(@Param('id') id: string) {
    return this.studentService.deleteStudent(id);
  }
}
