import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'Priya Sharma' })
  name!: string;

  @ApiProperty({ example: '9876543210' })
  mobile!: string;

  @ApiProperty({ example: 'priya@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'Bengaluru, Karnataka' })
  address?: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiPropertyOptional({ example: 'USER' })
  roleId?: string;

  @ApiPropertyOptional({ example: 'firebase-uid-123' })
  firebaseUid?: string;

  @ApiProperty({ example: false })
  isProfileCompleted!: boolean;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  updatedAt!: string;
}
