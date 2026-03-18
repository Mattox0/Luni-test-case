import { EpisodeStatus } from '../../../domain/episode.entity';

export class NextEpisodeItemDto {
  episodeId: string;
  number: number;
  title: string;
  status: EpisodeStatus;
  completedPercent: number;
}

export class NextSeriesDto {
  seriesId: string;
  seriesTitle: string;
  episode: NextEpisodeItemDto;
}

export class NextEpisodeResponseDto {
  nextEpisodes: NextSeriesDto[];
}
