'use client';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Plane, Raycaster, Vector3 } from 'three';
import { config } from '@/game/config';
import { buildKeyMap, rawInput, resetButtons } from '@/game/core/input';

const keyMap = buildKeyMap(config.input.bindings);
const ground = new Plane(new Vector3(0, 1, 0), 0);
const raycaster = new Raycaster();
const hit = new Vector3();

/**
 * Writes DOM input into `rawInput`: keys via the action map, fire from the canvas pointer,
 * and the cursor projected onto the ground plane each frame (before the sim ticks).
 */
export function InputBinder() {
  const canvas = useThree((s) => s.gl.domElement);

  useEffect(() => {
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const action = keyMap.get(e.code);
      if (!action) return;
      e.preventDefault();
      rawInput[action] = down;
    };
    const onKeyDown = onKey(true);
    const onKeyUp = onKey(false);
    const onPointerDown = (e: PointerEvent) => {
      if (e.button === config.input.fireButton) rawInput.fire = true;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.button === config.input.fireButton) rawInput.fire = false;
    };
    const onBlur = () => resetButtons(rawInput);
    const onContextMenu = (e: Event) => e.preventDefault();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('blur', onBlur);
    canvas.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('contextmenu', onContextMenu);
      resetButtons(rawInput);
      rawInput.hasAim = false;
    };
  }, [canvas]);

  useFrame((state) => {
    raycaster.setFromCamera(state.pointer, state.camera);
    if (raycaster.ray.intersectPlane(ground, hit)) {
      rawInput.aimX = hit.x;
      rawInput.aimZ = hit.z;
      rawInput.hasAim = true;
    }
  }, -200);

  return null;
}
