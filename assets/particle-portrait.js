import * as THREE from './vendor/three.js?v=portrait-core-1';

// Development-only tuning: localhost + ?portraitDev=1. Production exposes no panel/API.
const DEFAULTS = Object.freeze({
  faceDensity: 1, particleSize: 1.85, faceBrightness: 1.8, goldStrength: .12,
  dissolveThreshold: .58, dissolveDistance: .28, edgeNoise: .025,
  ambientCount: 720, flowSpeed: .24, mouseSensitivity: .7,
  headRotation: .10, scrollInfluence: .38, idleStrength: .044,
  dispersionStrength: .12, dispersionDistance: .34, hairDensity: 1, hairFlow: .16, formationSpeed: 1,
});

const vertex = /* glsl */`
  attribute vec4 art;
  attribute float seed;
  uniform float time, motion, scrollMix, pointSize, dpr, brightness, formation;
  uniform float dispersionStrength, dispersionDistance, hairDensity, hairFlow;
  uniform vec2 pointer;
  uniform float dissolveThreshold, dissolveDistance, edgeNoise, idleStrength, goldStrength;
  varying vec3 color;
  varying float opacity;
  void main() {
    float edge = art.y;
    float abstractPart = step(.5,art.w);
    float flow = smoothstep(dissolveThreshold, 1., edge);
    vec3 p = position;
    float phase = seed * 60.;
    float mid = smoothstep(.1,.7,edge);
    float hair = 1.-step(.5,abs(art.w-1.));
    // A static broken edge remains in reduced motion too; no traceable contour.
    p += edge*edge*.085*vec3(sin(phase),cos(phase*1.3),sin(phase*.7));
    float cycle=fract(seed+time*.095);
    float wake=sin(cycle*3.14159);
    p += motion * flow * dispersionStrength * (1.+dispersionDistance) * vec3(-wake,wake*.25,-wake*.4);
    p += motion * hair * hairFlow * vec3(sin(time*.6+phase)*.18,cos(time*.5+phase)*.18,sin(time*.45+phase)*.25);
    p.xy += motion * pointer * (mid*.025+abstractPart*.09);
    // Every point follows a staggered curved arrival to its own OBJ target.
    float core = (1.-abstractPart)*(1.-edge);
    float delay = mix(.30,.03,core)+hair*.12+seed*.16;
    float arrived = smoothstep(delay,min(.99,delay+.47),formation);
    vec3 origin = vec3((seed>.5?1.:-1.)*(2.8+seed),sin(phase)*1.8,-3.-seed*3.);
    vec3 arc=vec3(sin(phase*.3)*.45,cos(phase*.2)*.5,.4)*sin(arrived*3.14159);
    p=mix(origin,p,arrived)+arc*(1.-arrived);
    p += motion * (edgeNoise*flow+idleStrength*.08) * vec3(sin(time*.23+phase),cos(time*.19+phase),sin(time*.21+phase));
    // Structured facial points stay put; unsupported regions breathe and shed.
    p.x += motion * abstractPart * edge * .045 * sin(time*.48+phase);
    p.y += motion * abstractPart * edge * .045 * cos(time*.35+phase);
    p.x += motion * scrollMix * flow * dissolveDistance * (position.x>.0?1.:-1.);
    p.y -= motion * scrollMix * flow * dissolveDistance * .7;
    vec3 n = normalize(mat3(modelMatrix)*normal);
    float facing = smoothstep(-.22, .26, n.z);
    float flicker = 1.+motion*(.045+mid*.06)*sin(time*.7+phase);
    float light = .66+.34*max(dot(n,normalize(vec3(-.3,.55,1.))),0.);
    float value = art.x*brightness*light*flicker;
    float warm = goldStrength*smoothstep(.88,1.,seed)*(.3+.7*edge);
    color = mix(vec3(.88,.93,1.),vec3(1.,.65,.32),warm)*value;
    opacity = art.z * mix(facing,.80,abstractPart) * (1.-scrollMix*.18);
    opacity *= smoothstep(delay*.55,delay+.14,formation);
    opacity *= mix(1.,smoothstep(seed-.06,seed+.06,hairDensity),hair);
    opacity *= 1.-motion*flow*.16*(1.-wake);
    vec4 mv = modelViewMatrix*vec4(p,1.);
    gl_Position = projectionMatrix*mv;
    gl_PointSize = clamp(pointSize*dpr*(.55+seed*seed*1.05)*(1.+abstractPart*.2),.7,4.5*dpr);
  }
`;
const fragment = /* glsl */`
  varying vec3 color; varying float opacity;
  void main() {
    float r = length(gl_PointCoord-.5)*2.;
    if(r>1.) discard;
    float core = 1.-smoothstep(.15,1.,r);
    gl_FragColor=vec4(color,opacity*core);
  }
`;
const coreVertex = /* glsl */`
  attribute float tone;
  attribute float edgeFade;
  varying vec3 vNormal;
  varying float vTone, vEdgeFade;
  void main() {
    vNormal=normalize(normalMatrix*normal);
    vTone=tone;
    vEdgeFade=edgeFade;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
  }
`;
const coreFragment = /* glsl */`
  varying vec3 vNormal;
  varying float vTone, vEdgeFade;
  uniform float coreVisibility, brightness, scrollMix;
  void main() {
    vec3 n=normalize(vNormal);
    vec3 light=normalize(vec3(-.34,.52,.79));
    float diffuse=max(dot(n,light),0.);
    float rim=pow(1.-abs(n.z),2.);
    float textureTone=smoothstep(.055,.91,vTone);
    vec3 base=mix(vec3(.045,.052,.065),vec3(.33,.35,.38),textureTone);
    float illumination=.27+.65*diffuse+.08*rim;
    vec3 color=base*illumination*brightness+vec3(.026,.014,.005)*rim;
    float boundary=smoothstep(.008,.52,vEdgeFade);
    float alpha=boundary*coreVisibility*(1.-scrollMix*.20);
    if(alpha<.008)discard;
    gl_FragColor=vec4(color,alpha*.94);
  }
`;
const fieldVertex = /* glsl */`
  attribute vec4 art;
  uniform float time,motion,scrollY,pageHeight,width,height,originX,originY,flowSpeed,quiet,dpr,formation;
  varying vec3 color; varying float opacity;
  void main() {
    float t=position.y;
    float stream=art.w;
    float phase=art.x*6.28318;
    float travel=fract(t + motion*time*flowSpeed*.021);
    float y=mix(t,travel,stream);
    float docY=mix(y*pageHeight,originY+y*min(pageHeight*.66,5300.),stream);
    float lane=position.x;
    float path=originX+(width*.93-originX)*smoothstep(0.,.2,y);
    // Three coherent narrow paths; lower-page paths settle toward a faint data lattice.
    float curve=sin(y*12.+phase)*width*.023*(1.-y*.7);
    float x=mix(lane*width,path+curve+(lane-.5)*width*.10,stream);
    float grid=round(x/32.)*32.;
    x=mix(x,grid,smoothstep(.32,.64,y)*stream*.28);
    x+=motion*sin(time*.16+phase)*3.*(1.-y);
    float sy=docY-scrollY*(1.+position.z*.012);
    gl_Position=projectionMatrix*vec4(x,height-sy,position.z,1.);
    float decay=mix(.40,.028,smoothstep(0.,.80,docY/pageHeight));
    float clearText=stream>.5?1.:smoothstep(.20,.43,abs(lane-.5));
    opacity=art.y*decay*clearText*quiet*smoothstep(.05,.95,formation);
    color=mix(vec3(.72,.80,.90),vec3(.83,.64,.40),step(.91,art.x));
    gl_PointSize=dpr*(.9+art.z*1.2);
  }
`;

function decode(buffer, limit) {
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x31465053) throw new Error('Invalid portrait signature');
  const total=view.getUint32(4,true);
  if(buffer.byteLength!==8+total*16) throw new Error('Incomplete portrait asset');
  const count=Math.min(total,limit);
  const positions=new Float32Array(count*3), normals=new Float32Array(count*3);
  const art=new Float32Array(count*4), seeds=new Float32Array(count);
  for(let i=0;i<count;i++) {
    const offset=8+i*16;
    for(let j=0;j<3;j++) {
      positions[i*3+j]=view.getInt16(offset+j*2,true)/8192;
      normals[i*3+j]=view.getInt8(offset+6+j)/127;
    }
    for(let j=0;j<3;j++) art[i*4+j]=view.getUint8(offset+9+j)/255;
    art[i*4+3]=view.getUint8(offset+12);seeds[i]=view.getUint8(offset+13)/255;
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  geometry.setAttribute('art',new THREE.BufferAttribute(art,4));
  geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
  return geometry;
}

function decodeCore(buffer) {
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x31434653) throw new Error('Invalid facial mesh signature');
  const vertices=view.getUint32(4,true),indexCount=view.getUint32(8,true);
  const vertexOffset=12,indexOffset=vertexOffset+vertices*12;
  if(!vertices||!indexCount||buffer.byteLength!==indexOffset+indexCount*2) throw new Error('Incomplete facial mesh asset');
  const positions=new Float32Array(vertices*3),normals=new Float32Array(vertices*3);
  const tone=new Float32Array(vertices),edgeFade=new Float32Array(vertices),indices=new Uint16Array(indexCount);
  for(let i=0;i<vertices;i++) {
    const offset=vertexOffset+i*12;
    for(let j=0;j<3;j++) {
      positions[i*3+j]=view.getInt16(offset+j*2,true)/8192;
      normals[i*3+j]=view.getInt8(offset+6+j)/127;
    }
    tone[i]=view.getUint8(offset+9)/255;
    edgeFade[i]=view.getUint8(offset+10)/255;
  }
  for(let i=0;i<indexCount;i++)indices[i]=view.getUint16(indexOffset+i*2,true);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  geometry.setAttribute('tone',new THREE.BufferAttribute(tone,1));
  geometry.setAttribute('edgeFade',new THREE.BufferAttribute(edgeFade,1));
  geometry.setIndex(new THREE.BufferAttribute(indices,1));
  return geometry;
}

function staticDiagnostics(reason) {
  if(!['localhost','127.0.0.1'].includes(location.hostname)||new URLSearchParams(location.search).get('portraitDev')!=='1')return;
  document.querySelector('#portraitDiagnostics')?.remove();
  const data={staticFallback:true,reason,animationEnabled:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,introState:'hero',renderer:'not initialized',points:0,renderFPS:0};
  const panel=document.createElement('details');panel.id='portraitDiagnostics';panel.open=true;
  const label=document.createElement('summary');label.textContent='Portrait diagnostics · fallback';panel.append(label);
  const body=document.createElement('pre');body.textContent=JSON.stringify(data,null,2);panel.append(body);document.body.append(panel);
  window.portraitDev={stats:()=>data,config:{}};
}

export async function initPortrait() {
  const root=document.documentElement;
  const canvas=document.querySelector('#portraitCanvas');
  const stage=document.querySelector('#heroPortraitStage');
  if(!canvas || !stage) return;
  const params=new URLSearchParams(location.search);
  if(params.get('portraitFallback')==='1') { root.dataset.portrait='fallback';root.dataset.intro='hero';staticDiagnostics('Forced review fallback');return; }
  const mobile=matchMedia('(max-width: 940px)').matches;
  const constrained=navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory<=4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);
  let tier=mobile?'mobile':constrained?'balanced':'high';
  const budgets={high:76000,balanced:43000,economy:21000,mobile:22500,tiny:14000,micro:8000};
  const caps={high:1.25,balanced:1,economy:.75,mobile:1,tiny:.65,micro:.5};
  const cfg={...DEFAULTS};
  const dev=['localhost','127.0.0.1'].includes(location.hostname)&&params.get('portraitDev')==='1';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let enabled=root.dataset.motion!=='off'&&!reduced.matches;
  let renderer,geometry,coreGeometry,portrait,core,field,faceMaterial,coreMaterial,fieldMaterial,scene,camera;
  let raf=0,last=0,clock=0,visible=true,needsLayout=true,dirty=true,disposed=false;
  let docRect={x:0,y:0,w:0,h:0},width=0,height=0,pageHeight=0;
  let pointerX=0,pointerY=0,smoothedX=0,smoothedY=0;
  let frames=0,slow=0,badWindows=0,sampleStart=0,renderCount=0,lastRenderMs=0;
  let introRunning=false,introStart=0,introElapsed=0,hiddenAt=0,introFinishedAt=0;
  let stats,rafFPS=0,rafSamples=0,rafWindow=0;
  let diagnostics,diagnosticText,diagnosticLast=0,measureStart=0,measureFrames=0,renderFPS=0,gpuName='';
  let introWanted=params.get('intro')==='1';
  try { introWanted ||= !sessionStorage.getItem('saif-intro-v3'); } catch { introWanted=true; }
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  const cleanups=[];
  function finishIntro() {
    introRunning=false;introElapsed=5;introFinishedAt=performance.now();root.dataset.intro='hero';
    try { sessionStorage.setItem('saif-intro-v3','1'); } catch {}
    request();
  }
  function listen(target,event,fn,options) { target.addEventListener(event,fn,options);cleanups.push(()=>target.removeEventListener(event,fn,options)); }
  function fallback(reason='WebGL unavailable or context lost') {
    root.dataset.portrait='fallback';root.dataset.intro='hero';dispose();staticDiagnostics(reason);
  }
  function dispose() {
    if(disposed)return;disposed=true;cancelAnimationFrame(raf);raf=0;
    cleanups.forEach(fn=>fn());geometry?.dispose();coreGeometry?.dispose();field?.geometry.dispose();
    faceMaterial?.dispose();coreMaterial?.dispose();fieldMaterial?.dispose();renderer?.dispose();
    diagnostics?.remove();if(dev) delete window.portraitDev;
  }
  function request() {
    dirty=true;
    if(!raf&&!disposed&&!document.hidden) raf=requestAnimationFrame(frame);
  }
  try {
    // Explicit context check keeps unsupported hardware on the static supplied-face poster.
    const context=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:mobile?'low-power':'high-performance'});
    if(!context) { fallback();return; }
    // Software WebGL is useful for compatibility, but should not start at GPU quality.
    const info=context.getExtension('WEBGL_debug_renderer_info');
    const gpu=info?context.getParameter(info.UNMASKED_RENDERER_WEBGL):'';gpuName=gpu;
    if(!mobile&&/swiftshader|llvmpipe|software/i.test(gpu)) tier='economy';
    if(dev&&Object.hasOwn(budgets,params.get('portraitTier')))tier=params.get('portraitTier');
    renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:false});
    renderer.setClearColor(0x05070b,0);
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,caps[tier]));
    scene=new THREE.Scene();camera=new THREE.OrthographicCamera(0,1,1,0,-2000,2000);camera.position.z=1000;
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
    let buffer,coreBuffer;
    try {
      const asset=tier==='high'?'saif-particles.bin':`saif-particles-${tier==='mobile'?'mobile':'balanced'}.bin`;
      const responses=await Promise.all([
        fetch(new URL(`./portrait/${asset}?v=cinematic-3`,import.meta.url),{signal:controller.signal}),
        fetch(new URL('./portrait/saif-face-core.bin?v=core-1',import.meta.url),{signal:controller.signal}),
      ]);
      if(responses.some(response=>!response.ok))throw new Error('Portrait asset load failed');
      [buffer,coreBuffer]=await Promise.all(responses.map(response=>response.arrayBuffer()));
    } finally { clearTimeout(timeout); }
    geometry=decode(buffer,budgets[tier]);
    coreGeometry=decodeCore(coreBuffer);
    enabled=root.dataset.motion!=='off'&&!reduced.matches;
    const uniform=(value)=>({value});
    faceMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,
      transparent:true,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{time:uniform(0),motion:uniform(enabled?1:0),scrollMix:uniform(0),pointSize:uniform(cfg.particleSize),dpr:uniform(renderer.getPixelRatio()),brightness:uniform(cfg.faceBrightness),
        formation:uniform(1),dispersionStrength:uniform(cfg.dispersionStrength),dispersionDistance:uniform(cfg.dispersionDistance),hairDensity:uniform(cfg.hairDensity),hairFlow:uniform(cfg.hairFlow),pointer:uniform(new Float32Array(2)),dissolveThreshold:uniform(cfg.dissolveThreshold),dissolveDistance:uniform(cfg.dissolveDistance),edgeNoise:uniform(cfg.edgeNoise),idleStrength:uniform(cfg.idleStrength),goldStrength:uniform(cfg.goldStrength)}});
    portrait=new THREE.Points(geometry,faceMaterial);portrait.frustumCulled=false;portrait.renderOrder=2;scene.add(portrait);
    coreMaterial=new THREE.ShaderMaterial({vertexShader:coreVertex,fragmentShader:coreFragment,
      transparent:true,depthTest:true,depthWrite:true,blending:THREE.NormalBlending,
      uniforms:{brightness:uniform(.92),coreVisibility:uniform(0),scrollMix:uniform(0)}});
    core=new THREE.Mesh(coreGeometry,coreMaterial);core.frustumCulled=false;core.renderOrder=1.5;scene.add(core);
    const count=mobile?180:tier==='high'?cfg.ambientCount:420;
    const positions=new Float32Array(count*3),art=new Float32Array(count*4);
    // Seeded, once-only field allocation. No per-particle objects in the animation loop.
    let seed=834;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<count;i++) {
      const stream=i<count*.66;
      positions[i*3]=stream?.25+random()*.5:(random()<.5?random()*.12:.88+random()*.12);
      positions[i*3+1]=random()**1.8;positions[i*3+2]=-random()*30;
      art[i*4]=stream?Math.floor(random()*3)/3:random();
      art[i*4+1]=.24+random()*.7;art[i*4+2]=random();art[i*4+3]=stream?1:0;
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('art',new THREE.BufferAttribute(art,4));
    fieldMaterial=new THREE.ShaderMaterial({vertexShader:fieldVertex,fragmentShader:fragment,transparent:true,depthWrite:false,
      uniforms:{time:uniform(0),motion:uniform(enabled?1:0),scrollY:uniform(scrollY),pageHeight:uniform(1),width:uniform(1),height:uniform(1),originX:uniform(0),originY:uniform(0),flowSpeed:uniform(cfg.flowSpeed),formation:uniform(1),quiet:uniform(1),dpr:uniform(renderer.getPixelRatio())}});
    field=new THREE.Points(g,fieldMaterial);field.frustumCulled=false;field.renderOrder=1;scene.add(field);

    function layout() {
      width=innerWidth;height=innerHeight;pageHeight=root.scrollHeight;
      const r=stage.getBoundingClientRect();docRect={x:r.left,y:r.top+scrollY,w:r.width,h:r.height};
      camera.right=width;camera.top=height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
      // Facial coordinates retain original relative proportions; only uniform display scale.
      const scale=Math.min(docRect.w*.44,docRect.h*.30);
      portrait.scale.setScalar(scale);
      const u=fieldMaterial.uniforms;
      u.width.value=width;u.height.value=height;u.pageHeight.value=pageHeight;
      u.originX.value=docRect.x+docRect.w*.54;u.originY.value=docRect.y+docRect.h*.76;
      needsLayout=false;
    }
    initPortrait.layout=layout;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;request();},{rootMargin:'160px'});
    observer.observe(stage);cleanups.push(()=>observer.disconnect());
    const resizeObserver=new ResizeObserver(()=>{needsLayout=true;request();});resizeObserver.observe(document.body);resizeObserver.observe(stage);cleanups.push(()=>resizeObserver.disconnect());
    listen(window,'resize',()=>{needsLayout=true;request();},{passive:true});
    listen(window,'scroll',request,{passive:true});
    listen(document,'visibilitychange',()=>{
      if(document.hidden){frames=slow=badWindows=sampleStart=0;hiddenAt=performance.now();cancelAnimationFrame(raf);raf=0;last=0;}
      else {if(introRunning&&hiddenAt)introStart+=performance.now()-hiddenAt;hiddenAt=0;request();}
    });
    const hero=document.querySelector('#home');
    if(matchMedia('(pointer: fine)').matches) {
      listen(hero,'pointermove',e=>{pointerX=(e.clientX/innerWidth-.5)*2;pointerY=(e.clientY/innerHeight-.5)*2;},{passive:true});
      listen(hero,'pointerleave',()=>{pointerX=0;pointerY=0;});
    }
    const updateMotion=()=>{if(root.dataset.motion==='off'||reduced.matches)finishIntro();enabled=root.dataset.motion!=='off'&&!reduced.matches;faceMaterial.uniforms.motion.value=enabled?1:0;fieldMaterial.uniforms.motion.value=enabled?1:0;smoothedX=smoothedY=0;request();};
    listen(window,'portfolio-motion',updateMotion);listen(reduced,'change',updateMotion);
    listen(canvas,'webglcontextlost',e=>{e.preventDefault();fallback();});
    listen(window,'pagehide',e=>{if(!e.persisted)dispose();});
    listen(window,'pageshow',request);
    stats=()=>({tier,portraitStatic:false,staticFallback:false,renderFPS,rafFPS,time:clock,yaw:portrait.rotation.y,points:geometry.drawRange.count,coreTriangles:coreGeometry.index.count/3,allocatedPoints:geometry.attributes.position.count,dpr:renderer.getPixelRatio(),drawCalls:renderer.info.render.calls,renderCount,lastRenderMs,visible,enabled,reducedMotion:reduced.matches,documentHidden:document.hidden,introState:root.dataset.intro,introElapsed,pointer:[smoothedX,smoothedY],scrollMix:faceMaterial.uniforms.scrollMix.value,renderer:gpuName});
    if(dev) {
      window.portraitDev={config:cfg,set(values){for(const key of Object.keys(DEFAULTS))if(Number.isFinite(values[key]))cfg[key]=values[key];request();},stats,replay(){introRunning=enabled;introStart=performance.now();introElapsed=0;root.dataset.intro=enabled?'forming':'hero';request();},skip:finishIntro};
      diagnostics=document.createElement('details');diagnostics.id='portraitDiagnostics';
      const title=document.createElement('summary');title.textContent='Portrait diagnostics · localhost';diagnostics.append(title);
      diagnosticText=document.createElement('pre');diagnostics.append(diagnosticText);
      for(const [key,max] of Object.entries({faceDensity:1,particleSize:4,faceBrightness:3,goldStrength:1,dissolveThreshold:1,dissolveDistance:1,edgeNoise:.2,dispersionStrength:.5,dispersionDistance:1,hairDensity:1,hairFlow:.5,ambientCount:1000,flowSpeed:1,mouseSensitivity:2,headRotation:.2,idleStrength:.1,scrollInfluence:1,formationSpeed:2})){
        const label=document.createElement('label');label.append(key);const input=document.createElement('input');input.type='range';input.min=key==='formationSpeed'?.5:0;input.max=max;input.step=max/100;input.value=cfg[key];input.addEventListener('input',()=>{cfg[key]=Number(input.value);request();});label.append(input);diagnostics.append(label);
      }
      document.body.append(diagnostics);
    }
    listen(window,'portfolio-intro-skip',finishIntro);
    listen(document.querySelector('#introSkip'),'click',finishIntro);
    listen(window,'wheel',()=>{if(introRunning)finishIntro();},{passive:true});
    listen(window,'touchstart',()=>{if(introRunning)finishIntro();},{passive:true});
    listen(document,'keydown',e=>{if(introRunning&&['Escape','Tab','PageDown','ArrowDown',' '].includes(e.key))finishIntro();});
    listen(document,'click',e=>{if(introRunning&&e.target.closest('a,button')&&!e.target.closest('#portraitDiagnostics'))finishIntro();});
    // Warm shader compilation before the formation clock begins.
    await renderer.compileAsync(scene,camera);
    if(introWanted&&enabled&&scrollY<60&&root.dataset.intro!=='hero'){introRunning=true;introStart=performance.now();root.dataset.intro='forming';}
    else finishIntro();
    request();
  } catch(error) { if(dev)console.error('Portrait initialization/render failed',error);fallback(error.message); }

  function frame(now) {
    raf=0;if(disposed||document.hidden)return;
    rafSamples++;if(!rafWindow)rafWindow=now;if(now-rafWindow>1000){rafFPS=rafSamples*1000/(now-rafWindow);rafWindow=now;rafSamples=0;}
    try {
      if(needsLayout) initPortrait.layout();
      if(introRunning){introElapsed=(now-introStart)/1000*cfg.formationSpeed;root.dataset.intro=introElapsed<2.7?'forming':introElapsed<3.4?'assembled':introElapsed<4.6?'transition':'hero';if(introElapsed>=4.6)finishIntro();}
      const formation=introRunning?smooth(.25,3.2,introElapsed):1;
      const transition=introRunning?smooth(3.35,4.6,introElapsed):1;
      const fps=visible?(tier==='high'?60:30):(scrollY>pageHeight*.85?8:18);
      if(enabled&&last&&now-last<1000/fps-.8) {raf=requestAnimationFrame(frame);return;}
      const interval=last?now-last:0;
      const elapsed=last?Math.min((now-last)/1000,.25):1/60;last=now;
      if(enabled)clock+=elapsed;
      const lerp=1-Math.exp(-elapsed*4);
      smoothedX+=(pointerX-smoothedX)*lerp;smoothedY+=(pointerY-smoothedY)*lerp;
      const scrollMix=Math.min(1,Math.max(0,(scrollY-docRect.y*.2)/Math.max(docRect.h,1)))*cfg.scrollInfluence;
      portrait.visible=introRunning||docRect.y+docRect.h+120>scrollY&&docRect.y-120<scrollY+height;
      core.visible=portrait.visible;
      const finalX=docRect.x+docRect.w*.50, finalY=height-(docRect.y-scrollY+docRect.h*.44)-scrollMix*12;
      const finalScale=Math.min(docRect.w*.44,docRect.h*.30),introScale=Math.min(width*.27,height*.265);
      portrait.scale.setScalar(introScale+(finalScale-introScale)*transition);
      portrait.position.set(width*.50+(finalX-width*.50)*transition,height*.53+(finalY-height*.53)*transition+(enabled?Math.sin(clock*.6)*1.8:0),0);
      portrait.rotation.set(enabled?smoothedY*cfg.headRotation*cfg.mouseSensitivity+Math.sin(clock*.31)*.015:0,.04+.34*transition+(enabled?smoothedX*cfg.headRotation*cfg.mouseSensitivity+Math.sin(clock*.40)*cfg.idleStrength:0),0);
      core.scale.copy(portrait.scale);core.position.copy(portrait.position);core.rotation.copy(portrait.rotation);
      geometry.setDrawRange(0,Math.max(1,Math.floor(Math.min(budgets[tier],geometry.attributes.position.count)*Math.max(.1,Math.min(1,cfg.faceDensity)))));
      const u=faceMaterial.uniforms;u.time.value=clock;u.scrollMix.value=enabled?scrollMix:0;u.formation.value=formation;u.pointer.value[0]=smoothedX;u.pointer.value[1]=smoothedY;
      coreMaterial.uniforms.coreVisibility.value=introRunning?smooth(1.95,3.12,introElapsed):1;
      coreMaterial.uniforms.scrollMix.value=enabled?scrollMix:0;
      for(const [key,param] of Object.entries({pointSize:'particleSize',brightness:'faceBrightness',goldStrength:'goldStrength',dissolveThreshold:'dissolveThreshold',dissolveDistance:'dissolveDistance',edgeNoise:'edgeNoise',idleStrength:'idleStrength',dispersionStrength:'dispersionStrength',dispersionDistance:'dispersionDistance',hairDensity:'hairDensity',hairFlow:'hairFlow'}))u[key].value=cfg[param];
      u.pointSize.value*=Math.min(1.65,Math.sqrt(43000/geometry.drawRange.count));
      const fieldBudget=tier==='high'?720:tier==='balanced'?420:tier==='economy'?240:tier==='micro'?90:180;
      field.geometry.setDrawRange(0,Math.min(fieldBudget,field.geometry.attributes.position.count,Math.max(0,Math.floor(cfg.ambientCount))));
      const f=fieldMaterial.uniforms;f.time.value=clock;f.scrollY.value=scrollY;f.flowSpeed.value=cfg.flowSpeed;
      f.formation.value=formation;f.quiet.value=1-Math.min(.8,scrollY/pageHeight*.8);
      const begin=performance.now();renderer.render(scene,camera);lastRenderMs=performance.now()-begin;renderCount++;
      if(root.dataset.portrait!=='ready') root.dataset.portrait='ready';
      measureFrames++;if(!measureStart)measureStart=now;
      if(now-measureStart>1000){renderFPS=measureFrames*1000/(now-measureStart);measureFrames=0;measureStart=now;}
      if(dev&&now-diagnosticLast>450){diagnosticLast=now;diagnosticText.textContent=JSON.stringify(stats(),null,2);}
      dirty=false;
      // Quality reductions preserve an animated face. Static is reserved for
      // deliberate reduced motion/pause or unavailable WebGL, not slow hardware.
      if(enabled&&visible&&!needsLayout&&!introRunning&&now-introFinishedAt>2500&&tier!=='micro') {
        if(!sampleStart)sampleStart=now;
        if(interval>0&&interval<2000){frames++;if(interval>(tier==='high'?29:43)||lastRenderMs>18)slow++;}
        if(now-sampleStart>2000&&frames>=5){
          badWindows=slow/frames>.65?badWindows+1:0;
          if(badWindows>=2){
            badWindows=0;
            tier=({high:'balanced',balanced:'economy',economy:'tiny',mobile:'tiny',tiny:'micro'})[tier];
            renderer.setPixelRatio(Math.min(devicePixelRatio||1,caps[tier]));
            renderer.setSize(width,height,false);u.dpr.value=f.dpr.value=renderer.getPixelRatio();
            root.dataset.portraitQuality=tier;
          }
          frames=slow=0;sampleStart=now;
        }
      }
      if(enabled)raf=requestAnimationFrame(frame);
    } catch(error) { if(dev)console.error('Portrait initialization/render failed',error);fallback(error.message); }
  }
}
