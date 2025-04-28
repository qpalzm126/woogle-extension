// import { fileURLToPath, URL } from 'node:url'

// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     },
//   },
// })

import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import dotenv from 'dotenv'

function resolve(p: string) {
  return path.resolve(__dirname, p)
}

export default ({ mode, command }: any) => {
  dotenv.config({ path: `.env.${mode}` })

  const isProd = mode === 'production'
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  }
  console.info(process.env)

  return defineConfig({
    envDir: './',
    build: {
      ssr: true,
      outDir: resolve('dist'),
      sourcemap: false,
      minify: false,
      lib: {
        entry: resolve('src/server.ts'),
        name: 'CrawlerServer',
        fileName: 'server',
      },
    },
  })
}
