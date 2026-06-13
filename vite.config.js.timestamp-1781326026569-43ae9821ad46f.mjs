// vite.config.js
import { defineConfig } from "file:///sessions/zealous-pensive-pascal/mnt/Mule%20App/mulequest/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/zealous-pensive-pascal/mnt/Mule%20App/mulequest/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion": ["framer-motion"],
          "charts": ["recharts"],
          "supabase": ["@supabase/supabase-js"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvemVhbG91cy1wZW5zaXZlLXBhc2NhbC9tbnQvTXVsZSBBcHAvbXVsZXF1ZXN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvemVhbG91cy1wZW5zaXZlLXBhc2NhbC9tbnQvTXVsZSBBcHAvbXVsZXF1ZXN0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy96ZWFsb3VzLXBlbnNpdmUtcGFzY2FsL21udC9NdWxlJTIwQXBwL211bGVxdWVzdC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ1xuICAgIH1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDgwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAnbW90aW9uJzogWydmcmFtZXItbW90aW9uJ10sXG4gICAgICAgICAgJ2NoYXJ0cyc6IFsncmVjaGFydHMnXSxcbiAgICAgICAgICAnc3VwYWJhc2UnOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlWLFNBQVMsb0JBQW9CO0FBQ3RYLE9BQU8sV0FBVztBQUVsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCx1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsVUFDekQsVUFBVSxDQUFDLGVBQWU7QUFBQSxVQUMxQixVQUFVLENBQUMsVUFBVTtBQUFBLFVBQ3JCLFlBQVksQ0FBQyx1QkFBdUI7QUFBQSxRQUN0QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
