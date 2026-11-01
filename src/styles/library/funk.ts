import type { DrumHit, StyleDefinition } from '../types'

// Straight sixteenths: hi-hat eighths with ghosted sixteenths in between
function hats(offset: number): DrumHit[] {
  const out: DrumHit[] = []
  for (let i = 0; i < 16; i++) {
    const at = offset + i / 4
    if (i % 2 === 0) out.push([at, 'hhClosed', i % 4 === 0 ? 78 : 58])
    else out.push([at, 'hhClosed', 34, 0.45])
  }
  return out
}

// Backbeat with ghost notes on the snare
function snare(offset: number): DrumHit[] {
  return [
    [offset + 1, 'snare', 104],
    [offset + 3, 'snare', 104],
    [offset + 1.75, 'snare', 30, 0.5],
    [offset + 2.25, 'snare', 28, 0.4],
    [offset + 3.75, 'snare', 32, 0.5],
  ]
}

export const funk: StyleDefinition = {
  id: 'funk',
  name: 'Funk',
  family: 'funk',
  swing: 0.5,
  tempo: { default: 100, min: 75, max: 125 },

  bass: {
    mode: 'pattern',
    program: 33, // fingered electric bass
    range: [28, 52],
    patterns: {
      '4': [
        [
          { at: 0, dur: 0.4, tone: 'R', vel: 104 },
          { at: 0.75, dur: 0.2, tone: '8', vel: 84 },
          { at: 1.5, dur: 0.3, tone: 'R', vel: 92 },
          { at: 2.5, dur: 0.2, tone: '7', vel: 86 },
          { at: 2.75, dur: 0.2, tone: '8', vel: 90 },
          { at: 3.5, dur: 0.3, tone: 'app', vel: 88 },
        ],
        [
          { at: 0, dur: 0.6, tone: 'R', vel: 104 },
          { at: 0.75, dur: 0.2, tone: 'R', vel: 80 },
          { at: 1, dur: 0.2, tone: '8', vel: 90 },
          { at: 2, dur: 0.4, tone: 'R', vel: 96 },
          { at: 2.75, dur: 0.2, tone: '7', vel: 84 },
          { at: 3.25, dur: 0.2, tone: '5', vel: 86 },
          { at: 3.75, dur: 0.2, tone: 'app', vel: 84 },
        ],
        [
          { at: 0, dur: 0.3, tone: 'R', vel: 104 },
          { at: 0.5, dur: 0.2, tone: 'R', vel: 82 },
          { at: 1.5, dur: 0.3, tone: '5-', vel: 90 },
          { at: 2.5, dur: 0.2, tone: 'R', vel: 92 },
          { at: 2.75, dur: 0.2, tone: '8', vel: 86 },
          { at: 3.5, dur: 0.3, tone: '7', vel: 84 },
        ],
      ],
      '2': [
        [
          { at: 0, dur: 0.4, tone: 'R', vel: 104 },
          { at: 0.75, dur: 0.2, tone: '8', vel: 84 },
          { at: 1.5, dur: 0.3, tone: 'app', vel: 88 },
        ],
        [
          { at: 0, dur: 0.4, tone: 'R', vel: 102 },
          { at: 1, dur: 0.3, tone: '5', vel: 88 },
          { at: 1.75, dur: 0.2, tone: 'app', vel: 84 },
        ],
      ],
      '1': [
        [
          { at: 0, dur: 0.4, tone: 'R', vel: 100 },
          { at: 0.75, dur: 0.2, tone: '8', vel: 84 },
        ],
      ],
    },
  },

  comp: {
    program: 4, // electric piano
    voicing: 'rootless',
    velocity: [60, 78],
    anticipation: 0.25,
    rhythms: {
      // Short stabs on the sixteenths
      '4': [
        [[0.75, 0.2], [1.5, 0.2], [2.75, 0.2]],
        [[0, 0.2], [0.75, 0.2], [2, 0.2], [2.75, 0.3], [3.5, 0.2]],
        [[0.5, 0.2], [1.5, 0.4], [3, 0.2], [3.75, 0.2]],
        [[0, 0.3], [1.75, 0.2], [2.5, 0.2], [3.25, 0.2]],
      ],
      '2': [[[0, 0.2], [0.75, 0.3]], [[0.5, 0.2], [1.5, 0.2]], [[0, 0.2], [1.25, 0.2]]],
      '1': [[[0, 0.2]], [[0.5, 0.2]]],
    },
  },

  drums: {
    kit: 0,
    countIn: [
      [0, 'hhClosed', 92],
      [1, 'hhClosed', 82],
      [2, 'hhClosed', 82],
      [3, 'hhClosed', 82],
    ],
    grooves: {
      middle: [
        {
          bars: 2,
          hits: [
            ...hats(0),
            ...hats(4),
            ...snare(0),
            ...snare(4),
            [0, 'kick', 108],
            [0.75, 'kick', 86],
            [2.5, 'kick', 96],
            [4, 'kick', 108],
            [5.75, 'kick', 84],
            [6.5, 'kick', 96],
            [6.75, 'kick', 80, 0.5],
          ],
        },
        {
          bars: 2,
          hits: [
            ...hats(0),
            ...hats(4),
            ...snare(0),
            ...snare(4),
            [0, 'kick', 108],
            [1.5, 'kick', 84],
            [2.25, 'kick', 92],
            [4, 'kick', 108],
            [4.75, 'kick', 86],
            [6.5, 'kick', 96],
            [7.5, 'hhOpen', 64, 0.6],
          ],
        },
      ],
      first: [{ bars: 1, hits: [...hats(0).slice(2), ...snare(0), [0, 'crash', 100, 1, 2], [0, 'kick', 110], [2.5, 'kick', 96]] }],
      last: [
        {
          bars: 1,
          hits: [
            ...hats(0).slice(0, 8),
            [0, 'kick', 106],
            [1, 'snare', 104],
            [2.5, 'kick', 90],
            [3, 'snare', 82],
            [3.25, 'snare', 88],
            [3.5, 'tomMid', 96],
            [3.75, 'tomLow', 102],
          ],
        },
        { bars: 1, hits: [...hats(0), ...snare(0), [0, 'kick', 106], [2.5, 'kick', 94], [3.5, 'snare', 96], [3.75, 'snare', 100]] },
      ],
    },
    ending: [
      [0, 'crash', 110, 1, 3],
      [0, 'kick', 110],
      [0, 'snare', 96],
    ],
  },
}
