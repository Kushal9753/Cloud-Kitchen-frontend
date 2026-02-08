import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // Enable source maps for production debugging (optional)
        sourcemap: false,
        // Reduce chunk size warnings threshold
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    // Core React libraries
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    // State management
                    'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
                    // Animation library (large)
                    'animation-vendor': ['framer-motion'],
                    // Charts library (large, admin-only)
                    'chart-vendor': ['recharts'],
                    // Maps library (large, rarely used)
                    'map-vendor': ['leaflet', 'react-leaflet'],
                    // Utilities
                    'utility-vendor': ['axios', 'socket.io-client'],
                },
            },
        },
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux', 'axios'],
    },
})

