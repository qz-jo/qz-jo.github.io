# Identity → data: implementation and review

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
- A `BufferGeometry` / `Points` draw for the portrait and one for the ambient field:
  two draw calls in the active Hero, one once the portrait leaves the viewport.
- Surface samples use triangle area plus eye/brow/nose/mouth importance weights.
  Source texture luminance and sampled normals retain facial shading and landmarks.
- Geodesic distance from the actual 604-vertex mesh boundary controls density/opacity.
  Perimeter echoes dissolve outward, rather than revealing a clipped mask.
- Curl-like hair volume, sparse rear/side contours, and a fading neck/shoulder ghost
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
- Poster remains visible until the first WebGL render. Asset/module/context failures
  keep the poster and fully independent HTML controls. Context loss disposes resources.

## Quality and asset cost

| Tier | Portrait draw budget | DPR ceiling | Ambient budget | Active target |
|---|---:|---:|---:|---:|
| High | 76,000 | 1.5 | 720 | 60 FPS |
| Balanced | 43,000 | 1 | 420 | 30 FPS |
| Economy | 21,000 | 0.7 | 240 | 30 FPS |
| Mobile | 22,500 | 1 | 180 | 30 FPS |

Device hints select the initial tier; software WebGL starts balanced. Sustained
slow frame intervals and render submission cost lower resolution and draw ranges.
If economy cannot sustain 20 FPS, the mesh-derived static poster becomes the portrait
and only the quiet background renders at 8 FPS. This floor prevents a permanently
choppy face. Quality steps downward without oscillation.

Each point is stored in a deterministic 16-byte packed record, decoded into typed
arrays once. Only one tier asset is requested: high 1,303,480 bytes, balanced 688,008,
or mobile 360,008. The original 5.6 MB OBJ, other OBJ files, source photos, checkpoints,
and reconstruction renders are not shipped. The static poster is 199,664 bytes;
the local Three.js bundle is 531,251 bytes. No CDN or runtime OBJ parser is needed.
The optional production staging is 3.50 MiB across 28 files, including all quality
variants; a visitor does not download every variant. Historical video is omitted.

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
The browser uses **software SwiftShader**, so these are compatibility and fallback
observations, not claims about a physical desktop GPU or phone. Full unoptimized
desktop quality measured roughly 7–9 FPS here; reducing raster work and adding the
static quality floor prevents keeping that workload active. When the floor engages,
the face scrolls as a native static image and measured background FPS is intentionally
low. Mobile emulation keeps the live portrait with DPR 1 and a much smaller download.
Physical device GPU FPS, thermal behavior, battery use, and Safari remain unmeasured.

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

All tunable keys are in `portraitDev.config`: `faceDensity`, `particleSize`,
`faceBrightness`, `goldStrength`, `dissolveThreshold`, `dissolveDistance`, `edgeNoise`,
`ambientCount`, `flowSpeed`, `mouseSensitivity`, `headRotation`, `scrollInfluence`,
and `idleStrength`. No debug UI or control API is exposed on production hosts.
`?portraitFallback=1` provides a reviewable fallback mode on any host.

Regenerate the assets with Python, NumPy, SciPy, and Pillow:

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
- Unsupported or very slow WebGL hardware receives a static portrait.
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
