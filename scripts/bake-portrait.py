"""Bake surface-area samples of Saif's reconstruction; no photo plane at runtime."""
from pathlib import Path
import json, hashlib, gzip
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('C:/Users/saifn/Projects/NextGenFace/my-output/my-face-512')
rng = np.random.default_rng(73031)
vertices, uv, faces, ft = [], [], [], []
for line in (SOURCE / 'mesh3.obj').read_text().splitlines():
    s = line.split()
    if not s: continue
    if s[0] == 'v': vertices.append(list(map(float, s[1:4])))
    if s[0] == 'vt': uv.append(list(map(float, s[1:3])))
    if s[0] == 'f':
        parts = [x.split('/') for x in s[1:4]]
        faces.append([int(x[0])-1 for x in parts])
        ft.append([int(x[1])-1 for x in parts])
v = np.array(vertices); f = np.array(faces); tex = np.array(uv); ft = np.array(ft)
v -= (v.max(0)+v.min(0))/2
v *= np.array([1,-1,-1]) * (2.36 / np.ptp(v[:,1]))
v[:,1] += .58
angle=-.13
v[:,[0,2]]=v[:,[0,2]] @ np.array([[np.cos(angle),-np.sin(angle)],[np.sin(angle),np.cos(angle)]]).T
# Source 3 is already a three-quarter capture. Keep its silhouette and nose profile.
tri = v[f]; cross = np.cross(tri[:,1]-tri[:,0], tri[:,2]-tri[:,0])
normal = np.zeros_like(v)
for k in range(3): np.add.at(normal, f[:,k], cross)
normal /= np.maximum(np.linalg.norm(normal,axis=1,keepdims=True),1e-9)
if np.median(normal[:,2]) < 0: normal *= -1
# Topological boundary distance: fade BEFORE the face mask physically ends.
edges = np.sort(np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]),axis=1)
unique, counts = np.unique(edges,axis=0,return_counts=True)
boundary_edges=unique[counts==1]
adj={}
for a,b in boundary_edges:
    adj.setdefault(a,[]).append(b); adj.setdefault(b,[]).append(a)
components=[]; seen=set()
for start in adj:
    if start in seen: continue
    stack=[start]; component=[]
    while stack:
        item=stack.pop()
        if item in seen: continue
        seen.add(item);component.append(item);stack.extend(adj[item])
    components.append(component)
# Internal lip/eye openings must keep their geometry; dissolve only the outer outline.
boundary=np.array(max(components,key=len)); distance = np.full(len(v),1000.)
distance[boundary] = 0
for _ in range(40):
    d = distance.copy()
    np.minimum.at(distance,unique[:,0],d[unique[:,1]]+1)
    np.minimum.at(distance,unique[:,1],d[unique[:,0]]+1)
edge = np.clip(distance / 19, 0, 1)
image = np.asarray(Image.open(SOURCE/'diffuseMap_0.png').convert('RGB'))/255.
def colors(t):
    x = np.clip((t[:,0]*(image.shape[1]-1)).astype(int),0,image.shape[1]-1)
    y = np.clip(((1-t[:,1])*(image.shape[0]-1)).astype(int),0,image.shape[0]-1)
    c = image[y,x]
    # Restrained material colour, lit by cool silver and warm rim rather than orange.
    return c * .62 + np.mean(c,axis=1,keepdims=True)*np.array([.20,.23,.27])
vertex_uv = np.zeros((len(v),2))
for k in range(3): vertex_uv[f[:,k]] = tex[ft[:,k]]
def rows(p,n,c,region,e=None):
    count=len(p); seed=rng.random(count); out=np.zeros((count,16),np.float32)
    out[:,:3]=p; out[:,3:6]=n; out[:,6:9]=c; out[:,9]=seed
    out[:,10]=region
    # Eye/nose first, followed by cheeks and jaw; hair and bust last.
    feature=(p[:,2]>.57)|((p[:,1]>.55)&(p[:,1]<1.05))
    out[:,11]=np.where(feature,.58,np.where(p[:,1]>.5,1.12,1.6))+seed*.40
    if region: out[:,11]=2.3+seed*.65 if region in [2,3] else .1+seed*2.6
    out[:,12]=.65+seed**5*1.6; out[:,13]=1 if e is None else e
    out[:,14]=.12 if region==0 else .55; out[:,15]=.6+seed*.4
    return out
core = rows(v,normal,colors(vertex_uv),0,edge)
low=np.array([-4,-4,-4,-1,-1,-1,0,0,0,0,0,0,0,0,0,0])
high=np.array([4,4,4,1,1,1,1,1,1,1,5,4,3,1,1,1])
def packed(name,a):
    q=np.rint(np.clip((a-low)/(high-low),0,1)*65535).astype('<u2')
    (ROOT/'assets'/name).write_bytes(gzip.compress(q.tobytes(),mtime=0))
packed('portrait-core.q.gz',core)
(ROOT/'assets/portrait-indices.gz').write_bytes(gzip.compress(f.astype('<u4').tobytes(),mtime=0))
# True triangle area sampling with barycentric interpolation, never a rectangular grid.
area=np.linalg.norm(cross,axis=1); idx=rng.choice(len(f),82000,p=area/area.sum())
b=rng.random((len(idx),2)); b[:,0]=np.sqrt(b[:,0]); w=np.column_stack([1-b[:,0],b[:,0]*(1-b[:,1]),b[:,0]*b[:,1]])
p=(tri[idx]*w[:,:,None]).sum(1)
n=(normal[f[idx]]*w[:,:,None]).sum(1); n/=np.linalg.norm(n,axis=1,keepdims=True)
t=(tex[ft[idx]]*w[:,:,None]).sum(1); e=(edge[f[idx]]*w).sum(1)
skin=rows(p,n,colors(t),0,e)
layers=[skin]; counts={'face':len(skin)}
# Complete the rear cranial volume, behind the original face; soft transition.
count=14000; a=rng.uniform(np.pi,2*np.pi,count); h=rng.uniform(-1,1,count)
radius=np.sqrt(1-h*h)
rear=np.column_stack([-.12+.88*np.cos(a)*radius,.62+1.08*h,-.21+.61*np.sin(a)*radius])
rn=np.column_stack([np.cos(a)*radius,h,np.sin(a)*radius])
layers.append(rows(rear,rn,np.tile([.31,.35,.40],(count,1)),1)); counts['rear']=count
# Directional locks rooted along the crown: swept from right hairline to left rear.
hair=[]; hn=[]
for lock in range(1450):
    a=rng.uniform(0,np.pi*2); elevation=rng.uniform(.2,1.25)
    root=np.array([.77*np.cos(a)*np.cos(elevation),1.37+.55*np.sin(elevation),-.18+.57*np.sin(a)*np.cos(elevation)])
    length=rng.uniform(.1,.38)
    for u in np.linspace(0,1,16):
        hair.append(root+np.array([-length*u,.24*np.sin(u*np.pi*.7),-.1*u])+rng.normal(0,.004,3))
        hn.append([np.cos(a)*.5,.8,np.sin(a)*.5])
hair=np.array(hair); hc=np.tile([.12,.14,.16],(len(hair),1))
hc+=rng.random((len(hair),1))*.12
layers.append(rows(hair,np.array(hn),hc,2)); counts['hair']=len(hair)
# Analytic connected neck / clothed upper torso; not claimed to be reconstructed anatomy.
count=56000; u=rng.random(count); a=rng.uniform(0,2*np.pi,count)
neck=u<.22; y=np.where(neck,-.43-rng.random(count)*.94,-1.15-rng.random(count)*1.6)
spread=np.clip((-y-1.15)/.57,0,1);spread=spread*spread*(3-2*spread)
width=np.where(neck,.34+.12*(-y-.43),.43+1.42*spread)
p=np.column_stack([width*np.cos(a)+np.where(neck,.16,.02),y,.04+np.where(neck,.34,.51)*np.sin(a)])
n=np.column_stack([np.cos(a),np.ones(count)*.12,np.sin(a)])
c=np.tile([.28,.33,.40],(count,1)); c[neck]=[.40,.43,.48]
layers.append(rows(p,n,c,3)); counts['bust']=count
# Coherent ribbons branch from the outer material, with depth and long arcs.
streams=[]
for k in range(13):
    for t in rng.uniform(0,1,430):
        streams.append([-1.0-1.35*t+.30*np.sin(t*7+k),1.8-4.5*t+.13*np.sin(t*13+k),-.3+.5*np.sin(t*6+k)])
streams=np.array(streams)+rng.normal(0,.018,(5590,3))
layers.append(rows(streams,np.tile([0,0,1],(len(streams),1)),np.tile([.40,.48,.57],(len(streams),1)),4)); counts['streams']=len(streams)
atmos=rng.uniform([-3,-3,-2],[3,2.7,1.6],(1800,3))
layers.append(rows(atmos,np.tile([0,0,1],(1800,1)),np.tile([.35,.42,.5],(1800,1)),5)); counts['atmosphere']=1800
packed('portrait-particles.q.gz',np.concatenate(layers))
metadata={'source':'mesh3.obj','sourceSHA256':hashlib.sha256((SOURCE/'mesh3.obj').read_bytes()).hexdigest(),'vertices':len(v),'triangles':len(f),'stride':16,'counts':counts,'pose':'Source 3 three-quarter orientation; y/z axes corrected; no frontal intro','extensions':'Procedural directional hair, neck, clothed shoulders, streams; not reconstructed anatomy'}
(ROOT/'assets/portrait-manifest.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata,indent=2))
