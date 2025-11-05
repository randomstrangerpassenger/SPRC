import type { FetchStockResult } from './types.ts';

/**
 * @description 단일 주식의 현재가를 Finnhub API(Vite 프록시 경유)에서 가져옵니다.
 */
async function fetchStockPrice(ticker: string): Promise<number> {
    if (!ticker || ticker.trim() === '') {
        throw new Error('Ticker is empty.');
    }

    // Vite 프록시가 가로챌 주소 (/finnhub/quote)
    const url = `/finnhub/quote?symbol=${encodeURIComponent(ticker)}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!response.ok) {
        let errorBody = '';
        try {
            const errorData = await response.json();
            // Finnhub가 200 OK와 함께 에러 메시지를 보낼 때 (예: "No data found")
            if (errorData.c === 0 && errorData.d === null) {
                throw new Error(`Invalid ticker or no data found for ${ticker}`);
            }
            errorBody = errorData.error || (await response.text());
        } catch (e) {
            // response.json() 자체가 실패할 때 (예: 404, 500)
            errorBody = e instanceof Error ? e.message : await response.text();
        }
        throw new Error(`API returned status ${response.status} for ${ticker}. ${errorBody}`);
    }

    const data = await response.json();
    const price = data.c; // Finnhub API의 'current price' 필드

    if (typeof price !== 'number' || price <= 0) {
        console.warn(`[API] Received invalid price for ${ticker}: ${price}`);
        throw new Error(`Invalid or zero price received for ${ticker}: ${price}`);
    }

    return price;
}

/**
 * @description 여러 종목의 가격을 배치로 가져옵니다.
 * /api/batchGetPrices 엔드포인트를 한 번만 호출합니다.
 */
async function fetchAllStockPrices(
    tickersToFetch: { id: string; ticker: string }[]
): Promise<FetchStockResult[]> {
    if (tickersToFetch.length === 0) {
        return [];
    }

    // 모든 티커를 콤마로 구분하여 하나의 요청으로 전송
    const symbols = tickersToFetch.map(item => item.ticker).join(',');
    const url = `/api/batchGetPrices?symbols=${encodeURIComponent(symbols)}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
        throw new Error(`Batch API returned status ${response.status}`);
    }

    const batchResults = await response.json();

    // 배치 API 응답을 FetchStockResult 형식으로 매핑
    return batchResults.map((result: any, index: number) => {
        const { id } = tickersToFetch[index];
        if (result.status === 'fulfilled') {
            return {
                id: id,
                ticker: result.ticker,
                status: 'fulfilled' as const,
                value: result.value,
            };
        } else {
            return {
                id: id,
                ticker: result.ticker,
                status: 'rejected' as const,
                reason: result.reason || 'Unknown error',
            };
        }
    });
}

export const apiService = {
    fetchStockPrice,
    fetchAllStockPrices,
};