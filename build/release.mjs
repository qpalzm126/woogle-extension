import path from 'path'
import fs from 'fs/promises'
import cp from 'child_process'
import pkg from '../package.json' assert { type: 'json' }

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const extensionName = `${pkg.name}`
const extensionDirName = `${pkg.name}-v${pkg.version}`
const distDir = path.resolve(__dirname, '../dist')
const releaseDir = path.resolve(__dirname, '../releases')
const releaseExtension = path.resolve(releaseDir, extensionDirName)
console.info(pkg.version)
console.info(releaseDir)

makeReleaseDir()
  .then(() => cloneExtension())
  .then(() => zipReleaseExpension())
  .then(() => removeReleaseExpension())

function makeReleaseDir() {
  return fs.mkdir(releaseDir, { recursive: true }).then(() => fs.mkdir(releaseExtension, { recursive: true }))
}

function cloneExtension() {
  return Promise.resolve()
    .then(() => fs.stat(releaseExtension).catch(() => {}))
    .then(() => fs.cp(distDir, releaseExtension, { recursive: true }))
    .then(() => {
      console.info('copy done.')
      return fs.readFile(path.resolve(releaseExtension, 'manifest.json'), 'utf-8').then((r) => {
        const manifest = JSON.parse(r)
        manifest.name = extensionName
        manifest.version = pkg.version
        return fs.writeFile(path.resolve(releaseExtension, 'manifest.json'), JSON.stringify(manifest, null, 2))
      })
    })
}

function removeReleaseExpension() {
  return fs.rm(releaseExtension, { recursive: true })
}

function zipReleaseExpension() {
  const zipName = `${extensionDirName}.zip`
  const cmds = [`cd ${releaseDir}`, `zip -r ${zipName} ${extensionDirName}`]
  return Promise.resolve()
    .then(() => {
      const zipPath = path.resolve(releaseDir, zipName)
      return fs
        .stat(zipPath)
        .then(() => fs.rm(zipPath, { recursive: true }))
        .catch(() => {})
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        cp.spawn(cmds.join(' && '), { shell: true, stdio: 'ignore' })
          .on('message', (msg) => console.info(`    > ${msg}`))
          .on('error', (err) => reject(err))
          .on('close', (code) => resolve())
      })
    })
}
