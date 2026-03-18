import { Global, Module } from '@nestjs/common';
import { SeriesStore } from './series.store';
import { UserStore } from './user.store';

@Global()
@Module({
  providers: [SeriesStore, UserStore],
  exports: [SeriesStore, UserStore],
})
export class StoreModule {}
