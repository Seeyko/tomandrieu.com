import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Root directory is frontend/
  root: '.',

  // Public directory for static assets (data, assets folders)
  publicDir: 'public',

  build: {
    // Output to dist/ folder
    outDir: 'dist',

    // Generate source maps for debugging (can disable in production)
    sourcemap: false,

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true,
      },
    },

    // Code splitting and chunking
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Theme files get their own chunks (lazy loaded)
          if (id.includes('/themes/terminal/')) return 'theme-terminal';
          if (id.includes('/themes/blueprint/')) return 'theme-blueprint';
          if (id.includes('/themes/retro90s/')) return 'theme-retro90s';
          if (id.includes('/themes/default/')) return 'theme-default';

          // i18n gets its own chunk
          if (id.includes('/i18n/')) return 'i18n';

          // CRO scripts (can be lazy loaded)
          if (id.includes('/js/cro')) return 'cro';

          // Core modules stay together
          if (id.includes('/js/core/')) return 'core';
        },

        // Asset naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },

      // Mark GSAP as external (loaded from CDN)
      external: [
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
      ],
    },

    // Target modern browsers for smaller bundles
    target: 'es2020',

    // CSS code splitting
    cssCodeSplit: true,

    // Inline assets smaller than 4kb
    assetsInlineLimit: 4096,
  },

  // Development server settings
  server: {
    port: 8000,
    open: true,
  },

  // Preview server (for testing production build)
  preview: {
    port: 8000,
  },

  // CSS handling
  css: {
    devSourcemap: true,
  },
});
