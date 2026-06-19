import { Injectable } from '@nestjs/common';
import { SupabaseApiService, SupabaseHttpMethod, SupabaseRawResponse } from '../core/supabase/supabase-api.service';

@Injectable()
export class DataApiService {
  constructor(private readonly supabaseApi: SupabaseApiService) {}

  forward<T = unknown>(
    method: SupabaseHttpMethod,
    table: string,
    options?: {
      queryParams?: Record<string, any>;
      body?: unknown;
      token?: string;
      headers?: Record<string, string>;
    },
  ): Promise<SupabaseRawResponse<T>> {
    return this.supabaseApi.requestRaw<T>(method, `/${table}`, options);
  }
}
