import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

const raizFrontend = fileURLToPath(new URL('.', import.meta.url));
const carpetaBackend = fileURLToPath(new URL('../backend/', import.meta.url));

export default defineConfig(({ mode }) => {
  const variablesVite = loadEnv(mode, carpetaBackend, 'VITE_');
  const variablesServidor = loadEnv(mode, carpetaBackend, 'PUERTO');
  const puertoServidor = variablesServidor.PUERTO || '3000';

  return {
    root: raizFrontend,
    envDir: carpetaBackend,
    esbuild: {
      jsx: 'automatic',
    },
    base: variablesVite.VITE_BASE_PATH || '/',
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]',
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
