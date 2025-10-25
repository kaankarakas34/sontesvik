import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  // Coolify FQDN'den API URL'ini dinamik olarak oluştur
  const getApiUrl = () => {
    // Coolify deployment'ta COOLIFY_FQDN environment variable'ı otomatik olarak ayarlanır
    if (env.COOLIFY_FQDN) {
      return `${env.COOLIFY_FQDN}/api`
    }
    
    // Production environment'ta varsayılan URL
    if (mode === 'production') {
      return 'https://app.tesvik360.com/api'
    }
    
    // Development environment'ta localhost
    return 'http://localhost:5002/api'
  }

  const apiUrl = getApiUrl()
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },
    // Environment variables'ları frontend'e aktar
    define: {
      __API_URL__: JSON.stringify(apiUrl),
      __COOLIFY_FQDN__: JSON.stringify(env.COOLIFY_FQDN || ''),
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
      open: false,
      strictPort: false,
      cors: true,
      proxy: {
        '/api': {
          target: mode === 'production' ? apiUrl.replace('/api', '') : 'http://backend:5002',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})