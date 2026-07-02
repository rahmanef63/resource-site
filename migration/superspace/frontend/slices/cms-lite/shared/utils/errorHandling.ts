export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

export function getUserContactlyMessage(error: unknown): string {
  const message = getErrorMessage(error);

  const ContactlyMessages: Record<string, string> = {
    'Network request failed': 'Unable to connect to the server. Please check your internet connection.',
    'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
    'Unauthorized': 'You are not authorized to perform this action. Please sign in.',
    'Forbidden': 'You do not have permission to perform this action.',
    'Not Found': 'The requested resource was not found.',
    'Conflict': 'This item already exists. Please use a different name.',
    'Internal Server Error': 'Something went wrong on our end. Please try again later.',
    'Bad Request': 'Invalid request. Please check your input and try again.',
    'Validation Error': 'Please check your input and fix any errors.',
    'Upload failed': 'Failed to upload the file. Please try again.',
    'invalid token': 'Your session has expired. Please sign in again.',
    'missing token': 'Please sign in to continue.',
  };

  for (const [key, value] of Object.entries(ContactlyMessages)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return message.length > 100 
    ? 'An error occurred. Please try again or contact support if the problem persists.'
    : message;
}

export interface ErrorLogEntry {
  timestamp: Date;
  error: unknown;
  context?: string;
  userMessage: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 50;

  log(error: unknown, context?: string): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      error,
      context,
      userMessage: getUserContactlyMessage(error),
    };

    this.logs.unshift(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    console.error(`[${context || 'Error'}]`, error);
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();

export function handleError(error: unknown, context?: string): string {
  errorLogger.log(error, context);
  return getUserContactlyMessage(error);
}

export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    message.includes('Network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('offline')
  );
}

export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    message.includes('Unauthorized') ||
    message.includes('Forbidden') ||
    message.includes('token') ||
    message.includes('authentication')
  );
}

export function isValidationError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    message.includes('Validation') ||
    message.includes('Invalid') ||
    message.includes('required') ||
    message.includes('must be')
  );
}
