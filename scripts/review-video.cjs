const {chromium}=require('C:/Users/saifn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');const out=path.resolve(__dirname,'../evidence/video-frames');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const p=await b.newPage();await p.goto('http://127.0.0.1:8093/');
 await p.evaluate(()=>{document.body.innerHTML='<video muted src="/evidence/portrait-full-motion.mp4" preload="auto"></video><canvas width="1440" height="900"></canvas>';});
 await p.waitForFunction(()=>document.querySelector('video').readyState>=3);
 const result=await p.evaluate(async()=>{const v=document.querySelector('video'),c=document.querySelector('canvas'),ctx=c.getContext('2d');const frames=[];let next=.1;await v.play();
  while(!v.ended&&v.currentTime<17.7){await new Promise(r=>setTimeout(r,30));if(v.currentTime>=next){ctx.drawImage(v,0,0,1440,900);frames.push({time:v.currentTime,image:c.toDataURL('image/jpeg',.85).split(',')[1]});next+=v.currentTime<5?.25:1;}}
  return {duration:v.duration,frames};});
 result.frames.forEach((f,i)=>fs.writeFileSync(path.join(out,String(i).padStart(2,'0')+'-'+f.time.toFixed(2)+'.jpg'),Buffer.from(f.image,'base64')));
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({duration:result.duration,times:result.frames.map(x=>x.time),review:'Playback at natural speed, snapshots every .25s during formation and every second afterwards'},null,2));
 console.log('Playback reviewed',result.duration,result.frames.length);await b.close();})();
