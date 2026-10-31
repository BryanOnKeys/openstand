import { spellRoot, type Chord } from '../music/chords'

const ACCIDENTALS: Record<string, string> = { b: '♭', '#': '♯' }

// Typeset quality markers the way they appear on hand-written charts
function typeset(suffix: string): { quality: string; extensions: string } {
  const s = suffix
    .replace(/^(min|mi|m)(?!aj)/, '-')
    .replace(/^maj7?/, '^7')
    .replace(/^dim/, 'o')
    .replace(/^aug/, '+')
  const match = /^([-^ho+])?(\d+)?(.*)$/.exec(s) ?? ['', '', '', s]
  const marker = { '-': '−', '^': 'Δ', h: 'ø', o: '°', '+': '+' }[match[1] ?? ''] ?? ''
  const extensions = (match[3] ?? '').replace(/[b#]/g, (a) => ACCIDENTALS[a])
  return { quality: marker + (match[2] ?? ''), extensions }
}

export function ChordSymbol({ chord, keyPc }: { chord: Chord; keyPc: number }) {
  const name = spellRoot(chord.root, keyPc)
  const { quality, extensions } = typeset(chord.suffix)
  return (
    <span className="chord" aria-label={`${name}${chord.suffix}`}>
      <span className="chord-root">{name[0]}</span>
      {name[1] && <span className="chord-accidental">{ACCIDENTALS[name[1]]}</span>}
      {quality && <span className="chord-quality">{quality}</span>}
      {extensions && <span className="chord-ext">{extensions}</span>}
      {chord.bass !== chord.root && (
        <span className="chord-bass">/{spellRoot(chord.bass, keyPc).replace(/[b#]/, (a) => ACCIDENTALS[a])}</span>
      )}
    </span>
  )
}
