import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employees } from './employees.entity';
import { Repository } from 'typeorm';
import { CreateEmployee } from './dtos/create-employee.dto';
import { UpdateEmployee } from './dtos/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employees)
    private readonly employeeRepository: Repository<Employees>,
  ) {}

  async getAllEmployees(): Promise<Employees[]> {
    return this.employeeRepository.find();
  }
  async getSingleEmployee(id: string): Promise<Employees> {
    if (isNaN(Number(id))) throw new BadRequestException('Id must be a number');
    const employee = await this.employeeRepository.findOneBy({
      id: Number(id),
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }
    return employee;
  }
  async createEmployee(payload: CreateEmployee): Promise<Employees> {
    const employee = this.employeeRepository.create(payload);
    return this.employeeRepository.save(employee);
  }
  async updateEmployee(
    payload: UpdateEmployee,
    id: string,
  ): Promise<Employees> {
    const numberId = Number(id);
    if (isNaN(numberId)) throw new BadRequestException('Id must be a number');

    const employee = await this.employeeRepository.preload({
      id: numberId,
      ...payload,
    });

    if (!employee) throw new BadRequestException('Employee not found');

    return this.employeeRepository.save(employee);
  }
}
