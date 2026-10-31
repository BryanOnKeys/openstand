# OpenStand

**An open-source band that lives in your browser.** Pick a tune, set the key and tempo, and practice over a rhythm section — bass, piano and drums — generated live from a chord chart.

> An open music stand: put a chart on it and the band starts playing.

No install, no account, no subscription. Just open the page and play.

---

## Status

OpenStand is in an **early prototype** stage. What works today:

- 🎼 **Chord charts** rendered as a 4-bar grid with the current bar highlighted while playing
- 🎸 **Four styles** — Medium Swing, Ballad (brushes), Bossa Nova (nylon guitar) and Pop Rock. Switch styles while the band is playing.
- 🎶 **Generated accompaniment**:
  - **Bass** walks through chord tones in swing, or plays style patterns (bossa root–fifth, rock eighths), always approaching the next chord smoothly
  - **Piano / guitar** comps with rootless jazz voicings or close-position chords, choosing the shape closest to the previous one (voice leading)
  - **Drums** pick grooves by position in the form — a set-up on the first bar, two-bar figures in the middle, a fill on the last bar
  - Every chorus is played a little differently
- 📄 **A real-looking lead sheet** — chord symbols typeset like a hand-copied chart (C−7, B♭7, Eø7, CΔ7), correct flat/sharp spelling in every key, and a progress line under the current bar
- 🎚️ **Practice controls** — tempo (40–300 BPM, changes instantly), transpose to any key while playing, number of choruses, count-in, <kbd>Space</kbd> to play/stop
- 🔊 **Mixer** — per-instrument volume and mute
- 🎹 **Chord parser** for common jazz chart notation: `C-7`, `F7b9`, `Bb^7`, `Eh7`, `Do7`, `G7alt`, `C7sus`, slash chords (`G/B`)

## Quick start

Requires Node.js 22+.

```bash
git clone https://github.com/canbmaj7/openstand.git
cd openstand
npm install
npm run dev
```

Open <http://localhost:5173> and press ▶. The first load downloads a ~32 MB sound bank.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## How it works

```
chord chart + style ──▶ timeline ──▶ bass / comp / drums generators ──▶ Standard MIDI file ──▶ SoundFont synth ──▶ 🔈
```

1. **Timeline** (`src/engine/timeline.ts`) — expands the chart into chord slots (count-in, N choruses, final resolution to the tonic).
2. **Generators** (`src/engine/bass.ts`, `comp.ts`, `drums.ts`) — read the selected style and turn each slot or bar into note events, with light humanization of timing and velocity.
3. **MIDI writer** (`src/engine/midiWriter.ts`) — writes a format-1 Standard MIDI File in memory.
4. **Player** (`src/audio/player.ts`) — plays it through [SpessaSynth](https://github.com/spessasus/spessasynth_lib), a SoundFont synthesizer running in an `AudioWorklet`. Tempo changes adjust the playback rate, so nothing is regenerated.

Everything runs client-side. There is no server.

## Project structure

```
src/
├── audio/      Sound bank loading, playback, mixer
├── engine/     Accompaniment engine (timeline, generators, MIDI writer)
├── music/      Chord parsing, voicings, example tunes
├── styles/     Style format and the style library
├── ui/         Chart, transport, tune list and mixer components
└── App.tsx     App state and playback wiring
public/
└── soundfonts/ GeneralUser GS sound bank
```

## Styles

A style is **data, not code**. Each one lives in `src/styles/library/` and describes three parts. The engine handles transposition, voice leading and fitting patterns to the chords.

| Part | What you describe |
| --- | --- |
| `bass` | `walking` (rule-based) or `pattern`: notes as chord degrees — `R`, `3`, `5`, `5-` (fifth below), `7`, `8` (octave), `app` (approach to the next chord) |
| `comp` | Voicing type (`rootless` or `close`) and rhythms per chord length |
| `drums` | Kit, count-in, grooves for the first / middle / last bar of the form (1 or 2 bars long), ending |

Positions are in beats from the start of the bar or chord. Off-beat eighths are written as `x.5` and are swung automatically when the style has `swing` above `0.5`. A drum hit can carry a probability, so a groove varies on every pass.

```ts
// A bossa bass: root on 1, fifth below on the "and" of 2 and on 3, root on the "and" of 4
'4': [[
  { at: 0,   dur: 1.4,  tone: 'R'  },
  { at: 1.5, dur: 0.45, tone: '5-' },
  { at: 2,   dur: 1.4,  tone: '5-' },
  { at: 3.5, dur: 0.45, tone: 'R'  },
]]
```

**Adding a style:** copy one of the existing files, change the patterns, and register it in `src/styles/index.ts`. Types in `src/styles/types.ts` describe every field.

## Roadmap

- [x] Style format with four starter styles
- [ ] More styles: even 8ths, funk, samba, Afro-Cuban, waltz, shuffle — and beyond (Balkan, Turkish *usul*, Afrobeat…)
- [ ] Load styles from JSON / MIDI files so new grooves need no build step
- [ ] Chart editor and a library of tunes stored locally (IndexedDB)
- [ ] Import/export of common chord-chart formats
- [ ] Practice modes: tempo ramp per chorus, loop a section, cycle through all 12 keys
- [ ] Chord helper: piano keyboard, guitar diagrams, scale suggestions
- [ ] Export to WAV / MIDI / PDF
- [ ] Offline support (PWA) and a smaller, trimmed sound bank
- [ ] Engine published as a standalone package for other projects

## Contributing

OpenStand is meant to grow as a community project, and musicians are as welcome as developers.

- **Musicians** — tell us where the band sounds stiff or wrong. Concrete notes help most: *"in a minor ii–V the bass lands on the wrong note in bar 3"*. New styles are the most valuable contribution — see [Styles](#styles).
- **Developers** — pick an item from the roadmap or an open issue. Please open an issue before large changes so we can agree on the approach.

Before sending a pull request, make sure `npm run build` and `npm run lint` pass. All contributions must be your own work (or compatibly licensed, with attribution) and are released under the project license.

## Credits

- [SpessaSynth](https://github.com/spessasus/spessasynth_lib) by spessasus — SoundFont synthesizer and MIDI sequencer (Apache-2.0)
- [Fraunces](https://github.com/undercasetype/Fraunces) and [Instrument Sans](https://github.com/Instrument/instrument-sans) — typefaces (SIL Open Font License)
- [GeneralUser GS](https://www.schristiancollins.com/generaluser.php) by S. Christian Collins — sound bank (see `public/soundfonts/GeneralUser-GS-LICENSE.txt`)

## License

[GNU Affero General Public License v3.0 or later](LICENSE).

You are free to use, study, modify and share OpenStand. If you run a modified version as a web service, you must make its source code available to its users.
