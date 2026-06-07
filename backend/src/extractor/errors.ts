export type ExtractErrorCode =
  | 'invalid_url'
  | 'no_css'
  | 'navigation_timeout'
  | 'navigation_failed'
  | 'internal_error';

/**
 * A failure during token extraction that maps to a specific HTTP status.
 * The route handler reads `status` and `code` to shape the JSON error response.
 */
export class ExtractError extends Error {
  readonly code: ExtractErrorCode;
  readonly status: number;

  constructor(code: ExtractErrorCode, status: number, message: string) {
    super(message);
    this.name = 'ExtractError';
    this.code = code;
    this.status = status;
  }
}
