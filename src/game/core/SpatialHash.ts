/**
 * Uniform spatial hash on the XZ plane. Items are inserted into the cell containing their
 * center; queries scan every cell overlapping (radius + maxItemRadius). Buckets are a hashed
 * table of linked lists in flat Int32Arrays (head/next), rebuilt from scratch each tick.
 * Hash aliasing is harmless: a per-item stamp dedupes candidates within one query.
 */
export class SpatialHash {
  readonly ids: Int32Array;
  readonly x: Float32Array;
  readonly z: Float32Array;
  readonly r: Float32Array;
  private readonly next: Int32Array;
  private readonly heads: Int32Array;
  private readonly stamp: Uint32Array;
  private readonly mask: number;
  private queryId = 0;
  count = 0;
  maxRadius = 0;
  dropped = 0;

  constructor(
    readonly capacity: number,
    readonly cellSize: number,
    buckets: number,
  ) {
    if ((buckets & (buckets - 1)) !== 0) throw new Error('SpatialHash buckets must be a power of two');
    this.ids = new Int32Array(capacity);
    this.x = new Float32Array(capacity);
    this.z = new Float32Array(capacity);
    this.r = new Float32Array(capacity);
    this.next = new Int32Array(capacity);
    this.stamp = new Uint32Array(capacity);
    this.heads = new Int32Array(buckets).fill(-1);
    this.mask = buckets - 1;
  }

  private bucket(cx: number, cz: number): number {
    return (Math.imul(cx, 73856093) ^ Math.imul(cz, 19349663)) & this.mask;
  }

  clear(): void {
    this.heads.fill(-1);
    this.count = 0;
    this.maxRadius = 0;
  }

  insert(id: number, x: number, z: number, r: number): void {
    if (this.count >= this.capacity) {
      this.dropped++;
      return;
    }
    const i = this.count++;
    this.ids[i] = id;
    this.x[i] = x;
    this.z[i] = z;
    this.r[i] = r;
    if (r > this.maxRadius) this.maxRadius = r;
    const b = this.bucket(Math.floor(x / this.cellSize), Math.floor(z / this.cellSize));
    this.next[i] = this.heads[b];
    this.heads[b] = i;
  }

  /**
   * Writes the slots (not ids) of items whose circles overlap (x, z, radius) into `out`.
   * Returns the count. Use `ids[slot]`, `x[slot]`... to read them.
   */
  query(x: number, z: number, radius: number, out: Int32Array): number {
    const reach = radius + this.maxRadius;
    const cs = this.cellSize;
    const x0 = Math.floor((x - reach) / cs);
    const x1 = Math.floor((x + reach) / cs);
    const z0 = Math.floor((z - reach) / cs);
    const z1 = Math.floor((z + reach) / cs);
    const q = ++this.queryId;
    let n = 0;
    for (let cx = x0; cx <= x1; cx++) {
      for (let cz = z0; cz <= z1; cz++) {
        let i = this.heads[this.bucket(cx, cz)];
        while (i !== -1) {
          if (this.stamp[i] !== q) {
            this.stamp[i] = q;
            const dx = this.x[i] - x;
            const dz = this.z[i] - z;
            const rr = radius + this.r[i];
            if (dx * dx + dz * dz <= rr * rr && n < out.length) out[n++] = i;
          }
          i = this.next[i];
        }
      }
    }
    return n;
  }
}
