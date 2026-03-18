import { Injectable, OnModuleInit } from '@nestjs/common';
import { Series } from '../domain/series.entity';
import { Episode } from '../domain/episode.entity';
import { readFileSync } from 'fs';
import { join } from 'path';

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

    console.log(this.seriesMap, this.episodesMap);
  }
}
