import { PostgrestError } from '@supabase/supabase-js';

export enum AppErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFLICT = 'CONFLICT',
}

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: AppErrorCode = AppErrorCode.INTERNAL_ERROR,
    public readonly statusCode: number = 500,
    public readonly details?: any,
    public readonly originalError?: PostgrestError | Error
  ) {
    super(message);
    this.name = 'AppError';
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, AppErrorCode.UNAUTHORIZED, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, AppErrorCode.FORBIDDEN, 403);
  }

  static notFound(message = 'Not Found') {
    return new AppError(message, AppErrorCode.NOT_FOUND, 404);
  }

  static validation(message: string, details?: any) {
    return new AppError(message, AppErrorCode.VALIDATION_FAILED, 400, details);
  }

  static internal(message = 'Internal Server Error', originalError?: any) {
    return new AppError(message, AppErrorCode.INTERNAL_ERROR, 500, undefined, originalError);
  }
}
