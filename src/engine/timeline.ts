import { parseChord, transposeChord, type Chord } from '../music/chords'
import type { Song } from '../music/songs'

export const BEATS_PER_MEASURE = 4
export const COUNT_IN_BEATS = 4

// One chord span on the timeline, in beats
export interface Slot {
  chord: Chord
  start: number
  beats: number
  measure: number // measure index in the chart; -1 for the final chord
  chorus: number
}

// One bar of the form; drum grooves are chosen per bar
export interface Bar {
  start: number
  measure: number // -1 for the ending bar
  isFirst: boolean
  isLast: boolean
}

export interface Timeline {
  slots: Slot[]
  bars: Bar[]
  totalBeats: number
}

// How beats are split by the number of chords in a measure
function splitBeats(count: number): number[] {
  if (count <= 1) return [4]
  if (count === 2) return [2, 2]
  if (count === 3) return [2, 1, 1]
  return [1, 1, 1, 1]
}

export function buildTimeline(song: Song, transpose: number, choruses: number): Timeline {
  const form = song.measures.map((m) =>
    m.map((sym) => {
      const chord = parseChord(sym)
      if (!chord) throw new Error(`Could not parse chord: ${sym}`)
      return transposeChord(chord, transpose)
    }),
  )

  const slots: Slot[] = []
  const bars: Bar[] = []
  let beat = COUNT_IN_BEATS
  for (let chorus = 0; chorus < choruses; chorus++) {
    form.forEach((chords, measure) => {
      bars.push({ start: beat, measure, isFirst: measure === 0, isLast: measure === form.length - 1 })
      const lengths = splitBeats(chords.length)
      chords.forEach((chord, i) => {
        slots.push({
          chord,
          start: beat,
          beats: lengths[i],
          measure,
          chorus,
        })
        beat += lengths[i]
      })
    })
  }

  // Ending: resolve to the first chord of the form (usually the tonic) and hold
  bars.push({ start: beat, measure: -1, isFirst: false, isLast: false })
  slots.push({
    chord: form[0][0],
    start: beat,
    beats: BEATS_PER_MEASURE,
    measure: -1,
    chorus: choruses,
  })
  beat += BEATS_PER_MEASURE

  return { slots, bars, totalBeats: beat }
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
