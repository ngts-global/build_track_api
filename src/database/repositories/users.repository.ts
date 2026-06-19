import { Injectable } from '@nestjs/common';
import { SupabaseApiService } from '../../core/supabase/supabase-api.service';
import {
  CreateUserInput,
  UpdateUserInput,
  UserEntity,
} from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  private readonly endpoint = '/rest/v1/users';

  constructor(private readonly supabaseApi: SupabaseApiService) {}

  async create(data: CreateUserInput): Promise<UserEntity> {
    const [user] = await this.supabaseApi.post<UserEntity[]>(this.endpoint, data);
    return user;
  }

  async findById(userId: number): Promise<UserEntity | null> {
    return this.findOne({ user_id: `eq.${userId}` });
  }

  async findByMobile(mobile: string): Promise<UserEntity | null> {
    return this.findOne({ mobile: `eq.${mobile}` });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ email: `eq.${email}` });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserEntity | null> {
    return this.findOne({ firebase_uid: `eq.${firebaseUid}` });
  }

  async update(userId: number, data: UpdateUserInput): Promise<UserEntity> {
    const [user] = await this.supabaseApi.patch<UserEntity[]>(
      this.endpoint,
      data,
      { user_id: `eq.${userId}` },
    );
    return user;
  }

  private async findOne(
    filters: Record<string, string>,
  ): Promise<UserEntity | null> {
    const users = await this.supabaseApi.get<UserEntity[]>(this.endpoint, {
      ...filters,
      limit: '1',
    });
    return users[0] ?? null;
  }
}
