import { Injectable, OnModuleInit } from '@nestjs/common';
import { Series } from '../domain/series.entity';
import { Episode, EpisodeStatus, Tier } from '../domain/episode.entity';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DomainError } from '../common/errors/app.errors';
import { User } from '../domain/user.entity';

interface CatalogData {
  series: Series[];
}

@Injectable()
export class SeriesStore implements OnModuleInit {
  private seriesMap = new Map<string, Series>();
  private episodesMap = new Map<string, Episode>();

  onModuleInit(): void {
    const raw = readFileSync(
      join(process.cwd(), 'data', 'catalog.json'),
      'utf-8',
    );

    const data = JSON.parse(raw) as CatalogData;

    for (const series of data.series) {
      this.seriesMap.set(series.id, series);
      for (const episode of series.episodes) {
        this.episodesMap.set(episode.id, { ...episode, seriesId: series.id });
      }
    }
  }

  findSeriesById(seriesId: string): Series {
    const series = this.seriesMap.get(seriesId);
    if (!series) throw DomainError.seriesNotFound(seriesId);
    return series;
  }

  findEpisodesBySeriesId(seriesId: string): Episode[] {
    return this.findSeriesById(seriesId).episodes;
  }

  findEpisodeById(episodeId: string): Episode {
    const episode = this.episodesMap.get(episodeId);
    if (!episode) throw DomainError.episodeNotFound(episodeId);
    return episode;
  }

  getEpisodeStatus(episode: Episode, user: User): EpisodeStatus {
    if (episode.tier === Tier.FREE) {
      return EpisodeStatus.FREE;
    }
    if (user.unlockedEpisodes.includes(episode.id)) {
      return EpisodeStatus.UNLOCKED;
    }
    return EpisodeStatus.LOCKED;
  }
}
