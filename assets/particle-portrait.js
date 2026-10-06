import * as THREE from './vendor/three.js';

// Development-only tuning: localhost + ?portraitDev=1. Production exposes no panel/API.
const DEFAULTS = Object.freeze({
  faceDensity: 1, particleSize: 1.65, faceBrightness: 1.32, goldStrength: .13,
  dissolveThreshold: .58, dissolveDistance: .28, edgeNoise: .025,
  ambientCount: 720, flowSpeed: .055, mouseSensitivity: .6,
  headRotation: .055, scrollInfluence: .32, idleStrength: .012,
});

const vertex = /* glsl */`
  attribute vec4 art;
  attribute float seed;
  uniform float time, motion, scrollMix, pointSize, dpr, brightness;
  uniform float dissolveThreshold, dissolveDistance, edgeNoise, idleStrength, goldStrength;
  varying vec3 color;
  varying float opacity;
  void main() {
    float edge = art.y;
    float abstractPart = step(.5,art.w);
    float flow = smoothstep(dissolveThreshold, 1., edge);
    vec3 p = position;
    float phase = seed * 60.;
    p += motion * (edgeNoise*flow+idleStrength*.10) * vec3(sin(time*.23+phase),cos(time*.19+phase),sin(time*.21+phase));
    p.x += motion * scrollMix * flow * dissolveDistance * (position.x>.0?1.:-1.);
    p.y -= motion * scrollMix * flow * dissolveDistance * .7;
    vec3 n = normalize(mat3(modelMatrix)*normal);
    float facing = smoothstep(-.22, .26, n.z);
    float flicker = 1.+motion*.055*sin(time*.7+phase);
    float light = .66+.34*max(dot(n,normalize(vec3(-.3,.55,1.))),0.);
    float value = art.x*brightness*light*flicker;
    float warm = goldStrength*smoothstep(.88,1.,seed)*(.3+.7*edge);
    color = mix(vec3(.88,.93,1.),vec3(1.,.65,.32),warm)*value;
    opacity = art.z * mix(facing, .82, abstractPart) * (1.-scrollMix*.18);
    vec4 mv = modelViewMatrix*vec4(p,1.);
    gl_Position = projectionMatrix*mv;
    gl_PointSize = clamp(pointSize*dpr*(.66+seed*.65)*(1.+abstractPart*.18),.7,4.5*dpr);
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
const fieldVertex = /* glsl */`
  attribute vec4 art;
  uniform float time,motion,scrollY,pageHeight,width,height,originX,originY,flowSpeed,quiet,dpr;
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
    opacity=art.y*decay*clearText*quiet;
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

export async function initPortrait() {
  const root=document.documentElement;
  const canvas=document.querySelector('#portraitCanvas');
  const stage=document.querySelector('#heroPortraitStage');
  if(!canvas || !stage) return;
  const params=new URLSearchParams(location.search);
  if(params.get('portraitFallback')==='1') { root.dataset.portrait='fallback';return; }
  const mobile=matchMedia('(max-width: 940px)').matches;
  const constrained=navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory<=4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);
  let tier=mobile?'mobile':constrained?'balanced':'high';
  const budgets={high:76000,balanced:43000,economy:21000,mobile:22500};
  const caps={high:1.5,balanced:1,economy:.7,mobile:1};
  const cfg={...DEFAULTS};
  const dev=['localhost','127.0.0.1'].includes(location.hostname)&&params.get('portraitDev')==='1';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let enabled=root.dataset.motion!=='off'&&!reduced.matches;
  let renderer,geometry,portrait,field,faceMaterial,fieldMaterial,scene,camera;
  let raf=0,last=0,clock=0,visible=true,needsLayout=true,dirty=true,disposed=false;
  let docRect={x:0,y:0,w:0,h:0},width=0,height=0,pageHeight=0;
  let pointerX=0,pointerY=0,smoothedX=0,smoothedY=0;
  let frames=0,slow=0,sampleStart=0,renderCount=0,lastRenderMs=0;
  let portraitStatic=false;
  const cleanups=[];
  function listen(target,event,fn,options) { target.addEventListener(event,fn,options);cleanups.push(()=>target.removeEventListener(event,fn,options)); }
  function fallback() {
    root.dataset.portrait='fallback';dispose();
  }
  function dispose() {
    if(disposed)return;disposed=true;cancelAnimationFrame(raf);raf=0;
    cleanups.forEach(fn=>fn());geometry?.dispose();field?.geometry.dispose();
    faceMaterial?.dispose();fieldMaterial?.dispose();renderer?.dispose();
    if(dev) delete window.portraitDev;
  }
  function request() {
    dirty=true;
    if(!raf&&!disposed&&!document.hidden) raf=requestAnimationFrame(frame);
  }
  try {
    // Explicit context check keeps unsupported hardware on the static supplied-face poster.
    const context=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'});
    if(!context) { fallback();return; }
    // Software WebGL is useful for compatibility, but should not start at GPU quality.
    const info=context.getExtension('WEBGL_debug_renderer_info');
    const gpu=info?context.getParameter(info.UNMASKED_RENDERER_WEBGL):'';
    if(!mobile&&/swiftshader|llvmpipe|software/i.test(gpu)) tier='balanced';
    renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:false});
    renderer.setClearColor(0x05070b,0);
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,caps[tier]));
    scene=new THREE.Scene();camera=new THREE.OrthographicCamera(0,1,1,0,-2000,2000);camera.position.z=1000;
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
    let buffer;
    try {
      const asset=tier==='high'?'saif-particles.bin':`saif-particles-${tier==='economy'?'balanced':tier}.bin`;
      const response=await fetch(new URL(`./portrait/${asset}`,import.meta.url),{signal:controller.signal});
      if(!response.ok)throw new Error('Portrait load failed');buffer=await response.arrayBuffer();
    } finally { clearTimeout(timeout); }
    geometry=decode(buffer,budgets[tier]);
    const uniform=(value)=>({value});
    faceMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,
      transparent:true,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{time:uniform(0),motion:uniform(enabled?1:0),scrollMix:uniform(0),pointSize:uniform(cfg.particleSize),dpr:uniform(renderer.getPixelRatio()),brightness:uniform(cfg.faceBrightness),
        dissolveThreshold:uniform(cfg.dissolveThreshold),dissolveDistance:uniform(cfg.dissolveDistance),edgeNoise:uniform(cfg.edgeNoise),idleStrength:uniform(cfg.idleStrength),goldStrength:uniform(cfg.goldStrength)}});
    portrait=new THREE.Points(geometry,faceMaterial);portrait.frustumCulled=false;portrait.renderOrder=2;scene.add(portrait);
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
      uniforms:{time:uniform(0),motion:uniform(enabled?1:0),scrollY:uniform(scrollY),pageHeight:uniform(1),width:uniform(1),height:uniform(1),originX:uniform(0),originY:uniform(0),flowSpeed:uniform(cfg.flowSpeed),quiet:uniform(1),dpr:uniform(renderer.getPixelRatio())}});
    field=new THREE.Points(g,fieldMaterial);field.frustumCulled=false;field.renderOrder=1;scene.add(field);

    function layout() {
      width=innerWidth;height=innerHeight;pageHeight=root.scrollHeight;
      const r=stage.getBoundingClientRect();docRect={x:r.left,y:r.top+scrollY,w:r.width,h:r.height};
      camera.right=width;camera.top=height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
      // Facial coordinates retain original relative proportions; only uniform display scale.
      const scale=Math.min(docRect.w*.40,docRect.h*.265);
      portrait.scale.setScalar(scale);
      const u=fieldMaterial.uniforms;
      u.width.value=width;u.height.value=height;u.pageHeight.value=pageHeight;
      u.originX.value=docRect.x+docRect.w*.64;u.originY.value=docRect.y+docRect.h*.70;
      needsLayout=false;
    }
    initPortrait.layout=layout;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;request();},{rootMargin:'160px'});
    observer.observe(stage);cleanups.push(()=>observer.disconnect());
    const resizeObserver=new ResizeObserver(()=>{needsLayout=true;request();});resizeObserver.observe(document.body);resizeObserver.observe(stage);cleanups.push(()=>resizeObserver.disconnect());
    listen(window,'resize',()=>{needsLayout=true;request();},{passive:true});
    listen(window,'scroll',request,{passive:true});
    listen(document,'visibilitychange',()=>{
      if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}
      else request();
    });
    const hero=document.querySelector('#home');
    if(matchMedia('(pointer: fine)').matches) {
      listen(hero,'pointermove',e=>{pointerX=(e.clientX/innerWidth-.5)*2;pointerY=(e.clientY/innerHeight-.5)*2;},{passive:true});
      listen(hero,'pointerleave',()=>{pointerX=0;pointerY=0;});
    }
    const updateMotion=()=>{enabled=root.dataset.motion!=='off'&&!reduced.matches;faceMaterial.uniforms.motion.value=enabled?1:0;fieldMaterial.uniforms.motion.value=enabled?1:0;smoothedX=smoothedY=0;request();};
    listen(window,'portfolio-motion',updateMotion);listen(reduced,'change',updateMotion);
    listen(canvas,'webglcontextlost',e=>{e.preventDefault();fallback();});
    listen(window,'pagehide',e=>{if(!e.persisted)dispose();});
    listen(window,'pageshow',request);
    if(dev) {
      window.portraitDev={config:cfg,set(values){for(const key of Object.keys(DEFAULTS))if(Number.isFinite(values[key]))cfg[key]=values[key];request();},
        stats:()=>({tier,portraitStatic,points:geometry.drawRange.count,allocatedPoints:geometry.attributes.position.count,dpr:renderer.getPixelRatio(),drawCalls:renderer.info.render.calls,renderCount,lastRenderMs,visible,enabled,documentHidden:document.hidden})};
    }
    request();
  } catch { fallback(); }

  function frame(now) {
    raf=0;if(disposed||document.hidden)return;
    try {
      if(needsLayout) initPortrait.layout();
      const fps=portraitStatic?8:visible?(tier==='high'?60:30):(scrollY>pageHeight*.85?8:18);
      if(enabled&&!dirty&&now-last<1000/fps-.8) {raf=requestAnimationFrame(frame);return;}
      const interval=last?now-last:0;
      const elapsed=last?Math.min((now-last)/1000,.10):1/60;last=now;
      if(enabled)clock+=elapsed;
      const lerp=1-Math.exp(-elapsed*4);
      smoothedX+=(pointerX-smoothedX)*lerp;smoothedY+=(pointerY-smoothedY)*lerp;
      const scrollMix=Math.min(1,Math.max(0,(scrollY-docRect.y*.2)/Math.max(docRect.h,1)))*cfg.scrollInfluence;
      portrait.visible=!portraitStatic&&docRect.y+docRect.h+120>scrollY&&docRect.y-120<scrollY+height;
      portrait.position.set(docRect.x+docRect.w*.51,height-(docRect.y-scrollY+docRect.h*.45)-scrollMix*12,0);
      portrait.rotation.set(enabled?smoothedY*cfg.headRotation*cfg.mouseSensitivity:0,-.32+(enabled?smoothedX*cfg.headRotation*cfg.mouseSensitivity+Math.sin(clock*.15)*cfg.idleStrength:0),0);
      geometry.setDrawRange(0,Math.max(1,Math.floor(Math.min(budgets[tier],geometry.attributes.position.count)*Math.max(.1,Math.min(1,cfg.faceDensity)))));
      const u=faceMaterial.uniforms;u.time.value=clock;u.scrollMix.value=enabled?scrollMix:0;
      for(const [key,param] of Object.entries({pointSize:'particleSize',brightness:'faceBrightness',goldStrength:'goldStrength',dissolveThreshold:'dissolveThreshold',dissolveDistance:'dissolveDistance',edgeNoise:'edgeNoise',idleStrength:'idleStrength'}))u[key].value=cfg[param];
      const fieldBudget=tier==='high'?720:tier==='balanced'?420:tier==='economy'?240:180;
      field.geometry.setDrawRange(0,Math.min(fieldBudget,field.geometry.attributes.position.count,Math.max(0,Math.floor(cfg.ambientCount))));
      const f=fieldMaterial.uniforms;f.time.value=clock;f.scrollY.value=scrollY;f.flowSpeed.value=cfg.flowSpeed;
      f.quiet.value=1-Math.min(.8,scrollY/pageHeight*.8);
      const begin=performance.now();renderer.render(scene,camera);lastRenderMs=performance.now()-begin;renderCount++;
      if(root.dataset.portrait!=='ready') root.dataset.portrait='ready';
      dirty=false;
      // Frame intervals include GPU/compositor pressure that render() submission cannot.
      // Ignore long idle/visibility gaps. Quality only steps downward to avoid oscillation.
      if(enabled&&visible&&!needsLayout&&!portraitStatic&&tier!=='mobile') {
        if(!sampleStart)sampleStart=now;
        if(interval>0&&interval<250){frames++;if(interval>(tier==='high'?29:43)||lastRenderMs>18)slow++;}
        if(now-sampleStart>1400&&frames>=12){
          if(tier==='economy'&&frames*1000/(now-sampleStart)<20){
            // Last-resort floor: a native static mesh poster scrolls smoothly; only
            // the very quiet field continues. Do not run a choppy portrait forever.
            portraitStatic=true;root.dataset.portraitQuality='static';
          } else if(tier!=='economy'&&slow/frames>.55){tier=tier==='high'?'balanced':'economy';renderer.setPixelRatio(caps[tier]);renderer.setSize(width,height,false);u.dpr.value=f.dpr.value=renderer.getPixelRatio();}
          frames=slow=0;sampleStart=now;
        }
      }
      if(enabled)raf=requestAnimationFrame(frame);
    } catch { fallback(); }
  }
}
