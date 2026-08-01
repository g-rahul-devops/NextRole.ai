import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tanstackStart(), react(), tsconfigPaths()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
