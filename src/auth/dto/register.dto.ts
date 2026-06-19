import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Priya Sharma' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[0-9]{10,15}$/)
  mobile!: string;

  @ApiProperty({ example: 'priya@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'Bengaluru, Karnataka' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'USER' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ example: 'firebase-uid-123' })
  @IsOptional()
  @IsString()
  firebaseUid?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isProfileCompleted?: boolean;
}
