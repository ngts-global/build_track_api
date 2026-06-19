import { Injectable } from '@nestjs/common';
import { SupabaseApiService } from '../../core/supabase/supabase-api.service';
import {
  CreateUserOtpInput,
  UserOtpEntity,
} from '../entities/user-otp.entity';

@Injectable()
export class UserOtpsRepository {
  private readonly endpoint = '/rest/v1/user_otps';

  constructor(private readonly supabaseApi: SupabaseApiService) {}

  async create(data: CreateUserOtpInput): Promise<UserOtpEntity> {
    const [otp] = await this.supabaseApi.post<UserOtpEntity[]>(
      this.endpoint,
      data,
    );
    return otp;
  }

  async findLatestUsableOtp(
    mobile: string,
    otpCode: string,
    now: Date,
  ): Promise<UserOtpEntity | null> {
    const otps = await this.supabaseApi.get<UserOtpEntity[]>(this.endpoint, {
      mobile: `eq.${mobile}`,
      otp_code: `eq.${otpCode}`,
      is_used: 'eq.false',
      expires_at: `gt.${now.toISOString()}`,
      order: 'created_at.desc',
      limit: '1',
    });
    return otps[0] ?? null;
  }

  async markUsed(id: number): Promise<UserOtpEntity> {
    const [otp] = await this.supabaseApi.patch<UserOtpEntity[]>(
      this.endpoint,
      { is_used: true },
      { id: `eq.${id}` },
    );
    return otp;
  }
}
