import { HttpStatus } from '@nestjs/common';

export enum DomainErrorCode {
  EPISODE_NOT_FOUND = 'EPISODE_NOT_FOUND',
  SERIES_NOT_FOUND = 'SERIES_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ALREADY_UNLOCKED = 'ALREADY_UNLOCKED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  PREREQUISITE_NOT_MET = 'PREREQUISITE_NOT_MET',
  NO_EPISODES_TO_UNLOCK = 'NO_EPISODES_TO_UNLOCK',
}

export const HTTP_STATUS_MAP: Record<DomainErrorCode, HttpStatus> = {
  [DomainErrorCode.EPISODE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DomainErrorCode.SERIES_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DomainErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DomainErrorCode.ALREADY_UNLOCKED]: HttpStatus.CONFLICT,
  [DomainErrorCode.INSUFFICIENT_BALANCE]: HttpStatus.PAYMENT_REQUIRED,
  [DomainErrorCode.PREREQUISITE_NOT_MET]: HttpStatus.UNPROCESSABLE_ENTITY,
  [DomainErrorCode.NO_EPISODES_TO_UNLOCK]: HttpStatus.CONFLICT,
};

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }

  static episodeNotFound(episodeId: string): DomainError {
    return new DomainError(
      DomainErrorCode.EPISODE_NOT_FOUND,
      `Episode not found: ${episodeId}`,
    );
  }

  static seriesNotFound(seriesId: string): DomainError {
    return new DomainError(
      DomainErrorCode.SERIES_NOT_FOUND,
      `Series not found: ${seriesId}`,
    );
  }

  static userNotFound(userId: string): DomainError {
    return new DomainError(
      DomainErrorCode.USER_NOT_FOUND,
      `User not found: ${userId}`,
    );
  }

  static alreadyUnlocked(episodeId: string): DomainError {
    return new DomainError(
      DomainErrorCode.ALREADY_UNLOCKED,
      `Episode already unlocked: ${episodeId}`,
    );
  }

  static insufficientBalance(balance: number, cost: number): DomainError {
    return new DomainError(
      DomainErrorCode.INSUFFICIENT_BALANCE,
      `Insufficient balance: have ${balance}, need ${cost}`,
    );
  }

  static noEpisodesToUnlock(seriesId: string): DomainError {
    return new DomainError(
      DomainErrorCode.NO_EPISODES_TO_UNLOCK,
      `No premium episodes to unlock in series: ${seriesId}`,
    );
  }

  static prerequisiteNotMet(episodeId: string): DomainError {
    return new DomainError(
      DomainErrorCode.PREREQUISITE_NOT_MET,
      `Previous episodes must be unlocked before: ${episodeId}`,
    );
  }
}
