import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Plugin to add CSP headers for iframe embedding
const embedHeadersPlugin = (): Plugin => ({
  name: 'embed-headers',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.includes('/events/embed')) {
        // Allow embedding from any origin for the embed route
        res.setHeader('Content-Security-Policy', "frame-ancestors *");
        // Remove X-Frame-Options to avoid conflicts with CSP
        res.removeHeader('X-Frame-Options');
      } else {
        // Protect other routes from being embedded
        res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), embedHeadersPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
