import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 构建优化：启用较小的 chunkSizeWarningLimit、拆分常见大依赖、保留构建日志
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 指定优先使用浏览器环境的 exports 条件，避免入口解析冲突
    conditions: ['browser'],
    // 明确主入口字段优先级，确保走浏览器与 ESM 入口
    mainFields: ['browser', 'module', 'jsnext:main', 'main']
  },
  // 依赖预构建设置，帮助 esbuild 正确处理带条件导出的包
  optimizeDeps: {
    include: ['lexical', '@lexical/react'],
    esbuildOptions: {
      // 让 esbuild 解析 package.json exports 时优先使用 browser 条件
      conditions: ['browser']
    }
  },
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
          // 仅拆分 monaco 编辑器，避免对 lexical 包做手动拆分造成解析问题
          editor: ['@monaco-editor/react'],
          i18n: ['i18next', 'react-i18next'],
          vendor: ['lodash', 'axios']
        }
      }
    }
  }
})
