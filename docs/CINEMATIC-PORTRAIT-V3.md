# Cinematic particle portrait v3

This isolated proposal replaces the Hero photo and circuit video with one persistent, three-quarter WebGL2 particle bust. The updated Orvane screenshot is the particle style authority; the golden portrait remains the pose authority. No photo, textured plane, or realistic skin render appears in the new Hero. The About photograph remains part of the original content.

## Source and likeness

All four supplied NextGenFace reconstructions and their rendered comparisons were inspected. `mesh3.obj` was selected because its captured three-quarter direction, nose projection and jaw silhouette are closest to the pose reference. Mesh 0 is frontal, mesh 1 faces the opposite direction, and mesh 2 has a tilted frontal framing. The selected reconstruction contains 28,588 vertices and 56,572 triangles. Its SHA-256 is recorded in `assets/portrait-manifest.json`.

Coordinates are normalized, camera axes corrected, and yaw adjusted by -0.13 radians at bake time. That final pose is present throughout formation. No frontal-to-three-quarter animation exists. The diffuse map contributes only a restrained scalar tonal influence to particle lighting, including beard variation; no image texture is uploaded or displayed by WebGL.

These assets reconstruct the face only. Rear cranium, directional hair locks, neck, clothed shoulders and chest are procedural extensions, not measured anatomy. Eye direction and fine beard detail are constrained by the supplied reconstruction. The result is an artistic sculpture rather than an exact scan of a complete head and torso.

## Architecture

`scripts/bake-portrait.py` samples triangles in proportion to surface area and interpolates normals, source tone and topological boundary distance. Internal mouth/eye openings are excluded from the outer-edge dissolve calculation. Hair uses 1,450 swept directional locks. Rear head and torso complete the volume. Coherent ribbons and sparse depth particles extend the same material.

The runtime uses indexed `CoreFace` geometry and one interleaved particle buffer containing face skin, dissolve boundary, rear head, hair, neck/shoulders, streams and atmosphere. Each sample stores position, normal, colour group, seed, region, formation delay, size, boundary fade, disturbance resistance and brightness. The internal core is deliberately very dark and dithered, contributing depth without readable realistic skin.

All attributes are quantized to 16 bits and gzip-compressed at bake time. The browser decompresses with `DecompressionStream`, uploads typed arrays once, and animates in GLSL. The complete scene data is approximately 5.6 MB. Runtime dependencies are local; no CDN or package installation is required. Rebuilding requires Python, NumPy, Pillow and the original local reconstruction directory.

The explicit state progression is `BOOT → SCATTERED → FORMING → FACE_REVEAL → HAIR_REVEAL → BUST_COMPLETE → HERO_IDLE → SCROLL_DISSOLVE → PAGE_FLOW`. One scene persists across all states. Feature-region delays reveal eyes/nose before cheeks, jaw, hair and torso; the 4.3-second sequence settles into subtle drift. Cursor disturbance is local and bounded. Different regions follow scroll with different lag. Normal scrolling remains available.

## Quality tiers

| Region | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|
| Face | 82,000 | 41,000 | 27,333 |
| Rear head | 14,000 | 7,000 | 4,666 |
| Hair | 23,200 | 11,600 | 7,733 |
| Neck / torso | 56,000 | 28,000 | 18,666 |
| Streams | 5,590 | 2,795 | 1,863 |
| Atmosphere | 1,800 | 900 | 600 |
| Total draw count | 182,590 | 91,295 | 60,863 |
| Maximum DPR | 1.75 | 1.35 | 1.15 |

Counts by region are rounded; total comes from the single buffer. Mobile starts at LOW. Sustained frame rates below 32 trigger a downward tier adjustment; core geometry and identity do not change. `?portraitDev=1` displays GPU, renderer, FPS, DPR, quality, particle counts, state/progress, cursor, scroll, reduced motion and fallback, with replay, timeline and quality controls.

## Validation and evidence

Six existing portfolio tests pass. Browser validation covers 1920×1080, 1440×900, 1366×768, 390×844 and 320×640; English/Arabic round trips, RTL, overflow, paused rendering, reduced motion, deliberately unavailable WebGL, and local asset responses. Final results are in `evidence/validation.json`; no page errors or local 404s were observed. Actual `WEBGL_lose_context` loss/restoration is tested separately in `evidence/recovery.json`.

Edge headless used actual Intel UHD through ANGLE/Direct3D11. Desktop samples at DPR 1 measured roughly 91–123 FPS; browser mobile emulation reached the display scheduling limit. These are observations on this machine, not phone hardware benchmarks. Recording and concurrent QA can lower FPS and activate MEDIUM. No software-rendering result is presented as hardware performance.

The required still captures and MP4 are in `evidence/`. `portrait-full-motion.mp4` records the live GPU canvas at 60fps over a raster of the actual page, including real pointer and scroll input. `portrait-viewport-recording.mp4` separately records the uncomposited browser viewport, with a lower sampling rate due to screenshot overhead. The distinction is intentional and recorded in the JSON metadata. Normal-speed playback and quarter-second formation samples are retained in `evidence/video-frames/`, with review contact sheets.

Still captures cover intro start, forming, readable face, completion, idle, cursor interaction, three desktop widths, mobile and scroll. Additional Arabic, reduced-motion, fallback and context-recovery captures are included. Fallback is a rendering of the actual particle geometry; it is hidden during successful boot and shown only on failure. Final artifact hashes identify the precise source and evidence state.

## Scope and safety

Branch: `feat/cinematic-particle-portrait-v3`, created from current `main` at `ab071c3c6dbc9bbccd8efc913085a3d6ee5717fc`, confirmed against fetched `origin/main`. The original checkout and its uncommitted prototype changes were preserved. `main`, existing experiment branches, PR #3 and PR #4 were not modified. No merge or deployment was performed. GitHub Pages remains a static deployment; only the new branch is pushed and the new PR is a draft.

Changed implementation files: `index.html`, `assets/app.js`, new `assets/cinematic.css`, `assets/portrait.js`, the four compressed/metadata geometry assets and geometry-rendered fallback. Supporting files include the bake, preview, validation, recovery, recording and review scripts, this document and final visual evidence. Existing project, About, capability, journey, contact, navigation, assistant and bilingual content remain present.

## Practical limitations

Real mobile GPUs, Safari and Firefox have not been hardware-tested. Older browsers without WebGL2 or native gzip decompression receive the composed fallback. Procedural hair and torso preserve continuity but cannot reproduce missing measured anatomy. The photographic reference's gaze, clothing and hair cannot be reproduced exactly from a face-only mesh. The intro timeline starts when the scene assets are ready; network loading adds time before formation. No heavy bloom or depth-of-field postprocessing is used, so facial particles remain sharp.
