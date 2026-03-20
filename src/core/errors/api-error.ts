import { AppError } from './app-error';

/**
 * Error thrown by API client on non-ok responses.
 * Carries HTTP `status` for programmatic handling.
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message, 'API_ERROR');
    this.name = 'ApiError';
  }
}
