import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), basicSsl()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
      },
      '/audio': {
        target: 'http://127.0.0.1:8000',
      },
    },
  },
});
