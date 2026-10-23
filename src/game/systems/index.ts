import type { System } from '@/game/ecs/System';
import { auraSystem } from './auraSystem';
import { beamSystem } from './beamSystem';
import { cleanupSystem } from './cleanupSystem';
import { damageSystem } from './damageSystem';
import { erasureSystem } from './erasureSystem';
import { hudSystem } from './hudSystem';
import { historySystem, inputSystem } from './inputSystem';
import { playerMovementSystem } from './playerMovementSystem';
import { sandboxSystem } from './sandboxSystem';

// Registration order matters only inside a phase; GameLoop sorts by phase.
export const SYSTEMS: readonly System[] = [
  inputSystem,
  historySystem,
  sandboxSystem,
  playerMovementSystem, // before aura/beam so they use this tick's position
  auraSystem,
  beamSystem,
  damageSystem,
  erasureSystem,
  hudSystem,
  cleanupSystem,
];
