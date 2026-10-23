// Typed, synchronous, allocation-free on emit.
type Handler<P> = (payload: P) => void;

export class EventBus<Events extends object> {
  private readonly handlers: { [K in keyof Events]?: Handler<Events[K]>[] } = {};

  on<K extends keyof Events>(type: K, handler: Handler<Events[K]>): () => void {
    const list = (this.handlers[type] ??= []);
    list.push(handler);
    return () => this.off(type, handler);
  }

  off<K extends keyof Events>(type: K, handler: Handler<Events[K]>): void {
    const list = this.handlers[type];
    if (!list) return;
    const i = list.indexOf(handler);
    if (i !== -1) list.splice(i, 1);
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const list = this.handlers[type];
    if (!list) return;
    // Index loop: no iterator allocation. Handlers removed mid-emit may be skipped.
    for (let i = 0; i < list.length; i++) list[i](payload);
  }

  listenerCount(type?: keyof Events): number {
    if (type !== undefined) return this.handlers[type]?.length ?? 0;
    let n = 0;
    for (const key in this.handlers) n += this.handlers[key]?.length ?? 0;
    return n;
  }

  clear(): void {
    for (const key in this.handlers) delete this.handlers[key];
  }
}
