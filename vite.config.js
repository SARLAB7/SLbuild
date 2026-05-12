import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),   // Esta será tu pantalla de Login
        panel: resolve(__dirname, 'panel.html')   // Este será tu sistema Sarlab
      }
    }
  }
});
