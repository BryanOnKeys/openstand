import { useEffect, useRef, useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="band">
      <button className="band-toggle" aria-expanded={open} aria-controls="mixer" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 2v12M8 2v12M13 2v12" />
          <path d="M1.5 10h3M6.5 5h3M11.5 8h3" strokeWidth="2.4" />
        </svg>
        Mixer
      </button>
      {open && (
        <section id="mixer" className="mixer" aria-label="Mixer">
          {PARTS.map((part) => (
            <div key={part} className={`strip${muted[part] ? ' strip-muted' : ''}`}>
              <span className="label">{labels[part]}</span>
              <input
                className="fader"
                type="range"
                min={0}
                max={127}
                value={volumes[part]}
                aria-label={`${labels[part]} volume`}
                onChange={(e) => onVolume(part, Number(e.target.value))}
              />
              <span className="strip-value">{volumes[part]}</span>
              <button className="mute" aria-pressed={muted[part]} onClick={() => onMute(part)}>
                Mute
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
