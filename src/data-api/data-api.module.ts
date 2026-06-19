import { Module } from '@nestjs/common';
import { DataApiController } from './data-api.controller';
import { DataApiService } from './data-api.service';

@Module({
  controllers: [DataApiController],
  providers: [DataApiService],
})
export class DataApiModule {}
