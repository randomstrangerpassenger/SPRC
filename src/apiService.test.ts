// src/apiService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService, APIError, APIErrorType, formatAPIError } from './apiService';

// Mock global fetch
global.fetch = vi.fn();

describe('apiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('APIError', () => {
        it('should create APIError with type and message', () => {
            const error = new APIError('Test error', APIErrorType.NETWORK_ERROR);

            expect(error.name).toBe('APIError');
            expect(error.message).toBe('Test error');
            expect(error.type).toBe(APIErrorType.NETWORK_ERROR);
        });

        it('should include optional fields', () => {
            const error = new APIError('Ticker error', APIErrorType.INVALID_TICKER, {
                ticker: 'INVALID',
                statusCode: 404,
            });

            expect(error.ticker).toBe('INVALID');
            expect(error.statusCode).toBe(404);
        });

        it('should handle rate limit with retryAfter', () => {
            const error = new APIError('Rate limit', APIErrorType.RATE_LIMIT, {
                retryAfter: 60,
            });

            expect(error.retryAfter).toBe(60);
        });
    });

    describe('formatAPIError()', () => {
        it('should format network error', () => {
            const error = new APIError('Network failed', APIErrorType.NETWORK_ERROR);
            const message = formatAPIError(error);

            expect(message).toContain('네트워크');
            expect(message).toContain('연결');
        });

        it('should format timeout error', () => {
            const error = new APIError('Timeout', APIErrorType.TIMEOUT);
            const message = formatAPIError(error);

            expect(message).toContain('시간이 초과');
        });

        it('should format rate limit error with retry time', () => {
            const error = new APIError('Rate limit', APIErrorType.RATE_LIMIT, {
                retryAfter: 120,
            });
            const message = formatAPIError(error);

            expect(message).toContain('요청 한도');
            expect(message).toContain('120');
        });

        it('should format invalid ticker error', () => {
            const error = new APIError('Invalid', APIErrorType.INVALID_TICKER, {
                ticker: 'BADTICKER',
            });
            const message = formatAPIError(error);

            expect(message).toContain('유효하지 않은 티커');
            expect(message).toContain('BADTICKER');
        });

        it('should format server error', () => {
            const error = new APIError('Server error', APIErrorType.SERVER_ERROR);
            const message = formatAPIError(error);

            expect(message).toContain('서버 오류');
        });

        it('should format unknown error', () => {
            const error = new APIError('Unknown', APIErrorType.UNKNOWN);
            const message = formatAPIError(error);

            expect(message).toContain('알 수 없는 오류');
        });
    });

    describe('fetchStockPrice()', () => {
        it('should fetch stock price successfully', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ c: 150.25 }),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            const price = await apiService.fetchStockPrice('AAPL');

            expect(price).toBe(150.25);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('AAPL'),
                expect.objectContaining({
                    signal: expect.any(AbortSignal),
                })
            );
        });

        it('should throw APIError for empty ticker', async () => {
            await expect(apiService.fetchStockPrice('')).rejects.toThrow(APIError);
            await expect(apiService.fetchStockPrice('')).rejects.toMatchObject({
                type: APIErrorType.INVALID_TICKER,
            });
        });

        it('should throw APIError for invalid ticker (no data)', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ c: 0, d: null }),
            };
            (global.fetch as any).mockResolvedValue(mockResponse);

            const error = await apiService.fetchStockPrice('INVALID').catch((e) => e);
            expect(error).toBeInstanceOf(APIError);
            expect(error.type).toBe(APIErrorType.INVALID_TICKER);
        });

        it('should throw APIError for zero or negative price', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ c: 0 }),
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            await expect(apiService.fetchStockPrice('ZERO')).rejects.toThrow(APIError);
        });

        it('should retry on server error (5xx)', async () => {
            const mockError = {
                ok: false,
                status: 503,
                json: async () => ({ error: 'Service unavailable' }),
                text: async () => 'Service unavailable',
            };
            const mockSuccess = {
                ok: true,
                json: async () => ({ c: 100 }),
            };

            (global.fetch as any)
                .mockResolvedValueOnce(mockError)
                .mockResolvedValueOnce(mockSuccess);

            const price = await apiService.fetchStockPrice('AAPL');

            expect(price).toBe(100);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it(
            'should throw APIError after max retries',
            async () => {
                const mockError = {
                    ok: false,
                    status: 500,
                    json: async () => ({ error: 'Server error' }),
                    text: async () => 'Server error',
                };

                (global.fetch as any).mockResolvedValue(mockError);

                await expect(apiService.fetchStockPrice('AAPL')).rejects.toThrow(APIError);
                // Should retry up to CONFIG.API_MAX_RETRIES times (initial + 3 retries = 4 total)
                expect(global.fetch).toHaveBeenCalledTimes(4);
            },
            15000
        ); // Increased timeout to account for exponential backoff

        it('should handle rate limiting (429)', async () => {
            const mockRateLimit = {
                ok: false,
                status: 429,
                headers: new Headers({ 'Retry-After': '60' }),
                json: async () => ({}),
                text: async () => 'Too many requests',
            };

            (global.fetch as any).mockResolvedValueOnce(mockRateLimit);

            await expect(apiService.fetchStockPrice('AAPL')).rejects.toMatchObject({
                type: APIErrorType.RATE_LIMIT,
                retryAfter: 60,
            });
        });
    });

    describe('fetchAllStockPrices()', () => {
        it('should fetch prices for multiple tickers', async () => {
            const mockResponse = {
                ok: true,
                json: async () => [
                    { status: 'fulfilled', ticker: 'AAPL', value: 150 },
                    { status: 'fulfilled', ticker: 'GOOGL', value: 2800 },
                    { status: 'rejected', ticker: 'INVALID', reason: 'Not found' },
                ],
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            const tickersToFetch = [
                { id: '1', ticker: 'AAPL' },
                { id: '2', ticker: 'GOOGL' },
                { id: '3', ticker: 'INVALID' },
            ];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            expect(results).toHaveLength(3);
            expect(results[0]).toMatchObject({
                id: '1',
                status: 'fulfilled',
                value: 150,
            });
            expect(results[1]).toMatchObject({
                id: '2',
                status: 'fulfilled',
                value: 2800,
            });
            expect(results[2]).toMatchObject({
                id: '3',
                status: 'rejected',
                reason: 'Not found',
            });
        });

        it('should return empty array for empty input', async () => {
            const results = await apiService.fetchAllStockPrices([]);

            expect(results).toEqual([]);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it(
            'should fallback to individual fetches on batch API failure',
            async () => {
                // First call (batch) fails with 500, then individual fetches succeed
                const mockBatchError = {
                    ok: false,
                    status: 500,
                    json: async () => ({ error: 'Batch failed' }),
                    text: async () => 'Batch failed',
                };

                const mockIndividualSuccess = {
                    ok: true,
                    json: async () => ({ c: 150 }),
                };

                // Batch API fails all retry attempts (4 attempts with maxRetries=3)
                // Then falls back to individual fetches which succeed
                (global.fetch as any)
                    .mockResolvedValueOnce(mockBatchError) // Batch attempt 0
                    .mockResolvedValueOnce(mockBatchError) // Batch attempt 1 (retry)
                    .mockResolvedValueOnce(mockBatchError) // Batch attempt 2 (retry)
                    .mockResolvedValueOnce(mockBatchError) // Batch attempt 3 (retry)
                    .mockResolvedValue(mockIndividualSuccess); // Individual fetch succeeds

                const tickersToFetch = [{ id: '1', ticker: 'AAPL' }];

                const results = await apiService.fetchAllStockPrices(tickersToFetch);

                // Should fallback and succeed with individual fetch
                expect(results).toHaveLength(1);
                expect(results[0].status).toBe('fulfilled');
                expect(results[0].value).toBe(150);
            },
            15000
        ); // Increased timeout for retries and fallback

        it('should construct correct batch URL', async () => {
            const mockResponse = {
                ok: true,
                json: async () => [
                    { status: 'fulfilled', ticker: 'AAPL', value: 150 },
                    { status: 'fulfilled', ticker: 'GOOGL', value: 2800 },
                ],
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            const tickersToFetch = [
                { id: '1', ticker: 'AAPL' },
                { id: '2', ticker: 'GOOGL' },
            ];

            await apiService.fetchAllStockPrices(tickersToFetch);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('symbols=AAPL%2CGOOGL'),
                expect.any(Object)
            );
        });
    });
});