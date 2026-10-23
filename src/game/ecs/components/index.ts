import { defineComponent } from '../ComponentStore';

export interface TransformData {
  x: number;
  z: number;
  prevX: number; // previous tick, for render interpolation
  prevZ: number;
  rot: number; // yaw in radians (0 = facing +X)
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
  /** Seconds of remaining invulnerability. */
  iframes: number;
}

export const Health = defineComponent<HealthData>(
  'Health',
  () => ({ hp: 0, max: 0, iframes: 0 }),
  (d) => {
    d.hp = d.max = d.iframes = 0;
  },
);

export const BeamState = {
  idle: 0,
  charging: 1,
  channel: 2,
  tail: 3,
} as const;
export type BeamState = (typeof BeamState)[keyof typeof BeamState];

export interface PlayerData {
  level: number;
  aimDirX: number; // unit aim direction
  aimDirZ: number;
  energy: number;
  maxEnergy: number;
  lockedOut: boolean; // ran dry; needs minEnergyToFire to re-arm
  sinceDrain: number; // seconds since energy was last drained
  beamState: BeamState;
  beamTimer: number; // seconds in the current beam state
  beamLength: number; // current visual/collision length (stops at first target)
  beamHit: boolean;
  auraTimer: number;
  auraRadius: number;
  auraPulses: number;
  lowHp: boolean;
}

export const Player = defineComponent<PlayerData>(
  'Player',
  () => ({
    level: 1, aimDirX: 1, aimDirZ: 0, energy: 0, maxEnergy: 0, lockedOut: false, sinceDrain: 0,
    beamState: BeamState.idle, beamTimer: 0, beamLength: 0, beamHit: false,
    auraTimer: 0, auraRadius: 0, auraPulses: 0, lowHp: false,
  }),
  (d) => {
    d.level = 1;
    d.aimDirX = 1;
    d.aimDirZ = 0;
    d.energy = d.maxEnergy = d.sinceDrain = d.beamTimer = d.beamLength = 0;
    d.auraTimer = d.auraRadius = d.auraPulses = 0;
    d.lockedOut = d.beamHit = d.lowHp = false;
    d.beamState = BeamState.idle;
  },
);

/** Anything the aura and beam can hit (enemies, dummies; props later). */
export interface TargetData {
  radius: number;
  archetypeId: string;
  xp: number;
  air: boolean;
  /** Seconds remaining on the white hit flash. */
  flash: number;
}

export const Target = defineComponent<TargetData>(
  'Target',
  () => ({ radius: 0.5, archetypeId: '', xp: 0, air: false, flash: 0 }),
  (d) => {
    d.radius = 0.5;
    d.archetypeId = '';
    d.xp = 0;
    d.air = false;
    d.flash = 0;
  },
);

/** Present while an erased entity plays its dissolve. It is no longer targetable. */
export interface ErasingData {
  t: number; // seconds since erasure
}

export const Erasing = defineComponent<ErasingData>(
  'Erasing',
  () => ({ t: 0 }),
  (d) => {
    d.t = 0;
  },
);
