import type { Part } from '../engine/arrange'

interface MixerProps {
  labels: Record<Part, string>
  volumes: Record<Part, number>
  muted: Record<Part, boolean>
  onVolume: (part: Part, volume: number) => void
  onMute: (part: Part) => void
}

const PARTS: Part[] = ['bass', 'comp', 'drums']

export function Mixer({ labels, volumes, muted, onVolume, onMute }: MixerProps) {
  return (
    <section className="mixer" aria-label="Mixer">
      <h2 className="panel-title">Band</h2>
      {PARTS.map((part) => (
        <div key={part} className={`strip${muted[part] ? ' strip-muted' : ''}`}>
          <span className="strip-name">{labels[part]}</span>
          <button className="mute" aria-pressed={muted[part]} onClick={() => onMute(part)}>
            {muted[part] ? 'Muted' : 'Mute'}
          </button>
          <input
            type="range"
            min={0}
            max={127}
            value={volumes[part]}
            aria-label={`${labels[part]} volume`}
            onChange={(e) => onVolume(part, Number(e.target.value))}
          />
        </div>
      ))}
    </section>
  )
}
