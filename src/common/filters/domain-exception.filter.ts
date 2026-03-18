import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainError,
  DomainErrorCode,
  HTTP_STATUS_MAP,
} from '../errors/app.errors';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const statusCode: HttpStatus =
      HTTP_STATUS_MAP[exception.code as DomainErrorCode] ??
      HttpStatus.INTERNAL_SERVER_ERROR;
    res
      .status(statusCode)
      .json({ statusCode, error: exception.code, message: exception.message });
  }
}
