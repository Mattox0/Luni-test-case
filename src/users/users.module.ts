import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { SeriesModule } from '../series/series.module';

@Module({
  imports: [SeriesModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
