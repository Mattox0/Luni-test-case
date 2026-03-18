export interface WatchHistoryEntry {
  episodeId: string;
  watchedAt: Date;
  completedPercent: number;
}

export interface User {
  id: string;
  name: string;
  coinBalance: number;
  unlockedEpisodes: string[];
  watchHistory: WatchHistoryEntry[];
}
