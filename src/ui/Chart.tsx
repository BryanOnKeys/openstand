import { useMemo, type CSSProperties } from 'react'
import { keyPrefersFlats, noteName, parseChord, transposeChord } from '../music/chords'
import type { Song } from '../music/songs'
import type { StyleDefinition } from '../styles/types'
import { ChordSymbol } from './ChordSymbol'

const BARS_PER_ROW = 4

interface ChartProps {
  song: Song
  style: StyleDefinition
  transpose: number
  bpm: number
  activeMeasure: number | null
  beatInBar: number
}

export function Chart({ song, style, transpose, bpm, activeMeasure, beatInBar }: ChartProps) {
  const keyPc = (song.key + transpose + 12) % 12
  const flats = keyPrefersFlats(keyPc)

  const measures = useMemo(
    () => song.measures.map((m) => m.map((sym) => parseChord(sym)).map((c) => (c ? transposeChord(c, transpose) : null))),
    [song, transpose],
  )

  return (
    <article className="sheet" aria-label={`${song.title} chord chart`}>
      <header className="sheet-head">
        <span className="sheet-meta">{style.name}</span>
        <h1 className="sheet-title">{song.title}</h1>
        <span className="sheet-meta sheet-meta-right">
          Key of {noteName(keyPc, flats).replace('b', '♭').replace('#', '♯')} · {bpm} bpm
        </span>
      </header>

      <div className="bars">
        {measures.map((chords, i) => {
          const active = activeMeasure === i
          const classes = ['bar']
          if (i % BARS_PER_ROW === 0) classes.push('bar-row-start')
          if (i === measures.length - 1) classes.push('bar-final')
          if (active) classes.push('bar-active')
          return (
            <div key={i} className={classes.join(' ')} style={{ '--chords': chords.length } as CSSProperties}>
              {i % BARS_PER_ROW === 0 && <span className="bar-number">{i + 1}</span>}
              {chords.map((chord, j) =>
                chord ? <ChordSymbol key={j} chord={chord} keyPc={keyPc} /> : <span key={j}>?</span>,
              )}
              {active && <span className="bar-progress" style={{ transform: `scaleX(${beatInBar / 4})` }} />}
            </div>
          )
        })}
      </div>
    </article>
  )
}
