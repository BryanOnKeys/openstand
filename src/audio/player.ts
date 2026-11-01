import { MIDIControllers } from 'spessasynth_core'
import { Sequencer, WorkletSynthesizer } from 'spessasynth_lib'
import processorUrl from 'spessasynth_lib/dist/spessasynth_processor.min.js?url'

const SOUNDFONT_URL = '/soundfonts/openstand.sf3'

async function fetchWithProgress(url: string, onProgress: (ratio: number) => void): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(`Could not download the sound bank (${res.status})`)
  const total = Number(res.headers.get('content-length')) || 0
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    if (total) onProgress(loaded / total)
  }
  const out = new Uint8Array(loaded)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out.buffer
}

// Thin layer over SpessaSynth: sound bank loading, MIDI playback, mixer
export class Player {
  private ctx: AudioContext
  private synth: WorkletSynthesizer | null = null
  private seq: Sequencer | null = null
  private volumes = new Map<number, number>()
  onEnded: () => void = () => {}

  constructor() {
    this.ctx = new AudioContext({ sampleRate: 44100 })
    // On iPhone, Web Audio is silenced by the ring/silent switch unless the session is "playback"
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'playback'
  }

  async init(onProgress: (ratio: number) => void): Promise<void> {
    const [soundfont] = await Promise.all([
      fetchWithProgress(SOUNDFONT_URL, onProgress),
      this.ctx.audioWorklet.addModule(processorUrl),
    ])
    const synth = new WorkletSynthesizer(this.ctx)
    synth.connect(this.ctx.destination)
    await synth.soundBankManager.addSoundBank(soundfont, 'main')
    await synth.isReady

    const seq = new Sequencer(synth, { skipToFirstNoteOn: false })
    seq.loopCount = 0
    seq.eventHandler.addEvent('songEnded', 'player', () => this.onEnded())

    this.synth = synth
    this.seq = seq
  }

  // Loads the MIDI and starts playing from the given time (seconds of MIDI time)
  async play(midi: Uint8Array, fromSeconds = 0): Promise<void> {
    const seq = this.requireSeq()
    await this.ctx.resume()
    const loaded = new Promise<void>((resolve) => {
      seq.eventHandler.addEvent('songChange', 'player-load', () => resolve())
    })
    seq.loadNewSongList([{ binary: midi.slice().buffer, fileName: 'arrangement.mid' }])
    await loaded
    seq.eventHandler.removeEvent('songChange', 'player-load')
    this.applyVolumes()
    if (fromSeconds > 0) seq.currentTime = fromSeconds
    seq.play()
  }

  stop(): void {
    if (!this.seq || !this.synth) return
    this.seq.pause()
    this.seq.currentTime = 0
    this.synth.stopAll(true)
  }

  async dispose(): Promise<void> {
    this.stop()
    await this.ctx.close()
  }

  get isPlaying(): boolean {
    return !!this.seq && !this.seq.paused && !this.seq.isFinished
  }

  // Position inside the playing MIDI (seconds at the base tempo)
  get position(): number {
    return this.seq?.currentTime ?? 0
  }

  setRate(rate: number): void {
    if (this.seq) this.seq.playbackRate = rate
  }

  setVolume(channel: number, volume: number): void {
    this.volumes.set(channel, volume)
    this.applyVolume(channel, volume)
  }

  private applyVolumes(): void {
    this.volumes.forEach((v, ch) => this.applyVolume(ch, v))
  }

  // Locks the volume so controllers in the MIDI file cannot override the mixer
  private applyVolume(channel: number, volume: number): void {
    const midiChannel = this.synth?.midiChannels[channel]
    if (!this.synth || !midiChannel) return
    midiChannel.lockController(MIDIControllers.mainVolume, false)
    this.synth.controllerChange(channel, MIDIControllers.mainVolume, Math.round(volume))
    midiChannel.lockController(MIDIControllers.mainVolume, true)
  }

  private requireSeq(): Sequencer {
    if (!this.seq) throw new Error('Player is not ready yet')
    return this.seq
  }
}
