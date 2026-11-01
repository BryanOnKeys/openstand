// Share links: the whole chart travels in the URL fragment, compressed.
// No server is involved, and the fragment is never sent to one.

import type { Chart } from '../music/chart'

const PARAM = 'tune'

function toBase64Url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const s = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

async function pipe(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

export async function encodeChart(chart: Chart): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(chart))
  return toBase64Url(await pipe(json, new CompressionStream('deflate-raw')))
}

export async function decodeChart(value: string): Promise<Chart | null> {
  try {
    const json = await pipe(fromBase64Url(value), new DecompressionStream('deflate-raw'))
    const chart = JSON.parse(new TextDecoder().decode(json)) as Chart
    return chart.format === 'openstand-chart' && Array.isArray(chart.bars) ? chart : null
  } catch {
    return null
  }
}

export async function shareUrl(chart: Chart): Promise<string> {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = `${PARAM}=${await encodeChart(chart)}`
  return url.toString()
}

export async function chartFromHash(hash: string): Promise<Chart | null> {
  const value = new URLSearchParams(hash.replace(/^#/, '')).get(PARAM)
  return value ? decodeChart(value) : null
}
