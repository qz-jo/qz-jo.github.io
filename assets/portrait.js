// One persistent GPU scene: formation, idle, interaction and scroll share matter.
const hero = document.querySelector('#home');
const canvas = document.querySelector('#portraitCanvas');
const fallback = document.querySelector('#portraitFallback');
const dev = new URLSearchParams(location.search).has('portraitDev');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const STATES = ['BOOT','SCATTERED','FORMING','FACE_REVEAL','HAIR_REVEAL','BUST_COMPLETE','HERO_IDLE','SCROLL_DISSOLVE','PAGE_FLOW'];
let gl, program, core, indices, points, manifest, started, last, frames = 0, fps = 0, fpsAt = 0;
let tier = innerWidth < 700 ? 'LOW' : 'HIGH', dpr = 1, active = true, lost = false, loopStarted = false;
let elapsed = 0, scroll = 0, pointer = [10,10], targetPointer = [10,10], influence = 0;
 let timeOverride = null, qualityOverride = null, slowFrames = 0, stillKey = '';
const tiers = { HIGH:{stride:1,dpr:1.75}, MEDIUM:{stride:2,dpr:1.35}, LOW:{stride:3,dpr:1.15} };
const debug = dev ? document.body.appendChild(document.createElement('aside')) : null;
if(debug){
  debug.className='portrait-debug'; debug.innerHTML='<pre></pre><label>Time <input aria-label="Portrait timeline" type="range" min="0" max="8" step=".01"></label><button>Replay</button><select aria-label="Portrait quality"><option>AUTO</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>';
  debug.querySelector('input').oninput=e=>{timeOverride=+e.target.value;};
  debug.querySelector('button').onclick=()=>{timeOverride=null;elapsed=0;};
  debug.querySelector('select').onchange=e=>{qualityOverride=e.target.value==='AUTO'?null:e.target.value; tier=qualityOverride || (innerWidth<700?'LOW':'HIGH');resize();};
}
const vertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 aColor;
layout(location=3) in vec4 aData;
layout(location=4) in vec3 aExtra;
uniform float uTime,uScroll,uAspect,uDpr,uPoints,uMotion,uInfluence;
uniform vec2 uPointer;
out vec3 vColor;
out float vOpacity,vEdge,vSeed,vRegion;
float ease(float a){return a*a*(3.0-2.0*a);}
void main(){
 float seed=aData.x,region=aData.y,delay=aData.z,size=aData.w;
 float edge=aExtra.x;
 float progress=ease(clamp((uTime-delay)/1.22,0.0,1.0));
 vec3 p=aPosition;
 float free=region>3.5?1.0:mix(.035,.24,1.0-edge);
 if(region==2.0) free=.15;
 float lag=region*.045;
 float dissolve=smoothstep(lag,1.15+lag,uScroll);
 float phase=seed*6.283;
 // Curved paths converge directly onto the final source pose.
 float flow=p.x*2.4+p.y*1.8+region*.6+seed*.9;
 vec3 origin=p+vec3(sin(flow)*2.1,cos(flow*.8)*1.8-1.0,sin(flow*1.4)*2.5);
 vec3 arc=vec3(cos(flow+progress*4.5),sin(flow+progress*3.7),cos(flow+progress*3.0));
 if(uPoints>.5){
  p=mix(origin,p,progress)+arc*sin(progress*3.14159)*(.5+seed*.8);
  p+=vec3(sin(uTime*.43+phase),cos(uTime*.31+phase),sin(uTime*.29+phase)) * free*.09*uMotion*progress;
  if(region==4.0) p+=vec3(sin(uTime*.3+p.y)*.06,cos(uTime*.2+phase)*.05,0)*uMotion;
  p+=aNormal*.009;
 }
 // Core, skin, hair and streams follow with increasing lag.
 p.y-=dissolve*(.22+region*.13);
 if(uPoints>.5){p.x+=dissolve*sin(p.y*2.0+phase)*free*1.5;p.y-=dissolve*free*1.8;}
 float drift=sin(uTime*.21)*.009*uMotion;
 mat2 turn=mat2(cos(drift),-sin(drift),sin(drift),cos(drift));
 p.xz=turn*p.xz;
 vec2 projected=vec2(p.x/(2.8*uAspect), (p.y-.05)/2.8);
 float near=1.0-smoothstep(0.0,.19,length(projected-uPointer));
 if(uPoints>.5 && region<5.0){
   vec2 direction=normalize(projected-uPointer+vec2(.001));
   p.xy+=direction*near*uInfluence*mix(.025,.13,free)*progress;
   p.z+=near*uInfluence*.08*free;
 }
 gl_Position=vec4(p.x/(2.8*uAspect),(p.y-.05)/2.8,-p.z/5.0,1.0);
 gl_PointSize=clamp(size*uDpr*(region==5.0?2.4:1.5),1.0,6.0);
 vec3 n=normalize(aNormal);
 float key=max(0.0,dot(n,normalize(vec3(.75,.50,1.0))));
 float rim=pow(1.0-max(n.z,0.0),2.0)*max(n.x,0.0);
 vec3 silver=vec3(.48,.61,.95);
 vec3 warm=vec3(.80,.48,.22);
 // Identity comes from geometry; colour is sculptural light, never visible skin.
 float tone=dot(aColor,vec3(.299,.587,.114));
 vColor=silver*(.18+pow(key,1.4)*1.05)*(.18+tone*1.35)+warm*rim*.08;
 if(region==2.0) vColor=silver*(.08+key*.35)+warm*rim*.12;
 if(region==3.0) vColor=silver*(.16+key*.90);
 if(region==1.0) vColor=silver*(.14+key*.45);
 if(region>=4.0) vColor=mix(silver,warm,step(.94,seed))*(region==5.0?.35:.58);
 if(uPoints>.5) vColor*=.75+seed*.55;
 else vColor=vec3(.012,.017,.023)*(.5+key);
 vOpacity=progress*(1.0-dissolve*.85);
 if(region==3.0)vOpacity*=smoothstep(-2.78,-1.8,aPosition.y);
 if(region==5.0) vOpacity=.22*(1.0-dissolve*.8);
 if(region==4.0) vOpacity*=.40;
 vEdge=edge;vSeed=seed;vRegion=region;
}`;
const fragment = `#version 300 es
precision highp float;
in vec3 vColor;
in float vOpacity,vEdge,vSeed,vRegion;
uniform float uPoints;
out vec4 outColor;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
 float alpha=vOpacity;
 if(uPoints>.5){
   float r=length(gl_PointCoord-.5)*2.0;
   if(r>1.0) discard;
   alpha*=1.0-smoothstep(.38,1.0,r);
   if(vRegion==0.0) alpha*=mix(.87,.60,1.0-vEdge);
 }else{
   // Stable dithering feathers the topology boundary before its real edge.
   float density=smoothstep(.08,.95,vEdge)*alpha*.25;
   if(hash(gl_FragCoord.xy)>density) discard;
   alpha=1.0;
 }
 if(alpha<.005) discard;
 outColor=vec4(vColor,alpha);
}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function buffer(data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return {buffer:b,count:data.length/16};}
function unpack(data){
 const q=new Uint16Array(data),out=new Float32Array(q.length);
 const low=[-4,-4,-4,-1,-1,-1,0,0,0,0,0,0,0,0,0,0],high=[4,4,4,1,1,1,1,1,1,1,5,4,3,1,1,1];
 for(let i=0;i<q.length;i++){const j=i%16;out[i]=low[j]+q[i]/65535*(high[j]-low[j]);}
 return out;
}
function bind(data,step=1){
 gl.bindBuffer(gl.ARRAY_BUFFER,data.buffer);
 [[0,3,0],[1,3,3],[2,3,6],[3,4,9],[4,3,13]].forEach(([i,n,o])=>{gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,n,gl.FLOAT,false,64*step,o*4);});
}
function uniform(name,value){gl.uniform1f(gl.getUniformLocation(program,name),value);}
function resize(){
 if(!gl)return;
 dpr=Math.min(devicePixelRatio||1,tiers[tier].dpr);
 const r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);
 gl.viewport(0,0,canvas.width,canvas.height);
}
function stateFor(t){
 if(scroll>1)return 'PAGE_FLOW';if(scroll>.08)return 'SCROLL_DISSOLVE';
 return t<.5?'SCATTERED':t<1.2?'FORMING':t<2.3?'FACE_REVEAL':t<3.3?'HAIR_REVEAL':t<4.3?'BUST_COMPLETE':'HERO_IDLE';
}
function draw(now){
 requestAnimationFrame(draw);
 if(lost||!gl||!active||document.hidden){last=now;return;}
 const dt=Math.min(.05,(now-(last||now))/1000);last=now;
 const motion=!reduced.matches&&document.documentElement.dataset.motion!=='off';
 if(motion)elapsed+=dt;
 const t=timeOverride??(motion?elapsed:5);
 scroll=Math.max(0,Math.min(1.5,window.scrollY/hero.offsetHeight));
 pointer=pointer.map((x,i)=>x+(targetPointer[i]-x)*Math.min(1,dt*8));
 influence+=(targetPointer[0]===10?0:1-influence)*Math.min(1,dt*6);
 if(targetPointer[0]===10)influence*=Math.exp(-dt*8);
 hero.dataset.portraitState=stateFor(t);hero.dataset.rendering=motion?'animated':'still';
 const key=[t,scroll,canvas.width,canvas.height,tier].join('/');
 if(!motion&&timeOverride===null&&key===stillKey)return;stillKey=key;
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
 uniform('uTime',t);uniform('uScroll',scroll);uniform('uDpr',dpr);uniform('uAspect',canvas.width/canvas.height);uniform('uMotion',motion?1:0);uniform('uInfluence',motion?influence:0);
 gl.uniform2f(gl.getUniformLocation(program,'uPointer'),...pointer);
 gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
 uniform('uPoints',0);bind(core);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.drawElements(gl.TRIANGLES,manifest.triangles*3,gl.UNSIGNED_INT,0);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
 uniform('uPoints',1);const step=tiers[tier].stride;bind(points,step);gl.drawArrays(gl.POINTS,0,Math.floor(points.count/step));
 frames++;
 if(now-fpsAt>1000||!motion){
  fps=motion?frames*1000/(now-fpsAt):0;frames=0;fpsAt=now;
  if(motion&&t>5&&fps<32&&!qualityOverride){if(++slowFrames>=3&&tier!=='LOW'){tier=tier==='HIGH'?'MEDIUM':'LOW';resize();slowFrames=0;}}else slowFrames=0;
  const stats={fps:Math.round(fps),renderer:'WebGL2 / GPU surface buffers',dpr,gpu:gpuName(),quality:tier,face:Math.floor(manifest.counts.face/step),hair:Math.floor(manifest.counts.hair/step),atmosphere:Math.floor(manifest.counts.atmosphere/step),introState:stateFor(t),introProgress:Math.min(1,t/4.3),cursorInfluence:+influence.toFixed(2),scrollProgress:+scroll.toFixed(2),fallback:false,reducedMotion:reduced.matches};
  window.portraitStats=stats;if(debug)debug.querySelector('pre').textContent=JSON.stringify(stats,null,2);
 }
}
function gpuName(){const e=gl.getExtension('WEBGL_debug_renderer_info');return e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'unavailable';}
function fail(reason){
 lost=true;canvas.hidden=true;fallback.hidden=false;hero.dataset.portraitState='FALLBACK';
 window.portraitStats={fallback:true,reason,reducedMotion:reduced.matches};
 if(debug)debug.querySelector('pre').textContent=JSON.stringify(window.portraitStats,null,2);
}
async function boot(){
 hero.dataset.portraitState=STATES[0];
 try{
  gl=new URLSearchParams(location.search).has('portraitFallback')?null:canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'high-performance'});
  if(!gl)throw Error('WebGL2 unavailable');
  const data=await Promise.all(['portrait-core.q.gz','portrait-particles.q.gz','portrait-manifest.json','portrait-indices.gz'].map(async p=>{const r=await fetch('/assets/'+p);if(!r.ok)throw Error('Asset '+p+' '+r.status);return p.endsWith('json')?r.json():new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}));
  manifest=data[2];core=buffer(unpack(data[0]));points=buffer(unpack(data[1]));
  indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(data[3]),gl.STATIC_DRAW);
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  canvas.hidden=false;resize();started=performance.now();fpsAt=started;
  if(!loopStarted){loopStarted=true;requestAnimationFrame(draw);}fallback.hidden=true;
 }catch(e){fail(e.message);}
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail('context lost');});
canvas.addEventListener('webglcontextrestored',()=>{lost=false;elapsed=5;boot();});
hero.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();targetPointer=[(e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2];});
hero.addEventListener('pointerleave',()=>{targetPointer=[10,10];});
new IntersectionObserver(([e])=>{active=e.isIntersecting;},{rootMargin:'150px'}).observe(hero);
addEventListener('resize',resize,{passive:true});
boot();
