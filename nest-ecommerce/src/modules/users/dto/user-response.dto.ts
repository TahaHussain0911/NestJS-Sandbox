import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'User id',
    example: '600a3d0d-0145-47a8-aa7a-538371e10d49',
  })
  id: string;

  @ApiProperty({
    description: 'User Email address',
    example: 'taha12@yopmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'User First Name',
    example: 'Taha',
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User Last Name',
    example: 'Hussain',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User Role',
    example: 'USER',
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-10-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update date',
    example: '2023-10-10T12:34:56.789Z',
  })
  updatedAt: Date;
}
