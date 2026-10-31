import { keyPrefersFlats, noteName } from '../music/chords'
import type { Song } from '../music/songs'
import { getStyle } from '../styles'

interface LibraryProps {
  songs: Song[]
  selectedId: string
  onSelect: (id: string) => void
}

export function Library({ songs, selectedId, onSelect }: LibraryProps) {
  return (
    <nav className="library" aria-label="Tunes">
      <h2 className="library-title">
        Tunes <span className="library-count">{songs.length}</span>
      </h2>
      <ul className="library-list">
        {songs.map((song) => (
          <li key={song.id}>
            <button
              className="tune"
              aria-current={song.id === selectedId ? 'true' : undefined}
              onClick={() => onSelect(song.id)}
            >
              <span className="tune-title">{song.title}</span>
              <span className="tune-meta">
                {getStyle(song.style).name} · {noteName(song.key, keyPrefersFlats(song.key))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
