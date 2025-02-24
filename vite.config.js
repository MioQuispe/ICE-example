import { fileURLToPath, URL } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import environment from "vite-plugin-environment"
import dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8080",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
    ],
  },
})
