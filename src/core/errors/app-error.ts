/**
 * Base application error with a machine-readable `code` property.
 * All custom error classes should extend this.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'APP_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}
