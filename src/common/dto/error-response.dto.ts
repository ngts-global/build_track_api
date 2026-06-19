import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/auth/login' })
  path!: string;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Validation failed',
  })
  message!: string | string[];
}
