import { Injectable } from '@nestjs/common';

export const SINGLE_PRICE_NORMAL = 10;
export const SINGLE_PRICE_HAPPY_HOUR = 8;
export const BATCH_PRICE_PER_EPISODE = 7;

@Injectable()
export class PricingService {
  getSinglePrice(): number {
    const hour = new Date().getUTCHours();
    const isHappyHour = hour >= 18 && hour < 20;
    return isHappyHour ? SINGLE_PRICE_HAPPY_HOUR : SINGLE_PRICE_NORMAL;
  }

  getBatchCost(lockedPremiumCount: number): number {
    return lockedPremiumCount * BATCH_PRICE_PER_EPISODE;
  }
}
