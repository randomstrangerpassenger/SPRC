// /api/batchGetPrices.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

// 단일 티커를 가져오는 내부 헬퍼 함수
async function fetchSinglePrice(ticker: string, apiKey: string) {
  const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`;
  
  try {
    const apiResponse = await fetch(finnhubUrl, { signal: AbortSignal.timeout(5000) });
    if (!apiResponse.ok) throw new Error(`API status ${apiResponse.status}`);
    
    const data = await apiResponse.json();
    
    // Finnhub의 유효한 응답인지 확인
    if (typeof data.c === 'number' && data.c > 0) {
      return { status: 'fulfilled', value: data.c };
    } else {
      // API는 성공(200)했지만 데이터가 없는 경우 (잘못된 티커 등)
      return { status: 'rejected', reason: `Invalid ticker or no data found for ${ticker}` };
    }
  } catch (error) {
    return { status: 'rejected', reason: error instanceof Error ? error.message : 'Fetch failed' };
  }
}

// 메인 핸들러
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 1. 쿼리 파라미터로 'symbols=AAPL,MSFT,GOOG' 형태를 받습니다.
  const { symbols } = request.query;

  if (typeof symbols !== 'string' || !symbols) {
    return response.status(400).json({ error: 'Symbols query parameter is required (e.g., ?symbols=AAPL,MSFT)' });
  }

  const API_KEY = process.env.FINNHUB_API_KEY;
  if (!API_KEY) {
    return response.status(500).json({ error: 'API key is not configured' });
  }

  const tickers = symbols.split(',');

  // 2. 서버리스 함수 내에서 Promise.allSettled를 사용해 병렬로 Finnhub에 요청합니다.
  const results = await Promise.allSettled(
    tickers.map(ticker => fetchSinglePrice(ticker, API_KEY))
  );

  // 3. Finnhub의 결과를 클라이언트가 원하는 형식으로 재조립합니다.
  const mappedResults = results.map((result, index) => {
    const ticker = tickers[index];
    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
      return {
        ticker: ticker,
        status: 'fulfilled',
        value: result.value.value,
      };
    } else {
      // fetchSinglePrice에서 rejected된 경우
      const reason = (result.status === 'rejected' ? result.reason : result.value.reason) || 'Unknown error';
      return {
        ticker: ticker,
        status: 'rejected',
        reason: reason,
      };
    }
  });

  // 4. [중요!] 해결책 2: 캐시 헤더 추가
  // Netlify/Vercel Edge에 5분(300초) 동안 이 응답을 캐시하도록 지시합니다.
  // 동일한 요청(e.g., ?symbols=AAPL,MSFT)이 5분 내에 다시 오면 서버리스 함수를 실행하지 않고 캐시된 값을 즉시 반환합니다.
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  // 5. 최종 결과를 클라이언트에 한 번만 보냅니다.
  response.status(200).json(mappedResults);
}