import vuePlugin from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import dotenv from 'dotenv'
import vuetify from 'vite-plugin-vuetify'
dotenv.config({ path: `.env` })

function resolve(p: string) {
  return path.resolve(__dirname, '../', p)
}

export default ({ command, mode }: { command: string; mode: string }) => {
  dotenv.config({ path: `.env.${mode}`, override: true })
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  }
  return defineConfig({
    server: {
      open: 'src/popup/popup.html',
    },
    // root: 'build/eval',
    plugins: [vuePlugin(), vuetify()],
    resolve: {
      alias: {
        '/src/*': resolve('src'),
      },
    },
    define: { 'process.env': process.env },
    build: {
      sourcemap: false,
      minify: false,
      rollupOptions: {
        output: {
          chunkFileNames: 'popup.[ext]',
          entryFileNames: 'popup.js',
          assetFileNames: `[name].[ext]`,
        },
      },
    },
  })
}
