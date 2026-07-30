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
    // Proxy API in local/dev so the browser talks same-origin and avoids CORS/CORP issues.
    // Override with VITE_API_PROXY_TARGET if the API runs on a non-default port.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            console.error("[vite proxy /api]", err.message);
            if (res && !res.headersSent) {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  message:
                    "Cannot reach the API. Make sure the server is running, then try again.",
                }),
              );
            }
          });
        },
      },
      // Socket.IO must be same-origin in dev so auth cookies reach the handshake.
      "/socket.io": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

