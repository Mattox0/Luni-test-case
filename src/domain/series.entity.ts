import { Episode } from './episode.entity';

export interface Series {
  id: string;
  title: string;
  genre: string;
  episodes: Episode[];
}
