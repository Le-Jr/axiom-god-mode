import { entityIndex, type Entity } from './Entity';

export interface ComponentDef<T extends object> {
  readonly id: number;
  readonly name: string;
  create(): T;
  reset(data: T): void;
}

let nextComponentId = 0;

export function defineComponent<T extends object>(
  name: string,
  create: () => T,
  reset: (data: T) => void,
): ComponentDef<T> {
  return { id: nextComponentId++, name, create, reset };
}

/**
 * Sparse set. `dense`/`data` are packed in [0, size). Removing swaps the last element in,
 * which also moves the removed data object past `size`, where the next `add` reuses it.
 */
export class ComponentStore<T extends object> {
  readonly entities: Int32Array;
  readonly data: T[] = [];
  private readonly sparse: Int32Array;
  size = 0;

  constructor(
    readonly def: ComponentDef<T>,
    capacity: number,
  ) {
    this.entities = new Int32Array(capacity);
    this.sparse = new Int32Array(capacity).fill(-1);
  }

  has(e: Entity): boolean {
    const d = this.sparse[entityIndex(e)];
    return d !== -1 && this.entities[d] === e;
  }

  /** Returns the (reset) component. Hot paths should mutate it instead of passing `init`. */
  add(e: Entity, init?: Partial<T>): T {
    const idx = entityIndex(e);
    if (this.has(e)) {
      const existing = this.data[this.sparse[idx]];
      if (init) Object.assign(existing, init);
      return existing;
    }
    if (this.size >= this.entities.length) {
      throw new Error(`ComponentStore(${this.def.name}) full: ${this.entities.length}`);
    }
    const d = this.size++;
    let obj = this.data[d];
    if (obj === undefined) {
      obj = this.def.create();
      this.data[d] = obj;
    } else {
      this.def.reset(obj);
    }
    if (init) Object.assign(obj, init);
    this.entities[d] = e;
    this.sparse[idx] = d;
    return obj;
  }

  get(e: Entity): T {
    return this.data[this.sparse[entityIndex(e)]];
  }

  /** Like `get`, but returns undefined for missing/stale entities. */
  tryGet(e: Entity): T | undefined {
    return this.has(e) ? this.data[this.sparse[entityIndex(e)]] : undefined;
  }

  remove(e: Entity): void {
    if (!this.has(e)) return;
    const idx = entityIndex(e);
    const d = this.sparse[idx];
    const last = --this.size;
    if (d !== last) {
      const movedEntity = this.entities[last];
      const removed = this.data[d];
      this.entities[d] = movedEntity;
      this.data[d] = this.data[last];
      this.data[last] = removed;
      this.sparse[entityIndex(movedEntity)] = d;
    }
    this.sparse[idx] = -1;
  }

  clear(): void {
    for (let i = 0; i < this.size; i++) this.sparse[entityIndex(this.entities[i])] = -1;
    this.size = 0;
  }
}
