import { describe, expect, it } from 'vitest';
import { World } from '../World';
import { Health, Transform, Velocity } from '../components';

describe('World', () => {
  it('creates, adds and reads components', () => {
    const w = new World(16);
    const e = w.create();
    w.add(e, Transform, { x: 3, z: 4 });
    expect(w.has(e, Transform)).toBe(true);
    expect(w.get(e, Transform).x).toBe(3);
    expect(w.has(e, Health)).toBe(false);
  });

  it('defers destroy until flush and invalidates stale handles', () => {
    const w = new World(16);
    const e = w.create();
    w.add(e, Health, { hp: 10, max: 10 });
    w.destroy(e);
    expect(w.isAlive(e)).toBe(true); // still readable during the tick
    expect(w.get(e, Health).hp).toBe(10);
    w.flush();
    expect(w.isAlive(e)).toBe(false);
    expect(w.aliveCount).toBe(0);

    const reused = w.create(); // same index, new generation
    expect(reused).not.toBe(e);
    expect(w.isAlive(e)).toBe(false);
    expect(w.has(reused, Health)).toBe(false);
  });

  it('reuses and resets component objects after removal', () => {
    const w = new World(16);
    const a = w.create();
    const objA = w.add(a, Health, { hp: 5, max: 5 });
    w.destroy(a);
    w.flush();
    const b = w.create();
    const objB = w.add(b, Health);
    expect(objB).toBe(objA); // pooled
    expect(objB.hp).toBe(0); // reset
  });

  it('keeps the sparse set consistent on swap-remove', () => {
    const w = new World(16);
    const es = [w.create(), w.create(), w.create()];
    es.forEach((e, i) => w.add(e, Transform, { x: i }));
    w.remove(es[0], Transform);
    expect(w.get(es[2], Transform).x).toBe(2);
    expect(w.get(es[1], Transform).x).toBe(1);
    expect(w.store(Transform).size).toBe(2);
  });

  it('queries entities that have all components, without allocating results', () => {
    const w = new World(16);
    const moving = w.create();
    w.add(moving, Transform);
    w.add(moving, Velocity, { vx: 1 });
    const still = w.create();
    w.add(still, Transform);
    const q = w.query(Transform, Velocity);
    const buf = q.results;
    expect(q.collect()).toBe(1);
    expect(q.results[0]).toBe(moving);
    expect(q.results).toBe(buf);
  });

  it('throws when full', () => {
    const w = new World(2);
    w.create();
    w.create();
    expect(() => w.create()).toThrow(/full/);
  });
});
