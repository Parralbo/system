
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    // Avoid defining process.env as {} as it wipes out other variables
    // In production builds, Vite usually replaces process.env.VAR automatically
  },
  server: {
    port: 3000,
    host: true
  }
});
