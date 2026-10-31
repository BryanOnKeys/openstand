import { ballad } from './library/ballad'
import { bossaNova } from './library/bossa-nova'
import { mediumSwing } from './library/medium-swing'
import { popRock } from './library/pop-rock'
import type { StyleDefinition } from './types'

export const STYLES: StyleDefinition[] = [mediumSwing, ballad, bossaNova, popRock]

export function getStyle(id: string): StyleDefinition {
  return STYLES.find((s) => s.id === id) ?? STYLES[0]
}

export type { StyleDefinition } from './types'
