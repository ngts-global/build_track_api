import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[0-9]{10,15}$/)
  mobile!: string;

  @ApiProperty({ minLength: 8, example: 'StrongPass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
