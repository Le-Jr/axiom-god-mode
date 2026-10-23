import type { System } from '@/game/ecs/System';
import { waveDirector } from '@/game/waves/WaveDirector';
import { aiSystem } from './aiSystem';
import { auraSystem } from './auraSystem';
import { beamSystem } from './beamSystem';
import { cleanupSystem } from './cleanupSystem';
import { collisionSystem } from './collisionSystem';
import { damageSystem } from './damageSystem';
import { erasureSystem } from './erasureSystem';
import { gridSystem } from './gridSystem';
import { hudSystem } from './hudSystem';
import { historySystem, inputSystem } from './inputSystem';
import { playerMovementSystem } from './playerMovementSystem';
import { projectileSystem } from './projectileSystem';
import { sandboxSystem } from './sandboxSystem';
import { satelliteSystem } from './satelliteSystem';
import { stressSystem } from './stressSystem';
import { upgradeSystem } from './upgradeSystem';
import { xpSystem } from './xpSystem';

// Registration order matters only inside a phase; GameLoop sorts by phase.
export const SYSTEMS: readonly System[] = [
  inputSystem,
  historySystem,
  waveDirector,
  stressSystem,
  sandboxSystem,
  aiSystem,
  gridSystem, // first in `player`: aura/beam/satellites/collision see this tick's positions
  playerMovementSystem,
  auraSystem,
  beamSystem,
  projectileSystem,
  satelliteSystem, // before collision: blocked bullets never reach the player
  collisionSystem,
  damageSystem,
  erasureSystem,
  upgradeSystem,
  xpSystem,
  hudSystem,
  cleanupSystem,
];
