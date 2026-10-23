/** Packed SoA pool of XP orbs (same swap-remove contract as ProjectilePool). */
export class XpOrbPool {
  readonly x: Float32Array;
  readonly z: Float32Array;
  readonly prevX: Float32Array;
  readonly prevZ: Float32Array;
  readonly value: Float32Array;
  readonly age: Float32Array;
  readonly magnet: Uint8Array;
  count = 0;

  constructor(readonly capacity: number) {
    this.x = new Float32Array(capacity);
    this.z = new Float32Array(capacity);
    this.prevX = new Float32Array(capacity);
    this.prevZ = new Float32Array(capacity);
    this.value = new Float32Array(capacity);
    this.age = new Float32Array(capacity);
    this.magnet = new Uint8Array(capacity);
  }

  /** Spawns an orb; above `mergeThreshold` the value merges into an existing orb instead. */
  spawn(x: number, z: number, value: number, mergeThreshold: number, mergeInto: number): void {
    if (this.count >= Math.min(mergeThreshold, this.capacity)) {
      if (this.count > 0) this.value[mergeInto % this.count] += value;
      return;
    }
    const i = this.count++;
    this.x[i] = this.prevX[i] = x;
    this.z[i] = this.prevZ[i] = z;
    this.value[i] = value;
    this.age[i] = 0;
    this.magnet[i] = 0;
  }

  despawn(i: number): void {
    const last = --this.count;
    if (i === last) return;
    this.x[i] = this.x[last];
    this.z[i] = this.z[last];
    this.prevX[i] = this.prevX[last];
    this.prevZ[i] = this.prevZ[last];
    this.value[i] = this.value[last];
    this.age[i] = this.age[last];
    this.magnet[i] = this.magnet[last];
  }

  clear(): void {
    this.count = 0;
  }
}
