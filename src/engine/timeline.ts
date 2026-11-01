import { beatsPerBar, playbackOrder, type Chart, type TimeSignature } from '../music/chart'
import { parseChord, transposeChord, type Chord } from '../music/chords'

export const BEATS_PER_MEASURE = 4

// The count-in is one bar of a waltz or a 4/4 tune; other meters count four beats
export function countInBeats(chart: Chart): number {
  const beats = beatsPerBar(chart.time)
  return beats === 3 ? 3 : 4
}

// One chord span on the timeline, in beats
export interface Slot {
  chord: Chord
  start: number
  beats: number
  measure: number // bar index in the chart; -1 for the final chord
  chorus: number
}

// One bar as played; drum grooves are chosen per bar
export interface Bar {
  start: number
  beats: number
  measure: number // -1 for the ending bar
  isFirst: boolean
  isLast: boolean
}

export interface Timeline {
  slots: Slot[]
  bars: Bar[]
  totalBeats: number
  countIn: number // beats before the first bar
}

export function buildTimeline(chart: Chart, transpose: number, choruses: number): Timeline {
  const chords = new Map<string, Chord>()
  const toChord = (symbol: string): Chord => {
    let chord = chords.get(symbol)
    if (!chord) {
      const parsed = parseChord(symbol)
      if (!parsed) throw new Error(`Could not parse chord: ${symbol}`)
      chord = transposeChord(parsed, transpose)
      chords.set(symbol, chord)
    }
    return chord
  }

  // Time signature in force at each written bar
  let time: TimeSignature = chart.time
  const barBeats = chart.bars.map((bar) => {
    if (bar.time) time = bar.time
    return beatsPerBar(time)
  })

  const order = playbackOrder(chart)
  const slots: Slot[] = []
  const bars: Bar[] = []
  const countIn = countInBeats(chart)
  let beat = countIn

  for (let chorus = 0; chorus < choruses; chorus++) {
    // A blank bar keeps the chord that was sounding at the end of the previous one
    let held: Chord | null = null
    order.forEach((measure, n) => {
      const bar = chart.bars[measure]
      const beats = barBeats[measure]
      bars.push({ start: beat, beats, measure, isFirst: n === 0, isLast: n === order.length - 1 })

      if (bar.chords.length === 0) {
        if (held) slots.push({ chord: held, start: beat, beats, measure, chorus })
      } else {
        let at = beat
        for (const c of bar.chords) {
          held = c.symbol ? toChord(c.symbol) : null // N.C. leaves a gap
          if (held) slots.push({ chord: held, start: at, beats: c.beats, measure, chorus })
          at += c.beats
        }
      }
      beat += beats
    })
  }

  // Ending: resolve to the first chord of the tune (usually the tonic) and hold
  const first = chart.bars.flatMap((b) => b.chords).find((c) => c.symbol)?.symbol
  if (first) {
    bars.push({ start: beat, beats: BEATS_PER_MEASURE, measure: -1, isFirst: false, isLast: false })
    slots.push({ chord: toChord(first), start: beat, beats: BEATS_PER_MEASURE, measure: -1, chorus: choruses })
    beat += BEATS_PER_MEASURE
  }

  return { slots, bars, totalBeats: beat, countIn }
}

export function slotAtBeat(timeline: Timeline, beat: number): Slot | undefined {
  const { slots } = timeline
  let lo = 0
  let hi = slots.length - 1
  if (hi < 0 || beat < slots[0].start) return undefined
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (slots[mid].start <= beat) lo = mid
    else hi = mid - 1
  }
  return slots[lo]
}
