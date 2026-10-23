# Intro cutscene

A data-driven panel player (`src/game/cutscene/`) shows static illustrated panels with typewriter captions and subtle parallax/zoom. **A click advances**: it finishes the typewriter, then moves to the next panel. **Space or Esc skips the whole cutscene.** A "Space: skip" hint fades in after 1 s.

## Script: `public/assets/cutscene/intro.json`
| # | Beat | Image (placeholder) | Caption | Motion | Audio |
|---|---|---|---|---|---|
| 1 | Routine experiment | Lab interior, cool fluorescent light, a lone researcher at a ring-shaped containment chamber | "Run 4,812. Containment nominal. Another quiet night." | slow zoom-in 1.00→1.06 | lab hum, soft pad |
| 2 | First anomaly | Close-up: readouts climbing, a hairline crack of light in the field | "The numbers began to disagree with each other." | pan right | rising tone |
| 3 | Containment failure | Chamber ruptures in white-violet light, alarms | "Then the field stopped holding anything at all." | shake + zoom 1.0→1.12 | alarm, impact |
| 4 | Disintegration | The silhouette breaks into lines and points of light | "I felt every atom let go of the others." | slow dissolve-in | reverse swell, then cut |
| 5 | Silence | Pure black frame, a single faint point of cyan | "Silence." (typed very slowly) | none | **silence** (only a faint room tone, so the game never truly mutes) |
| 6 | Reassembly | Lattice lines converge into a humanoid form of light | "Something remembered my shape." | zoom-out 1.1→1.0 | choir swell begins |
| 7 | Awakening | The Unbound hovering in the ruined lab, debris suspended, sirens outside | "And it was no longer mine to lose." | slow push-in, parallax layers | music hit → crossfade into gameplay ambient |

**Voice:** first person, as above. These are Dr. Aren Vael's last and first thoughts. The captions above are the v1 copy. Placeholder art is generated gradients and silhouettes (see ART_DIRECTION). The same player renders the one-panel **memory fragments** shown at each Cycle transition (`public/assets/cutscene/fragments/*.json`).

## JSON schema
```ts
// src/game/cutscene/types.ts (validated at load with a hand-written guard; no runtime schema lib)
export interface CutsceneFile {
  id: string;                 // "intro"
  version: 1;
  skippable: boolean;
  panels: Panel[];
}

export interface Panel {
  id: string;
  layers: Layer[];            // back → front; 1 layer is fine
  caption?: {
    text: string;
    charsPerSecond?: number;  // default 32
    delay?: number;           // seconds before typing starts, default 0.4
    position?: 'bottom' | 'center' | 'top';
  };
  duration: number;           // seconds the panel holds after the caption finishes
  motion?: {
    zoom?: [from: number, to: number];
    pan?: [fromX: number, fromY: number, toX: number, toY: number]; // % of frame
    shake?: number;           // 0..1
    easing?: 'linear' | 'easeInOut' | 'easeOut';
  };
  transition?: { type: 'cut' | 'fade' | 'flash'; duration: number; color?: string };
  audio?: { sfx?: string[]; music?: string; musicIntensity?: number; silence?: boolean };
}

export interface Layer {
  src: string;                // "/assets/cutscene/intro/01_bg.webp" (falls back to a generated placeholder)
  parallax?: number;          // 0 = static, 1 = full motion; default 1
  blend?: 'normal' | 'screen' | 'add';
}
```

## Example
```json
{
  "id": "intro",
  "version": 1,
  "skippable": true,
  "panels": [
    {
      "id": "p1_routine",
      "layers": [{ "src": "/assets/cutscene/intro/01_bg.webp", "parallax": 0.4 },
                 { "src": "/assets/cutscene/intro/01_fg.webp", "parallax": 1 }],
      "caption": { "text": "Run 4,812. Containment nominal. Another quiet night." },
      "duration": 2.5,
      "motion": { "zoom": [1.0, 1.06], "easing": "easeInOut" },
      "transition": { "type": "fade", "duration": 0.6 },
      "audio": { "sfx": ["lab_hum"], "musicIntensity": 0.1 }
    }
  ]
}
```

## Implementation notes
- DOM/CSS player (React + Tailwind + CSS transforms), **not** the WebGL canvas. That makes it cheap and lets it preload while the game canvas initializes behind it.
- Preload all layers before panel 1, with a 3 s timeout falling back to placeholders.
- Respect `prefers-reduced-motion`: no shake, half the zoom.
- After the last panel (or a skip), emit `cutscene:done` → `run:start`. The cutscene runs automatically only on the first run (flag in the settings store) and can be replayed from the menu.
