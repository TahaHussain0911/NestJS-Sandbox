import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployee } from './dtos/create-employee.dto';
import { UpdateEmployee } from './dtos/update-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  getAllEmployees() {
    return this.employeesService.getAllEmployees();
  }

  @Get(':id')
  getSingleEmployee(@Param('id') id: string) {
    return this.employeesService.getSingleEmployee(id);
  }

  @Post()
  createEmployee(@Body() payload: CreateEmployee) {
    return this.employeesService.createEmployee(payload);
  }

  @Patch(':id')
  updateEmployee(@Param('id') id: string, @Body() payload: UpdateEmployee) {
    return this.employeesService.updateEmployee(payload, id);
  }
}
