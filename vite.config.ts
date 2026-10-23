import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Wajib agar bisa diakses perangkat lain di jaringan yang sama
    port: 4200,
  },
});