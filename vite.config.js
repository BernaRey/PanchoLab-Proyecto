import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, process.cwd(), '');
  const puertoServidor = variables.PUERTO || '3000';

  return {
    esbuild: {
      jsx: 'automatic',
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