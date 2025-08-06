import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import history from 'connect-history-api-fallback';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  base: './',
  preview: {
    // 🔁 Esta parte es crucial para que Vite Preview redirija rutas
    middlewareMode: true,
    configurePreviewServer: (server) => {
      server.middlewares.use(
        history({
          rewrites: [
            
          ],
        })
      );
    },
  },
});
