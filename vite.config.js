import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, process.cwd(), '');
  const puertoServidor = variables.PUERTO || '3000';

  return {
    esbuild: {
      jsx: 'automatic',
    },
    base: variables.VITE_BASE_PATH || '/',
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/')) return 'vendor';
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${puertoServidor}`,
          changeOrigin: true,
        },
      },
    },
  };
});
