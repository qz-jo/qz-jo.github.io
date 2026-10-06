// Optional production staging. Pages can still serve the repository root directly.
import { cp, mkdir, rm, readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'dist');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const item of ['index.html','404.html','CNAME','.nojekyll','favicon.svg','site.webmanifest','robots.txt','sitemap.xml','assets','fonts','case-studies']) {
  await cp(path.join(root,item),path.join(output,item),{recursive:true});
}
// Historical Hero media remains recoverable in Git; it is never shipped in staging.
await rm(path.join(output,'assets/neural-circuit.mp4'),{force:true});
const html=await readFile(path.join(output,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
  await access(path.resolve(output,match[1]));
}
let bytes=0,files=0;
async function total(folder){for(const item of await readdir(folder,{withFileTypes:true})){const p=path.join(folder,item.name);if(item.isDirectory())await total(p);else{bytes+=(await readFile(p)).byteLength;files++;}}}
await total(output);console.log(`Production staging: ${files} files, ${(bytes/1024/1024).toFixed(2)} MiB. All HTML local asset paths exist.`);
