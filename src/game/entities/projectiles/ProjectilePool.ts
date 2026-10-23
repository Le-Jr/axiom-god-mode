/**
 * Struct-of-arrays bullet pool. Active bullets are packed in [0, count): despawn swaps the last
 * bullet into the hole, so iterate backwards when despawning during a loop.
 */
export class ProjectilePool {
  readonly x: Float32Array;
  readonly z: Float32Array;
  readonly prevX: Float32Array;
  readonly prevZ: Float32Array;
  readonly vx: Float32Array;
  readonly vz: Float32Array;
  readonly radius: Float32Array;
  readonly damage: Float32Array;
  readonly life: Float32Array;
  readonly age: Float32Array;
  readonly kind: Uint8Array;
  count = 0;
  dropped = 0;

  constructor(readonly capacity: number) {
    this.x = new Float32Array(capacity);
    this.z = new Float32Array(capacity);
    this.prevX = new Float32Array(capacity);
    this.prevZ = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vz = new Float32Array(capacity);
    this.radius = new Float32Array(capacity);
    this.damage = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.age = new Float32Array(capacity);
    this.kind = new Uint8Array(capacity);
  }

  /** Returns the slot, or -1 if the pool is full (counted in `dropped`). */
  spawn(kind: number, x: number, z: number, vx: number, vz: number, damage: number, radius: number, life: number): number {
    if (this.count >= this.capacity) {
      this.dropped++;
      return -1;
    }
    const i = this.count++;
    this.x[i] = this.prevX[i] = x;
    this.z[i] = this.prevZ[i] = z;
    this.vx[i] = vx;
    this.vz[i] = vz;
    this.damage[i] = damage;
    this.radius[i] = radius;
    this.life[i] = life;
    this.age[i] = 0;
    this.kind[i] = kind;
    return i;
  }

  despawn(i: number): void {
    const last = --this.count;
    if (i === last) return;
    this.x[i] = this.x[last];
    this.z[i] = this.z[last];
    this.prevX[i] = this.prevX[last];
    this.prevZ[i] = this.prevZ[last];
    this.vx[i] = this.vx[last];
    this.vz[i] = this.vz[last];
    this.radius[i] = this.radius[last];
    this.damage[i] = this.damage[last];
    this.life[i] = this.life[last];
    this.age[i] = this.age[last];
    this.kind[i] = this.kind[last];
  }

  clear(): void {
    this.count = 0;
  }
}
