import { defineConfig } from 'vite'
import { path } from 'path';
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium/')
  },
  build: {
    rollupOptions: {
      external: {
      }
    }
  },
  assetsInclude: ['**/*.gltf', '**/*.glb'],
  server: {
    fs: {
      allow: ['..']
    }
  }
})
