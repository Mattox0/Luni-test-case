import { EpisodeStatus } from '../../../domain/episode.entity';

export class FeedEpisodeDto {
  episodeId: string;
  number: number;
  title: string;
  durationSec: number;
  status: EpisodeStatus;
  completedPercent: number;
  unlockCost: number | null;
}

export class FeedResponseDto {
  seriesId: string;
  seriesTitle: string;
  episodes: FeedEpisodeDto[];
  batchUnlockCost: number;
}
