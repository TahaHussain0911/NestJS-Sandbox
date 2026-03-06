import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import type { Query as ExpressQuery } from 'express-serve-static-core';
@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
  ) {}

  async allStudents(query: ExpressQuery): Promise<Student[]> {
    const { search, page = '1', limit = '40' } = query;
    const pageNumber = Math.max(Number(page), 1);
    const recordsLimit = Math.max(Number(limit), 1);
    let searchParams = {};
    const pipeline: any = [];
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              name: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              email: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      });
    }
    pipeline.push(
      {
        $skip: (pageNumber - 1) * recordsLimit,
      },
      {
        $limit: recordsLimit,
      },
    );
    const allStudents = await this.studentModel.aggregate(pipeline);
    return allStudents;
  }

  async studentById(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async createStudent(data: Partial<Student>): Promise<Student> {
    const newStudent = new this.studentModel(data);
    return newStudent.save();
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const updatedStudent = await this.studentModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedStudent) throw new NotFoundException('Student not found');
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<Student> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id);
    if (!deletedStudent) throw new NotFoundException('Student not found');
    return deletedStudent;
  }
}
