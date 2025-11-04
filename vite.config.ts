// vite.config.ts (Vitest 4.x용 단순화 버전)

import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',

    esbuild: {
      target: 'esnext', // # 문법 지원은 유지
      drop: ['console', 'debugger'],
    },

    test: {
      globals: true,
      environment: 'jsdom',
      include: ['js/**/*.test.js', 'js/**/*.test.ts'],
      esbuild: {
        target: 'esnext', // 테스트 환경에서도 esnext 문법(예: #)을 사용하도록 설정
      },
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
  };
});
