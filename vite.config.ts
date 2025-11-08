// vite.config.ts (Vitest 4.x용 단순화 버전)

import { defineConfig, loadEnv } from 'vite';
import purgecss from 'vite-plugin-purgecss';
// ===== [Phase 3-2 최적화] PWA 플러그인 추가 =====
import { VitePWA } from 'vite-plugin-pwa';
// ===== [Phase 3-2 최적화 끝] =====

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',

    // ===== [Phase 3.3 최적화] CSS Purging 플러그인 추가 =====
    plugins: [
      // ===== [Phase 3-2 최적화] PWA 플러그인 설정 =====
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Portfolio Rebalancer',
          short_name: 'Portfolio',
          description: 'Smart Portfolio Rebalancing Calculator',
          theme_color: '#667eea',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          // 정적 자산 캐싱
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          // IndexedDB API 응답 캐싱 (런타임 캐싱)
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/finnhub\.io\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 // 1시간
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: false // 개발 모드에서는 비활성화
        }
      }),
      // ===== [Phase 3-2 최적화 끝] =====
      ...(mode === 'production' ? [
        purgecss({
          content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
          defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
          safelist: {
            standard: ['dark-mode', 'sr-only', 'skip-link', 'modal-open'],
            // ===== [Phase 1-5 최적화] CSS Safelist 구체화 =====
            deep: [/^btn-/, /^toast-/, /^modal-/, /^virtual-/, /^error-/, /^text-/],
            greedy: [/aria-/]  // data- 속성 제거, aria-만 유지
            // ===== [Phase 1-5 최적화 끝] =====
          }
        })
      ] : [])
    ],
    // ===== [Phase 3.3 최적화 끝] =====

    // ===== [Phase 1-1 최적화] 백엔드 의존성 분리 =====
    build: {
      rollupOptions: {
        external: ['express', 'nodemailer', 'cors']
      }
    },
    // ===== [Phase 1-1 최적화 끝] =====

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