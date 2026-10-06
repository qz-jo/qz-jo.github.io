/* Reproduce the static poster from the actual hybrid WebGL renderer. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../dist'),result=path.resolve(__dirname,'../test-results');fs.mkdirSync(result,{recursive:true});
const server=require('node:http').createServer((req,res)=>{let name=new URL(req.url,'http://localhost:8082').pathname;if(name==='/')name='/index.html';const file=path.join(root,name);fs.readFile(file,(error,body)=>{res.writeHead(error?404:200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream'});res.end(error?'missing':body);});});
(async()=>{await new Promise(resolve=>server.listen(8082,'127.0.0.1',resolve));let browser;
try{browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.25});
await page.addInitScript(()=>{sessionStorage.setItem('saif-intro-v3','1');localStorage.setItem('saif-motion','off');});
await page.route('https://api.github.com/**',r=>r.fulfill({body:'[]'}));
await page.goto('http://localhost:8082/?portraitDev=1&portraitTier=high');await page.waitForFunction(()=>document.documentElement.dataset.portrait==='ready');
await page.addStyleTag({content:'#portraitDiagnostics{display:none}'});await page.screenshot({scale:'css',path:path.resolve(__dirname,'../docs/screenshots/desktop-high.png')});
const data=await page.evaluate(()=>portraitDev.snapshot());fs.writeFileSync(path.join(result,'hybrid-poster.png'),Buffer.from(data.split(',')[1],'base64'));require('node:child_process').execFileSync('python',['-c',"from PIL import Image; im=Image.open('test-results/hybrid-poster.png').convert('RGBA'); Image.alpha_composite(Image.new('RGBA',im.size,(5,7,11,255)),im).convert('RGB').resize((900,1080),Image.Resampling.LANCZOS).save('assets/portrait/saif-particle-poster.webp',quality=91)"],{cwd:path.resolve(__dirname,'..')});
console.log('Captured and composited original-mesh hybrid poster + high-tier Hero');
}finally{await browser?.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
