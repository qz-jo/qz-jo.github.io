# Identity → data: implementation and review

Branch: `feat/particle-portrait-core-face`. This is a separate review branch; main,
the public deployment, and the existing draft PR are unchanged.

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

## Cinematic revision (review feedback)

The initial version kept the reconstruction's camera **+Y-down** convention while
displaying it in a +Y-up scene; its quality controller could also stop the portrait
after a single short economy sample below 20 FPS. The failed-implementation screenshot
mentioned in the brief was not attached, so no direct screenshot comparison is claimed.
The axis and single-sample stop paths are confirmed in source and have been corrected.
Mesh3 is rigidly oriented with a right-handed frame derived from the supplied UV eye
centers and chin. Automated geometric checks assert level eyes, chin below eyes and nose
forward. No facial proportions were edited.

The revised opening is one continuous scene: darkness, a softly shaded face surface,
staggered particle arrival, then the same mesh-and-points portrait translates,
scales and rotates into the right-side Hero while the original bilingual copy appears
on the left. On mobile it settles into the dedicated stacked portrait area. Formation
resolves the central face first; hair and peripheral particles arrive later. A shader
computes curved initial positions and per-particle delays from packed attributes and
seeds. There is no second face, canvas, reload or fade-to-black swap. The complete
sequence lasts about 4.6 seconds after buffers and shaders are ready. Skip, wheel,
touch and navigation keys release it. The skip action also works while assets load.
Session storage remembers the intro; `?intro=1` forces replay. Reduced motion skips
particle flight immediately.

The full geodesic boundary is now faded to zero rather than retaining an opacity floor.
Directed escape particles originate throughout an interior geodesic band, avoiding
concentric echoes of the perimeter. Hair uses curved clusters rooted at the actual
forehead/temple geometry, with varied depth and backward flow; the old hemisphere is
gone. Jaw-rooted ribbons suggest neck/shoulder direction and dissolve downward. Eight
restrained curved paths connect the head gesture to the page-level streams. These
extensions remain artistic abstractions, not a reconstructed authentic skull.

The shaded core uses topology-preserving quadric edge collapse on `mesh3`, with
per-vertex normals and luminance sampled from its supplied diffuse map. It keeps 7,123
vertices and 14,000 indexed triangles; a shader provides directional shading and fades
the open reconstruction boundary. The full-resolution true-surface points are layered
in front.
About 74% of the 76,000 high-tier samples come directly from the real facial surface;
this ratio is retained in smaller prefixes so low quality spends its budget on identity.
Particle size, opacity, texture luminance, surface normals and region behavior vary.
Core points remain almost attached, middle regions breathe, and edges/hair/streams move
more visibly. Frame scheduling now honors the render cap during native scrolling too.

Visual acceptance remains subject to the user's real browser review. The software
captures show the actual renderer, not generated mockups or the reference person's face.

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

- One decorative fixed WebGL2 canvas, one Three.js scene, one orthographic camera.
- Three active-Hero draws: shaded `Mesh` core, `Points` portrait and ambient `Points`
  field. Only the field draws after the portrait leaves the viewport.
- Surface samples use triangle area plus eye/brow/nose/mouth importance weights.
  Source texture luminance and sampled normals retain facial shading and landmarks.
- The actual source topology and smooth normals provide a shaded surface beneath the
  points; a geodesic fade conceals the reconstruction's open cut boundary.
- Geodesic distance from the actual 604-vertex mesh boundary controls density/opacity.
  The perimeter reaches zero opacity; interior-band emission disrupts the outline.
- Rooted curved hair clusters, interior-band escape streams, and a fading jaw/neck ribbon
  are procedural abstractions. They do not replace or fabricate the facial geometry.
- Shader uniforms handle tiny breathing, brightness, peripheral movement, scroll,
  and interpolated pointer rotation. No per-particle JavaScript objects are animated.
- Three coherent particle stream paths emerge at the portrait, bend toward the right
  margin, and settle loosely toward a data lattice lower down. Density and brightness
  decrease with document depth; text and clean project cards stay above the field.
- Normal browser scrolling remains intact. Canvas pointer events are disabled; the
  portrait observes pointer movement on the Hero without intercepting links or buttons.
- Resize/section expansion updates layout via `ResizeObserver`; `IntersectionObserver`
  controls Hero activity. Hidden tabs stop RAF entirely. Below Hero the field renders
  at up to 18 FPS; near the footer at up to 8 FPS.
- Reduced motion and the existing pause button render a still portrait, with no
  continuous RAF loop. Layout and scroll changes request a fresh static frame.
- Poster remains visible until the first WebGL render and combines the shaded projected
  surface with particles. Asset/module/context failures keep it and fully independent
  HTML controls. Context loss disposes both mesh and point resources.

## Quality and asset cost

| Tier | Portrait draw budget | DPR ceiling | Ambient budget | Active target |
|---|---:|---:|---:|---:|
| High | 76,000 | 1.25 | 720 | 60 FPS |
| Balanced | 43,000 | 1 | 420 | 30 FPS |
| Economy | 21,000 | 0.75 | 240 | 30 FPS |
| Mobile | 22,500 | 1 | 180 | 30 FPS |
| Tiny | 14,000 | 0.65 | 180 | 30 FPS |
| Micro | 8,000 | 0.5 | 90 | 30 FPS |

Device hints select the initial tier; detected software WebGL starts economy.
The intro and a 2.5-second settling interval are excluded from quality decisions.
Two consecutive slow two-second measurement windows are required before each downgrade.
Desktop requests the performance adapter; mobile requests the low-power adapter.
DPR and point count decrease through the tiny and micro tiers while the face keeps
animating. This controller never automatically turns the portrait into a static image.
A real WebGL/context/asset failure retains the supplied-mesh poster; deliberate pause
and reduced motion retain a still WebGL portrait. Physical GPUs are not classified from
SwiftShader measurements. Quality only moves downward within a page load.
Each point is stored in a deterministic 16-byte packed record, decoded into typed
arrays once. Only one tier asset is requested: high 1,216,008 bytes, balanced 688,008,
or mobile 360,008. The 7,123-vertex / 14,000-triangle mesh core is 169,488 bytes; the
static poster is 167,414 bytes. The original 5.6 MB OBJ, other OBJ files, source photos,
checkpoints, and reconstruction renders are not shipped. The local Three.js bundle is
531,365 bytes. No CDN or runtime OBJ parser is needed. Production staging is 3.56 MiB
across 29 files, including all quality variants; a visitor does
not download every variant. Historical video is omitted.

## Validation and performance scope

The six existing unit tests pass. Production staging validates local HTML assets.
Real Chromium tests cover 1920×1080, 1440×900, 1366×768, and 390×844; English/Arabic
round trips; project matching/details; desktop command palette; mobile navigation;
motion pause/resume; reduced motion; forced fallback; missing WebGL; failed binary
and module loads; a simulated Page Visibility event; production debug exclusion;
and a project Pages URL subpath. No local asset 404s or application/shader console
errors occurred in the normal layout runs. The optional external GitHub repository
count is isolated with an empty successful fixture, preserving its static count.

`browser-validation.json` contains the exact measurements and quality decisions.
The browser uses **software SwiftShader**, so these are compatibility observations,
not claims about a physical desktop GPU or phone. The revised controller preserves
animation even at its lowest tier. Exact settled render rates and selected budgets are
stored in the JSON report. With the shaded mesh core, settled software runs measured
13.3 render FPS at 1920×1080, 18.1 at 1440×900 and 19.7 at 1366×768 (tiny tier,
14,000 points, DPR .65), and 25.6 at 390×844 (mobile tier, 22,500 points, DPR 1).
Each portrait remained live. The controller lowered desktop point budgets to tiny in
this software-only environment; actual GPU performance and quality selection can differ.
A five-second idle capture comparison changed 20.7% of portrait-region pixels by more
than five channel levels, and mouse input changed the damped yaw. These are visible-motion
checks, not merely a running RAF counter.

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
git clone --branch feat/particle-portrait-core-face https://github.com/qz-jo/qz-jo.github.io.git
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
and `formationSpeed`. No debug UI or control API is exposed on production hosts.
`?portraitFallback=1` provides a reviewable fallback mode on any host.

Regenerate the assets with Python, NumPy, SciPy, `fast-simplification`, and Pillow:

```sh
python tools/sample-portrait.py /path/to/extracted/my-face-512
```

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
