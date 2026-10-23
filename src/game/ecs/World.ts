import { ComponentStore, type ComponentDef } from './ComponentStore';
import { entityGeneration, entityIndex, makeEntity, MAX_ENTITY_INDEX, MAX_GENERATION, type Entity } from './Entity';

export class World {
  private readonly stores: (ComponentStore<object> | undefined)[] = [];
  private readonly generations: Uint16Array;
  private readonly alive: Uint8Array;
  private readonly freeList: Int32Array;
  private freeCount = 0;
  private nextIndex = 0;
  private readonly pendingDestroy: Int32Array;
  private pendingCount = 0;
  aliveCount = 0;

  constructor(readonly capacity: number) {
    if (capacity > MAX_ENTITY_INDEX + 1) throw new Error(`World capacity ${capacity} too large`);
    this.generations = new Uint16Array(capacity);
    this.alive = new Uint8Array(capacity);
    this.freeList = new Int32Array(capacity);
    this.pendingDestroy = new Int32Array(capacity);
  }

  create(): Entity {
    let index: number;
    if (this.freeCount > 0) index = this.freeList[--this.freeCount];
    else if (this.nextIndex < this.capacity) index = this.nextIndex++;
    else throw new Error(`World full: ${this.capacity} entities`);
    this.alive[index] = 1;
    this.aliveCount++;
    return makeEntity(index, this.generations[index]);
  }

  isAlive(e: Entity): boolean {
    const i = entityIndex(e);
    // 1 = alive, 2 = marked for destroy (still readable until flush)
    return i < this.capacity && this.alive[i] !== 0 && this.generations[i] === entityGeneration(e);
  }

  /** Deferred until `flush()` (run by the cleanup phase), so iteration stays valid. */
  destroy(e: Entity): void {
    if (!this.isAlive(e)) return;
    const i = entityIndex(e);
    if (this.alive[i] === 2) return;
    this.alive[i] = 2; // marked; still "alive" for has/get until flush
    this.pendingDestroy[this.pendingCount++] = e;
  }

  flush(): void {
    for (let p = 0; p < this.pendingCount; p++) {
      const e = this.pendingDestroy[p];
      const i = entityIndex(e);
      for (let s = 0; s < this.stores.length; s++) this.stores[s]?.remove(e);
      this.alive[i] = 0;
      this.generations[i] = (this.generations[i] + 1) & MAX_GENERATION;
      this.freeList[this.freeCount++] = i;
      this.aliveCount--;
    }
    this.pendingCount = 0;
  }

  store<T extends object>(def: ComponentDef<T>): ComponentStore<T> {
    let s = this.stores[def.id] as ComponentStore<T> | undefined;
    if (!s) {
      s = new ComponentStore(def, this.capacity);
      this.stores[def.id] = s as unknown as ComponentStore<object>;
    }
    return s;
  }

  add<T extends object>(e: Entity, def: ComponentDef<T>, init?: Partial<T>): T {
    return this.store(def).add(e, init);
  }

  get<T extends object>(e: Entity, def: ComponentDef<T>): T {
    return this.store(def).get(e);
  }

  has<T extends object>(e: Entity, def: ComponentDef<T>): boolean {
    return this.store(def).has(e);
  }

  remove<T extends object>(e: Entity, def: ComponentDef<T>): void {
    this.store(def).remove(e);
  }

  /** Create once (system init), then call `collect()` each tick. */
  query(...defs: ComponentDef<object>[]): Query {
    return new Query(defs.map((d) => this.store(d)), this.capacity);
  }

  clear(): void {
    for (let s = 0; s < this.stores.length; s++) this.stores[s]?.clear();
    this.generations.fill(0);
    this.alive.fill(0);
    this.freeCount = 0;
    this.nextIndex = 0;
    this.pendingCount = 0;
    this.aliveCount = 0;
  }
}

/** Allocation-free query: `const n = q.collect(); for (let i = 0; i < n; i++) q.results[i]`. */
export class Query {
  readonly results: Int32Array;

  constructor(
    private readonly stores: ComponentStore<object>[],
    capacity: number,
  ) {
    this.results = new Int32Array(capacity);
  }

  collect(): number {
    const stores = this.stores;
    let smallest = stores[0];
    for (let s = 1; s < stores.length; s++) if (stores[s].size < smallest.size) smallest = stores[s];
    let n = 0;
    outer: for (let i = 0; i < smallest.size; i++) {
      const e = smallest.entities[i];
      for (let s = 0; s < stores.length; s++) {
        if (stores[s] !== smallest && !stores[s].has(e)) continue outer;
      }
      this.results[n++] = e;
    }
    return n;
  }
}
