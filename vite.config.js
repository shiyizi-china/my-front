import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
    },
  },
  server: {
    port: 5179,
    // 开发环境代理配置 - 解决CORS问题
    proxy: {
      // 使用更简洁的通配符代理所有API
      '^/(login|deitys|article|barrage|image|user)': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      // 添加OSS图片代理
      '/oss': {
        target: 'https://home-pageimage.oss-cn-guangzhou.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oss/, ''),
      },
    },
  },
})