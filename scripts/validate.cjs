const {chromium}=require('C:/Users/saifn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[],bad=[],results=[];
 for(const [name,width,height,extra] of [['desktop-1440',1440,900,{}],['desktop-1920',1920,1080,{}],['desktop-1366',1366,768,{}],['mobile',390,844,{isMobile:true,hasTouch:true,deviceScaleFactor:3}],['mobile-small',320,640,{isMobile:true,hasTouch:true,deviceScaleFactor:2}],['reduced-motion',1440,900,{reducedMotion:'reduce'}],['fallback',1440,900,{}]]){
  const context=await browser.newContext({viewport:{width,height},...extra});const page=await context.newPage();
  page.on('pageerror',e=>errors.push(name+': '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push(name+': '+m.text())});
  page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8093')&&r.status()>=400)bad.push(r.url())});
  await page.goto('http://127.0.0.1:8093/'+(name==='fallback'?'?portraitFallback=1':''));await page.waitForTimeout(6000);
  const stats=await page.evaluate(()=>({stats:window.portraitStats,overflow:document.documentElement.scrollWidth>innerWidth,state:document.querySelector('#home').dataset.portraitState}));
  assert.equal(stats.overflow,false,name+' overflow');assert.ok(stats.stats,name+' loaded');
  await page.screenshot({path:path.join(out,name+'.png')});
  if(name==='mobile')await page.screenshot({path:path.join(out,'mobile-full.png'),fullPage:true});
  await page.locator('#languageToggle').click();await page.waitForTimeout(300);assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
  await page.screenshot({path:path.join(out,name+'-ar.png')});
  await page.locator('#languageToggle').click();
  if(name==='desktop-1440'){
    await page.screenshot({path:path.join(out,'hero-idle.png')});
    await page.mouse.move(1030,340);await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'hero-mouse-interaction.png')});
    await page.mouse.move(20,20);await page.waitForTimeout(700);await page.mouse.wheel(0,450);await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,'scroll-transition.png')});
    await page.evaluate(()=>scrollTo(0,0));await page.locator('#motionToggle').click();await page.waitForTimeout(100);
    const a=await page.locator('#portraitCanvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(200);assert.equal(await page.locator('#portraitCanvas').evaluate(c=>c.toDataURL()),a,'paused scene must be still');
    await page.locator('#heroPortraitStage').screenshot({path:path.join(out,'portrait-still.png')});
    await page.locator('#portraitCanvas').screenshot({path:path.resolve(__dirname,'../assets/portrait-fallback.png')});
    console.log('MediaRecorder support',await page.evaluate(()=>['video/mp4','video/mp4;codecs=avc1.42001E','video/webm'].map(x=>[x,MediaRecorder.isTypeSupported(x)])));
  }
  results.push({name,...stats});await context.close();
 }
 const ctx=await browser.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();await p.goto('http://127.0.0.1:8093/?portraitDev=1');await p.waitForTimeout(1000);
 for(const [name,time] of [['intro-start',.2],['intro-forming',1],['intro-face-readable',2.25],['intro-complete',4.3]]){await p.locator('input[aria-label="Portrait timeline"]').fill(String(time));await p.waitForTimeout(120);await p.locator('.portrait-debug').evaluate(e=>e.style.visibility='hidden');await p.screenshot({path:path.join(out,name+'.png')});await p.locator('.portrait-debug').evaluate(e=>e.style.visibility='visible');}
 fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({results,errors,bad},null,2));console.log(JSON.stringify({results,errors,bad},null,2));
 await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
})();
