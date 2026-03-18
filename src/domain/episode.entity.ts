export enum Tier {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum EpisodeStatus {
  FREE = 'free',
  UNLOCKED = 'unlocked',
  LOCKED = 'locked',
}

export interface Episode {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  durationSec: number;
  tier: Tier;
}
