import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ['mysql2', 'mysql2/promise', 'crypto', 'fs', 'path', 'os', 'net', 'tls', 'stream'],
    }
  },
  optimizeDeps: {
    exclude: ['mysql2']
  }
});
