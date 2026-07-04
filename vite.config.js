import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        aufgaben: resolve(__dirname, 'aufgaben.html'),
        pruefung: resolve(__dirname, 'pruefung.html')
      },
      
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop().toLowerCase();
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
        
        manualChunks: {
          'vendor-core': ['chart.js'],
          'vendor-utils': ['lodash-es', 'date-fns'],
          
          'feature-exam': [
            './js/pruefung.js'
          ],
          
          'feature-aufgaben': [
            './js/aufgaben-engine.js'
          ],
          
          'feature-progress': [
            './js/fortschritt.js'
          ],
          
          'feature-editor': [
            './js/word-editor.js',
            './js/excel-editor.js',
            './js/powerpoint-editor.js'
          ],
          
          'shared-ui': [
            './js/main.js',
            './js/performance-suite.js'
          ],
          
          'shared-styles': [
            './style.css',
            './css/aufgaben-engine.css',
            './css/fortschritt.css',
            './css/pruefung.css'
          ]
        },
        
        // Tree shaking optimization
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false
        }
      },
      
      // External dependencies (don't bundle)
      external: ['chart.js']
    },
    
    // Esbuild optimizations
    esbuild: {
      drop: ['console', 'debugger'],
      pure: ['console.log', 'console.info', 'console.debug'],
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true
    },
    
    // CSS optimization
    cssMinify: 'esbuild',
    
    // Module preloading
    modulePreload: {
      polyfill: true,
      resolveDependencies: (url, deps) => deps
    }
  },
  
  // Development server optimization
  server: {
    port: 3000,
    open: true,
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  
  // Preview server (production build testing)
  preview: {
    port: 4173,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  
  // Plugin configuration
  plugins: [
    // Bundle analyzer (only in production)
    process.env.NODE_ENV === 'production' && visualizer({
      filename: 'bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ].filter(Boolean),
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'chart.js',
      'lodash-es',
      'date-fns'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'js/components'),
      '@utils': resolve(__dirname, 'js/utils'),
      '@styles': resolve(__dirname, 'css')
    }
  },
  
  // Experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}`, css: `/${filename}` };
      }
      return { js: `/${filename}`, css: `/${filename}` };
    }
  }
});