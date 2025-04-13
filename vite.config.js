import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  root: 'src/web/client',
  base: '/app/', // Set base path to /app/ so all assets are referenced with /app/ prefix
  build: {
    outDir: path.resolve(__dirname, 'src/static/app'),
    emptyOutDir: true,
    assetsDir: 'assets', // Make sure assets are placed in the assets directory
    rollupOptions: {
      output: {
        // Ensure consistent asset file naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/web/client'),
      '@components': path.resolve(__dirname, 'src/web/client/components'),
      '@views': path.resolve(__dirname, 'src/web/client/views'),
      '@store': path.resolve(__dirname, 'src/web/client/store'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:3100',
        changeOrigin: true
      }
    }
  }
});
