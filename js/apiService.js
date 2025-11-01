// @ts-check

/**
 * @description 단일 주식의 현재가를 Finnhub API(Vite 프록시 경유)에서 가져옵니다.
 * @param {string} ticker - 가져올 주식의 티커
 * @returns {Promise<number>} 현재가
 * @throws {Error} - API 호출 실패 또는 티커가 유효하지 않을 경우
 */
async function fetchStockPrice(ticker) {
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
            errorBody = errorData.error || await response.text();
        } catch (e) {
            // response.json() 자체가 실패할 때 (예: 404, 500)
            errorBody = (e instanceof Error) ? e.message : await response.text();
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

// 여러 종목의 가격을 병렬로 가져옵니다.
/**
 * @param {{id: string, ticker: string}[]} tickersToFetch 
 * @returns {Promise<{id: string, ticker: string, status: 'fulfilled' | 'rejected', value?: number, reason?: string}[]>}
 */
async function fetchAllStockPrices(tickersToFetch) {
    const results = await Promise.allSettled(
        tickersToFetch.map(async (item) => {
            const price = await fetchStockPrice(item.ticker);
            return { ...item, price }; // 성공 시 price 포함
        })
    );

    // Promise.allSettled 결과를 일관된 형식으로 매핑
    return results.map((result, index) => {
        const { id, ticker } = tickersToFetch[index];
        if (result.status === 'fulfilled') {
            return {
                id: result.value.id,
                ticker: result.value.ticker,
                status: 'fulfilled',
                value: result.value.price
            };
        } else {
            return {
                id: id,
                ticker: ticker,
                status: 'rejected',
                reason: (result.reason instanceof Error) ? result.reason.message : String(result.reason)
            };
        }
    });
}

export const apiService = {
    fetchStockPrice,
    fetchAllStockPrices
};