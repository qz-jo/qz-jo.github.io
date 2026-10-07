/* Actual Chromium screencast and visual motion/intro checks. Same environment as validate-browser. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),output=path.resolve(__dirname,'../docs/screenshots');
const frames=path.resolve(__dirname,'../test-results/portrait-frames');fs.mkdirSync(frames,{recursive:true});
const report={environment:'Actual Chromium software WebGL screencast; not a physical GPU benchmark.',frames:[],checks:[]};
const server=require('node:http').createServer((req,res)=>{let name=new URL(req.url,'http://localhost:8081').pathname;if(name==='/')name='/index.html';const file=path.join(root,name);fs.readFile(file,(err,body)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.bin':'application/octet-stream'}[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':body);});});
(async()=>{await new Promise(resolve=>server.listen(8081,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try {
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://api.github.com/**',r=>r.fulfill({contentType:'application/json',body:'[]'}));
 const cdp=await context.newCDPSession(page);let filming=true;
 cdp.on('Page.screencastFrame',event=>{if(filming){const name=String(report.frames.length).padStart(5,'0')+'.jpg';fs.writeFileSync(path.join(frames,name),Buffer.from(event.data,'base64'));report.frames.push({file:name,time:event.metadata.timestamp});}cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:960,maxHeight:600,everyNthFrame:2});
 await page.goto('http://localhost:8081/?portraitDev=1&intro=1');
 await page.addStyleTag({content:'#portraitDiagnostics { display:none; }'});
 await page.waitForFunction(()=>window.portraitDev?.stats().introElapsed>=1.55,{timeout:20000});
 let first=await page.evaluate(()=>portraitDev.stats());assert.equal(first.introState,'forming');
 await page.screenshot({scale:'css',path:path.join(output,'intro-forming.png')});
 await page.waitForFunction(()=>portraitDev.stats().introElapsed>=2.97);
 await page.screenshot({scale:'css',path:path.join(output,'intro-complete.png')});
 await page.waitForFunction(()=>document.documentElement.dataset.intro==='hero');
 assert.equal(await page.locator('canvas').count(),1);
 const clip={x:680,y:105,width:650,height:690};
 await page.screenshot({clip,path:path.join(frames,'idle-before.png')});
 const idleStart=await page.evaluate(()=>portraitDev.stats());await page.waitForTimeout(5000);
 await page.screenshot({clip,path:path.join(frames,'idle-after.png')});
 const idleEnd=await page.evaluate(()=>portraitDev.stats());assert.ok(idleEnd.time>idleStart.time+3);
 const yaw=idleEnd.yaw;await page.mouse.move(1400,300);await page.waitForTimeout(700);
 const mouse=await page.evaluate(()=>portraitDev.stats());assert.ok(Math.abs(mouse.yaw-yaw)>.02);
 await page.mouse.move(100,500);await page.waitForTimeout(700);
 await page.evaluate(()=>window.scrollTo({top:260,behavior:'smooth'}));await page.waitForTimeout(1000);
 await page.locator('#capabilities').scrollIntoViewIfNeeded();await page.waitForTimeout(800);
 filming=false;await cdp.send('Page.stopScreencast');
 report.checks.push({mode:'formation-to-Hero-single-canvas',first,idleStart,idleEnd,mouse,consoleErrors:errors});assert.deepEqual(errors,[]);
 // Same session reload skips formation; forced replay and explicit skip remain available.
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.intro==='hero');
 // The URL contains intro=1, so check the non-forced subsequent load instead.
 await page.goto('http://localhost:8081/?portraitDev=1');await page.waitForFunction(()=>document.documentElement.dataset.portrait==='ready');
 assert.equal(await page.evaluate(()=>portraitDev.stats().introState),'hero');
 await page.goto('http://localhost:8081/?portraitDev=1&intro=1');await page.waitForFunction(()=>window.portraitDev?.stats().introState==='forming');
 await page.locator('#introSkip').click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.intro),'hero');
 report.checks.push({mode:'session-replay-and-explicit-skip',passed:true});
 // The skip button also releases the HTML immediately while the buffer is delayed.
 await page.route('**/saif-particles*.bin*',async r=>{await new Promise(resolve=>setTimeout(resolve,1600));await r.continue();});
 await page.goto('http://localhost:8081/?portraitDev=1&intro=1');await page.locator('#introSkip').click();
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.intro),'hero');await page.waitForFunction(()=>document.documentElement.dataset.portrait==='ready');
 assert.equal(await page.evaluate(()=>portraitDev.stats().introState),'hero');
 report.checks.push({mode:'skip-during-loading',passed:true});
 await page.goto('http://localhost:8081/?portraitDev=1&intro=1');await page.locator('#motionToggle').click();
 await page.waitForFunction(()=>document.documentElement.dataset.portrait==='ready');assert.equal(await page.evaluate(()=>portraitDev.stats().enabled),false);
 report.checks.push({mode:'pause-during-buffer-loading',passed:true});
 await context.close();
} finally {await browser.close();server.close();fs.writeFileSync(path.resolve(__dirname,'../docs/motion-validation.json'),JSON.stringify(report,null,2)+'\n');}
})().catch(e=>{console.error(e);process.exitCode=1;});
