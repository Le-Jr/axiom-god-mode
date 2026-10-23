import { defineComponent } from '../ComponentStore';

export interface TransformData {
  x: number;
  z: number;
  prevX: number; // previous tick, for render interpolation
  prevZ: number;
  rot: number; // yaw in radians
}

export const Transform = defineComponent<TransformData>(
  'Transform',
  () => ({ x: 0, z: 0, prevX: 0, prevZ: 0, rot: 0 }),
  (d) => {
    d.x = d.z = d.prevX = d.prevZ = d.rot = 0;
  },
);

export interface VelocityData {
  vx: number;
  vz: number;
}

export const Velocity = defineComponent<VelocityData>(
  'Velocity',
  () => ({ vx: 0, vz: 0 }),
  (d) => {
    d.vx = d.vz = 0;
  },
);

export interface HealthData {
  hp: number;
  max: number;
}

export const Health = defineComponent<HealthData>(
  'Health',
  () => ({ hp: 0, max: 0 }),
  (d) => {
    d.hp = d.max = 0;
  },
);
