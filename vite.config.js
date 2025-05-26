import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        host: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    supabase: ['@supabase/supabase-js'],
                    ui: ['lucide-react', 'recharts'],
                },
            },
        },
    },
    define: {
        // Enable runtime checks in development
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    },
})