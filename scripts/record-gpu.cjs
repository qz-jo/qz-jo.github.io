// Normal-speed 60fps GPU canvas capture composited with the actual page raster.
// The separate viewport recording records uncomposited browser screenshots.
const {chromium}=require('C:/Users/saifn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../evidence');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const ctx=await browser.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:8093/?portraitDev=1');await p.waitForFunction(()=>window.portraitStats?.introState==='HERO_IDLE');
 await p.locator('.portrait-debug').evaluate(e=>e.style.visibility='hidden');
 const background=await p.screenshot({fullPage:true,style:'#portraitCanvas {visibility:hidden!important} .reveal {opacity:1!important;transform:none!important}'});
 await p.locator('.portrait-debug button').evaluate(e=>e.click());
 await p.waitForFunction(()=>document.querySelector('#home').dataset.portraitState==='SCATTERED');
 await p.evaluate(async data=>{
  const bg=new Image();bg.src='data:image/png;base64,'+data;await bg.decode();
  const c=document.createElement('canvas');c.width=1440;c.height=900;c.style.cssText='position:fixed;left:-10000px;top:0';document.body.append(c);
  const scene=document.querySelector('#portraitCanvas'),ctx=c.getContext('2d');window.recordFrames=0;window.recording=true;
  function frame(){
   if(!recording)return;const r=scene.getBoundingClientRect();
   ctx.fillStyle='#05070a';ctx.fillRect(0,0,1440,900);ctx.drawImage(bg,0,-scrollY);
   ctx.drawImage(scene,r.x,r.y,r.width,r.height);
   ctx.drawImage(bg,0,0,1440,86,0,0,1440,86);window.recordFrames++;
   requestAnimationFrame(frame);
  }
  window.parts=[];window.media=new MediaRecorder(c.captureStream(60),{mimeType:'video/mp4;codecs=avc1.42001E',videoBitsPerSecond:9000000});media.ondataavailable=e=>parts.push(e.data);media.start();frame();
 },background.toString('base64'));
 const start=Date.now();let mark=0;const marks=[['intro-start',.2],['intro-forming',1],['intro-face-readable',2],['intro-complete',4.35],['hero-idle',7],['hero-mouse-interaction',9.8],['scroll-transition',14]];
 while(Date.now()-start<18000){const t=(Date.now()-start)/1000;
  if(t>8&&t<11)await p.mouse.move(940+95*Math.sin(t*1.3),350+70*Math.cos(t*1.3));
  if(t>11)await p.mouse.move(20,20);
  if(t>11.5&&t<15.5)await p.evaluate(y=>scrollTo(0,y),Math.round((t-11.5)*145));
  if(mark<marks.length&&t>=marks[mark][1]){await p.screenshot({path:path.join(out,marks[mark][0]+'.png')});mark++;}
  await p.waitForTimeout(40);
 }
 const data=await p.evaluate(()=>new Promise(resolve=>{media.onstop=async()=>{window.recording=false;const blob=new Blob(parts,{type:'video/mp4'});const f=new FileReader();f.onload=()=>resolve({base64:f.result.split(',')[1],frames:recordFrames});f.readAsDataURL(blob);};media.stop();}));
 fs.writeFileSync(path.join(out,'portrait-full-motion.mp4'),Buffer.from(data.base64,'base64'));
 fs.writeFileSync(path.join(out,'gpu-recording.json'),JSON.stringify({frames:data.frames,seconds:18,method:'Live 60fps GPU canvas composited over a raster of the actual page; separate viewport video provided',stats:await p.evaluate(()=>window.portraitStats)},null,2));
 console.log('Recorded',data.frames,'frames');await browser.close();
})();
