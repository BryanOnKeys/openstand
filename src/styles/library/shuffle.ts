import type { DrumHit, StyleDefinition } from '../types'

// Triplet shuffle: hi-hat "ding-da" on every beat (the "and" is swung by the engine)
function hats(offset: number): DrumHit[] {
  return Array.from({ length: 8 }, (_, i): DrumHit => [offset + i / 2, 'hhClosed', i % 2 === 0 ? 82 : 54])
}

function backbeat(offset: number): DrumHit[] {
  return [
    [offset + 1, 'snare', 100],
    [offset + 3, 'snare', 100],
    [offset + 2.5, 'snare', 30, 0.3],
  ]
}

export const shuffle: StyleDefinition = {
  id: 'shuffle',
  name: 'Shuffle',
  family: 'pop',
  swing: 0.67,
  tempo: { default: 120, min: 70, max: 170 },

  bass: {
    mode: 'pattern',
    program: 33, // fingered electric bass
    range: [28, 52],
    patterns: {
      '4': [
        // Boogie line up and back
        [
          { at: 0, dur: 0.8, tone: 'R', vel: 100 },
          { at: 1, dur: 0.8, tone: '3', vel: 88 },
          { at: 2, dur: 0.8, tone: '5', vel: 94 },
          { at: 3, dur: 0.8, tone: '6', vel: 88 },
        ],
        [
          { at: 0, dur: 0.8, tone: 'R', vel: 100 },
          { at: 1, dur: 0.8, tone: '5', vel: 88 },
          { at: 2, dur: 0.8, tone: '6', vel: 94 },
          { at: 3, dur: 0.8, tone: '5', vel: 88 },
        ],
        // Swung root pickups
        [
          { at: 0, dur: 0.6, tone: 'R', vel: 100 },
          { at: 0.5, dur: 0.3, tone: 'R', vel: 72 },
          { at: 1, dur: 0.6, tone: '3', vel: 88 },
          { at: 2, dur: 0.6, tone: '5', vel: 94 },
          { at: 2.5, dur: 0.3, tone: '5', vel: 72 },
          { at: 3, dur: 0.8, tone: 'app', vel: 88 },
        ],
      ],
      '2': [
        [
          { at: 0, dur: 0.8, tone: 'R', vel: 100 },
          { at: 1, dur: 0.8, tone: '5', vel: 88 },
        ],
        [
          { at: 0, dur: 0.8, tone: 'R', vel: 100 },
          { at: 1, dur: 0.8, tone: 'app', vel: 88 },
        ],
      ],
      '1': [[{ at: 0, dur: 0.8, tone: 'R' }]],
    },
  },

  comp: {
    program: 0,
    voicing: 'close',
    velocity: [62, 80],
    anticipation: 0.2,
    rhythms: {
      '4': [
        [[1, 0.3], [1.5, 0.3], [3, 0.3], [3.5, 0.3]],
        [[0, 0.8], [1.5, 0.3], [3, 0.5]],
        [[1, 0.4], [3, 0.4]],
        [[0.5, 0.3], [1.5, 0.3], [2.5, 0.3], [3.5, 0.3]],
      ],
      '2': [[[1, 0.3], [1.5, 0.3]], [[0, 0.8], [1.5, 0.3]]],
      '1': [[[0, 0.4]]],
    },
  },

  drums: {
    kit: 0,
    countIn: [
      [0, 'hhClosed', 90],
      [1, 'hhClosed', 80],
      [2, 'hhClosed', 80],
      [3, 'hhClosed', 80],
    ],
    grooves: {
      middle: [
        {
          bars: 2,
          hits: [
            ...hats(0),
            ...hats(4),
            ...backbeat(0),
            ...backbeat(4),
            [0, 'kick', 100],
            [2, 'kick', 92],
            [2.5, 'kick', 70, 0.4],
            [4, 'kick', 100],
            [6, 'kick', 92],
            [7.5, 'kick', 72, 0.4],
          ],
        },
      ],
      first: [{ bars: 1, hits: [...hats(0).slice(1), ...backbeat(0), [0, 'crash', 100, 1, 2], [0, 'kick', 104], [2, 'kick', 92]] }],
      last: [
        {
          bars: 1,
          hits: [
            ...hats(0).slice(0, 6),
            ...backbeat(0).slice(0, 1),
            [0, 'kick', 100],
            [2, 'kick', 92],
            // Triplet fill on beat 4 (exact thirds are not moved by the swing)
            [3, 'snare', 88],
            [3 + 1 / 3, 'tomMid', 90],
            [3 + 2 / 3, 'tomLow', 96],
          ],
        },
      ],
    },
    ending: [
      [0, 'crash', 108, 1, 3],
      [0, 'kick', 106],
      [0, 'snare', 96],
    ],
  },
}
