import { DRUM_NOTES } from '../styles/drums'
import type { DrumHit, DrumPart, Groove } from '../styles/types'
import { chance, humanize, pick, place, toTicks, type NoteEvent } from './events'
import type { Bar } from './timeline'

export const DRUM_CHANNEL = 9

function render(hits: DrumHit[], start: number, swing: number, from = 0, to = Infinity): NoteEvent[] {
  const out: NoteEvent[] = []
  for (const [at, drum, vel, p = 1, dur = 0.25] of hits) {
    if (at < from || at >= to || !chance(p)) continue
    out.push(
      humanize(
        {
          tick: toTicks(start + place(at - from, swing)),
          channel: DRUM_CHANNEL,
          note: DRUM_NOTES[drum],
          velocity: vel,
          duration: toTicks(dur),
        },
        5,
        5,
      ),
    )
  }
  return out
}

// Plays each bar by its position in the form: first bar, middle bars (two-bar grooves), last bar
export function generateDrums(bars: Bar[], part: DrumPart, swing: number, countIn: number): NoteEvent[] {
  const events = render(part.countIn, 0, swing, 0, countIn)
  let groove: Groove = pick(part.grooves.middle)
  let grooveBar = 0

  for (const bar of bars) {
    if (bar.measure === -1) {
      events.push(...render(part.ending, bar.start, swing))
      continue
    }

    let current: Groove
    let barIndex: number
    if (bar.isLast && part.grooves.last) {
      current = pick(part.grooves.last)
      barIndex = 0
      grooveBar = 0
    } else if (bar.isFirst && part.grooves.first) {
      current = pick(part.grooves.first)
      barIndex = 0
      grooveBar = 0
    } else {
      // A new groove is picked only at the start of a pattern so two-bar figures stay intact
      if (grooveBar === 0) groove = pick(part.grooves.middle)
      current = groove
      barIndex = grooveBar
      grooveBar = (grooveBar + 1) % groove.bars
    }

    // Each groove bar has the groove's own length; a shorter bar plays the start of it
    const unit = current.beats ?? 4
    const from = barIndex * unit
    events.push(...render(current.hits, bar.start, swing, from, from + Math.min(unit, bar.beats)))
  }

  return events
}
