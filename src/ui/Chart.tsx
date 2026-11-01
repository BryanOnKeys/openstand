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
  activeMeasure: number | null
  beatInBar: number
}

const prettyKey = (name: string) => name.replace('b', '♭').replace('#', '♯')

export function Chart({ song, style, transpose, activeMeasure, beatInBar }: ChartProps) {
  const keyPc = (song.key + transpose + 12) % 12

  const measures = useMemo(
    () =>
      song.measures.map((m) =>
        m.map((symbol) => {
          const chord = parseChord(symbol)
          return { symbol, chord: chord ? transposeChord(chord, transpose) : null }
        }),
      ),
    [song, transpose],
  )

  return (
    <article className="sheet" aria-label={`${song.title} chord chart`}>
      <header className="sheet-head">
        <span className="sheet-meta">({style.name})</span>
        <h1 className="sheet-title">{song.title}</h1>
        <span className="sheet-meta sheet-meta-right">
          Key of {prettyKey(noteName(keyPc, keyPrefersFlats(keyPc)))}
        </span>
      </header>

      <div className="bars">
        {measures.map((chords, i) => {
          const classes = ['bar']
          if (i === 0) classes.push('bar-first')
          if (i === measures.length - 1) classes.push('bar-final')
          return (
            <div key={i} className={classes.join(' ')} style={{ '--chords': chords.length } as CSSProperties}>
              {i % BARS_PER_ROW === 0 && <span className="bar-number">{i + 1}</span>}
              {i === 0 && (
                <span className="timesig" aria-label="4/4 time">
                  <span>4</span>
                  <span>4</span>
                </span>
              )}
              {activeMeasure === i && (
                <span className="bar-highlight" style={{ transform: `scaleX(${Math.min(1, (beatInBar + 0.25) / 4)})` }} />
              )}
              {chords.map(({ symbol, chord }, j) =>
                chord ? (
                  <ChordSymbol key={j} chord={chord} keyPc={keyPc} />
                ) : (
                  <span key={j} className="chord chord-unknown" title="Unrecognized chord">
                    {symbol}
                  </span>
                ),
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}
