import type { InputAction } from '@/game/config';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  blink: boolean;
  fire: boolean;
  /** Cursor projected on the ground plane (world units). */
  aimX: number;
  aimZ: number;
  hasAim: boolean;
}

export function createInputState(): InputState {
  return { up: false, down: false, left: false, right: false, blink: false, fire: false, aimX: 0, aimZ: 0, hasAim: false };
}

/**
 * Written by DOM listeners (InputBinder) and the render-side aim ray (AimProbe) at any time.
 * The `input` system copies it into `ctx.input` once per tick, so a tick sees one consistent snapshot.
 */
export const rawInput: InputState = createInputState();

export function copyInput(from: InputState, to: InputState): void {
  to.up = from.up;
  to.down = from.down;
  to.left = from.left;
  to.right = from.right;
  to.blink = from.blink;
  to.fire = from.fire;
  to.aimX = from.aimX;
  to.aimZ = from.aimZ;
  to.hasAim = from.hasAim;
}

export function resetButtons(state: InputState): void {
  state.up = state.down = state.left = state.right = state.blink = state.fire = false;
}

/** Builds a code → action lookup from the action map. */
export function buildKeyMap(bindings: Readonly<Record<InputAction, readonly string[]>>): Map<string, InputAction> {
  const map = new Map<string, InputAction>();
  for (const action of Object.keys(bindings) as InputAction[]) {
    for (const code of bindings[action]) map.set(code, action);
  }
  return map;
}
