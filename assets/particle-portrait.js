import * as THREE from './vendor/three.js';

// Development-only tuning: localhost + ?portraitDev=1. Production exposes no panel/API.
const DEFAULTS = Object.freeze({
  surfaceDensity: 1, hairBrightness: 1.45, faceDensity: 1, particleSize: 1.45, faceBrightness: 1.7, goldStrength: .18,
  coreOpacity: .90, coreBrightness: .92, particleOpacity: .76, colorMix: .67, warmStrength: .35, boundaryDissolve: .65,
  streamStrength: 1.15, streamCurvature: 1, streamTurbulence: .035, foregroundCount: 60, depthRange: 1, mouseParallax: 1, formationDuration: 5.6, formationSpread: 1,
  dissolveThreshold: .58, dissolveDistance: .28, edgeNoise: .025,
  ambientCount: 720, flowSpeed: .24, mouseSensitivity: .7,
  headRotation: .10, scrollInfluence: .38, idleStrength: .044,
  dispersionStrength: .12, dispersionDistance: .34, hairDensity: 1, hairFlow: .16, formationSpeed: 1,
});

const vertex = /* glsl */`
  attribute vec4 art;
  attribute float seed;
  uniform sampler2D albedo;
  uniform float time, motion, scrollMix, pointSize, dpr, brightness, formation,particleOpacity,colorMix,warmStrength,transitionLag,mouseParallax,formationSpread,surfaceDensity;
  uniform float dispersionStrength, dispersionDistance, hairDensity, hairFlow,hairBrightness;
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
    p += motion * hair * hairFlow * (.25+uv.y*.75) * vec3(sin(time*.6+uv.x*48.)*.18,cos(time*.5+uv.x*48.)*.18,sin(time*.45+uv.x*48.)*.25);
    p.xy += motion * pointer * mouseParallax * (mid*.018+abstractPart*.10);
    // Every point follows a staggered curved arrival to its own OBJ target.
    float core = (1.-abstractPart)*(1.-edge);
    float noseFeature=exp(-pow(position.x/.28,2.)-pow((position.y+.04)/.40,2.));
    float eyeFeature=exp(-pow((abs(position.x)-.49)/.22,2.)-pow((position.y-.38)/.20,2.));
    float mouthFeature=exp(-pow(position.x/.50,2.)-pow((position.y+.62)/.22,2.));
    float feature=mix(.24,.005,max(max(noseFeature,eyeFeature*.95),mouthFeature*.65));
    float delay=(feature*(1.-abstractPart)+abstractPart*.38+hair*.12+seed*.10)*formationSpread;
    float arrived = smoothstep(delay,min(.99,delay+.38),formation);
    // Designed two-sided curved arrival lanes; each point has a target,
    // semantic delay, duration and a cubic path with a controlled spiral.
    vec3 origin=vec3(seed>.70?2.7:-3.1, .9+sin(seed*6.283)*1.2,-1.4-seed);
    vec3 c1=origin+vec3(.6,.6,-.2),c2=p+vec3(-.45,.35,-.3);
    float k=1.-arrived;
    p=k*k*k*origin+3.*k*k*arrived*c1+3.*k*arrived*arrived*c2+arrived*arrived*arrived*p;
    p+=sin(arrived*3.14159)*k*vec3(cos(arrived*9.+phase)*.10,sin(arrived*9.+phase)*.10,0.);
    p.x-=transitionLag*(.03+edge*.25+abstractPart*.55);
    p += motion * (edgeNoise*flow+idleStrength*.08) * vec3(sin(time*.23+phase),cos(time*.19+phase),sin(time*.21+phase));
    // Structured facial points stay put; unsupported regions breathe and shed.
    p.x += motion * abstractPart * edge * .045 * sin(time*.48+phase);
    p.y += motion * abstractPart * edge * .045 * cos(time*.35+phase);
    p.x += motion * scrollMix * flow * dissolveDistance * (position.x>.0?1.:-1.);
    p.y -= motion * scrollMix * flow * dissolveDistance * .7;
    vec3 n = normalize(mat3(modelMatrix)*normal);
    float facing = smoothstep(-.22, .26, n.z);
    float flicker = 1.+motion*(.045+mid*.06)*sin(time*.7+phase);
    // A key light reveals the nose/jaw; broad fill keeps eyes and lips readable.
    float key=max(dot(n,normalize(vec3(.45,.6,1.))),0.);
    float fill=max(dot(n,normalize(vec3(-.65,.15,1.))),0.);
    float light=.30+.52*key+.22*fill;
    light=mix(light,.30+.52*key+.20*fill,hair);
    float value = art.x*brightness*light*flicker*(1.+hair*(hairBrightness-1.));
    float warm = goldStrength*smoothstep(.82,1.,seed)*(.3+.7*edge);
    vec3 tex=texture2D(albedo,uv).rgb;
    vec3 silver=mix(vec3(.82,.88,.98),tex*.9+vec3(.08),colorMix*(1.-abstractPart));
    silver=mix(silver,vec3(.56,.42,.28),hair*(.32+warmStrength*.20));
    color=mix(silver,vec3(1.,.70,.40),warm+hair*warmStrength*.12)*value;
    opacity = particleOpacity * art.z * mix(facing,.96,abstractPart) * (1.-scrollMix*.18);
    opacity *= smoothstep(delay*.55,delay+.14,formation);
    opacity *= mix(1.,smoothstep(seed-.06,seed+.06,hairDensity),hair);
    opacity *= mix(smoothstep(seed-.025,seed+.025,surfaceDensity),1.,abstractPart);
    opacity *= 1.-motion*flow*.16*(1.-wake);
    vec4 mv = modelViewMatrix*vec4(p,1.);
    gl_Position = projectionMatrix*mv;
    gl_PointSize = clamp(pointSize*dpr*(.72+seed*seed*.9)*(1.+hair*1.8)*(1.+(1.-abstractPart)*.5)*clamp(1100./max(500.,-mv.z),.8,1.5),.6,4.5*dpr);
  }
`;
const fragment = /* glsl */`
  varying vec3 color; varying float opacity;
  void main() {
    float r = length(gl_PointCoord-.5)*2.;
    if(r>1.) discard;
    float core = 1.-smoothstep(.30,1.,r);
    gl_FragColor=vec4(color,opacity*core);
  }
`;
const fieldVertex = /* glsl */`
  attribute vec4 art;
  uniform float time,motion,scrollY,pageHeight,width,height,originX,originY,flowSpeed,quiet,dpr,formation,trailMode;
  varying vec3 color; varying float opacity;
  void main() {
    float t=position.y;
    float stream=art.w;
    float phase=art.x*6.28318;
    float travel=fract(t + motion*time*flowSpeed*.021);
    float y=mix(t,travel,stream*(1.-trailMode));
    float docY=mix(y*pageHeight,originY+y*min(pageHeight*.66,5300.),stream);
    float lane=position.x;
    float path=originX+(width*.965-originX)*smoothstep(0.,.2,y);
    // Three coherent narrow paths; lower-page paths settle toward a faint data lattice.
    float curve=sin(y*12.+phase)*width*.023*(1.-y*.7);
    float x=mix(lane*width,path+curve+(lane-.5)*width*.10,stream);
    float grid=round(x/32.)*32.;
    x=mix(x,grid,smoothstep(.32,.64,y)*stream*.28);
    x+=motion*sin(time*.16+phase)*3.*(1.-y);
    float sy=docY-scrollY*(1.+position.z*.012);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(x,height-sy,position.z,1.);
    float decay=mix(.40,.028,smoothstep(0.,.80,docY/pageHeight));
    float clearText=stream>.5?1.:smoothstep(.20,.43,abs(lane-.5));
    opacity=art.y*decay*clearText*quiet*smoothstep(.05,.95,formation);
    color=mix(vec3(.72,.80,.90),vec3(.83,.64,.40),step(.91,art.x));
    gl_PointSize=dpr*(.9+art.z*1.2);
  }
`;

const coreVertex = /* glsl */`
  attribute float boundary;
  varying vec2 texUV; varying vec3 faceNormal,local; varying float edge,appearanceDelay;
  void main(){texUV=uv;faceNormal=normalize(mat3(modelMatrix)*normal);local=position;edge=boundary;
    float nose=exp(-pow(position.x/.28,2.)-pow((position.y+.04)/.40,2.));
    float eyes=exp(-pow((abs(position.x)-.49)/.22,2.)-pow((position.y-.38)/.20,2.));
    float mouth=exp(-pow(position.x/.50,2.)-pow((position.y+.62)/.22,2.));
    appearanceDelay=mix(.66,.34,max(max(nose,eyes*.95),mouth*.65));
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;
const coreFragment = /* glsl */`
  uniform sampler2D albedo;
  uniform float formation,coreOpacity,coreBrightness,warmStrength,boundaryDissolve;
  varying vec2 texUV; varying vec3 faceNormal,local; varying float edge,appearanceDelay;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    vec3 n=normalize(faceNormal);vec3 skin=texture2D(albedo,texUV).rgb;
    float lum=dot(skin,vec3(.2126,.7152,.0722));
    float key=max(dot(n,normalize(vec3(.55,.65,1.))),0.);
    float fill=max(dot(n,normalize(vec3(-.7,.25,1.))),0.);
    float spec=pow(max(dot(n,normalize(vec3(.35,.35,1.))),0.),32.);
    vec3 tone=mix(vec3(lum)*vec3(.76,.85,.96),skin,.50+warmStrength*.25);
    vec3 light=tone*(.28+.72*key+.20*fill)*coreBrightness;
    light+=spec*.055*mix(vec3(.80,.88,1.),vec3(1.,.73,.46),warmStrength);
    // The skin dissolves well inside the OUTER perimeter. Mouth loop is retained.
    float fade=1.-smoothstep(.05,mix(.98,.66,boundaryDissolve),edge);
    float porous=hash(floor(texUV*620.));
    if(porous<edge*edge*.42)discard;
    float appear=smoothstep(appearanceDelay,appearanceDelay+.24,formation);
    float opacity=coreOpacity*fade*appear;
    if(opacity<.008)discard;
    gl_FragColor=vec4(light,opacity);
  }
`;
const flowVertex = /* glsl */`
  attribute vec3 control1,control2,finish;
  attribute vec4 art;
  uniform float time,motion,formation,flowSpeed,dpr,streamStrength,streamCurvature,streamTurbulence,depthRange,mouseParallax,transitionLag,foregroundDensity;
  uniform vec2 pointer;
  varying vec3 color;varying float opacity;
  vec3 bezier(vec3 a,vec3 b,vec3 c,vec3 d,float t){float k=1.-t;return k*k*k*a+3.*k*k*t*b+3.*k*t*t*c+t*t*t*d;}
  void main(){
    float travel=fract(art.x+time*flowSpeed*.13*motion);
    vec3 c1=mix(position,control1,streamCurvature),c2=mix(finish,control2,streamCurvature);
    vec3 p=bezier(position,c1,c2,finish,travel);
    float envelope=sin(travel*3.14159);
    p+=streamTurbulence*envelope*vec3(sin(travel*13.+art.x*12.+time*.23),cos(travel*17.+art.x*9.),sin(travel*11.+art.x*8.));
    p.z*=depthRange;
    p.xy+=pointer*mouseParallax*(.08+art.w*.12);
    p.x-=transitionLag*(.6+travel*.8);
    // In the intro the same curves run INWARD; the assembled portrait activates escape.
    float inbound=smoothstep(.03,.65,formation);
    vec3 arrival=bezier(finish,c2,c1,position,inbound);
    p=mix(arrival,p,smoothstep(.66,.98,formation));
    opacity=art.z*streamStrength*pow(max(envelope,0.),.45)*pow(1.-travel,.55)*smoothstep(.015,.20,formation);
    opacity*=mix(1.,step(art.x,foregroundDensity),art.w);
    color=mix(vec3(.72,.82,1.),vec3(1.,.68,.34),step(.72,art.x))*(.85+art.w*.45);
    vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
    gl_PointSize=dpr*art.y*clamp(1500./max(300.,-mv.z),1.,1.8);
  }
`;
const flowFragment = /* glsl */`
  varying vec3 color;varying float opacity;
  void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
    float glow=exp(-r*r*6.);gl_FragColor=vec4(color,opacity*glow);}
`;

function decodeCore(buffer){
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x32464353)throw new Error('Invalid core portrait asset');
  const count=view.getUint32(4,true),indices=view.getUint32(8,true),paths=view.getUint32(12,true),hairCount=view.getUint32(16,true);
  if(buffer.byteLength!==20+count*16+indices*2+paths*48+hairCount*16)throw new Error('Incomplete core portrait asset');
  const p=new Float32Array(count*3),n=new Float32Array(count*3),uv=new Float32Array(count*2),edge=new Float32Array(count);
  for(let i=0;i<count;i++){const at=20+i*16;for(let j=0;j<3;j++){p[i*3+j]=view.getInt16(at+j*2,true)/8192;n[i*3+j]=view.getInt8(at+6+j)/127;}
    edge[i]=view.getUint8(at+9)/255;uv[i*2]=view.getUint16(at+10,true)/65535;uv[i*2+1]=view.getUint16(at+12,true)/65535;}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(p,3));geometry.setAttribute('normal',new THREE.BufferAttribute(n,3));
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setAttribute('boundary',new THREE.BufferAttribute(edge,1));
  const index=new Uint16Array(indices);for(let i=0;i<indices;i++)index[i]=view.getUint16(20+count*16+i*2,true);geometry.setIndex(new THREE.BufferAttribute(index,1));
  const curves=new Float32Array(paths*12);for(let i=0;i<curves.length;i++)curves[i]=view.getFloat32(20+count*16+indices*2+i*4,true);
  const hairBuffer=new ArrayBuffer(8+hairCount*16),h=new DataView(hairBuffer);h.setUint32(0,0x31465053,true);h.setUint32(4,hairCount,true);
  new Uint8Array(hairBuffer,8).set(new Uint8Array(buffer,20+count*16+indices*2+paths*48));
  return {geometry,curves,hair:decode(hairBuffer,hairCount)};
}
function flowGeometry(curves,count){
  const arrays=[new Float32Array(count*3),new Float32Array(count*3),new Float32Array(count*3),new Float32Array(count*3)],art=new Float32Array(count*4);
  let state=179;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  for(let i=0;i<count;i++){const large=i%25===0;const lane=large?8+Math.floor(rand()*2):Math.floor(rand()*8);
    for(let j=0;j<4;j++)for(let k=0;k<3;k++)arrays[j][i*3+k]=curves[lane*12+j*3+k]+(rand()-.5)*.045;
    art[i*4]=rand();art[i*4+1]=large?7+rand()*9:1.4+rand()*1.5;art[i*4+2]=large?.68:.36+rand()*.48;art[i*4+3]=large?1:0;}
  const g=new THREE.BufferGeometry();for(const [i,key]of ['position','control1','control2','finish'].entries())g.setAttribute(key,new THREE.BufferAttribute(arrays[i],3));g.setAttribute('art',new THREE.BufferAttribute(art,4));return g;
}

function decode(buffer, limit) {
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x31465053) throw new Error('Invalid portrait signature');
  const total=view.getUint32(4,true);
  if(buffer.byteLength!==8+total*16) throw new Error('Incomplete portrait asset');
  const count=Math.min(total,limit);
  const positions=new Float32Array(count*3), normals=new Float32Array(count*3);
  const art=new Float32Array(count*4), seeds=new Float32Array(count), uv=new Float32Array(count*2);
  for(let i=0;i<count;i++) {
    const offset=8+i*16;
    for(let j=0;j<3;j++) {
      positions[i*3+j]=view.getInt16(offset+j*2,true)/8192;
      normals[i*3+j]=view.getInt8(offset+6+j)/127;
    }
    for(let j=0;j<3;j++) art[i*4+j]=view.getUint8(offset+9+j)/255;
    art[i*4+3]=view.getUint8(offset+12);seeds[i]=view.getUint8(offset+13)/255;
    uv[i*2]=view.getUint8(offset+14)/255;uv[i*2+1]=view.getUint8(offset+15)/255;
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  geometry.setAttribute('art',new THREE.BufferAttribute(art,4));
  geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
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
  let fieldLines,hairLines;
  let renderer,geometry,portrait,field,faceMaterial,fieldMaterial,scene,camera,coreGeometry,coreMaterial,flowMaterial,streams,albedo;
  let raf=0,last=0,clock=0,visible=true,needsLayout=true,dirty=true,disposed=false;
  let docRect={x:0,y:0,w:0,h:0},width=0,height=0,pageHeight=0;
  let pointerX=0,pointerY=0,smoothedX=0,smoothedY=0;
  let auxiliaryReduced=false;
  let frames=0,slow=0,badWindows=0,sampleStart=0,renderCount=0,lastRenderMs=0;
  let introRunning=false,introStart=0,introElapsed=0,hiddenAt=0,introFinishedAt=0;
  let stats,rafFPS=0,rafSamples=0,rafWindow=0;
  let diagnostics,diagnosticText,diagnosticLast=0,measureStart=0,measureFrames=0,renderFPS=0,gpuName='';
  let introWanted=params.get('intro')==='1';
  try { introWanted ||= !sessionStorage.getItem('saif-intro-v3'); } catch { introWanted=true; }
  const sinLag=x=>Math.sin(Math.PI*x)*.60;
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  const cleanups=[];
  function finishIntro() {
    introRunning=false;introElapsed=6;introFinishedAt=performance.now();root.dataset.intro='hero';
    try { sessionStorage.setItem('saif-intro-v3','1'); } catch {}
    request();
  }
  function listen(target,event,fn,options) { target.addEventListener(event,fn,options);cleanups.push(()=>target.removeEventListener(event,fn,options)); }
  function fallback(reason='WebGL unavailable or context lost') {
    root.dataset.portrait='fallback';root.dataset.intro='hero';dispose();staticDiagnostics(reason);
  }
  function dispose() {
    if(disposed)return;disposed=true;cancelAnimationFrame(raf);raf=0;
    cleanups.forEach(fn=>fn());geometry?.dispose();field?.geometry.dispose();
    faceMaterial?.dispose();fieldMaterial?.dispose();fieldLines?.geometry.dispose();fieldLines?.material.dispose();hairLines?.geometry.dispose();hairLines?.material.dispose();coreGeometry?.dispose();coreMaterial?.dispose();streams?.geometry.dispose();flowMaterial?.dispose();albedo?.dispose();renderer?.dispose();
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
    if(!mobile&&/swiftshader|llvmpipe|software/i.test(gpu)) tier=innerWidth>=1700?'tiny':'economy';
    if(dev&&Object.hasOwn(budgets,params.get('portraitTier')))tier=params.get('portraitTier');
    renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:false});
    renderer.setClearColor(0x05070b,0);
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,caps[tier]));
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(30,innerWidth/innerHeight,1,10000);
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
    let buffer,coreBuffer;
    try {
      const asset=tier==='high'?'saif-particles.bin':`saif-particles-${tier==='mobile'?'mobile':'balanced'}.bin`;
      const loaded=await Promise.all([asset,'saif-face-core.bin'].map(async name=>{
        const response=await fetch(new URL(`./portrait/${name}?v=hybrid-5`,import.meta.url),{signal:controller.signal});
        if(!response.ok)throw new Error('Portrait load failed');return response.arrayBuffer();}));
      [buffer,coreBuffer]=loaded;
      albedo=await new Promise((resolve,reject)=>{
        let expired=false;const limit=setTimeout(()=>{expired=true;reject(new Error('Portrait texture timed out'));},15000);
        new THREE.TextureLoader().loadAsync(new URL('./portrait/saif-face-albedo.webp?v=hybrid-5',import.meta.url).href)
          .then(texture=>{clearTimeout(limit);if(expired)texture.dispose();else resolve(texture);},error=>{clearTimeout(limit);reject(error);});
      });
    } finally { clearTimeout(timeout); }
    geometry=decode(buffer,budgets[tier]);
    enabled=root.dataset.motion!=='off'&&!reduced.matches;
    const uniform=(value)=>({value});
    faceMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,
      transparent:true,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{time:uniform(0),motion:uniform(enabled?1:0),scrollMix:uniform(0),pointSize:uniform(cfg.particleSize),dpr:uniform(renderer.getPixelRatio()),brightness:uniform(cfg.faceBrightness),
        surfaceDensity:uniform(cfg.surfaceDensity),hairBrightness:uniform(cfg.hairBrightness),albedo:uniform(albedo),particleOpacity:uniform(cfg.particleOpacity),colorMix:uniform(cfg.colorMix),warmStrength:uniform(cfg.warmStrength),transitionLag:uniform(0),mouseParallax:uniform(cfg.mouseParallax),formationSpread:uniform(cfg.formationSpread),formation:uniform(1),dispersionStrength:uniform(cfg.dispersionStrength),dispersionDistance:uniform(cfg.dispersionDistance),hairDensity:uniform(cfg.hairDensity),hairFlow:uniform(cfg.hairFlow),pointer:uniform(new Float32Array(2)),dissolveThreshold:uniform(cfg.dissolveThreshold),dissolveDistance:uniform(cfg.dissolveDistance),edgeNoise:uniform(cfg.edgeNoise),idleStrength:uniform(cfg.idleStrength),goldStrength:uniform(cfg.goldStrength)}});
    portrait=new THREE.Group();scene.add(portrait);
    const skin=new THREE.Points(geometry,faceMaterial);skin.frustumCulled=false;skin.renderOrder=2;portrait.add(skin);
    const decoded=decodeCore(coreBuffer);coreGeometry=decoded.geometry;
    const hairMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:'varying vec3 color;varying float opacity;void main(){gl_FragColor=vec4(color,opacity*.28);}',transparent:true,depthWrite:false,uniforms:faceMaterial.uniforms});
    hairLines=new THREE.LineSegments(decoded.hair,hairMaterial);hairLines.frustumCulled=false;hairLines.renderOrder=2;portrait.add(hairLines);
    coreMaterial=new THREE.ShaderMaterial({vertexShader:coreVertex,fragmentShader:coreFragment,transparent:true,side:2,depthWrite:false,
      uniforms:{albedo:uniform(albedo),formation:uniform(1),coreOpacity:uniform(cfg.coreOpacity),coreBrightness:uniform(cfg.coreBrightness),warmStrength:uniform(cfg.warmStrength),boundaryDissolve:uniform(cfg.boundaryDissolve)}});
    const core=new THREE.Mesh(coreGeometry,coreMaterial);core.frustumCulled=false;core.renderOrder=1;portrait.add(core);
    flowMaterial=new THREE.ShaderMaterial({vertexShader:flowVertex,fragmentShader:flowFragment,transparent:true,depthWrite:false,
      uniforms:{time:uniform(0),motion:uniform(enabled?1:0),formation:uniform(1),flowSpeed:uniform(cfg.flowSpeed),dpr:uniform(renderer.getPixelRatio()),streamStrength:uniform(cfg.streamStrength),streamCurvature:uniform(cfg.streamCurvature),streamTurbulence:uniform(cfg.streamTurbulence),depthRange:uniform(cfg.depthRange),mouseParallax:uniform(cfg.mouseParallax),pointer:uniform(new Float32Array(2)),transitionLag:uniform(0),foregroundDensity:uniform(1)}});
    streams=new THREE.Points(flowGeometry(decoded.curves,1800),flowMaterial);streams.frustumCulled=false;streams.renderOrder=3;portrait.add(streams);
    const count=mobile?180:tier==='high'?cfg.ambientCount:420;
    const positions=new Float32Array(count*3),art=new Float32Array(count*4);
    // Seeded, once-only field allocation. No per-particle objects in the animation loop.
    let seed=834;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<count;i++) {
      const stream=i<count*.66;
      positions[i*3]=stream?.48+random()*.04:(random()<.5?random()*.12:.88+random()*.12);
      positions[i*3+1]=random()**1.8;positions[i*3+2]=-random()*30;
      art[i*4]=stream?Math.floor(random()*3)/3:random();
      art[i*4+1]=.24+random()*.7;art[i*4+2]=random();art[i*4+3]=stream?1:0;
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('art',new THREE.BufferAttribute(art,4));
    fieldMaterial=new THREE.ShaderMaterial({vertexShader:fieldVertex,fragmentShader:fragment,transparent:true,depthWrite:false,
      uniforms:{trailMode:uniform(0),time:uniform(0),motion:uniform(enabled?1:0),scrollY:uniform(scrollY),pageHeight:uniform(1),width:uniform(1),height:uniform(1),originX:uniform(0),originY:uniform(0),flowSpeed:uniform(cfg.flowSpeed),formation:uniform(1),quiet:uniform(1),dpr:uniform(renderer.getPixelRatio())}});
    field=new THREE.Points(g,fieldMaterial);field.frustumCulled=false;field.renderOrder=0;scene.add(field);
    // Three quiet continuous trajectories make the page flow readable even at
    // lower point budgets. Fewer than 1k line vertices; no additional canvas.
    const trailP=new Float32Array(3*150*2*3),trailArt=new Float32Array(3*150*2*4);
    let at=0;for(let lane=0;lane<3;lane++)for(let i=0;i<150;i++)for(let end=0;end<2;end++){
      trailP[at*3]=.5;trailP[at*3+1]=(i+end)/150*.96;trailP[at*3+2]=-35;
      trailArt[at*4]=lane/3;trailArt[at*4+1]=.68;trailArt[at*4+3]=1;at++;
    }
    const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(trailP,3));tg.setAttribute('art',new THREE.BufferAttribute(trailArt,4));
    const tm=new THREE.ShaderMaterial({vertexShader:fieldVertex,fragmentShader:'varying vec3 color;varying float opacity;void main(){gl_FragColor=vec4(color,opacity*.25);}',transparent:true,depthWrite:false,
      uniforms:{...fieldMaterial.uniforms,trailMode:uniform(1)}});
    fieldLines=new THREE.LineSegments(tg,tm);fieldLines.frustumCulled=false;fieldLines.renderOrder=0;scene.add(fieldLines);

    function layout() {
      width=innerWidth;height=innerHeight;pageHeight=root.scrollHeight;
      const r=stage.getBoundingClientRect();docRect={x:r.left,y:r.top+scrollY,w:r.width,h:r.height};
      camera.aspect=width/height;camera.position.set(width/2,height/2,height/(2*Math.tan(Math.PI/12)));camera.updateProjectionMatrix();renderer.setSize(width,height,false);
      // Facial coordinates retain original relative proportions; only uniform display scale.
      const scale=Math.min(docRect.w*.44,docRect.h*.30);
      portrait.scale.setScalar(scale);
      const u=fieldMaterial.uniforms;
      u.width.value=width;u.height.value=height;u.pageHeight.value=pageHeight;
      u.originX.value=docRect.x+docRect.w*.35;u.originY.value=docRect.y+docRect.h*.72;
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
    const updateMotion=()=>{if(root.dataset.motion==='off'||reduced.matches)finishIntro();enabled=root.dataset.motion!=='off'&&!reduced.matches;faceMaterial.uniforms.motion.value=enabled?1:0;fieldMaterial.uniforms.motion.value=enabled?1:0;flowMaterial.uniforms.motion.value=enabled?1:0;smoothedX=smoothedY=0;request();};
    listen(window,'portfolio-motion',updateMotion);listen(reduced,'change',updateMotion);
    listen(canvas,'webglcontextlost',e=>{e.preventDefault();fallback();});
    listen(window,'pagehide',e=>{if(!e.persisted)dispose();});
    listen(window,'pageshow',request);
    stats=()=>({tier,portraitStatic:!enabled,staticFallback:false,hybrid:true,coreVertices:coreGeometry.attributes.position.count,coreTriangles:coreGeometry.index.count/3,streamPoints:streams.geometry.drawRange.count,hairFilamentVertices:hairLines.geometry.drawRange.count,auxiliaryReduced,renderFPS,rafFPS,time:clock,yaw:portrait.rotation.y,points:geometry.drawRange.count,allocatedPoints:geometry.attributes.position.count,dpr:renderer.getPixelRatio(),drawCalls:renderer.info.render.calls,renderCount,lastRenderMs,visible,enabled,reducedMotion:reduced.matches,documentHidden:document.hidden,introState:root.dataset.intro,introElapsed,pointer:[smoothedX,smoothedY],scrollMix:faceMaterial.uniforms.scrollMix.value,renderer:gpuName});
    if(dev) {
      window.portraitDev={config:cfg,set(values){for(const key of Object.keys(DEFAULTS))if(Number.isFinite(values[key]))cfg[key]=values[key];request();},stats,snapshot(){
        // Reproducible fallback from the SAME GPU objects/shaders, never an AI image.
        renderer.setSize(900,1080,false);camera.aspect=900/1080;camera.position.set(450,540,1080/(2*Math.tan(Math.PI/12)));camera.updateProjectionMatrix();
        portrait.position.set(510,640,0);portrait.rotation.set(0,.52,0);portrait.scale.setScalar(270);portrait.visible=true;field.visible=fieldLines.visible=false;
        faceMaterial.uniforms.formation.value=coreMaterial.uniforms.formation.value=flowMaterial.uniforms.formation.value=1;
        faceMaterial.uniforms.transitionLag.value=flowMaterial.uniforms.transitionLag.value=0;
        renderer.render(scene,camera);const png=canvas.toDataURL('image/png');field.visible=fieldLines.visible=true;needsLayout=true;request();return png;
      },replay(){introRunning=enabled;introStart=performance.now();introElapsed=0;root.dataset.intro=enabled?'forming':'hero';request();},skip:finishIntro};
      diagnostics=document.createElement('details');diagnostics.id='portraitDiagnostics';
      const title=document.createElement('summary');title.textContent='Portrait diagnostics · localhost';diagnostics.append(title);
      diagnosticText=document.createElement('pre');diagnostics.append(diagnosticText);
      for(const [key,max] of Object.entries({surfaceDensity:1,hairBrightness:4,coreOpacity:1,coreBrightness:3,particleOpacity:1,colorMix:1,warmStrength:1,boundaryDissolve:1,streamStrength:2,streamCurvature:2,streamTurbulence:.15,foregroundCount:100,depthRange:2,mouseParallax:2,formationDuration:10,formationSpread:1.5,faceDensity:1,particleSize:4,faceBrightness:3,goldStrength:1,dissolveThreshold:1,dissolveDistance:1,edgeNoise:.2,dispersionStrength:.5,dispersionDistance:1,hairDensity:1,hairFlow:.5,ambientCount:1000,flowSpeed:1,mouseSensitivity:2,headRotation:.2,idleStrength:.1,scrollInfluence:1,formationSpeed:2})){
        const label=document.createElement('label');label.append(key);const input=document.createElement('input');input.type='range';input.min=key==='formationSpeed'?.5:key==='formationDuration'?3:0;input.max=max;input.step=max/100;input.value=cfg[key];input.addEventListener('input',()=>{cfg[key]=Number(input.value);request();});label.append(input);diagnostics.append(label);
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
      if(introRunning){introElapsed=(now-introStart)/1000*cfg.formationSpeed*5.6/cfg.formationDuration;root.dataset.intro=introElapsed<3.3?'forming':introElapsed<4.0?'assembled':introElapsed<5.6?'transition':'hero';if(introElapsed>=5.6)finishIntro();}
      const formation=introRunning?smooth(.12,3.5,introElapsed):1;
      const transition=introRunning?smooth(4.0,5.6,introElapsed):1;
      const fps=visible?(tier==='high'?60:30):(scrollY>pageHeight*.85?8:18);
      if(enabled&&last&&now-last<1000/fps-.8) {raf=requestAnimationFrame(frame);return;}
      const interval=last?now-last:0;
      const elapsed=last?Math.min((now-last)/1000,.25):1/60;last=now;
      if(enabled)clock+=elapsed;
      const lerp=1-Math.exp(-elapsed*4);
      smoothedX+=(pointerX-smoothedX)*lerp;smoothedY+=(pointerY-smoothedY)*lerp;
      const scrollMix=Math.min(1,Math.max(0,(scrollY-docRect.y*.2)/Math.max(docRect.h,1)))*cfg.scrollInfluence;
      portrait.visible=introRunning||docRect.y+docRect.h+120>scrollY&&docRect.y-120<scrollY+height;
      const finalX=docRect.x+docRect.w*.50, finalY=height-(docRect.y-scrollY+docRect.h*.44)-scrollMix*12;
      const finalScale=Math.min(docRect.w*.44,docRect.h*.30),introScale=Math.min(width*.27,height*.265);
      portrait.scale.setScalar(introScale+(finalScale-introScale)*transition);
      portrait.position.set(width*.50+(finalX-width*.50)*transition,height*.53+(finalY-height*.53)*transition+(enabled?Math.sin(clock*.6)*1.8:0),0);
      portrait.rotation.set(enabled?smoothedY*cfg.headRotation*cfg.mouseSensitivity+Math.sin(clock*.31)*.015:0,.06+.46*transition+(enabled?smoothedX*cfg.headRotation*cfg.mouseSensitivity+Math.sin(clock*.40)*cfg.idleStrength:0),0);
      geometry.setDrawRange(0,Math.max(1,Math.floor(Math.min(budgets[tier],geometry.attributes.position.count)*Math.max(.1,Math.min(1,cfg.faceDensity)))));
      const u=faceMaterial.uniforms;u.time.value=clock;u.scrollMix.value=enabled?scrollMix:0;u.formation.value=formation;u.transitionLag.value=introRunning?sinLag(transition)*(finalX-width*.50)/Math.max(finalScale,1):0;u.pointer.value[0]=smoothedX;u.pointer.value[1]=smoothedY;
      for(const [key,param] of Object.entries({surfaceDensity:'surfaceDensity',hairBrightness:'hairBrightness',particleOpacity:'particleOpacity',colorMix:'colorMix',warmStrength:'warmStrength',mouseParallax:'mouseParallax',formationSpread:'formationSpread',pointSize:'particleSize',brightness:'faceBrightness',goldStrength:'goldStrength',dissolveThreshold:'dissolveThreshold',dissolveDistance:'dissolveDistance',edgeNoise:'edgeNoise',idleStrength:'idleStrength',dispersionStrength:'dispersionStrength',dispersionDistance:'dispersionDistance',hairDensity:'hairDensity',hairFlow:'hairFlow'}))u[key].value=cfg[param];
      u.pointSize.value*=Math.min(1.65,Math.sqrt(43000/geometry.drawRange.count));
      const cu=coreMaterial.uniforms;cu.formation.value=formation;for(const key of ['coreOpacity','coreBrightness','warmStrength','boundaryDissolve'])cu[key].value=cfg[key];
      const su=flowMaterial.uniforms;su.time.value=clock;su.formation.value=formation;su.transitionLag.value=u.transitionLag.value;su.pointer.value[0]=smoothedX;su.pointer.value[1]=smoothedY;
      for(const key of ['flowSpeed','streamStrength','streamCurvature','streamTurbulence','depthRange','mouseParallax'])su[key].value=cfg[key];
      su.foregroundDensity.value=Math.min(1,Math.max(0,cfg.foregroundCount/72))*(auxiliaryReduced?.5:1);
      hairLines.geometry.setDrawRange(0,tier==='high'?10500:tier==='balanced'?7000:tier==='mobile'?3500:tier==='micro'?1400:2800);
      streams.geometry.setDrawRange(0,Math.floor((auxiliaryReduced?.55:1)*Math.min(1800,tier==='high'?1800:tier==='balanced'?1100:tier==='mobile'?380:tier==='tiny'?320:tier==='micro'?180:620)));
      const fieldBudget=tier==='high'?720:tier==='balanced'?420:tier==='economy'?240:tier==='micro'?90:180;
      fieldLines.geometry.setDrawRange(0,auxiliaryReduced?300:900);
      field.geometry.setDrawRange(0,Math.min(auxiliaryReduced?Math.floor(fieldBudget*.4):fieldBudget,field.geometry.attributes.position.count,Math.max(0,Math.floor(cfg.ambientCount))));
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
            if(!auxiliaryReduced){auxiliaryReduced=true;}else tier=({high:'balanced',balanced:'economy',economy:'tiny',mobile:'tiny',tiny:'micro'})[tier];
            renderer.setPixelRatio(Math.min(devicePixelRatio||1,caps[tier]));
            renderer.setSize(width,height,false);u.dpr.value=f.dpr.value=flowMaterial.uniforms.dpr.value=renderer.getPixelRatio();
            root.dataset.portraitQuality=tier;
          }
          frames=slow=0;sampleStart=now;
        }
      }
      if(enabled)raf=requestAnimationFrame(frame);
    } catch(error) { if(dev)console.error('Portrait initialization/render failed',error);fallback(error.message); }
  }
}
