import { Injectable } from '@nestjs/common';
import { UserStore } from '../../store/user.store';
import { SeriesStore } from '../../store/series.store';
import { PricingService } from '../../pricing/services/pricing.service';
import { EpisodeStatus, Tier } from '../../domain/episode.entity';
import { DomainError } from '../../common/errors/app.errors';
import { UnlockResponseDto } from '../dto/responses/unlock-response.dto';
import { UnlockBatchResponseDto } from '../dto/responses/unlock-batch-response.dto';
import { BATCH_PRICE_PER_EPISODE } from '../../pricing/services/pricing.service';
import {
  NextEpisodeResponseDto,
  NextSeriesDto,
} from '../dto/responses/next-episode-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userStore: UserStore,
    private readonly seriesStore: SeriesStore,
    private readonly pricingService: PricingService,
  ) {}

  unlockEpisode(userId: string, episodeId: string): UnlockResponseDto {
    const user = this.userStore.findUserById(userId);
    const episode = this.seriesStore.findEpisodeById(episodeId);

    if (
      this.seriesStore.getEpisodeStatus(episode, user) !== EpisodeStatus.LOCKED
    ) {
      throw DomainError.alreadyUnlocked(episodeId);
    }

    const seriesEpisodes = this.seriesStore.findEpisodesBySeriesId(
      episode.seriesId,
    );
    const previousEpisodes = seriesEpisodes.filter(
      (seriesEpisode) => seriesEpisode.number < episode.number,
    );
    const allPrerequisitesMet = previousEpisodes.every(
      (previousEpisode) =>
        previousEpisode.tier === Tier.FREE ||
        user.unlockedEpisodes.includes(previousEpisode.id),
    );
    if (!allPrerequisitesMet) {
      throw DomainError.prerequisiteNotMet(episodeId);
    }

    const cost = this.pricingService.getSinglePrice();
    if (user.coinBalance < cost) {
      throw DomainError.insufficientBalance(user.coinBalance, cost);
    }

    const updatedUser = this.userStore.debitUser(userId, cost, episodeId);

    return {
      unlockedEpisode: episodeId,
      cost,
      newBalance: updatedUser.coinBalance,
    };
  }

  unlockBatch(userId: string, seriesId: string): UnlockBatchResponseDto {
    const user = this.userStore.findUserById(userId);
    const episodes = this.seriesStore.findEpisodesBySeriesId(seriesId);

    const toUnlock = episodes.filter(
      (episode) =>
        this.seriesStore.getEpisodeStatus(episode, user) ===
        EpisodeStatus.LOCKED,
    );

    if (toUnlock.length === 0) {
      throw DomainError.noEpisodesToUnlock(seriesId);
    }

    const totalCost = this.pricingService.getBatchCost(toUnlock.length);
    if (user.coinBalance < totalCost) {
      throw DomainError.insufficientBalance(user.coinBalance, totalCost);
    }

    const episodeIds = toUnlock.map((e) => e.id);
    const updatedUser = this.userStore.debitUserBatch(
      userId,
      totalCost,
      episodeIds,
    );

    return {
      unlockedEpisodes: episodeIds,
      costPerEpisode: BATCH_PRICE_PER_EPISODE,
      totalCost,
      newBalance: updatedUser.coinBalance,
    };
  }

  getNextEpisodes(userId: string): NextEpisodeResponseDto {
    const user = this.userStore.findUserById(userId);
    const nextEpisodes: NextSeriesDto[] = [];

    const activityEpisodeIds = [
      ...user.watchHistory.map((watchHistory) => watchHistory.episodeId),
      ...user.unlockedEpisodes,
    ];

    // Set to avoid duplicates when user has multiple episodes in the same series
    const seriesIds = [
      ...new Set(
        activityEpisodeIds.map(
          (id) => this.seriesStore.findEpisodeById(id).seriesId,
        ),
      ),
    ];

    for (const seriesId of seriesIds) {
      const series = this.seriesStore.findSeriesById(seriesId);

      const next = series.episodes.find((episode) => {
        const entry = user.watchHistory.find(
          (watchHistory) => watchHistory.episodeId === episode.id,
        );
        return (entry?.completedPercent ?? 0) < 80;
      });

      if (!next) continue;

      const entry = user.watchHistory.find(
        (watchHistory) => watchHistory.episodeId === next.id,
      );

      nextEpisodes.push({
        seriesId: series.id,
        seriesTitle: series.title,
        episode: {
          episodeId: next.id,
          number: next.number,
          title: next.title,
          status: this.seriesStore.getEpisodeStatus(next, user),
          completedPercent: entry?.completedPercent ?? 0,
        },
      });
    }

    return { nextEpisodes };
  }
}
