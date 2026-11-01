// Builds the sound bank the app downloads: only the presets OpenStand's styles
// can use, with samples compressed to Ogg Vorbis (SF3). Run with `npm run soundbank`.
// Requires ffmpeg with libvorbis on the PATH.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SoundBankLoader } from 'spessasynth_core'

const SOURCE = 'soundbank-src/GeneralUser-GS.sf2'
const TARGET = 'public/soundfonts/openstand.sf3'
const QUALITY = process.env.VORBIS_QUALITY ?? '5'

// General MIDI programs a style may use (bank 0), and GS drum kits (bank 128)
const PROGRAMS = new Set([
  ...range(0, 7), // pianos, electric pianos, harpsichord, clavinet
  11, // vibraphone
  ...range(16, 19), // organs
  21, // accordion
  ...range(24, 31), // guitars
  ...range(32, 39), // basses
  48, 49, 52, // strings, choir
  56, 61, 65, 66, // trumpet, brass section, alto and tenor sax
  89, // warm pad
])
const KITS = new Set([0, 8, 16, 24, 25, 32, 40, 48])

function range(a, b) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i)
}

const bank = SoundBankLoader.fromArrayBuffer(readFileSync(SOURCE).buffer)
for (const preset of [...bank.presets]) {
  const keep = preset.isGMGSDrum ? KITS.has(preset.program) : preset.bankMSB === 0 && PROGRAMS.has(preset.program)
  if (!keep) bank.deletePreset(preset)
}
bank.removeUnusedElements()
console.log(`${bank.presets.length} presets, ${bank.samples.length} samples`)

const work = mkdtempSync(join(tmpdir(), 'openstand-sf3-'))
let done = 0

// Encode one sample as Ogg Vorbis with ffmpeg
async function encode(data, sampleRate) {
  const raw = join(work, 'in.f32')
  const out = join(work, 'out.ogg')
  writeFileSync(raw, Buffer.from(data.buffer, data.byteOffset, data.byteLength))
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-f', 'f32le', '-ar', String(sampleRate), '-ac', '1', '-i', raw,
    '-c:a', 'libvorbis', '-q:a', QUALITY, out,
  ])
  if (++done % 50 === 0) console.log(`  ${done} samples encoded`)
  return new Uint8Array(readFileSync(out))
}

await bank.setSampleFormat({ format: 'compressed', compressionFunction: encode })
const binary = bank.writeSF2({ software: 'OpenStand' })
writeFileSync(TARGET, Buffer.from(binary))
rmSync(work, { recursive: true })
console.log(`${TARGET}: ${(binary.byteLength / 1024 / 1024).toFixed(1)} MB`)
