import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfiguration from './configuration';
import { envValidationSchema } from './env.validation';
import { TypedConfigService } from './typed-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration],
      validationSchema: envValidationSchema,
    }),
  ],
  providers: [TypedConfigService],
  exports: [ConfigModule, TypedConfigService],
})
export class AppConfigModule {}
