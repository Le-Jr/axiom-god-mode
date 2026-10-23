import type { Entity } from '@/game/ecs/Entity';

export const HitKind = {
  aura: 0,
  beam: 1,
  bullet: 2,
  contact: 3,
  satellite: 4,
} as const;
export type HitKind = (typeof HitKind)[keyof typeof HitKind];

/** Preallocated damage queue: producers push during a tick, the damage system drains it. */
export class HitBuffer {
  readonly target: Int32Array;
  readonly amount: Float32Array;
  readonly kind: Uint8Array;
  count = 0;
  dropped = 0;

  constructor(readonly capacity: number) {
    this.target = new Int32Array(capacity);
    this.amount = new Float32Array(capacity);
    this.kind = new Uint8Array(capacity);
  }

  push(target: Entity, amount: number, kind: HitKind): void {
    if (this.count >= this.capacity) {
      this.dropped++;
      return;
    }
    const i = this.count++;
    this.target[i] = target;
    this.amount[i] = amount;
    this.kind[i] = kind;
  }

  clear(): void {
    this.count = 0;
  }
}
