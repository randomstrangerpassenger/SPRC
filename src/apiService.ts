// src/apiService.ts
import type { FetchStockResult } from './types';
import { CONFIG } from './constants';
import { logger } from './services/Logger';

/**
 * @enum APIErrorType
 * @description API 오류 유형 분류
 */
export enum APIErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT = 'TIMEOUT',
    RATE_LIMIT = 'RATE_LIMIT',
    INVALID_TICKER = 'INVALID_TICKER',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN = 'UNKNOWN',
}

/**
 * @class APIError
 * @description 구조화된 API 오류 클래스
 */
export class APIError extends Error {
    type: APIErrorType;
    ticker?: string;
    statusCode?: number;
    retryAfter?: number;

    constructor(
        message: string,
        type: APIErrorType,
        options?: {
            ticker?: string;
            statusCode?: number;
            retryAfter?: number;
        }
    ) {
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.ticker = options?.ticker;
        this.statusCode = options?.statusCode;
        this.retryAfter = options?.retryAfter;
    }
}

/**
 * @description 지터(jitter)를 적용한 지수 백오프 지연 시간 계산
 * @param attempt - 현재 시도 횟수 (0부터 시작)
 * @returns 지연 시간 (밀리초)
 */
function calculateBackoffDelay(attempt: number): number {
    // 지수 백오프: baseDelay * 2^attempt
    const exponentialDelay = CONFIG.API_RETRY_BASE_DELAY * Math.pow(2, attempt);

    // 최대 지연 시간 제한
    const cappedDelay = Math.min(exponentialDelay, CONFIG.API_RETRY_MAX_DELAY);

    // 지터 적용: ±jitterFactor 범위로 무작위화 (thundering herd 방지)
    const jitterRange = cappedDelay * CONFIG.API_RETRY_JITTER_FACTOR;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;

    return Math.max(0, cappedDelay + jitter);
}

/**
 * @description Retry 로직을 포함한 fetch 래퍼 (향상된 지수 백오프 with jitter)
 * @param url - API URL
 * @param options - Fetch 옵션
 * @param maxRetries - 최대 재시도 횟수 (기본값: CONFIG.API_MAX_RETRIES)
 * @returns Promise<Response>
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = CONFIG.API_MAX_RETRIES
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            // 429 (Too Many Requests) 처리
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
                throw new APIError(
                    `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
                    APIErrorType.RATE_LIMIT,
                    { statusCode: 429, retryAfter }
                );
            }

            // 5xx 서버 오류는 재시도
            if (response.status >= 500 && attempt < maxRetries) {
                const delay = calculateBackoffDelay(attempt);
                logger.warn(
                    `Server error ${response.status}, retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${maxRetries})...`,
                    'API'
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }

            // 503 (Service Unavailable) 또는 502 (Bad Gateway)는 최종 실패로 처리
            if ((response.status === 503 || response.status === 502) && attempt === maxRetries) {
                throw new APIError(
                    `Server unavailable after ${maxRetries} retries`,
                    APIErrorType.SERVER_ERROR,
                    { statusCode: response.status }
                );
            }

            return response;
        } catch (error) {
            lastError = error as Error;

            // Timeout 오류 (재시도 가능)
            if (error instanceof Error && error.name === 'TimeoutError') {
                if (attempt < maxRetries) {
                    const delay = calculateBackoffDelay(attempt);
                    logger.warn(
                        `Timeout, retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${maxRetries})...`,
                        'API'
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
                throw new APIError(
                    'Request timed out after multiple attempts',
                    APIErrorType.TIMEOUT
                );
            }

            // 네트워크 오류 (재시도 가능)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                if (attempt < maxRetries) {
                    const delay = calculateBackoffDelay(attempt);
                    logger.warn(
                        `Network error, retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${maxRetries})...`,
                        'API'
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
                throw new APIError(
                    'Network error after multiple retry attempts',
                    APIErrorType.NETWORK_ERROR
                );
            }

            // Rate limit 오류는 재시도하지 않음 (즉시 throw)
            if (error instanceof APIError && error.type === APIErrorType.RATE_LIMIT) {
                throw error;
            }

            // 기타 APIError는 재시도하지 않음
            if (error instanceof APIError) {
                throw error;
            }
        }
    }

    // 모든 재시도 실패
    throw lastError || new APIError('Unknown fetch error', APIErrorType.UNKNOWN);
}

/**
 * @description 단일 주식의 현재가를 Finnhub API(Vite 프록시 경유)에서 가져옵니다.
 * @param ticker - 주식 티커
 * @returns Promise<number>
 */
async function fetchStockPrice(ticker: string): Promise<number> {
    if (!ticker || ticker.trim() === '') {
        throw new APIError('Ticker is empty', APIErrorType.INVALID_TICKER, { ticker });
    }

    const url = `/finnhub/quote?symbol=${encodeURIComponent(ticker)}`;

    try {
        const response = await fetchWithRetry(
            url,
            { signal: AbortSignal.timeout(CONFIG.API_TIMEOUT) }
            // Uses CONFIG.API_MAX_RETRIES by default
        );

        if (!response.ok) {
            let errorBody = '';
            try {
                const errorData = await response.json();
                if (errorData.c === 0 && errorData.d === null) {
                    throw new APIError(
                        `Invalid ticker or no data found for ${ticker}`,
                        APIErrorType.INVALID_TICKER,
                        { ticker, statusCode: response.status }
                    );
                }
                errorBody = errorData.error || (await response.text());
            } catch (error) {
                errorBody = error instanceof Error ? error.message : await response.text();
            }

            throw new APIError(
                `API returned status ${response.status} for ${ticker}. ${errorBody}`,
                response.status >= 500 ? APIErrorType.SERVER_ERROR : APIErrorType.UNKNOWN,
                { ticker, statusCode: response.status }
            );
        }

        const data = await response.json();
        const price = data.c;

        if (typeof price !== 'number' || price <= 0) {
            logger.warn(`Received invalid price for ${ticker}: ${price}`, 'API');
            throw new APIError(
                `Invalid or zero price received for ${ticker}: ${price}`,
                APIErrorType.INVALID_TICKER,
                { ticker }
            );
        }

        return price;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        // 예상치 못한 오류
        throw new APIError(
            error instanceof Error ? error.message : 'Unknown error',
            APIErrorType.UNKNOWN,
            { ticker }
        );
    }
}

/**
 * @description 개별 종목 가격 가져오기 (배치 API 폴백용)
 * @param item - { id, ticker } 객체
 * @returns Promise<FetchStockResult>
 */
async function fetchSingleStockPrice(item: {
    id: string;
    ticker: string;
}): Promise<FetchStockResult> {
    try {
        const price = await fetchStockPrice(item.ticker);
        return {
            id: item.id,
            ticker: item.ticker,
            status: 'fulfilled' as const,
            value: price,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
            id: item.id,
            ticker: item.ticker,
            status: 'rejected' as const,
            reason: message,
        };
    }
}

/**
 * @description 여러 종목의 가격을 배치로 가져옵니다. (실패 시 개별 fetch로 폴백)
 * @param tickersToFetch - 티커 배열
 * @returns Promise<FetchStockResult[]>
 */
async function fetchAllStockPrices(
    tickersToFetch: { id: string; ticker: string }[]
): Promise<FetchStockResult[]> {
    if (tickersToFetch.length === 0) {
        return [];
    }

    const symbols = tickersToFetch.map((item) => item.ticker).join(',');
    const url = `/api/batchGetPrices?symbols=${encodeURIComponent(symbols)}`;

    try {
        const response = await fetchWithRetry(
            url,
            { signal: AbortSignal.timeout(CONFIG.BATCH_API_TIMEOUT) }
            // Uses CONFIG.API_MAX_RETRIES by default
        );

        if (!response.ok) {
            throw new APIError(
                `Batch API returned status ${response.status}`,
                response.status >= 500 ? APIErrorType.SERVER_ERROR : APIErrorType.UNKNOWN,
                { statusCode: response.status }
            );
        }

        const batchResults = await response.json();

        return batchResults.map((result: any, index: number) => {
            const { id, ticker } = tickersToFetch[index];
            if (result.status === 'fulfilled') {
                return {
                    id: id,
                    ticker: result.ticker || ticker,
                    status: 'fulfilled' as const,
                    value: result.value,
                };
            } else {
                return {
                    id: id,
                    ticker: result.ticker || ticker,
                    status: 'rejected' as const,
                    reason: result.reason || 'Unknown error',
                };
            }
        });
    } catch (error) {
        // 배치 API 실패 시 개별 fetch로 폴백
        logger.warn(
            `Batch API failed, falling back to individual fetches: ${error instanceof Error ? error.message : error}`,
            'apiService'
        );

        // Promise.allSettled를 사용하여 모든 개별 요청 실행
        const individualResults = await Promise.allSettled(
            tickersToFetch.map((item) => fetchSingleStockPrice(item))
        );

        // allSettled 결과를 FetchStockResult[] 형식으로 변환
        return individualResults.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                // Promise rejection (매우 드문 경우)
                return {
                    id: tickersToFetch[index].id,
                    ticker: tickersToFetch[index].ticker,
                    status: 'rejected' as const,
                    reason:
                        result.reason instanceof Error ? result.reason.message : 'Unknown error',
                };
            }
        });
    }
}

/**
 * @description API 오류를 사용자 친화적인 메시지로 변환
 * @param error - APIError 인스턴스
 * @returns 사용자 메시지
 */
export function formatAPIError(error: APIError): string {
    switch (error.type) {
        case APIErrorType.NETWORK_ERROR:
            return '네트워크 연결을 확인해주세요. 인터넷 연결이 불안정합니다.';
        case APIErrorType.TIMEOUT:
            return 'API 요청 시간이 초과되었습니다. 다시 시도해주세요.';
        case APIErrorType.RATE_LIMIT:
            return `요청 한도를 초과했습니다. ${error.retryAfter || 60}초 후에 다시 시도해주세요.`;
        case APIErrorType.INVALID_TICKER:
            return `유효하지 않은 티커: ${error.ticker}. 티커를 확인해주세요.`;
        case APIErrorType.SERVER_ERROR:
            return 'API 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
            return `알 수 없는 오류: ${error.message}`;
    }
}

/**
 * @description 환율 정보 가져오기
 * @returns Promise<number | null> - USD/KRW 환율 또는 null
 */
async function fetchExchangeRate(): Promise<number | null> {
    try {
        const apiKey = CONFIG.EXCHANGE_RATE_API_KEY;

        // API 키가 있으면 유료 버전, 없으면 무료 버전 사용
        const apiUrl = apiKey
            ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
            : 'https://api.exchangerate-api.com/v4/latest/USD';

        const response = await fetchWithRetry(
            apiUrl,
            { signal: AbortSignal.timeout(CONFIG.API_TIMEOUT) }
            // Uses CONFIG.API_MAX_RETRIES by default
        );

        if (!response.ok) {
            logger.warn('Exchange rate API failed', 'apiService');
            return null;
        }

        const data = await response.json();

        // 유료 버전은 conversion_rates, 무료 버전은 rates 사용
        const krwRate = apiKey ? data.conversion_rates?.KRW : data.rates?.KRW;

        if (typeof krwRate === 'number' && krwRate > 0) {
            logger.info(
                `Exchange rate fetched: ${krwRate} ${apiKey ? '(with API key)' : '(free tier)'}`,
                'apiService'
            );
            return krwRate;
        }

        return null;
    } catch (error) {
        logger.warn('Failed to fetch exchange rate', 'apiService', error);
        return null;
    }
}

export const apiService = {
    fetchStockPrice,
    fetchAllStockPrices,
    fetchExchangeRate,
};
