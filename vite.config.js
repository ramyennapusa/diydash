import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration for DIYDash
  server: {
    port: 3000,
    host: true, // Allow external connections
    open: true, // Automatically open browser
    strictPort: false, // Try next available port if 3000 is taken
    hmr: {
      overlay: true // Show error overlay on HMR errors
    }
  },
  
  // Build configuration for production
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps for production
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    open: true
  }
})
