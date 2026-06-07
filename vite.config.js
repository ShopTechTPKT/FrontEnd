import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
            return "vendor-react";
          }
          if (id.includes("redux") || id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
            return "vendor-redux";
          }
          if (id.includes("i18next") || id.includes("react-i18next")) {
            return "vendor-i18n";
          }
          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }
          if (id.includes("html2canvas") || id.includes("jspdf")) {
            return "vendor-export";
          }
          if (id.includes("sockjs-client") || id.includes("stompjs")) {
            return "vendor-realtime";
          }
          if (id.includes("react-toastify") || id.includes("framer-motion")) {
            return "vendor-ui";
          }
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("@fortawesome")) return "vendor-icons-fa";
          if (id.includes("leaflet") || id.includes("mapbox")) return "vendor-maps";
          return "vendor-misc";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["sockjs-client", "stompjs"],
  },
  server: {
    port: 5188,
    proxy: {
      // Prefer direct services in dev so FE works even if api-gateway (8081) is not started.
      // Monolith backend (8080): everything under /api/**
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // WebSocket (SockJS): /ws/**
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      // Use a dedicated path so it doesn't conflict with the /ws backend proxy
      path: '/__vite_hmr',
    },
  },
})
// Updated: 2025-10-12T16:06:45.408Z

// Updated: 2025-10-12T16:09:00.927Z
