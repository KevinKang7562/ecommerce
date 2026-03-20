import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devHost = env.VITE_DEV_SERVER_HOST || 'localhost';
  const devPort = Number(env.VITE_DEV_SERVER_PORT || 5173);

  return {
    plugins: [react()],
    server: {
      host: devHost,
      port: devPort,
      strictPort: true,
      hmr: {
        host: devHost,
        port: devPort,
        clientPort: devPort,
        protocol: 'ws',
      },
      proxy: {
        '/zin_api': {
          target: 'http://localhost:7080',
          changeOrigin: true,
        },
      },
    },
  };
});
