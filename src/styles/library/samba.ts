import type { DrumHit, StyleDefinition } from '../types'

// A 4/4 bar holds two samba bars of 2/4. The surdo answers on beats 2 and 4.

// Shaker sixteenths, accented on the last sixteenth of each beat
function shaker(offset: number): DrumHit[] {
  return Array.from({ length: 16 }, (_, i): DrumHit => [offset + i / 4, 'shaker', i % 4 === 3 ? 66 : i % 4 === 0 ? 48 : 34])
}

// Bass drum as surdo: soft on 1, "a" pickup, strong on 2
function surdo(offset: number): DrumHit[] {
  return [
    [offset, 'kick', 58],
    [offset + 0.75, 'kick', 44],
    [offset + 1, 'kick', 82],
    [offset + 2, 'kick', 58],
    [offset + 2.75, 'kick', 44],
    [offset + 3, 'kick', 82],
  ]
}

// Tamborim-style syncopation on the cross-stick, over two bars
const teleco: DrumHit[] = [0, 0.5, 1, 1.25, 1.75, 2.25, 2.5, 3, 3.5, 4, 4.5, 5.25, 5.75, 6.25, 6.75, 7.5].map(
  (at): DrumHit => [at, 'sidestick', 64],
)

export const samba: StyleDefinition = {
  id: 'samba',
  name: 'Samba',
  family: 'latin',
  swing: 0.5,
  tempo: { default: 120, min: 90, max: 160 },

  bass: {
    mode: 'pattern',
    program: 32,
    range: [28, 52],
    patterns: {
      '4': [
        [
          { at: 0, dur: 0.7, tone: 'R', vel: 92 },
          { at: 0.75, dur: 0.2, tone: '5-', vel: 78 },
          { at: 1, dur: 0.9, tone: '5-', vel: 98 },
          { at: 2, dur: 0.7, tone: 'R', vel: 92 },
          { at: 2.75, dur: 0.2, tone: '5-', vel: 78 },
          { at: 3, dur: 0.9, tone: '5-', vel: 98 },
        ],
        [
          { at: 0, dur: 0.7, tone: 'R', vel: 92 },
          { at: 0.75, dur: 0.2, tone: '5-', vel: 78 },
          { at: 1, dur: 0.9, tone: '5-', vel: 98 },
          { at: 2, dur: 0.7, tone: 'R', vel: 92 },
          { at: 2.75, dur: 0.2, tone: '5', vel: 78 },
          { at: 3, dur: 0.7, tone: '5-', vel: 96 },
          { at: 3.75, dur: 0.2, tone: 'app', vel: 80 },
        ],
      ],
      '2': [
        [
          { at: 0, dur: 0.7, tone: 'R', vel: 92 },
          { at: 0.75, dur: 0.2, tone: '5-', vel: 78 },
          { at: 1, dur: 0.9, tone: '5-', vel: 98 },
        ],
        [
          { at: 0, dur: 0.7, tone: 'R', vel: 92 },
          { at: 1, dur: 0.7, tone: '5-', vel: 96 },
          { at: 1.75, dur: 0.2, tone: 'app', vel: 80 },
        ],
      ],
      '1': [
        [
          { at: 0, dur: 0.7, tone: 'R', vel: 92 },
          { at: 0.75, dur: 0.2, tone: '5-', vel: 78 },
        ],
      ],
    },
  },

  comp: {
    program: 24, // nylon-string guitar
    voicing: 'rootless',
    velocity: [48, 64],
    anticipation: 0.3,
    rhythms: {
      // Syncopated guitar figures on the sixteenths
      '4': [
        [[0, 0.2], [0.75, 0.2], [1.5, 0.3], [2.25, 0.2], [3, 0.2], [3.5, 0.3]],
        [[0.5, 0.2], [1, 0.2], [1.75, 0.3], [2.5, 0.2], [3.25, 0.2], [3.75, 0.2]],
        [[0, 0.2], [0.5, 0.2], [1.25, 0.2], [2, 0.2], [2.75, 0.2], [3.5, 0.3]],
      ],
      '2': [[[0, 0.2], [0.75, 0.2], [1.5, 0.3]], [[0.5, 0.2], [1, 0.2], [1.75, 0.2]]],
      '1': [[[0, 0.2], [0.75, 0.2]]],
    },
  },

  drums: {
    kit: 0,
    countIn: [
      [0, 'sidestick', 85],
      [1, 'sidestick', 70],
      [2, 'sidestick', 70],
      [3, 'sidestick', 70],
    ],
    grooves: {
      middle: [{ bars: 2, hits: [...shaker(0), ...shaker(4), ...surdo(0), ...surdo(4), ...teleco] }],
      first: [{ bars: 1, hits: [...shaker(0), ...surdo(0), ...teleco.slice(0, 9), [0, 'crash', 90, 1, 2]] }],
      last: [
        {
          bars: 1,
          hits: [
            ...shaker(0),
            ...surdo(0).slice(0, 3),
            [2, 'snare', 72],
            [2.5, 'snare', 76],
            [2.75, 'snare', 70],
            [3, 'tomHigh', 84],
            [3.25, 'tomMid', 84],
            [3.5, 'tomLow', 90],
            [3.75, 'tomLow', 94],
          ],
        },
      ],
    },
    ending: [
      [0, 'kick', 90],
      [0, 'crash', 96, 1, 3],
      [0, 'shaker', 50],
    ],
  },
}
