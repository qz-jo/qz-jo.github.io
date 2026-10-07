// Record the actual browser viewport at normal elapsed time into native MP4.
const {chromium}=require('C:/Users/saifn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../evidence');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const ctx=await browser.newContext({viewport:{width:1440,height:900}});
 const encoder=await ctx.newPage();
 await encoder.setContent('<canvas width="1440" height="900"></canvas>');
 await encoder.evaluate(()=>{
  const canvas=document.querySelector('canvas');window.recordCanvas=canvas;window.chunks=[];
  window.recorder=new MediaRecorder(canvas.captureStream(24),{mimeType:'video/mp4;codecs=avc1.42001E',videoBitsPerSecond:7500000});
  recorder.ondataavailable=e=>chunks.push(e.data);recorder.start();
 });
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const started=Date.now();await page.goto('http://127.0.0.1:8093/',{waitUntil:'domcontentloaded'});
 let frames=0,last=0;const marks=[['intro-start',.35],['intro-forming',1.25],['intro-face-readable',2.5],['intro-complete',4.7],['hero-idle',7],['hero-mouse-interaction',10],['scroll-transition',14]];let mark=0;
 while(Date.now()-started<18000){
  const t=(Date.now()-started)/1000;
  if(t>8&&t<11){await page.mouse.move(900+110*Math.sin(t*2),350+65*Math.cos(t*2));}
  if(t>11.5&&t<15.5){await page.evaluate(y=>scrollTo(0,y),Math.round((t-11.5)*145));}
  const shot=await page.screenshot({type:'jpeg',quality:92});
  await encoder.evaluate(async data=>{const img=new Image();img.src='data:image/jpeg;base64,'+data;await img.decode();recordCanvas.getContext('2d').drawImage(img,0,0);},shot.toString('base64'));
  if(mark<marks.length&&t>=marks[mark][1]){await page.screenshot({path:path.join(out,marks[mark][0]+'.png')});mark++;}
  frames++;last=t;
 }
 const data=await encoder.evaluate(()=>new Promise(resolve=>{recorder.onstop=async()=>{const b=new Blob(chunks,{type:'video/mp4'});const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(b);};recorder.stop();}));
 fs.writeFileSync(path.join(out,'portrait-viewport-recording.mp4'),Buffer.from(data,'base64'));
 fs.writeFileSync(path.join(out,'recording.json'),JSON.stringify({frames,elapsed:last,errors,gpu:await page.evaluate(()=>window.portraitStats)},null,2));
 // Frames from the final normal-speed capture are also sampled for transition review.
 await browser.close();console.log(JSON.stringify({frames,elapsed:last,errors}));
})();
