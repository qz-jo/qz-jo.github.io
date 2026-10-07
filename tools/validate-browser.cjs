/* Real Chromium checks. Set PLAYWRIGHT_MODULE and CHROME_PATH when not on PATH.
   node tools/build.mjs; python -m http.server 8080 --directory dist
   BASE_URL=http://localhost:8080 node tools/validate-browser.cjs */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://localhost:8080';
const output=path.resolve(__dirname,'../docs/screenshots');fs.mkdirSync(output,{recursive:true});
 const report={browser:'Chromium version reported by Playwright',environment:'Headless software WebGL; mobile viewport emulation, not a physical phone. Optional external GitHub pulse is stubbed with an empty successful response to keep the static count.',checks:[]};
(async()=>{
 let server;
 if(!process.env.BASE_URL){
  const root=path.resolve(__dirname,'../dist');
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.bin':'application/octet-stream'};
  server=require('node:http').createServer((req,res)=>{
   let name=decodeURIComponent(new URL(req.url,base).pathname);if(name==='/')name='/index.html';
   const file=path.resolve(root,'.'+name);
   if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   fs.readFile(file,(err,body)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':body);});
  });await new Promise(resolve=>server.listen(8080,'127.0.0.1',resolve));
 }
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  report.browser=`Chromium ${browser.version()}`;
 try {
  const allViewports=[[1920,1080],[1440,900],[1366,768],[390,844]];
  const selectedViewports=process.env.PORTRAIT_VIEWPORTS?.split(',').map(Number);
  const viewports=selectedViewports?allViewports.filter(([width])=>selectedViewports.includes(width)):allViewports;
  if(!viewports.length)throw new Error('PORTRAIT_VIEWPORTS must include 1920, 1440, 1366, or 390');
  for(const [width,height] of viewports) {
   const mobile=width<940;const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:mobile?3:2,isMobile:mobile,hasTouch:mobile});
   const page=await context.newPage();const errors=[],failed=[];
   await page.route('https://api.github.com/users/qz-jo/repos?*',r=>r.fulfill({contentType:'application/json',body:'[]'}));
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push({url:r.url(),status:r.status()});});
   await page.goto(base+'/?portraitDev=1');await page.waitForFunction(()=>document.documentElement.dataset.portrait==='ready',{timeout:20000});
   await page.waitForFunction(()=>document.documentElement.dataset.intro==='hero',{timeout:20000});
   await page.waitForTimeout(1200);
   const top=await page.evaluate(()=>({status:document.documentElement.dataset.portrait,canvas:document.querySelectorAll('canvas').length,overflow:document.documentElement.scrollWidth>innerWidth,stats:window.portraitDev.stats(),stage:document.querySelector('#heroPortraitStage').getBoundingClientRect().toJSON(),heroHeight:document.querySelector('#home').offsetHeight}));
   assert.equal(top.canvas,1);assert.equal(top.overflow,false);assert.ok(top.stats.dpr<=(mobile?1:1.25));
   assert.ok(mobile?Math.abs(top.stage.x+top.stage.width/2-width/2)<2:top.stage.x>width*.43,'final Hero composition');

   // Let the frame-timing quality controller settle before measuring steady rendering.
   await page.waitForTimeout(3000);
   const performance=await page.evaluate(async()=>{
    const initial=window.portraitDev.stats().renderCount;const gaps=[];let prev=performance.now();const start=prev;
    await new Promise(resolve=>{function tick(now){gaps.push(now-prev);prev=now;if(now-start>2500)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);});
    gaps.sort((a,b)=>a-b);return {durationMs:prev-start,renderedFrames:window.portraitDev.stats().renderCount-initial,medianRafMs:gaps[Math.floor(gaps.length*.5)],p95RafMs:gaps[Math.floor(gaps.length*.95)],stats:window.portraitDev.stats()};
   });
   await page.addStyleTag({content:'#portraitDiagnostics { display:none; }'});
   await page.screenshot({scale:'css',path:path.join(output,mobile?'mobile-hero.png':`desktop-${width}.png`)});
   assert.equal(performance.stats.portraitStatic,false);
   assert.ok(performance.stats.time>top.stats.time+.5,'animation clock advances');
   assert.ok(performance.renderedFrames>10,'face keeps rendering after adaptation');
   // Pointer influence changes yaw smoothly without moving the mesh landmarks.
   if(!mobile){
    const yaw=performance.stats.yaw;await page.mouse.move(width*.88,height*.3);
    await page.waitForTimeout(550);assert.ok(Math.abs((await page.evaluate(()=>portraitDev.stats().yaw))-yaw)>.005);
   }
   await page.evaluate(()=>window.scrollTo({top:260,behavior:'instant'}));await page.waitForTimeout(700);
   if(width===1440)await page.screenshot({scale:'css',path:path.join(output,'hero-scrolled.png')});
   await page.locator('#capabilities').scrollIntoViewIfNeeded();await page.waitForTimeout(800);
   const middle=await page.evaluate(()=>window.portraitDev.stats());assert.equal(middle.visible,false);assert.equal(middle.drawCalls,1);
   if(width===1440)await page.screenshot({scale:'css',path:path.join(output,'middle-transition.png')});
   // Native project matcher and details continue to work.
   await page.locator('[data-match="automation"]').click();
   assert.equal(await page.locator('[data-match="automation"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('[data-project="automation"]').evaluate(el=>el.classList.contains('is-recommended')),true);
   const detail=page.locator('details').first();await detail.locator('summary').click();assert.equal(await detail.getAttribute('open'),'');
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
   await page.locator('#languageToggle').click();assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(width===1440)await page.screenshot({scale:'css',path:path.join(output,'arabic-hero.png')});
   await page.locator('#languageToggle').click();
   await page.locator('.assistant-fab').click();assert.equal(await page.locator('#assistantPanel').getAttribute('aria-hidden'),'false');
   const beforeMessages=await page.locator('#assistantLog .assistant-message').count();await page.locator('#assistantPanel [data-question=automation]').click();await page.waitForTimeout(500);assert.ok(await page.locator('#assistantLog .assistant-message').count()>beforeMessages);await page.locator('#assistantClose').click();
   if(mobile){await page.locator('#menuToggle').click();assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'true');await page.locator('#primaryNav a[href="#about"]').click();assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'false');}
   else{await page.keyboard.press('Control+k');assert.equal(await page.locator('#commandPalette').evaluate(el=>el.open),true);await page.keyboard.press('Escape');}
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
   await page.locator('#motionToggle').click();await page.waitForTimeout(200);
   await page.waitForTimeout(700);const paused=await page.evaluate(()=>window.portraitDev.stats().renderCount);await page.waitForTimeout(400);
   assert.equal(await page.evaluate(()=>window.portraitDev.stats().renderCount),paused);
   await page.locator('#motionToggle').click();
   if(width===1440){
    // Simulate the browser's Page Visibility notification and verify scheduling stops.
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    const hiddenFrames=await page.evaluate(()=>window.portraitDev.stats().renderCount);await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>window.portraitDev.stats().renderCount),hiddenFrames);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
   }
   assert.deepEqual(failed,[]);assert.deepEqual(errors,[]);
   report.checks.push({viewport:`${width}x${height}`,top,performance,middle,local404s:failed,consoleErrors:errors,interactions:'matcher, details, language, motion, navigation / command palette passed'});
   console.log('PASS',width,height);await context.close();
  }
  for(const mode of process.env.PORTRAIT_SKIP_MODES==='1'?[]:['reduced','fallback','no-webgl','asset-failure','module-failure']) {
   const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:mode==='reduced'?'reduce':'no-preference'});const page=await context.newPage();
   await page.route('https://api.github.com/users/qz-jo/repos?*',r=>r.fulfill({contentType:'application/json',body:'[]'}));
   if(mode==='no-webgl')await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args);};});
   if(mode==='asset-failure')await page.route('**/saif-particles*.bin*',r=>r.fulfill({status:404,body:'missing'}));
    if(mode==='module-failure')await page.route('**/vendor/three.js*',r=>r.abort());
   await page.goto(base+`/?portraitDev=1${mode==='fallback'?'&portraitFallback=1':''}`);
   await page.waitForFunction(()=>['ready','fallback'].includes(document.documentElement.dataset.portrait));await page.waitForTimeout(1200);
   const result=await page.evaluate(()=>({status:document.documentElement.dataset.portrait,posterOpacity:getComputedStyle(document.querySelector('.particle-poster')).opacity,titleVisible:document.querySelector('h1').getBoundingClientRect().width>0,stats:window.portraitDev?.stats()}));
   if(mode==='reduced'){assert.equal(result.status,'ready');assert.equal(result.stats.enabled,false);const count=result.stats.renderCount;await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.portraitDev.stats().renderCount),count);}
   else{assert.equal(result.status,'fallback');assert.equal(Number(result.posterOpacity),1);}
   await page.keyboard.press('Control+k');assert.equal(await page.locator('#commandPalette').evaluate(el=>el.open),true);
   await page.keyboard.press('Escape');
   await page.screenshot({scale:'css',path:path.join(output,`${mode}.png`)});report.checks.push({mode,...result});console.log('PASS',mode);await context.close();
  }
  // Production must never expose development controls, even with the query parameter.
  const context=await browser.newContext();const page=await context.newPage();
  const prefixFailures=[];page.on('response',r=>{if(r.url().startsWith('https://preview.example')&&r.status()>=400)prefixFailures.push(r.url());});
  await page.route('https://api.github.com/users/qz-jo/repos?*',r=>r.fulfill({contentType:'application/json',body:'[]'}));
  await page.route('https://preview.example/**',async route=>{const u=new URL(route.request().url());const response=await route.fetch({url:base+u.pathname.replace(/^\/review\//,'/')+u.search});await route.fulfill({response});});
  await page.goto('https://preview.example/review/?portraitDev=1');await page.waitForFunction(()=>document.documentElement.dataset.portrait==='ready');
  assert.equal(await page.evaluate(()=>typeof window.portraitDev),'undefined');assert.equal(await page.locator('#portraitDiagnostics').count(),0);assert.deepEqual(prefixFailures,[]);report.checks.push({mode:'production-debug-disabled-and-pages-subpath',passed:true});await context.close();
 } finally {await browser.close();server?.close();fs.writeFileSync(path.resolve(__dirname,'../docs/browser-validation.json'),JSON.stringify(report,null,2)+'\n');}
})().catch(e=>{console.error(e);process.exitCode=1;});
