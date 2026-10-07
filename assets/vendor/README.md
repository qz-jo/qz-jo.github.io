# Three.js

`three.js` is a local, tree-shaken ESM bundle of Three.js **0.186.1** (MIT),
containing the WebGL renderer and the nine exports used by the portrait.
It has no CDN dependency. License: `THREE-LICENSE.txt`.

Rebuild outside the deployed tree with npm `three@0.186.1` and `esbuild@0.25.12`:

```js
// entry.js
export { WebGLRenderer, Scene, OrthographicCamera, Points, Mesh, BufferGeometry,
  BufferAttribute, ShaderMaterial, NormalBlending } from 'three';
```

```sh
npx esbuild@0.25.12 entry.js --bundle --minify --format=esm --legal-comments=eof --outfile=assets/vendor/three.js
```
