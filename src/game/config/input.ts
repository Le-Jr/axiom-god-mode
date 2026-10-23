// Action map (KeyboardEvent.code). A rebinding UI only needs to edit these lists.
export const input = {
  bindings: {
    up: ['KeyW', 'ArrowUp'],
    down: ['KeyS', 'ArrowDown'],
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],
    blink: ['Space'],
  },
  fireButton: 0, // PointerEvent.button (0 = left)
} as const;

export type InputAction = keyof typeof input.bindings;
