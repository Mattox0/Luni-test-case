import { HttpStatus } from '@nestjs/common';

export enum DomainErrorCode {
  EPISODE_NOT_FOUND = 'EPISODE_NOT_FOUND',
  SERIES_NOT_FOUND = 'SERIES_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
}

export const HTTP_STATUS_MAP: Record<DomainErrorCode, HttpStatus> = {
  [DomainErrorCode.EPISODE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DomainErrorCode.SERIES_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DomainErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
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
}
