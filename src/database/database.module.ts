import { Global, Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { RolesRepository } from './repositories/roles.repository';
import { UserOtpsRepository } from './repositories/user-otps.repository';
import { UsersRepository } from './repositories/users.repository';

@Global()
@Module({
  imports: [CoreModule],
  providers: [UsersRepository, RolesRepository, UserOtpsRepository],
  exports: [UsersRepository, RolesRepository, UserOtpsRepository],
})
export class DatabaseModule {}
