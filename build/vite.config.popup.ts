import path from 'path'
import vuePlugin from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'

function resolve(p: string) {
  return path.resolve(__dirname, '../', p)
}

export default defineConfig({
  publicDir: resolve('static'),
  root: resolve('src/popup'),
  plugins: [vuePlugin(), vuetify()],
  build: {
    outDir: resolve('dist'),
    sourcemap: false,
    minify: false,

    emptyOutDir: false,
    rollupOptions: {
      input: { app: resolve('src/popup/popup.html') },
      output: {
        chunkFileNames: 'popup.[ext]',
        entryFileNames: 'popup.js',
        assetFileNames: `[name].[ext]`,
      },
    },
  },
})
