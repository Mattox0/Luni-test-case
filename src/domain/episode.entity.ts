export enum Tier {
  FREE = 'free',
  PREMIUM = 'premium',
}

export interface Episode {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  durationSec: number;
  tier: Tier;
}
