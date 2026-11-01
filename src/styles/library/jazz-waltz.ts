import type { DrumHit, StyleDefinition } from '../types'

// Jazz waltz in 3/4: ride on 1, 2 and the "and" of 2, hi-hat foot on 2 and 3
function time(offset: number): DrumHit[] {
  return [
    [offset, 'ride', 80],
    [offset + 1, 'ride', 86],
    [offset + 1.5, 'ride', 60],
    [offset + 2, 'ride', 74],
    [offset + 1, 'hhPedal', 62],
    [offset + 2, 'hhPedal', 70],
    [offset, 'kick', 36],
  ]
}

export const jazzWaltz: StyleDefinition = {
  id: 'jazz-waltz',
  name: 'Jazz Waltz',
  family: 'jazz',
  swing: 0.64,
  tempo: { default: 150, min: 90, max: 240 },

  bass: {
    mode: 'pattern',
    program: 32,
    range: [28, 55],
    patterns: {
      '3': [
        // Dotted half, the classic "one" feel
        [{ at: 0, dur: 2.8, tone: 'R' }],
        // Root and fifth
        [
          { at: 0, dur: 1.8, tone: 'R' },
          { at: 2, dur: 0.9, tone: '5' },
        ],
        // Walking in three toward the next chord
        [
          { at: 0, dur: 0.9, tone: 'R' },
          { at: 1, dur: 0.9, tone: '3' },
          { at: 2, dur: 0.9, tone: 'app' },
        ],
        [
          { at: 0, dur: 0.9, tone: 'R' },
          { at: 1, dur: 0.9, tone: '5' },
          { at: 2, dur: 0.9, tone: 'app' },
        ],
      ],
      '2': [
        [
          { at: 0, dur: 0.9, tone: 'R' },
          { at: 1, dur: 0.9, tone: 'app' },
        ],
        [{ at: 0, dur: 1.8, tone: 'R' }],
      ],
      '1': [[{ at: 0, dur: 0.9, tone: 'R' }]],
    },
  },

  comp: {
    program: 0,
    voicing: 'rootless',
    velocity: [52, 70],
    anticipation: 0.15,
    rhythms: {
      '3': [
        [[1, 0.5], [2, 0.5]], // on 2 and 3
        [[0, 0.8], [1.5, 0.5]],
        [[1.5, 0.5], [2.5, 0.4]],
        [[0, 2.5]],
        [[0.5, 0.5], [2, 0.6]],
      ],
      '2': [[[0, 0.8]], [[1, 0.5]], [[0.5, 0.5], [1.5, 0.4]]],
      '1': [[[0, 0.6]]],
    },
  },

  drums: {
    kit: 32,
    countIn: [
      [0, 'sidestick', 95],
      [1, 'sidestick', 80],
      [2, 'sidestick', 80],
    ],
    grooves: {
      middle: [
        { bars: 2, beats: 3, hits: [...time(0), ...time(3), [5.5, 'snare', 46, 0.3]] },
        { bars: 2, beats: 3, hits: [...time(0), ...time(3), [2.5, 'snare', 44, 0.3], [4, 'kick', 40, 0.4]] },
      ],
      first: [{ bars: 1, beats: 3, hits: [...time(0), [0, 'crash', 88, 0.6, 2], [0, 'kick', 78, 0.6]] }],
      last: [
        { bars: 1, beats: 3, hits: [...time(0), [1.5, 'snare', 62, 0.8], [2, 'snare', 72], [2.5, 'snare', 80]] },
        { bars: 1, beats: 3, hits: [...time(0), [2, 'snare', 66, 0.7], [2.5, 'kick', 70, 0.7]] },
      ],
    },
    ending: [
      [0, 'crash', 100, 1, 3],
      [0, 'kick', 90],
    ],
  },
}
