// src/services/Logger.ts

/**
 * @enum LogLevel
 * @description Log level definition
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

/**
 * @class Logger
 * @description Environment variable-based logging service
 * - Suppress unnecessary logs in production environment
 * - Support context-based logging
 * - Automatically add timestamp
 */
export class Logger {
    static #instance: Logger;
    #currentLevel: LogLevel;
    #isDevelopment: boolean;

    private constructor() {
        // Consider as development if NODE_ENV is not set or not 'production'
        this.#isDevelopment =
            typeof process !== 'undefined'
                ? process.env.NODE_ENV !== 'production'
                : import.meta.env?.MODE !== 'production';

        // Development: INFO level, Production: WARN level
        this.#currentLevel = this.#isDevelopment ? LogLevel.INFO : LogLevel.WARN;
    }

    /**
     * @description Return Singleton instance
     */
    static getInstance(): Logger {
        if (!Logger.#instance) {
            Logger.#instance = new Logger();
        }
        return Logger.#instance;
    }

    /**
     * @description Set log level
     * @param level - Log level to set
     */
    setLevel(level: LogLevel): void {
        this.#currentLevel = level;
    }

    /**
     * @description Return current log level
     */
    getLevel(): LogLevel {
        return this.#currentLevel;
    }

    /**
     * @description Check whether to output log
     * @param level - Log level to check
     */
    private shouldLog(level: LogLevel): boolean {
        return level >= this.#currentLevel;
    }

    /**
     * @description Format context
     * @param context - Context string
     */
    private formatContext(context?: string): string {
        if (!context) return '';
        return `[${context}]`;
    }

    /**
     * @description DEBUG level log
     * @param message - Log message
     * @param context - Context (optional)
     * @param data - Additional data (optional)
     */
    debug(message: string, context?: string, ...data: unknown[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(`${this.formatContext(context)} ${message}`, ...data);
        }
    }

    /**
     * @description INFO level log
     * @param message - Log message
     * @param context - Context (optional)
     * @param data - Additional data (optional)
     */
    info(message: string, context?: string, ...data: unknown[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.log(`${this.formatContext(context)} ${message}`, ...data);
        }
    }

    /**
     * @description WARN level log
     * @param message - Log message
     * @param context - Context (optional)
     * @param data - Additional data (optional)
     */
    warn(message: string, context?: string, ...data: unknown[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(`${this.formatContext(context)} ${message}`, ...data);
        }
    }

    /**
     * @description ERROR level log
     * @param message - Log message
     * @param context - Context (optional)
     * @param error - Error object (optional)
     * @param data - Additional data (optional)
     */
    error(message: string, context?: string, error?: Error | unknown, ...data: unknown[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            if (error) {
                console.error(`${this.formatContext(context)} ${message}`, error, ...data);
            } else {
                console.error(`${this.formatContext(context)} ${message}`, ...data);
            }
        }
    }

    /**
     * @description Start group
     * @param label - Group label
     */
    group(label: string): void {
        if (this.#isDevelopment && this.shouldLog(LogLevel.INFO)) {
            console.group(label);
        }
    }

    /**
     * @description End group
     */
    groupEnd(): void {
        if (this.#isDevelopment && this.shouldLog(LogLevel.INFO)) {
            console.groupEnd();
        }
    }

    /**
     * @description Log in table format
     * @param data - Table data
     */
    table(data: unknown): void {
        if (this.#isDevelopment && this.shouldLog(LogLevel.DEBUG)) {
            console.table(data);
        }
    }
}

// Export global Logger instance
export const logger = Logger.getInstance();
