import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(dir, '..', 'public')
const src = path.join(pub, 'icon-source.svg')

const targets = [
  { file: 'pwa-192.png', size: 192 },
  { file: 'pwa-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const t of targets) {
  await sharp(src, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(path.join(pub, t.file))
  console.log('wrote', t.file)
}
