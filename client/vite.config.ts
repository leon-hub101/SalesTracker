// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";


export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: "127.0.0.1", // Fix ENOTSUP on Windows
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Points to client/src/
      "@components": path.resolve(__dirname, "src/components"), // New alias for components
      "@shared": path.resolve(__dirname, "../shared"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@ui": path.resolve(__dirname, "src/components/ui"),
      "@api": path.resolve(__dirname, "../api"),           
      "@lib": path.resolve(__dirname, "../lib")
    },
  },
    css: {
    postcss: "./postcss.config.cjs",
  },
});

