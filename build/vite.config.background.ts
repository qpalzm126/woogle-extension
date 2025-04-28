import path from 'path'
import { defineConfig, loadEnv } from 'vite'
// import { injectEnvVariables } from 'core-web/vite-plugins'
import manifest from '../static/manifest.json'
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
    publicDir: 'static',
    resolve: { alias: { '/src/*': path.resolve(__dirname, 'src') } },
    plugins: [
      // injectEnvVariables({
      //   version: manifest.version,
      // }),
    ],
    build: {
      ssr: true,
      outDir: resolve('dist'),
      sourcemap: false,
      minify: false,
      emptyOutDir: false,
      lib: {
        entry: resolve('src/background/index.ts'),
        name: 'background',
        fileName: 'background',
      },
      rollupOptions: {
        output: {
          entryFileNames: (info) => {
            return 'background.js'
          },
        },
      },
    },
  })
}
