// vite.config.js

import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['js/**/*.test.js'],
  },
});