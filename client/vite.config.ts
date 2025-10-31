// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";


export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: "127.0.0.1", // Fix ENOTSUP on Windows
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Points to client/src/
      "@components": path.resolve(__dirname, "client/src/components"), // New alias for components
      "@shared": path.resolve(__dirname, "shared"),
      "@lib": path.resolve(__dirname, "lib"),
    },
  },
});

