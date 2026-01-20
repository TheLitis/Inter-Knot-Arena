import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    },
    fs: {
      allow: [path.resolve(__dirname, "../..")]
    }
  },
  resolve: {
    alias: {
      "@ika/shared": path.resolve(__dirname, "../../packages/shared/src")
    }
  }
});
