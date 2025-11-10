import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 构建优化：启用较小的 chunkSizeWarningLimit、拆分常见大依赖、保留构建日志
export default defineConfig({
  plugins: [react()],
  build: {
    // 降低告警阈值，便于发现大包
    chunkSizeWarningLimit: 600,
    // 使用 terser 以获得更稳定的内存表现
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // 将较大的依赖拆分到独立 chunk，减少单文件体积
          react: ['react', 'react-dom'],
          dndkit: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          editor: ['@monaco-editor/react', 'lexical', '@lexical/react'],
          i18n: ['i18next', 'react-i18next'],
          vendor: ['lodash', 'axios']
        }
      }
    }
  }
})
