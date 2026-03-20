import { AppError } from './app-error';

/**
 * Error for form/input validation failures.
 * Carries the `field` name and list of `constraints` that failed.
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly constraints: string[] = []
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
