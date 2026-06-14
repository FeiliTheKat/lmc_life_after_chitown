import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { resolve } from 'node:path';

// 纯前端离线单页：base './' 支持 file:// 与任意子路径部署（design §13 / §15.2）
export default defineConfig({
  base: './',
  plugins: [preact()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node', // 领域逻辑层是纯函数，默认无 DOM；需要 DOM 的 UI 测试单独标 jsdom
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
