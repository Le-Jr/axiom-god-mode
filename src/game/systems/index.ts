import type { System } from '@/game/ecs/System';
import { cleanupSystem } from './cleanupSystem';

// Registration order matters only inside a phase; GameLoop sorts by phase.
export const SYSTEMS: readonly System[] = [cleanupSystem];
