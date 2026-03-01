import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/features': path.resolve(__dirname, './src/features'),
            '@/services': path.resolve(__dirname, './src/services'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/models': path.resolve(__dirname, './src/models'),
            '@/context': path.resolve(__dirname, './src/context'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/constants': path.resolve(__dirname, './src/constants'),
        },
    },
    server: {
        port: 5173,
        host: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    fluentui: ['@fluentui/react-components'],
                },
            },
        },
    },
})
