// vite.config.js (Vitest 4.x용 단순화 버전)

import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Finnhub API 키 확인
  if (!env.VITE_FINNHUB_API_KEY || env.VITE_FINNHUB_API_KEY === 'your_api_key_here') {
    console.warn('\n⚠️  WARNING: Finnhub API key is not set!');
    console.warn('📝 Please set VITE_FINNHUB_API_KEY in .env file');
    console.warn('🔗 Get your free API key at: https://finnhub.io/register\n');
  }

  return {
    base: './',

    esbuild: {
      target: 'esnext', // # 문법 지원은 유지
    },

    test: {
      globals: true,
      environment: 'jsdom',
      include: ['js/**/*.test.js'],
      // --- ⬇️ [추가된 부분] ⬇️ ---
      esbuild: {
        target: 'esnext', // 테스트 환경에서도 esnext 문법(예: #)을 사용하도록 설정
      },
      // --- ⬆️ [추가된 부분] ⬆️ ---
      // pool, threads, deps.optimizer 등 제거
    },

    server: {
      proxy: {
        '/finnhub': {
          target: 'https://finnhub.io/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/finnhub/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const url = new URL(proxyReq.path, options.target);
              url.searchParams.set('token', env.VITE_FINNHUB_API_KEY);
              proxyReq.path = url.pathname + url.search;
            });
          }
        }
      }
    }
  }
});