import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [StoreModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
