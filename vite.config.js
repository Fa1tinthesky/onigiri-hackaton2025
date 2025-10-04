import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      cesium: resolve(__dirname, "node_modules/cesium/Source"),
    },
  },
  optimizeDeps: {
    exclude: ["cesium"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          cesium: ["cesium"],
        },
      },
    },
  },
  server: {
    fs: {
      allow: ["node_modules/cesium/Build/Cesium"],
    },
  },
});
