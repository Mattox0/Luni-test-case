import { Injectable } from '@nestjs/common';
import { UserStore } from '../../store/user.store';
import { SeriesStore } from '../../store/series.store';
import { PricingService } from '../../pricing/services/pricing.service';
import { EpisodeStatus, Tier } from '../../domain/episode.entity';
import { DomainError } from '../../common/errors/app.errors';
import { UnlockResponseDto } from '../dto/responses/unlock-response.dto';

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
}
