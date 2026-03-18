import { Injectable } from '@nestjs/common';
import { SeriesStore } from '../../store/series.store';
import { UserStore } from '../../store/user.store';
import {
  FeedEpisodeDto,
  FeedResponseDto,
} from '../../users/dto/responses/feed-response.dto';
import { PricingService } from '../../pricing/services/pricing.service';
import { EpisodeStatus } from '../../domain/episode.entity';

@Injectable()
export class SeriesService {
  constructor(
    private readonly seriesStore: SeriesStore,
    private readonly userStore: UserStore,
    private readonly pricingService: PricingService,
  ) {}

  getFeed(userId: string, seriesId: string): FeedResponseDto {
    const user = this.userStore.findUserById(userId);
    const series = this.seriesStore.findSeriesById(seriesId);
    const singlePrice = this.pricingService.getSinglePrice();

    let lockedPremiumCount = 0;

    const episodeDtos: FeedEpisodeDto[] = series.episodes.map((episode) => {
      const status = this.seriesStore.getEpisodeStatus(episode, user);
      const watchEntry = user.watchHistory.find(
        (h) => h.episodeId === episode.id,
      );
      const completedPercent = watchEntry?.completedPercent ?? 0;
      let unlockCost: number | null = null;
      if (status === EpisodeStatus.LOCKED) {
        unlockCost = singlePrice;
        lockedPremiumCount++;
      }
      return {
        episodeId: episode.id,
        number: episode.number,
        title: episode.title,
        durationSec: episode.durationSec,
        status,
        completedPercent,
        unlockCost,
      };
    });

    return {
      seriesId: series.id,
      seriesTitle: series.title,
      episodes: episodeDtos,
      batchUnlockCost: this.pricingService.getBatchCost(lockedPremiumCount),
    };
  }
}
