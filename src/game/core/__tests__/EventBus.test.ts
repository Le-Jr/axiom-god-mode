import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../EventBus';

interface TestEvents {
  ping: { n: number };
  pong: { s: string };
}

describe('EventBus', () => {
  it('delivers payloads to listeners of that type only', () => {
    const bus = new EventBus<TestEvents>();
    const ping = vi.fn();
    const pong = vi.fn();
    bus.on('ping', ping);
    bus.on('pong', pong);
    bus.emit('ping', { n: 1 });
    expect(ping).toHaveBeenCalledWith({ n: 1 });
    expect(pong).not.toHaveBeenCalled();
  });

  it('unsubscribes via off and the returned disposer', () => {
    const bus = new EventBus<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    const offA = bus.on('ping', a);
    bus.on('ping', b);
    offA();
    bus.off('ping', b);
    bus.emit('ping', { n: 2 });
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
    expect(bus.listenerCount()).toBe(0);
  });

  it('passes the same payload object (reuse contract)', () => {
    const bus = new EventBus<TestEvents>();
    const payload = { n: 0 };
    const seen: object[] = [];
    bus.on('ping', (p) => seen.push(p));
    bus.emit('ping', payload);
    payload.n = 1;
    bus.emit('ping', payload);
    expect(seen[0]).toBe(seen[1]);
  });

  it('clear removes every listener', () => {
    const bus = new EventBus<TestEvents>();
    bus.on('ping', () => {});
    bus.on('pong', () => {});
    bus.clear();
    expect(bus.listenerCount()).toBe(0);
  });
});
