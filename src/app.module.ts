import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ProjectsModule } from './projects/projects.module';
import { FinancialsModule } from './financials/financials.module';
import { DataApiModule } from './data-api/data-api.module';

import { CommonModule } from './common/common.module';
import { AppConfigModule } from './configuration/configuration.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    DatabaseModule,
    CoreModule,
    AuthModule,
    SubscriptionsModule,
    ProjectsModule,
    FinancialsModule,
    DataApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
