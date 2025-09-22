import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(), basicSsl()],
    build: {
        outDir: 'build',
        rollupOptions: {
            input: {
                index: 'index.html',
                sw: 'src/sw.js'
            }
        }
    },
    base: '/Magram',
    server: {
        host: true,
        open: false,
        port: 3000,
    },
});