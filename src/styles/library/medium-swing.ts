import type { DrumHit, StyleDefinition } from '../types'

// One-bar foundation: ride, hi-hat and feathered kick
const time: DrumHit[] = [
  [0, 'ride', 78],
  [1, 'ride', 88],
  [1.5, 'ride', 62],
  [2, 'ride', 78],
  [3, 'ride', 88],
  [3.5, 'ride', 62],
  [1, 'hhPedal', 75],
  [3, 'hhPedal', 75],
  [0, 'kick', 32],
  [1, 'kick', 30],
  [2, 'kick', 32],
  [3, 'kick', 30],
]

export const mediumSwing: StyleDefinition = {
  id: 'medium-swing',
  name: 'Medium Swing',
  family: 'jazz',
  swing: 0.66,
  tempo: { default: 140, min: 90, max: 220 },

  bass: { mode: 'walking', program: 32, range: [28, 55] },

  comp: {
    program: 0,
    voicing: 'rootless',
    velocity: [54, 72],
    anticipation: 0.2,
    rhythms: {
      '4': [
        [[0, 0.8], [1.5, 0.5]], // Charleston
        [[0, 0.8], [2.5, 0.6]],
        [[1.5, 0.5], [3, 0.6]],
        [[1, 0.5], [2.5, 0.8]],
        [[0, 2.5]],
        [[0.5, 0.5], [2, 0.5], [3.5, 0.3]],
      ],
      '3': [[[0, 0.8], [1.5, 0.5]], [[0, 1.6]]],
      '2': [[[0, 0.8]], [[0.5, 0.6]], [[0, 0.5], [1.5, 0.3]]],
      '1': [[[0, 0.6]]],
    },
  },

  drums: {
    kit: 32,
    countIn: [
      [0, 'sidestick', 95],
      [1, 'sidestick', 80],
      [2, 'sidestick', 80],
      [3, 'sidestick', 80],
    ],
    grooves: {
      middle: [
        { bars: 1, hits: [...time, [1.5, 'snare', 45, 0.15], [3.5, 'snare', 40, 0.15]] },
        { bars: 1, hits: [...time, [2.5, 'snare', 50, 0.3]] },
      ],
      first: [{ bars: 1, hits: [...time, [0, 'crash', 90, 0.6, 2], [0, 'kick', 80, 0.6]] }],
      last: [
        { bars: 1, hits: [...time, [3, 'snare', 70, 0.7], [3.5, 'snare', 82, 0.7]] },
        { bars: 1, hits: [...time, [2.5, 'snare', 60, 0.6], [3.5, 'kick', 75, 0.6]] },
      ],
    },
    ending: [
      [0, 'crash', 105, 1, 3],
      [0, 'kick', 95],
    ],
  },
}
