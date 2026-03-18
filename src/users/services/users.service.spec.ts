import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserStore } from '../../store/user.store';
import { SeriesStore } from '../../store/series.store';
import { PricingService } from '../../pricing/services/pricing.service';
import { EpisodeStatus, Tier } from '../../domain/episode.entity';
import { DomainErrorCode } from '../../common/errors/app.errors';
import { Episode } from '../../domain/episode.entity';
import { Series } from '../../domain/series.entity';
import { User } from '../../domain/user.entity';

const ep101: Episode = {
  id: 'ep-101',
  seriesId: 'series-1',
  number: 1,
  title: "L'appel",
  durationSec: 120,
  tier: Tier.FREE,
};
const ep102: Episode = {
  id: 'ep-102',
  seriesId: 'series-1',
  number: 2,
  title: 'La fuite',
  durationSec: 95,
  tier: Tier.FREE,
};
const ep103: Episode = {
  id: 'ep-103',
  seriesId: 'series-1',
  number: 3,
  title: 'Le doute',
  durationSec: 140,
  tier: Tier.PREMIUM,
};
const ep104: Episode = {
  id: 'ep-104',
  seriesId: 'series-1',
  number: 4,
  title: 'La chute',
  durationSec: 110,
  tier: Tier.PREMIUM,
};

const SERIES: Series = {
  id: 'series-1',
  title: 'Le Piège',
  genre: 'thriller',
  episodes: [ep101, ep102, ep103, ep104],
};

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  name: 'Alice',
  coinBalance: 50,
  unlockedEpisodes: ['ep-103'],
  watchHistory: [
    { episodeId: 'ep-101', watchedAt: new Date(), completedPercent: 100 },
    { episodeId: 'ep-102', watchedAt: new Date(), completedPercent: 100 },
    { episodeId: 'ep-103', watchedAt: new Date(), completedPercent: 45 },
  ],
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let userStore: jest.Mocked<UserStore>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserStore,
          useValue: {
            findUserById: jest.fn(),
            debitUser: jest.fn(),
            debitUserBatch: jest.fn(),
          },
        },
        {
          provide: SeriesStore,
          useValue: {
            findEpisodeById: jest.fn((id: string) =>
              SERIES.episodes.find((e) => e.id === id),
            ),
            findSeriesById: jest.fn().mockReturnValue(SERIES),
            findEpisodesBySeriesId: jest.fn().mockReturnValue(SERIES.episodes),
            getEpisodeStatus: jest.fn((episode: Episode, user: User) => {
              if (episode.tier === Tier.FREE) return EpisodeStatus.FREE;
              if (user.unlockedEpisodes.includes(episode.id))
                return EpisodeStatus.UNLOCKED;
              return EpisodeStatus.LOCKED;
            }),
          },
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

    service = module.get(UsersService);
    userStore = module.get(UserStore);
  });

  describe('unlockEpisode', () => {
    it('debits the user and returns the correct response', () => {
      const user = makeUser();
      userStore.findUserById.mockReturnValue(user);
      userStore.debitUser.mockReturnValue({
        ...user,
        coinBalance: 40,
        unlockedEpisodes: [...user.unlockedEpisodes, 'ep-104'],
      });

      const result = service.unlockEpisode('user-1', 'ep-104');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userStore.debitUser).toHaveBeenCalledWith('user-1', 10, 'ep-104');
      expect(result).toEqual({
        unlockedEpisode: 'ep-104',
        cost: 10,
        newBalance: 40,
      });
    });

    it('throws PREREQUISITE_NOT_MET if a previous premium episode is not unlocked', () => {
      const user = makeUser({ unlockedEpisodes: [] });
      userStore.findUserById.mockReturnValue(user);

      expect(() => service.unlockEpisode('user-1', 'ep-104')).toThrow(
        expect.objectContaining({
          code: DomainErrorCode.PREREQUISITE_NOT_MET,
        }) as unknown as Error,
      );
    });

    it('throws INSUFFICIENT_BALANCE if the coin balance is too low', () => {
      const user = makeUser({ coinBalance: 5 });
      userStore.findUserById.mockReturnValue(user);

      expect(() => service.unlockEpisode('user-1', 'ep-104')).toThrow(
        expect.objectContaining({
          code: DomainErrorCode.INSUFFICIENT_BALANCE,
        }) as unknown as Error,
      );
    });
  });

  describe('unlockBatch', () => {
    it('unlocks all locked episodes and debits the total batch cost', () => {
      const user = makeUser();
      userStore.findUserById.mockReturnValue(user);
      // ep-103 unlocked, ep-104 locked → 1 episode to unlock, cost = 1 × 7 = 7
      userStore.debitUserBatch.mockReturnValue({
        ...user,
        coinBalance: 43,
        unlockedEpisodes: ['ep-103', 'ep-104'],
      });

      const result = service.unlockBatch('user-1', 'series-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userStore.debitUserBatch).toHaveBeenCalledWith('user-1', 7, [
        'ep-104',
      ]);
      expect(result).toEqual({
        unlockedEpisodes: ['ep-104'],
        costPerEpisode: 7,
        totalCost: 7,
        newBalance: 43,
      });
    });

    it('throws NO_EPISODES_TO_UNLOCK when all premium episodes are already unlocked', () => {
      const user = makeUser({ unlockedEpisodes: ['ep-103', 'ep-104'] });
      userStore.findUserById.mockReturnValue(user);

      expect(() => service.unlockBatch('user-1', 'series-1')).toThrow(
        expect.objectContaining({
          code: DomainErrorCode.NO_EPISODES_TO_UNLOCK,
        }) as unknown as Error,
      );
    });
  });

  describe('getNextEpisodes', () => {
    it('returns the first episode under 80% completion', () => {
      // ep-103 is at 45% → it is the next one
      const user = makeUser();
      userStore.findUserById.mockReturnValue(user);

      const result = service.getNextEpisodes('user-1');

      expect(result.nextEpisodes).toHaveLength(1);
      expect(result.nextEpisodes[0].episode.episodeId).toBe('ep-103');
      expect(result.nextEpisodes[0].episode.completedPercent).toBe(45);
    });

    it('excludes a series where all episodes are completed at ≥ 80%', () => {
      const user = makeUser({
        watchHistory: [
          { episodeId: 'ep-101', watchedAt: new Date(), completedPercent: 100 },
          { episodeId: 'ep-102', watchedAt: new Date(), completedPercent: 100 },
          { episodeId: 'ep-103', watchedAt: new Date(), completedPercent: 100 },
          { episodeId: 'ep-104', watchedAt: new Date(), completedPercent: 80 },
        ],
        unlockedEpisodes: ['ep-103', 'ep-104'],
      });
      userStore.findUserById.mockReturnValue(user);

      const result = service.getNextEpisodes('user-1');

      expect(result.nextEpisodes).toHaveLength(0);
    });
  });
});
