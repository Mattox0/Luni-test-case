import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { UsersModule } from './users/users.module';
import { SeriesModule } from './series/series.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [StoreModule, UsersModule, SeriesModule, PricingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
