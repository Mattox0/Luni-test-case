import { Test, TestingModule } from '@nestjs/testing';
import { SeriesService } from './series.service';
import { SeriesStore } from '../../store/series.store';
import { UserStore } from '../../store/user.store';
import { PricingService } from '../../pricing/services/pricing.service';
import { EpisodeStatus, Tier } from '../../domain/episode.entity';
import { Episode } from '../../domain/episode.entity';
import { Series } from '../../domain/series.entity';
import { User } from '../../domain/user.entity';

const SERIES: Series = {
  id: 'series-1',
  title: 'Le Piège',
  genre: 'thriller',
  episodes: [
    {
      id: 'ep-101',
      seriesId: 'series-1',
      number: 1,
      title: "L'appel",
      durationSec: 120,
      tier: Tier.FREE,
    },
    {
      id: 'ep-103',
      seriesId: 'series-1',
      number: 3,
      title: 'Le doute',
      durationSec: 140,
      tier: Tier.PREMIUM,
    },
    {
      id: 'ep-104',
      seriesId: 'series-1',
      number: 4,
      title: 'La chute',
      durationSec: 110,
      tier: Tier.PREMIUM,
    },
  ],
};

const USER: User = {
  id: 'user-1',
  name: 'Alice',
  coinBalance: 50,
  unlockedEpisodes: ['ep-103'],
  watchHistory: [
    { episodeId: 'ep-101', watchedAt: new Date(), completedPercent: 100 },
    { episodeId: 'ep-103', watchedAt: new Date(), completedPercent: 45 },
  ],
};

describe('SeriesService', () => {
  let service: SeriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: SeriesStore,
          useValue: {
            findSeriesById: jest.fn().mockReturnValue(SERIES),
            getEpisodeStatus: jest.fn((episode: Episode, user: User) => {
              if (episode.tier === Tier.FREE) return EpisodeStatus.FREE;
              if (user.unlockedEpisodes.includes(episode.id))
                return EpisodeStatus.UNLOCKED;
              return EpisodeStatus.LOCKED;
            }),
          },
        },
        {
          provide: UserStore,
          useValue: { findUserById: jest.fn().mockReturnValue(USER) },
        },
        {
          provide: PricingService,
          useValue: {
            getSinglePrice: jest.fn().mockReturnValue(10),
            getBatchCost: jest.fn((n: number) => n * 7),
          },
        },
      ],
    }).compile();

    service = module.get(SeriesService);
  });

  describe('getFeed', () => {
    it('returns correct episode statuses, completedPercent and batchUnlockCost', () => {
      const feed = service.getFeed('user-1', 'series-1');

      expect(feed.seriesTitle).toBe('Le Piège');
      expect(feed.episodes).toMatchObject([
        {
          episodeId: 'ep-101',
          status: EpisodeStatus.FREE,
          completedPercent: 100,
          unlockCost: null,
        },
        {
          episodeId: 'ep-103',
          status: EpisodeStatus.UNLOCKED,
          completedPercent: 45,
          unlockCost: null,
        },
        {
          episodeId: 'ep-104',
          status: EpisodeStatus.LOCKED,
          completedPercent: 0,
          unlockCost: 10,
        },
      ]);
      expect(feed.batchUnlockCost).toBe(7); // 1 locked × 7
    });
  });
});
