import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: unknown, context?: string): AppError {
    const appError: AppError = {
      message: this.extractErrorMessage(error),
      code: this.extractErrorCode(error),
      details: error,
      timestamp: new Date().toISOString(),
    };

    this.errorLog.push(appError);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Error'}]`, appError);
    }

    return appError;
  }

  handleError(error: unknown, context?: string, showToast = true): AppError {
    const appError = this.logError(error, context);

    if (showToast) {
      this.showErrorToast(appError);
    }

    return appError;
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (this.isPostgrestError(error)) {
      return error.message || 'Database error occurred';
    }

    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      if ('error' in error && typeof error.error === 'string') {
        return error.error;
      }
    }

    return 'An unexpected error occurred';
  }

  private extractErrorCode(error: unknown): string | undefined {
    if (this.isPostgrestError(error)) {
      return error.code;
    }

    if (typeof error === 'object' && error !== null) {
      if ('code' in error && typeof error.code === 'string') {
        return error.code;
      }
      if ('status' in error && typeof error.status === 'number') {
        return error.status.toString();
      }
    }

    return undefined;
  }

  private isPostgrestError(error: unknown): error is PostgrestError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'details' in error &&
      'hint' in error
    );
  }

  private showErrorToast(error: AppError) {
    const message = this.getUserFriendlyMessage(error);
    
    toast.error(message, {
      description: error.code ? `Error code: ${error.code}` : undefined,
      duration: 5000,
    });
  }

  private getUserFriendlyMessage(error: AppError): string {
    const { message, code } = error;

    // Map common error codes to user-friendly messages
    const errorMap: Record<string, string> = {
      '23505': 'This record already exists',
      '23503': 'Cannot delete: related records exist',
      '42501': 'You do not have permission to perform this action',
      'PGRST116': 'No data found',
      'PGRST301': 'Invalid request parameters',
      '401': 'Please log in to continue',
      '403': 'Access denied',
      '404': 'Resource not found',
      '500': 'Server error. Please try again later',
      '503': 'Service temporarily unavailable',
    };

    if (code && errorMap[code]) {
      return errorMap[code];
    }

    // Check for common error patterns
    if (message.toLowerCase().includes('network')) {
      return 'Network error. Please check your connection';
    }

    if (message.toLowerCase().includes('timeout')) {
      return 'Request timed out. Please try again';
    }

    if (message.toLowerCase().includes('jwt') || message.toLowerCase().includes('token')) {
      return 'Your session has expired. Please log in again';
    }

    return message;
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: unknown, context?: string, showToast = true) => {
  return errorHandler.handleError(error, context, showToast);
};

export const logError = (error: unknown, context?: string) => {
  return errorHandler.logError(error, context);
};
