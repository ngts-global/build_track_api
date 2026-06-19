import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SupabaseApiService } from './supabase/supabase-api.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [SupabaseApiService],
  exports: [SupabaseApiService],
})
export class CoreModule {}
