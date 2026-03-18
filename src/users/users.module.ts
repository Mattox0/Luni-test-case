import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { SeriesModule } from '../series/series.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [SeriesModule, PricingModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
