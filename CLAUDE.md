# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `tejo-del-berriondo/` (the inner directory where `package.json` lives):

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Build for production (outputs to dist/)
npm run preview    # Preview production build locally
```

There is no test framework — testing is manual via the dev server.

## Architecture

Mobile-first (480×854px) tejo game built with **Phaser 3** + **Matter.js physics** + **Vite**. All game constants (level configs, scoring thresholds, prize probabilities, offer types) live in `src/config/game.config.js` — tune gameplay here first.

### Scene flow

```
MenuScene → TutorialScene → PersonajeScene → GameScene
                                                 ├─ jackpot fills → SlotScene → back to GameScene
                                                 └─ every 9000 pts → OfertaScene → back to GameScene
```

Scenes pass persistent state via `this.registry`: `nombreJugador` (string), `personaje` (key string), `colorTejo` (hex int). SlotScene and OfertaScene launch as overlays while GameScene is paused, then call `this.scene.resume('GameScene', data)` on close. GameScene listens with `this.events.on('resume', ...)` to receive offer results.

### PersonajeScene — character selection

Three selectable characters, each sets `personaje` key and `colorTejo` in the registry:

| Key | Name | `colorTejo` |
|---|---|---|
| `campesino` | El Campesino | `0x999999` (grey) |
| `abuela` | La Abuela | `0x9b59b6` (purple) |
| `minero` | El Minero | `0x1a1a1a` (black) |

### GameScene — the core loop

- **Throw mechanic**: swipe upward anywhere on screen → `pointerup` computes upward distance + horizontal offset; velocity direction = swipe direction (NOT slingshot reversal). `upDist < 28px` is ignored. During drag, `dibujarAim()` renders a simulated arc preview. Physics walls are angled to match the 3D court trapezoid.
- **Perspective 3D court**: `crearFondo()` draws a clay trapezoid (widest at player end, narrows to bocín at top). Dianas scale via `perspectiveScale()` from `TENANT_CONFIG.cancha`. Tejo scales dynamically in `update()` as it travels (scale 1.0 at bottom → 0.38 at top). Reset in `resetearTejo()` restores scale to 1.
- **Dianas**: Matter.js static sensor bodies — red (`diana-buena`, +500 pts base) and blue (`diana-trampa`, -500 pts, resets combo). Collision detected via `this.matter.world.on('collisionstart', …)`
- **Level progression**: `aciertosNivel` consecutive red hits per level (from `NIVELES[n].aciertosParaSiguiente`); levels cycle 1→2→3→1 while `ciclo` increments, increasing wind force each cycle
- **Jackpot meter**: `puntosJackpot` (0→`PUNTOS_JACKPOT`=3000); 35% chance per red hit adds 500 pts (750 for explosivo); reaching threshold triggers `jackpot()` → launches SlotScene
- **Combo multiplier**: `golpesConsecutivos` ≥3 → x2, ≥5 → x3; resets on trampa hit or level change
- **Special tejo powers**: 3 launches each — `fuego` (1.45× speed, fire trail), `hielo` (immune to wind force, ice trail), `explosivo` (1.25× speed, 2× points, two-wave explosion). Activated via `activarTejoEspecial(tipo)` when GameScene resumes from OfertaScene
- **Near-miss**: every frame while flying checks distance to each diana; shows "¡Casi!" at 36–72px range
- **Trail**: last 12 positions drawn each frame in `trailGraphics`; color palette switches per active power
- **Offers**: `verificarOferta()` called after each red hit; every `PUNTOS_OFERTA`=9000 points launches OfertaScene

### Special tejo physical differences

| Power | Speed mult | Max clamp | Wind | Points | Jackpot bonus |
|---|---|---|---|---|---|
| Normal | 1.0× | 40 | affected | 500 | 500 |
| Fuego | 1.45× | 58 | affected | 500 | 500 |
| Hielo | 1.0× | 40 | **immune** | 500 | 500 |
| Explosivo | 1.25× | 50 | affected | **1000** | **750** |

### SlotScene

3-reel slot machine, 40% win rate. Prize pool and probabilities in `PREMIOS_SLOT`. Launched as an overlay; closes by calling `this.scene.resume('GameScene')` (no data — the score bonus is applied in GameScene's `jackpot()` before launching the slot).

### OfertaScene

Shown every 9000 score points (`PUNTOS_OFERTA`). Picks a random offer from `OFERTAS`. On accept, resumes GameScene with `{ tejoEspecial: offer.id }`. On reject, resumes with `{ tejoEspecial: null }`.

### Key config values (`src/config/game.config.js`)

| Constant | Purpose |
|---|---|
| `RESTAURANTE` | Restaurant branding: `nombre`, `tagline`, `nombreJuego` — change this when deploying for a new venue |
| `NIVELES` | Level definitions: diana positions, wind flag, `fuerzaViento`, obstacle flag, `aciertosParaSiguiente` |
| `TOTAL_NIVELES` (9) | Number of levels per cycle; increase here if adding more levels to `NIVELES` |
| `PUNTOS_JACKPOT` (3000) | `puntosJackpot` threshold to trigger SlotScene |
| `PUNTOS_OFERTA` (9000) | Score interval that triggers OfertaScene |
| `PREMIOS_SLOT` | Slot prize pool — each entry has `simbolos`, `texto`, `probabilidad` |
| `SIMBOLOS_POOL` | Emoji pool used for the spinning reels between stops |
| `OFERTAS` | Offer types — each has `id` (matches power key), `producto`, `descuento`, `recompensa` |
| `FONT` | `"'Baloo 2', Arial, sans-serif"` — loaded via Google Fonts in `index.html` |

### Asset notes

- `casino-bg.mp3` — imported as a module in GameScene and passed to `this.load.audio()` in `preload()`; all other textures (tejo, dianas, particles) are generated procedurally in `preload()` via `this.make.graphics()` + `generateTexture()`
- `donkey_clean.png` — NPC image used in TutorialScene
- `logo.png` — used in MenuScene
- Google Fonts (Baloo 2) is loaded in `index.html`; `main.js` waits on `document.fonts.ready` before calling `new Phaser.Game()` to avoid text rendering with fallback font

### Phaser config gotchas

- `parent: 'app'` in `main.js` is critical — without it Phaser appends the canvas to `<body>` after the `#app` div, pushing it 854px below the viewport.
- `dom.createContainer: true` is required for TutorialScene's HTML `<input>` element (player name entry); removing it breaks the name input overlay.
- `matter.debug: false` in `main.js` — set to `true` to render Matter.js collision bodies as wireframes, useful for tuning diana hit areas and obstacle boundaries.
