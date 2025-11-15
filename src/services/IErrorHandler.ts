// src/services/IErrorHandler.ts

/**
 * @interface IErrorHandler
 * @description Interface for error handling
 * - Enables dependency injection
 * - Decouples error handling from business logic
 * - Facilitates testing with mock implementations
 */
export interface IErrorHandler {
    /**
     * @description Handle an error with context
     * @param error - The error to handle
     * @param context - Context information (e.g., method name, module name)
     */
    handle(error: Error, context?: string): void;

    /**
     * @description Handle an error with additional data
     * @param error - The error to handle
     * @param context - Context information
     * @param additionalData - Additional debugging data
     */
    handleWithData(error: Error, context: string, additionalData?: Record<string, unknown>): void;
}
