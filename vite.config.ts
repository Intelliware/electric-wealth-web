import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // The browser calls /api on the Vite dev server, which proxies to the API.
  // That keeps everything same-origin, so there is no CORS setup in development.
  const apiUrl = env.API_URL || 'http://localhost:4100';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': apiUrl,
      },
    },
  };
});
