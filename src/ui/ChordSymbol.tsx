import { spellRoot, type Chord } from '../music/chords'

// SMuFL chord-symbol glyphs (rendered with Petaluma Text), so symbols look hand-copied
const GLYPH = {
  minor: '',
  major7: '',
  halfDiminished: '',
  diminished: '',
  augmented: '',
  flat: '',
  sharp: '',
}

const accidental = (a: string) => (a === 'b' ? GLYPH.flat : GLYPH.sharp)

// Typeset quality markers the way they appear on hand-written charts
function typeset(suffix: string): { quality: string; extensions: string } {
  const s = suffix
    .replace(/^(min|mi|m)(?!aj)/, '-')
    .replace(/^maj7?/, '^7')
    .replace(/^dim/, 'o')
    .replace(/^aug/, '+')
  const match = /^([-^ho+])?(\d+)?(.*)$/.exec(s) ?? ['', '', '', s]
  const markers: Record<string, string> = {
    '-': GLYPH.minor,
    '^': GLYPH.major7,
    h: GLYPH.halfDiminished,
    o: GLYPH.diminished,
    '+': GLYPH.augmented,
  }
  const marker = markers[match[1] ?? ''] ?? ''
  // A bare Δ already means major seventh
  const number = match[1] === '^' && match[2] === '7' ? '' : (match[2] ?? '')
  const extensions = (match[3] ?? '').replace(/[b#]/g, accidental)
  return { quality: marker + number, extensions }
}

export function ChordSymbol({ chord, keyPc }: { chord: Chord; keyPc: number }) {
  const name = spellRoot(chord.root, keyPc)
  const { quality, extensions } = typeset(chord.suffix)
  return (
    <span className="chord" aria-label={`${name}${chord.suffix}`}>
      <span>{name[0]}</span>
      {name[1] && <span className="chord-accidental">{accidental(name[1])}</span>}
      {quality && <span className="chord-quality">{quality}</span>}
      {extensions && <span className="chord-ext">{extensions}</span>}
      {chord.bass !== chord.root && (
        <span className="chord-bass">/{spellRoot(chord.bass, keyPc).replace(/[b#]/, accidental)}</span>
      )}
    </span>
  )
}
