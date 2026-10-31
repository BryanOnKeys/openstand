import { closeVoicingTones, rootlessVoicings, type Chord } from '../music/chords'
import type { CompHit, CompPart } from '../styles/types'
import { chance, humanize, pick, place, rand, toTicks, type NoteEvent } from './events'
import type { Slot } from './timeline'

const CHANNEL = 1
const LOWEST = 48 // lowest allowed bottom note of a voicing
const HIGHEST_BOTTOM = 62 // highest allowed bottom note of a voicing

// Voicing candidates as intervals above the root (A/B forms or inversions)
function voicingForms(chord: Chord, kind: CompPart['voicing']): number[][] {
  if (kind === 'rootless') return rootlessVoicings(chord)
  const tones = closeVoicingTones(chord)
  return tones.map((_, r) => [...tones.slice(r), ...tones.slice(0, r).map((t) => t + 12)])
}

// Pick the form and octave closest to the previous voicing (voice leading)
function chooseVoicing(chord: Chord, kind: CompPart['voicing'], prevCenter: number): number[] {
  let best: number[] = []
  let bestScore = Infinity
  for (const form of voicingForms(chord, kind)) {
    for (let octave = 2; octave <= 6; octave++) {
      const notes = form.map((i) => chord.root + i + octave * 12)
      if (notes[0] < LOWEST || notes[0] > HIGHEST_BOTTOM) continue
      const center = notes.reduce((a, b) => a + b, 0) / notes.length
      const score = Math.abs(center - prevCenter) + rand(0, 1.5)
      if (score < bestScore) {
        bestScore = score
        best = notes
      }
    }
  }
  return best
}

export function generateComp(slots: Slot[], part: CompPart, swing: number): NoteEvent[] {
  const events: NoteEvent[] = []
  let prevCenter = 62

  slots.forEach((slot) => {
    const voicing = chooseVoicing(slot.chord, part.voicing, prevCenter)
    prevCenter = voicing.reduce((a, b) => a + b, 0) / voicing.length

    if (slot.measure === -1) {
      // Final chord: one long hit with the root in the left hand
      const notes = [slot.chord.root + 36, ...voicing]
      for (const note of notes) {
        events.push({ tick: toTicks(slot.start), channel: CHANNEL, note, velocity: part.velocity[1], duration: toTicks(3.5) })
      }
      return
    }

    const options = part.rhythms[String(slot.beats) as '1' | '2' | '3' | '4'] ?? part.rhythms['1'] ?? [[[0, 0.6]]]
    const hits: CompHit[] = pick(options).map(([at, dur, vel]): CompHit => [at, dur, vel])

    // Sometimes anticipate the chord by an eighth
    if (hits[0][0] === 0 && slot.start > 4 && chance(part.anticipation ?? 0)) {
      hits[0] = [-0.5, hits[0][1] + (1 - swing), hits[0][2]]
    }

    for (const [at, duration, vel] of hits) {
      const velocity = vel ?? rand(part.velocity[0], part.velocity[1])
      for (const note of voicing) {
        events.push(
          humanize(
            {
              tick: toTicks(slot.start + place(at, swing)),
              channel: CHANNEL,
              note,
              velocity,
              duration: toTicks(duration),
            },
            6,
            4,
          ),
        )
      }
    }
  })

  return events
}
