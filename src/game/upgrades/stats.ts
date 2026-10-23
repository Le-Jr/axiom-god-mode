import type { GameConfig } from '@/game/config';

/** Derived player stats: base values from config, then every owned buff applied in order. */
export interface PlayerStats {
  maxHp: number;
  moveSpeed: number;
  pickupRadius: number;
  auraRadius: number;
  auraDamage: number;
  auraInterval: number;
  beamMaxEnergy: number;
  beamRecharge: number;
  beamWidth: number;
  /** Extra targets the beam passes through; Infinity = all. */
  beamPierce: number;
  satellites: number;
}

export function createStats(): PlayerStats {
  return {
    maxHp: 0, moveSpeed: 0, pickupRadius: 0, auraRadius: 0, auraDamage: 0, auraInterval: 0,
    beamMaxEnergy: 0, beamRecharge: 0, beamWidth: 0, beamPierce: 0, satellites: 0,
  };
}

export function resetStats(s: PlayerStats, config: GameConfig): void {
  s.maxHp = config.player.maxHp;
  s.moveSpeed = config.player.moveSpeed;
  s.pickupRadius = config.player.pickupRadius;
  s.auraRadius = config.aura.radius;
  s.auraDamage = config.aura.damagePerPulse;
  s.auraInterval = config.aura.pulseInterval;
  s.beamMaxEnergy = config.beam.maxEnergy;
  s.beamRecharge = config.beam.rechargePerSecond;
  s.beamWidth = config.beam.width;
  s.beamPierce = 0;
  s.satellites = 0;
}
