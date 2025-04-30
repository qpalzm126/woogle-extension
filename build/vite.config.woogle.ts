import vuePlugin from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import dotenv from 'dotenv'
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
    plugins: [vuePlugin(), vuetify()],
    resolve: { alias: { '/src/*': path.resolve(__dirname, 'src') } },
    define: {
      'process.env': process.env,
    },
    build: {
      outDir: resolve('dist'),
      sourcemap: false,
      minify: false,
      emptyOutDir: false,
      lib: {
        entry: resolve(`src/content_scripts/woogle/index.ts`),
        name: 'woogle',
        fileName: 'woogle',
      },
      rollupOptions: {
        output: {
          entryFileNames: `content_scripts/woogle.js`,
          assetFileNames: `content_scripts/woogle.[ext]`,
        },
      },
    },
  })
}
