from PIL import Image, ImageFilter
from pathlib import Path
import random, struct, gzip, base64, re, json
root=Path(__file__).resolve().parents[1]
source=Image.open(r'C:/Users/saifn/Downloads/Untitled design (7).png').convert('RGBA')
box=(690,330,1820,1810)
master=source.crop(box)
w,h=master.size
alpha=master.getchannel('A'); a=alpha.load()
for y in range(h):
    t=max(0,min(1,(y/h-.60)/.34))
    fade=1-t*t*(3-2*t)
    for x in range(w):
        side=max(0,min(1,min(x,w-1-x)/(w*.18)))
        taper=side*side*(3-2*side)
        a[x,y]=round(a[x,y]*fade*taper)
master.putalpha(alpha)
master.save(root/'assets/portrait-front.webp',lossless=True,method=6)
sample=master.copy(); sample.thumbnail((1000,1350),Image.Resampling.LANCZOS)
w,h=sample.size; px=sample.load()
eroded=sample.getchannel('A').filter(ImageFilter.MinFilter(15)).load()
rng=random.Random(42); points=[]
for _ in range(42000):
    x=rng.randrange(w);y=rng.randrange(h);r,g,b,a=px[x,y]
    if a<100 or rng.random()>a/255: continue
    points.extend((x/w,y/h,r/255,g/255,b/255,rng.random(),1.0 if eroded[x,y]<180 else 0.0))
raw=struct.pack('<%sf'%len(points),*points)
(root/'assets/portrait-front.bin.gz').write_bytes(gzip.compress(raw,compresslevel=9,mtime=0))
seed=b''.join(raw[i:i+28] for i in range(0,len(raw),28*19))
script=root/'assets/portrait-hero.js'; code=script.read_text(encoding='utf-8')
line="const seedData=new Float32Array(Uint8Array.from(atob('"+base64.b64encode(seed).decode()+"'),c=>c.charCodeAt(0)).buffer);"
code=re.sub(r'^const seedData=.*?;$',lambda _:line,code,flags=re.M)
code=code.replace('/assets/portrait-samples-v2.bin.gz','/assets/portrait-front.bin.gz')
script.write_text(code,encoding='utf-8')
p=root/'index.html';html=p.read_text(encoding='utf-8').replace('/assets/portrait-master.webp','/assets/portrait-front.webp').replace('width="2180" height="2858"','width="1130" height="1480"').replace('v=20261008-release','v=20261008-front-portrait')
p.write_text(html,encoding='utf-8')
(root/'assets/portrait-front-source.json').write_text(json.dumps({'source':'Untitled design (7).png','crop':box,'size':master.size,'particles':len(points)//7,'processing':'Face and upper shoulder crop; alpha fade at lower and shoulder edges. Original face colors and details preserved.'},indent=2))
print(master.size,len(points)//7)
