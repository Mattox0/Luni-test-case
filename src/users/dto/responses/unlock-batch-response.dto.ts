export class UnlockBatchResponseDto {
  unlockedEpisodes: string[];
  costPerEpisode: number;
  totalCost: number;
  newBalance: number;
}