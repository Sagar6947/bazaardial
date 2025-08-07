import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {
    base: "./",
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
