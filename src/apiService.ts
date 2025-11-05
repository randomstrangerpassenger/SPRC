// src/apiService.ts (강화된 오류 처리)
import type { FetchStockResult } from './types.ts';
import { CONFIG } from './constants.ts';

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
    UNKNOWN = 'UNKNOWN'
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

    constructor(message: string, type: APIErrorType, options?: {
        ticker?: string;
        statusCode?: number;
        retryAfter?: number;
    }) {
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.ticker = options?.ticker;
        this.statusCode = options?.statusCode;
        this.retryAfter = options?.retryAfter;
    }
}

/**
 * @description Retry 로직을 포함한 fetch 래퍼
 * @param url - API URL
 * @param options - Fetch 옵션
 * @param maxRetries - 최대 재시도 횟수
 * @returns Promise<Response>
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3
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
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.warn(`[API] Server error ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;

            // Timeout 오류
            if (error instanceof Error && error.name === 'TimeoutError') {
                if (attempt < maxRetries) {
                    console.warn(`[API] Timeout, retrying... (attempt ${attempt + 1}/${maxRetries})`);
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
                    const delay = Math.pow(2, attempt) * 1000;
                    console.warn(`[API] Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw new APIError(
                    'Network error after multiple retry attempts',
                    APIErrorType.NETWORK_ERROR
                );
            }

            // Rate limit 오류는 재시도하지 않음
            if (error instanceof APIError && error.type === APIErrorType.RATE_LIMIT) {
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
            { signal: AbortSignal.timeout(CONFIG.API_TIMEOUT) },
            2 // 최대 2회 재시도
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
            } catch (e) {
                errorBody = e instanceof Error ? e.message : await response.text();
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
            console.warn(`[API] Received invalid price for ${ticker}: ${price}`);
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
 * @description 여러 종목의 가격을 배치로 가져옵니다.
 * @param tickersToFetch - 티커 배열
 * @returns Promise<FetchStockResult[]>
 */
async function fetchAllStockPrices(
    tickersToFetch: { id: string; ticker: string }[]
): Promise<FetchStockResult[]> {
    if (tickersToFetch.length === 0) {
        return [];
    }

    const symbols = tickersToFetch.map(item => item.ticker).join(',');
    const url = `/api/batchGetPrices?symbols=${encodeURIComponent(symbols)}`;

    try {
        const response = await fetchWithRetry(
            url,
            { signal: AbortSignal.timeout(CONFIG.BATCH_API_TIMEOUT) },
            2 // 최대 2회 재시도
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
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError(
            error instanceof Error ? error.message : 'Batch API request failed',
            APIErrorType.UNKNOWN
        );
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

export const apiService = {
    fetchStockPrice,
    fetchAllStockPrices,
};
