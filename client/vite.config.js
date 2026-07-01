import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

// HTTPS is opt-in (npm run dev:https) — needed to test Cashfree locally,
// since Cashfree rejects a plain http:// return_url even in sandbox.
const useHttps = process.env.VITE_HTTPS === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(useHttps ? [basicSsl()] : []),
  ],
  server: {
    https: useHttps,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

