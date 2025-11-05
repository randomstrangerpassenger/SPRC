// vite.config.ts (Vitest 4.x용 단순화 버전)

import { defineConfig, loadEnv } from 'vite';
import purgecss from 'vite-plugin-purgecss';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',

    // ===== [Phase 3.3 최적화] CSS Purging 플러그인 추가 =====
    plugins: mode === 'production' ? [
      purgecss({
        content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: ['dark-mode', 'sr-only', 'skip-link', 'modal-open'],
          deep: [/^btn/, /^toast/, /^modal/, /^virtual-/, /^error-/, /^text-/],
          greedy: [/data-/, /aria-/]
        }
      })
    ] : [],
    // ===== [Phase 3.3 최적화 끝] =====

    esbuild: {
      target: 'esnext', // # 문법 지원은 유지
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.js', 'src/**/*.test.ts'],
      esbuild: {
        target: 'esnext', // 테스트 환경에서도 esnext 문법(예: #)을 사용하도록 설정
      },
    },

    server: {
      proxy: {
        '/api/batchGetPrices': {
          target: 'https://finnhub.io/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/batchGetPrices/, '/quote'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const url = new URL(proxyReq.path, options.target);
              url.searchParams.set('token', env.FINNHUB_API_KEY || env.VITE_FINNHUB_API_KEY);
              proxyReq.path = url.pathname + url.search;
            });
          }
        }
      }
    }
  };
});