import { Injectable } from '@nestjs/common';
import { SupabaseApiService } from '../../core/supabase/supabase-api.service';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RolesRepository {
  private readonly endpoint = '/rest/v1/roles';

  constructor(private readonly supabaseApi: SupabaseApiService) {}

  async findByName(roleName: string): Promise<RoleEntity | null> {
    const roles = await this.supabaseApi.get<RoleEntity[]>(this.endpoint, {
      role_name: `eq.${roleName}`,
      limit: '1',
    });
    return roles[0] ?? null;
  }

  list(): Promise<RoleEntity[]> {
    return this.supabaseApi.get<RoleEntity[]>(this.endpoint, {
      order: 'role_name.asc',
    });
  }
}
