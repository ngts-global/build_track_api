import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

@Injectable()
export class TypedConfigService {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.getOrThrow<string>('app.nodeEnv');
  }

  get port(): number {
    return this.configService.getOrThrow<number>('app.port');
  }

  get supabaseUrl(): string {
    return this.configService.getOrThrow<string>('supabase.url');
  }

  get supabaseKey(): string {
    return this.configService.getOrThrow<string>('supabase.key');
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('jwt.secret');
  }

  get jwtExpiresIn(): number | StringValue {
    return this.configService.getOrThrow<number | StringValue>('jwt.expiresIn');
  }
}
