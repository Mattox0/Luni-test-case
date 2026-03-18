import { Module } from '@nestjs/common';
import { SeriesService } from './services/series.service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
