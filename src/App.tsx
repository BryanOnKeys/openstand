import { useCallback, useEffect, useRef, useState } from 'react'
import { Player } from './audio/player'
import { arrange, BASE_BPM, CHANNELS, type Part } from './engine/arrange'
import { COUNT_IN_BEATS, type Timeline } from './engine/timeline'
import { SONGS } from './music/songs'
import { getStyle } from './styles'
import { Chart } from './ui/Chart'
import { Library } from './ui/Library'
import { Mixer } from './ui/Mixer'
import { Transport, type Readiness } from './ui/Transport'

interface Position {
  measure: number // -1 during the count-in and the ending
  chorus: number
  beatInBar: number
  countIn: number // 1-4 during the count-in, otherwise 0
  ending: boolean
}

interface ArrangeOptions {
  styleId: string
  transpose: number
  choruses: number
}

const BPM_RANGE: [number, number] = [40, 300]

// Keeps the transposition within -5..+6 so the band's register doesn't drift
const offsetToKey = (from: number, to: number) => ((to - from + 17) % 12) - 5

// The comp instrument is named after the style's General MIDI program
const compLabel = (program: number) => (program >= 24 && program <= 31 ? 'Guitar' : 'Piano')

function positionAt(timeline: Timeline, beat: number): Position | null {
  if (beat < COUNT_IN_BEATS) {
    return { measure: -1, chorus: 0, beatInBar: beat, countIn: Math.floor(beat) + 1, ending: false }
  }
  const bar = timeline.bars.findLast((b) => b.start <= beat)
  if (!bar) return null
  const chorus = timeline.slots.findLast((s) => s.start <= beat)?.chorus ?? 0
  return { measure: bar.measure, chorus, beatInBar: beat - bar.start, countIn: 0, ending: bar.measure === -1 }
}

export default function App() {
  const playerRef = useRef<Player | null>(null)
  const timelineRef = useRef<Timeline | null>(null)

  const [readiness, setReadiness] = useState<Readiness>({ kind: 'loading', progress: 0 })
  const [songId, setSongId] = useState(SONGS[0].id)
  const [styleId, setStyleId] = useState(SONGS[0].style)
  const [transpose, setTranspose] = useState(0)
  const [bpm, setBpm] = useState(SONGS[0].bpm)
  const [choruses, setChoruses] = useState(3)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [volumes, setVolumes] = useState<Record<Part, number>>({ bass: 110, comp: 85, drums: 95 })
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [muted, setMuted] = useState<Record<Part, boolean>>({ bass: false, comp: false, drums: false })

  const song = SONGS.find((s) => s.id === songId) ?? SONGS[0]
  const style = getStyle(styleId)
  const keyPc = (song.key + transpose + 12) % 12

  useEffect(() => {
    // The effect may run twice (StrictMode); a discarded player must not update the UI
    let active = true
    const player = new Player()
    playerRef.current = player
    player.onEnded = () => {
      setPlaying(false)
      setPosition(null)
    }
    player
      .init((progress) => active && setReadiness({ kind: 'loading', progress }))
      .then(() => active && setReadiness({ kind: 'ready' }))
      .catch((err: unknown) => active && setReadiness({ kind: 'error', message: String(err) }))
    return () => {
      active = false
      void player.dispose()
    }
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!player || readiness.kind !== 'ready') return
    for (const part of Object.keys(CHANNELS) as Part[]) {
      player.setVolume(CHANNELS[part], muted[part] ? 0 : volumes[part])
    }
  }, [volumes, muted, readiness.kind])

  // Tempo changes only the playback rate; the arrangement is not regenerated
  useEffect(() => {
    playerRef.current?.setRate(bpm / BASE_BPM)
  }, [bpm])

  const start = async (opts: ArrangeOptions, fromSeconds = 0) => {
    const player = playerRef.current
    if (!player) return
    const { midi, timeline } = arrange(song, getStyle(opts.styleId), opts.transpose, opts.choruses)
    timelineRef.current = timeline
    await player.play(midi, fromSeconds)
    player.setRate(bpm / BASE_BPM)
    setPlaying(true)
  }

  const stop = useCallback(() => {
    playerRef.current?.stop()
    setPlaying(false)
    setPosition(null)
  }, [])

  // Changing style, key or choruses while playing continues from the same spot with a new arrangement
  const changeArrangement = (next: ArrangeOptions) => {
    setStyleId(next.styleId)
    setTranspose(next.transpose)
    setChoruses(next.choruses)
    const player = playerRef.current
    if (playing && player) void start(next, player.position)
  }

  const toggle = () => (playing ? stop() : void start({ styleId, transpose, choruses }))
  const toggleRef = useRef(toggle)
  useEffect(() => {
    toggleRef.current = toggle
  })

  // Space toggles playback unless a form control has focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.code !== 'Space' || target.closest('input, select, textarea, button')) return
      e.preventDefault()
      if (readiness.kind === 'ready') toggleRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [readiness.kind])

  // Follow the audio clock to highlight the current bar
  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = () => {
      const player = playerRef.current
      const timeline = timelineRef.current
      if (player && timeline) setPosition(positionAt(timeline, (player.position * BASE_BPM) / 60))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const selectSong = (id: string) => {
    stop()
    const next = SONGS.find((s) => s.id === id) ?? SONGS[0]
    setSongId(next.id)
    setStyleId(next.style)
    setTranspose(0)
    setBpm(next.bpm)
    setLibraryOpen(false)
  }

  const readout = (() => {
    if (!position) return `${song.measures.length} bars × ${choruses}`
    if (position.countIn) return `Count-in  ${position.countIn}`
    if (position.ending) return 'Ending'
    return `Chorus ${position.chorus + 1}/${choruses}  Bar ${position.measure + 1}`
  })()

  return (
    <div className="app">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="OpenStand home">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M6 4h20l-2 11H8z" />
            <path d="M5 15h22" />
            <path d="M16 15v12M16 27l-6 3M16 27l6 3" />
          </svg>
          OpenStand
        </a>
        <span className="topbar-tag">Practice with a band in your browser</span>
        <span className="topbar-spacer" />
        <button className="tunes-toggle" aria-expanded={libraryOpen} onClick={() => setLibraryOpen(!libraryOpen)}>
          Tunes
        </button>
        <a className="topbar-link" href="https://github.com/canbmaj7/openstand" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="topbar-link-text">GitHub</span>
        </a>
      </header>

      <div className={libraryOpen ? 'workspace library-open' : 'workspace'}>
        <Library songs={SONGS} selectedId={songId} onSelect={selectSong} />

        <main className="stage" onClick={() => setLibraryOpen(false)}>
          <Chart
            song={song}
            style={style}
            transpose={transpose}
            activeMeasure={position && position.measure >= 0 ? position.measure : null}
            beatInBar={position?.beatInBar ?? 0}
          />
        </main>
      </div>

      <Transport
        readiness={readiness}
        playing={playing}
        onToggle={toggle}
        position={readout}
        styleId={styleId}
        onStyle={(id) => {
          setBpm(getStyle(id).tempo.default)
          changeArrangement({ styleId: id, transpose, choruses })
        }}
        keyPc={keyPc}
        onKey={(pc) => changeArrangement({ styleId, transpose: offsetToKey(song.key, pc), choruses })}
        bpm={bpm}
        bpmRange={BPM_RANGE}
        onBpm={setBpm}
        choruses={choruses}
        onChoruses={(n) => changeArrangement({ styleId, transpose, choruses: n })}
      >
        <Mixer
          labels={{ bass: 'Bass', comp: compLabel(style.comp.program), drums: 'Drums' }}
          volumes={volumes}
          muted={muted}
          onVolume={(part, v) => setVolumes((all) => ({ ...all, [part]: v }))}
          onMute={(part) => setMuted((all) => ({ ...all, [part]: !all[part] }))}
        />
      </Transport>
    </div>
  )
}
