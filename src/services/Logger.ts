// src/services/Logger.ts

/**
 * @enum LogLevel
 * @description 로그 레벨 정의
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
 * @description 환경 변수 기반 로깅 서비스
 * - 프로덕션 환경에서 불필요한 로그 억제
 * - 컨텍스트 기반 로깅 지원
 * - 타임스탬프 자동 추가
 */
export class Logger {
    private static instance: Logger;
    private currentLevel: LogLevel;
    private isDevelopment: boolean;

    private constructor() {
        // NODE_ENV가 설정되지 않았거나 'production'이 아니면 development로 간주
        this.isDevelopment =
            typeof process !== 'undefined'
                ? process.env.NODE_ENV !== 'production'
                : import.meta.env?.MODE !== 'production';

        // 개발 환경: INFO 레벨, 프로덕션: WARN 레벨
        this.currentLevel = this.isDevelopment ? LogLevel.INFO : LogLevel.WARN;
    }

    /**
     * @description Singleton 인스턴스 반환
     */
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * @description 로그 레벨 설정
     * @param level - 설정할 로그 레벨
     */
    setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }

    /**
     * @description 현재 로그 레벨 반환
     */
    getLevel(): LogLevel {
        return this.currentLevel;
    }

    /**
     * @description 로그 출력 여부 확인
     * @param level - 확인할 로그 레벨
     */
    private shouldLog(level: LogLevel): boolean {
        return level >= this.currentLevel;
    }

    /**
     * @description 컨텍스트 포맷팅
     * @param context - 컨텍스트 문자열
     */
    private formatContext(context?: string): string {
        if (!context) return '';
        return `[${context}]`;
    }

    /**
     * @description DEBUG 레벨 로그
     * @param message - 로그 메시지
     * @param context - 컨텍스트 (optional)
     * @param data - 추가 데이터 (optional)
     */
    debug(message: string, context?: string, ...data: any[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(`${this.formatContext(context)} ${message}`, ...data);
        }
    }

    /**
     * @description INFO 레벨 로그
     * @param message - 로그 메시지
     * @param context - 컨텍스트 (optional)
     * @param data - 추가 데이터 (optional)
     */
    info(message: string, context?: string, ...data: any[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.log(`${this.formatContext(context)} ${message}`, ...data);
        }
    }

    /**
     * @description WARN 레벨 로그
     * @param message - 로그 메시지
     * @param context - 컨텍스트 (optional)
     * @param data - 추가 데이터 (optional)
     */
    warn(message: string, context?: string, ...data: any[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(`${this.formatContext(context)} ${message}`, ...data);
        }
    }

    /**
     * @description ERROR 레벨 로그
     * @param message - 로그 메시지
     * @param context - 컨텍스트 (optional)
     * @param error - 에러 객체 (optional)
     * @param data - 추가 데이터 (optional)
     */
    error(message: string, context?: string, error?: Error | any, ...data: any[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            if (error) {
                console.error(`${this.formatContext(context)} ${message}`, error, ...data);
            } else {
                console.error(`${this.formatContext(context)} ${message}`, ...data);
            }
        }
    }

    /**
     * @description 그룹 시작
     * @param label - 그룹 레이블
     */
    group(label: string): void {
        if (this.isDevelopment && this.shouldLog(LogLevel.INFO)) {
            console.group(label);
        }
    }

    /**
     * @description 그룹 종료
     */
    groupEnd(): void {
        if (this.isDevelopment && this.shouldLog(LogLevel.INFO)) {
            console.groupEnd();
        }
    }

    /**
     * @description 테이블 형식 로그
     * @param data - 테이블 데이터
     */
    table(data: any): void {
        if (this.isDevelopment && this.shouldLog(LogLevel.DEBUG)) {
            console.table(data);
        }
    }
}

// 전역 Logger 인스턴스 export
export const logger = Logger.getInstance();
