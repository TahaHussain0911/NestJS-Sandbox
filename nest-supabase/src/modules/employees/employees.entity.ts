import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Department, Position } from './enums/employees.enum';

@Entity()
export class Employees {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: String;

  @Column({
    type: 'enum',
    enum: Position,
    nullable: true,
  })
  position?: string;

  @Column({
    type: 'enum',
    enum: Department,
    nullable: true,
  })
  department?: string;
}
