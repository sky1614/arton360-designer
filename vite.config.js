import path from "path";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    react()

    // === COPY VERCEL.JSON INTO DIST AFTER BUILD ===
    // {
    //   name: 'copy-vercel-json',
    //   closeBundle() {
    //     try {
    //       copyFileSync('vercel.json', 'dist/vercel.json')
    //       console.log('✔ vercel.json copied into dist/')
    //     } catch (e) {
    //       console.error('❌ Failed to copy vercel.json:', e)
    //     }
    //   }
    // }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },


  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: '/index.html',
      output: {
        entryFileNames: 'assets/index.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/index.css'
          }
          return 'assets/[name][extname]'
        },
        chunkFileNames: 'assets/index.[name].js'
      }
    }
  }
})
