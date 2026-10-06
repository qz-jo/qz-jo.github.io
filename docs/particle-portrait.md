# Hybrid identity → data: implementation and review

Branch: `feat/identity-particle-portrait`. Main and the public deployment are unchanged.

## Repository inspection

The existing repository is a framework-free bilingual HTML/CSS/JavaScript portfolio.
GitHub reports Pages enabled; `.nojekyll`, root `index.html`, and `CNAME` (`saif.codes`)
provide the static deployment shape. There is no checked-in Actions workflow or backend.
The Pages administration endpoint is unavailable through the connection, so its UI
source setting was not changed or independently verified.

The original Hero ran a 720p video, a canvas network with pairwise line comparisons,
and a mouse-shifted WebP photograph. Its typography is system sans + monospace, with
a locally hosted Arabic font and cyan/violet/green lighting. The new Hero removes
the video request, old canvas loop, and photograph motion. The established typography,
navigation, About photograph, capabilities, eight projects, matching and details,
proof section, journey/education, contact email draft, meeting link, footer, SEIF.OS,
command palette, translations, and clock remain. Existing card/reveal/marquee effects
remain lightweight CSS. Lighting is harmonized toward silver with restrained gold.

## Hybrid portrait revision (reference feedback)

The rejected screenshot was a white point-cloud scan. The reference instead combines
recognizable shaded facial information, dense particle skin and directional dissolution.
The renderer was rebuilt around that hierarchy after inspecting both images side by side.
Every facial layer still comes from Saif's real `mesh3.obj` and supplied reconstruction UV
texture. The reference supplies artistic direction only; no reference-person geometry,
photograph projection or generated identity is used.

1. **Shaded core:** an indexed, textured original-mesh surface with a custom key/fill
   shader, dark warm/cool tonal information, subtle specular highlights and porous
   geodesic fading well before the unsupported outer perimeter.
2. **Particle skin and hair:** surface-conforming original OBJ samples retain UV color,
   normals and landmark-weighted density. Size, opacity, luminance and depth vary.
   Actual forehead/temple roots feed layered curved curl clumps that flow backward;
   only their unsupported extensions are procedural.
3. **Dissolution:** ten actual-root cubic Bezier lanes carry detached particles at
   different real Z depths, with controlled turbulence, tapering and a few larger glows.
   Jaw ribbons dissolve downward and connect with the page field.

The OBJ has two disconnected boundary loops: **512 outer vertices and 92 mouth
vertices**. The old fade treated the mouth as an unsupported perimeter and erased the
lips. Only the outer component now controls dissolution; the mouth and facial features
remain. Core and particle textures both follow the 3D UV surface rather than a flat photo.

The reconstruction's +Y-down orientation remains corrected by a right-handed rigid
UV eye/chin frame. Assertions verify level eyes, chin below eyes and nose forward.
No facial proportions are manually reshaped. The core is reduced from 56,572 to
12,000 triangles by border-preserving quadric simplification. UVs, normals and dissolve
weights are reprojected onto original triangles; projection error is recorded in the mesh
report. Particle targets continue to sample the **full original geometry**.

The opening is a single approximately **5.6-second** shot after assets/shaders are ready:
black stage, sparse distant particles, designed inward curved arrivals, eyes/nose,
mouth/cheeks, soft shaded form, then hair and escaping streams. Feature delays blend
spatially instead of showing rectangular strips. The completed centered portrait holds
briefly, then the same group rotates, scales and moves right. Core moves first; surface
points lag slightly and detached points lag more, creating trailing motion as Hero copy
appears. A perspective camera gives actual depth to the composition.

Skip works while loading, wheel/touch/navigation keys preserve native scrolling,
`?intro=1` replays, and session storage avoids compulsory repeat playback. Reduced
motion skips arrival and renders the same hybrid portrait still. Hair/outer flow remain
alive normally; core shape remains almost stable. Three faint continuous trajectories
and a shrinking particle field guide the page toward quiet data-like paths at the footer.

The high tier contains 50,000 real face samples, 18,000 hair samples and 8,000 artistic
edge/neck/extension samples. Progressive prefixes retain this approximate hierarchy;
**the shaded core survives every quality tier**. Slow rendering reduces auxiliary field,
foreground and stream complexity before reducing the portrait tier/DPR. Poster fallback is used for genuine failures; explicit pause/reduced motion retain
a still WebGL hybrid scene. Slow devices continue animating at reduced quality. The fallback poster is captured from the same WebGL objects and shaders,
then composited over the site background with correct transparency.

Visual captures are actual browser rendering. Acceptance on the user's real browser
remains distinct from headless software compatibility measurements.

## Mesh comparison and choice

All four supplied OBJ files have 28,588 vertices and 56,572 triangles. Their camera
poses differ substantially; directly comparing raw bounding boxes would be misleading.
The generator centers every mesh and fits a rigid Procrustes rotation to mesh0 before
comparing corresponding vertices. It also inspects the actual triangle perimeter.

| Mesh | Pose-aligned mean difference to mesh0 | Source-view assessment |
|---|---:|---|
| mesh0 | 0 mm (reference) | Close frontal reference; slightly parted source lips |
| mesh1 | 1.3855 mm | Distant pool photograph; less source detail for judging landmarks |
| mesh2 | 0.8738 mm | Close view with more head tilt and expression |
| **mesh3** | **1.6078 mm** | Calm closed-mouth expression, clear three-quarter nose/jaw view |

**mesh3 supplies every facial surface point.** The selection is an artistic judgment
supported by aligned geometry and the supplied render/landmark images, not a claim that
the residual measures reconstruction accuracy. The four meshes are largely the same
identity with small expression changes. Forehead, cheeks, chin, jaw, and nose remain
the supplied surface after rigid orientation and uniform scale; they are not reshaped.
Source file hashes and counts are recorded in `mesh-analysis.json`.

The reference image guided palette and dissolution only. No new face was generated.

## Architecture

- One decorative fixed WebGL2 canvas, one self-hosted Three.js scene and perspective camera.
- One shaded core mesh, one particle-skin/hair draw, one Bezier stream draw, and sparse hair curl filaments under the point clumps, and two
  inexpensive page field draws (points + three faint line paths): six active draws,
  two after the portrait leaves the viewport. No per-particle JavaScript objects.
- Typed arrays decode deterministic packed geometry once. GLSL handles formation,
  position/brightness drift, core shading, per-layer inertia and damped pointer parallax.
- Geodesic density/opacity uses the **outer** boundary component only. Core fades sooner
  than its particle shell; directed extensions hide the unsupported head/neck geometry.
- Hair clumps are rooted in actual forehead/temple surface points. Ten cubic curves start
  at the supplied temple, forehead, rear cheek and jaw; two include forward Z-depth lanes.
- Three page paths emerge near the portrait and settle toward the right gutter. Sparse
  particles follow them; both activity and brightness taper toward the footer.
- Native scroll remains unchanged. Canvas pointer events are disabled; Hero pointer events
  feed interpolation without interfering with text selection, links or keyboard controls.
- ResizeObserver maintains layout; IntersectionObserver removes the entire portrait group
  offscreen. Hidden tabs cancel RAF. Lower field caps are 18 FPS, then 8 near the footer.
- Pause/reduced motion render a still hybrid scene without continuous RAF; layout/scroll
  requests refresh it. Poster stays until the first render and survives asset/module,
  texture and context failures. Production has no diagnostics panel or tuning API.

## Quality and asset cost

| Tier | Portrait draw budget | DPR ceiling | Ambient budget | Active target |
|---|---:|---:|---:|---:|
| High | 76,000 | 1.25 | 720 | 60 FPS |
| Balanced | 43,000 | 1 | 420 | 30 FPS |
| Economy | 21,000 | 0.75 | 240 | 30 FPS |
| Mobile | 22,500 | 1 | 180 | 30 FPS |
| Tiny | 14,000 | 0.65 | 180 | 30 FPS |
| Micro | 8,000 | 0.5 | 90 | 30 FPS |

Device hints select the initial tier; detected software WebGL starts economy, or tiny on viewports at least 1700px wide.
Auxiliary stream/ambient/foreground complexity is reduced first.
The intro and a 2.5-second settling interval are excluded from quality decisions.
Two consecutive slow two-second measurement windows are required before each downgrade.
Desktop requests the performance adapter; mobile requests the low-power adapter.
DPR and point count decrease through the tiny and micro tiers while the face keeps
animating. This controller never automatically turns the portrait into a static image.
A real WebGL/context/asset failure retains the supplied-mesh poster; deliberate pause
and reduced motion retain a still WebGL portrait. Physical GPUs are not classified from
SwiftShader measurements. Quality only moves downward within a page load.
Each surface/hair point is stored in a deterministic 16-byte record, including packed UV.
Only one point-tier asset is requested: high 1,216,008 bytes, balanced 688,008 or mobile
360,008. The additional core asset includes the optimized indexed surface, ten curve
controls and sparse curl filaments; texture is a compact reconstruction WebP. Core + flow/curl data: 341,332 bytes. Albedo: 80,808 bytes. The poster and self-hosted
Three.js sizes are recorded by the local production build. Only one point quality file
is loaded per visit. Original 5.6 MB OBJs and source
photos/renders are not shipped. Self-hosted Three.js needs no CDN or runtime OBJ parser.

## Validation and performance scope

The six existing unit tests pass. Independent GPU captures disable each portrait
layer in turn and measure central-face pixels, proving both the shaded core and
particle skin are actually visible. This catches silent shader uniform shadowing
that a ready-canvas/FPS check alone would miss. Production staging validates local HTML assets.
Real Chromium tests cover 1920×1080, 1440×900, 1366×768, and 390×844; English/Arabic
round trips; project matching/details; desktop command palette; mobile navigation;
motion pause/resume; reduced motion; forced fallback; missing WebGL; failed particle/core binaries, texture
and module loads; a simulated Page Visibility event; production debug exclusion;
and a project Pages URL subpath. No local asset 404s or application/shader console
errors occurred in the normal layout runs. The optional external GitHub repository
count is isolated with an empty successful fixture, preserving its static count.

`browser-validation.json` contains the exact measurements and quality decisions.
The browser uses **software SwiftShader**, so these are compatibility observations,
not claims about a physical desktop GPU or phone. The revised controller preserves
animation even at its lowest tier. Exact settled render rates and selected budgets are
stored in the JSON report. Measured software-only rates in the final responsive run:

| Viewport | Render FPS | Tier | Points | DPR | Active draws |
|---|---:|---|---:|---:|---:|
| 1920x1080 | 19.5 | tiny | 14,000 | 0.65 | 6 |
| 1440x900 | 22.4 | economy | 21,000 | 0.75 | 6 |
| 1366x768 | 22.8 | economy | 21,000 | 0.75 | 6 |
| 390x844 | 25.4 | mobile | 22,500 | 1 | 6 |

Current settled software rendering rates and quality states are recorded in
`browser-validation.json`; they must not be interpreted as physical GPU/phone FPS.
Actual idle/pointer/intro motion checks are recorded in `motion-validation.json` and
the timestamp-preserving screencast. The core stays visible when quality is reduced.

Physical GPU FPS, battery/thermal behavior and Safari remain
unmeasured. The user will judge the artistic result on their actual machine.

`motion-validation.json` records the natural intro, same-canvas transition, five-second
idle interval, mouse response, session replay, explicit skip and skip-during-loading.
`portrait-motion.mp4` is a timestamp-preserving Chromium screencast. It includes actual
formation, settling, idle, pointer response and scrolling. It is not a hardware benchmark.
The diagnostics panel is hidden for clean screenshots/recording only.
The screenshot captures are actual browser output. Desktop software quality can
step downward during the run; a capable GPU starts with the full portrait budget.

## Preview the branch

```sh
git clone --branch feat/identity-particle-portrait https://github.com/qz-jo/qz-jo.github.io.git
cd qz-jo.github.io
python -m http.server 8000
```

Open `http://localhost:8000`. Serve over HTTP; opening `index.html` as a file does not
support module and binary fetches reliably. Alternatively download this branch's ZIP,
extract it, and run the same Python command inside its folder.

For the exact staged production files (Node 20+):

```sh
node tools/build.mjs
python -m http.server 8000 --directory dist
```

No change to Pages settings is needed for review. This branch has not been merged or
deployed over main. Merging later can retain the existing root Pages deployment.

## Developer tuning and reproduction

On localhost only, open `/?portraitDev=1`, then use the browser console:

```js
portraitDev.set({ particleSize: 1.8, goldStrength: .2, headRotation: .045 });
portraitDev.stats();
```

The localhost query also shows a collapsible diagnostics panel: browser RAF FPS,
render FPS, tier, points, DPR, enabled/visible/reduced/hidden state, time, pointer,
scroll, intro phase and WebGL renderer. No panel or API exists on production hosts.
Open `http://localhost:8000/?portraitDev=1&intro=1` to replay with diagnostics.
`portraitDev.replay()` and `portraitDev.skip()` are available locally.
`?portraitDev=1&portraitTier=high` can force the initial tier for artistic inspection;
it still adapts, and should not be confused with a measured physical GPU.

All tunable keys are in `portraitDev.config`: `faceDensity`, `particleSize`,
`faceBrightness`, `goldStrength`, `dissolveThreshold`, `dissolveDistance`, `edgeNoise`,
`ambientCount`, `flowSpeed`, `mouseSensitivity`, `headRotation`, `scrollInfluence`,
`idleStrength`, `dispersionStrength`, `dispersionDistance`, `hairDensity`, `hairFlow`,
and `formationSpeed`. Hybrid controls also include `coreOpacity`, `coreBrightness`,
`surfaceDensity`, `particleOpacity`, `colorMix`, `warmStrength`, `boundaryDissolve`,
`hairBrightness`, `streamStrength`, `streamCurvature`, `streamTurbulence`,
`foregroundCount`, `depthRange`, `mouseParallax`, `formationDuration`, and `formationSpread`. No debug UI or control API is exposed on production hosts.
`?portraitFallback=1` provides a reviewable fallback mode on any host.

Regenerate the assets with Python, NumPy, SciPy, Pillow and fast-simplification:

```sh
python tools/sample-portrait.py /path/to/extracted/my-face-512
```

After regenerating geometry, build and refresh the actual-render fallback poster:

```sh
node tools/build.mjs
CHROME_PATH=/path/to/chrome PLAYWRIGHT_MODULE=/path/to/playwright node tools/capture-fallback.cjs
node tools/build.mjs
```

The capture utility requires Pillow, uses the same shader scene, preserves alpha during
background composition and writes the production WebP. It never generates a new face.

Run the browser suite with Playwright and a Chromium executable:

```sh
node tools/build.mjs
CHROME_PATH=/path/to/chrome PLAYWRIGHT_MODULE=/path/to/playwright node tools/validate-browser.cjs
```

The suite starts its own localhost server when `BASE_URL` is omitted. This makes
tests and their HTTP server share the same environment even in isolated workspaces.

## Known limitations

- Source reconstruction quality limits likeness; there is no authentic rear skull,
  ear, hair, or neck mesh. Those regions are intentionally abstract and fade away.
- The default view is curated and pointer rotation is limited. It is not a 360° head.
- Unavailable/lost WebGL or failed required assets receive a static portrait; slow
  devices progressively reduce live quality. Lowest tiers contain less facial detail.
- Actual GitHub Pages branch deployment was not activated; root/subpath asset serving
  was tested locally. Physical hardware/Safari performance needs review on those devices.

## Screenshots

- [Current hybrid versus artistic reference](screenshots/hybrid-reference-comparison.jpg)

- [High-tier hybrid Hero](screenshots/desktop-high.png)
- [Desktop Hero, 1440×900](screenshots/desktop-1440.png)
- [Hero slightly scrolled](screenshots/hero-scrolled.png)
- [Middle-page transition](screenshots/middle-transition.png)
- [Mobile Hero, 390×844](screenshots/mobile-hero.png)
- [1920×1080](screenshots/desktop-1920.png) / [1366×768](screenshots/desktop-1366.png)
- [Arabic](screenshots/arabic-hero.png) / [Reduced motion](screenshots/reduced.png)
- [Fallback](screenshots/fallback.png) / [WebGL unavailable](screenshots/no-webgl.png)
- [Missing binary](screenshots/asset-failure.png) / [Missing module](screenshots/module-failure.png)

- [Intro forming](screenshots/intro-forming.png) / [Assembled centered face](screenshots/intro-complete.png)
- [Actual motion recording](screenshots/portrait-motion.mp4)
