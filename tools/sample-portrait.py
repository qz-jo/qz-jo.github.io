"""Offline, deterministic OBJ -> compact particle surface + artistic extension.

Usage: python tools/sample-portrait.py /path/to/extracted/my-face-512
Requires numpy, scipy, Pillow. Reconstruction originals are intentionally not shipped.
"""
from pathlib import Path
import argparse, hashlib, json, struct
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
rng = np.random.default_rng(834)

def obj(path):
    lines = path.read_text().splitlines()
    v = np.array([[float(x) for x in l.split()[1:4]] for l in lines if l.startswith('v ')])
    uv = np.array([[float(x) for x in l.split()[1:3]] for l in lines if l.startswith('vt ')])
    f = np.array([[int(x.split('/')[0])-1 for x in l.split()[1:4]] for l in lines if l.startswith('f ')])
    return v, uv, f

def smooth(a, b, x):
    t = np.clip((x-a)/(b-a), 0, 1)
    return t*t*(3-2*t)

def main(folder):
    meshes = [obj(folder / f'mesh{i}.obj') for i in range(4)]
    ref = meshes[0][0] - meshes[0][0].mean(0)
    report = []
    aligned = []
    for i, (v, uv, f) in enumerate(meshes):
        v = v-v.mean(0)
        u, _, vt = np.linalg.svd(v.T @ ref)
        rotation = u @ vt
        a = v @ rotation
        aligned.append(a)
        report.append(dict(mesh=f'mesh{i}.obj', vertices=len(v), triangles=len(f),
            source_bytes=(folder/f'mesh{i}.obj').stat().st_size,
            mean_pose_aligned_difference_mm=round(float(np.linalg.norm(a-ref, axis=1).mean()), 4),
            sha256=hashlib.sha256((folder/f'mesh{i}.obj').read_bytes()).hexdigest()))

    v = aligned[3].copy()
    # Remove the source camera's roll. This is a rigid transform, not facial editing.
    a = 0.17
    v = v @ np.array([[np.cos(a),np.sin(a),0],[-np.sin(a),np.cos(a),0],[0,0,1]])
    v[:,2] *= -1
    v /= 75
    uv, f = meshes[3][1:]
    triangles = v[f]
    cross = np.cross(triangles[:,1]-triangles[:,0], triangles[:,2]-triangles[:,0])
    area = np.linalg.norm(cross, axis=1)/2
    normals = np.zeros_like(v)
    for j in range(3): np.add.at(normals,f[:,j],cross)
    normals /= np.maximum(np.linalg.norm(normals,axis=1)[:,None],1e-8)
    if np.median(normals[:,2]) < 0: normals *= -1

    # Actual open mesh perimeter, then geodesic distance: no hard oval crop.
    edges = np.sort(np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]),axis=1)
    unique, counts = np.unique(edges,axis=0,return_counts=True)
    boundary = np.unique(unique[counts==1])
    lengths = np.linalg.norm(v[unique[:,0]]-v[unique[:,1]],axis=1)
    graph = coo_matrix((np.tile(lengths,2),(np.r_[unique[:,0],unique[:,1]],np.r_[unique[:,1],unique[:,0]])),shape=(len(v),len(v))).tocsr()
    distances = dijkstra(graph,indices=boundary,min_only=True)

    texture = np.asarray(Image.open(folder/'diffuseMap_0.png').convert('RGB'))/255
    h,w = texture.shape[:2]
    def luminance(texcoords):
        xy = np.clip(texcoords,[0,0],[1,1])
        rgb = texture[((1-xy[:,1])*(h-1)).astype(int),(xy[:,0]*(w-1)).astype(int)]
        return rgb @ [0.2126,0.7152,0.0722]

    center = triangles.mean(1)
    # Eye/brow band, nose, mouth: importance weights on actual facial surface.
    feature = np.exp(-((center[:,1]-.28)/.22)**2)*1.1
    feature += np.exp(-((center[:,0])/.25)**2-((center[:,1]+.10)/.45)**2)*.9
    feature += np.exp(-((center[:,1]+.55)/.19)**2)*.8
    weight = area*(1+feature)*(.15+.85*smooth(0,.13,distances[f].mean(1)))
    n = 48000
    chosen = rng.choice(len(f),n,p=weight/weight.sum())
    r = rng.random((n,2));sr=np.sqrt(r[:,0]);bary=np.c_[1-sr,sr*(1-r[:,1]),sr*r[:,1]]
    points = (v[f[chosen]]*bary[:,:,None]).sum(1)
    norm = (normals[f[chosen]]*bary[:,:,None]).sum(1)
    norm /= np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-8)
    lum = luminance((uv[f[chosen]]*bary[:,:,None]).sum(1))
    edge = 1-smooth(.02,.24,(distances[f[chosen]]*bary).sum(1))
    alpha = (.18+.82*(1-edge))*(.30+.70*np.clip(lum/.60,0,1))
    # Surface brightness retains brows, eye sockets, lips and beard from supplied UV.
    shade = (.33+.67*np.clip(lum/.64,0,1))*(.38+.62*np.clip(norm @ [.2,.5,.84],0,1))
    data = [np.c_[points,norm,shade,edge,alpha,np.zeros(n)]]

    # Curled hair volume: short layers around an ellipsoid, fading into open flow.
    n=15000;t=rng.uniform(0,np.pi*2,n);u=rng.uniform(0,1,n)
    rad=np.sqrt(1-u*u)
    p=np.c_[.98*rad*np.cos(t),.68+.83*u,-.42+.83*rad*np.sin(t)]
    curl=.030*np.sin(t*29+u*30)
    p+=np.c_[curl,np.cos(t*23+u*39)*.024,np.sin(t*19+u*31)*.035]
    p+=rng.normal(0,.021,(n,3))
    # Fade the front hairline, do not place hair in the facial landmark region.
    p[:,1]+=.05*np.cos(t*3)
    hairalpha=.15+.63*rng.random(n)
    nn=p-np.array([0,.64,-.42]);nn/=np.linalg.norm(nn,axis=1)[:,None]
    data.append(np.c_[p,nn,rng.uniform(.20,.63,n),rng.uniform(.3,.8,n),hairalpha,np.ones(n)])

    # Abstract side/rear suggestion. It never becomes a solid replacement skull.
    n=6000;t=rng.uniform(0,2*np.pi,n);y=rng.uniform(-.78,.87,n)
    p=np.c_[1.00*np.cos(t),y,-.45+.86*np.sin(t)]
    keep=p[:,2]<-.19;p=p[keep];n=len(p)
    p+=rng.normal(0,.045,(n,3));nn=p.copy();nn[:,1]*=.4;nn/=np.linalg.norm(nn,axis=1)[:,None]
    data.append(np.c_[p,nn,rng.uniform(.15,.40,n),rng.uniform(.6,.95,n),rng.uniform(.12,.46,n),np.ones(n)])

    # Chin -> neck -> shoulder ghost; wide soft fade hides the face's lower perimeter.
    n=8500;t=rng.uniform(0,2*np.pi,n);u=rng.random(n)
    y=-.88-u*1.24;radius=.48+smooth(.25,1,u)*.94
    p=np.c_[radius*np.cos(t),y,-.36+.39*np.sin(t)]
    p+=rng.normal(0,.025+u[:,None]*.07,(n,3))
    nn=np.c_[np.cos(t),np.ones(n)*.1,np.sin(t)]
    data.append(np.c_[p,nn,rng.uniform(.18,.47,n),.48+.50*u,(1-u)**1.2*rng.uniform(.16,.50,n),np.ones(n)*2])

    # Perimeter echoes sampled from the real boundary, dispersed with continuous falloff.
    n=6500;idx=rng.choice(boundary,n);u=rng.random(n)
    p=v[idx].copy();direction=p.copy();direction[:,2]*=.35
    direction/=np.linalg.norm(direction,axis=1)[:,None]
    p+=direction*(u*u*.78)[:,None]+rng.normal(0,.035+u[:,None]*.1,(n,3))
    data.append(np.c_[p,normals[idx],rng.uniform(.25,.6,n),.50+.49*u,(1-u)**2*.38,np.ones(n)*3])
    values=np.concatenate(data);rng.shuffle(values)
    # 16 bytes/point: position int16 (1/8192), normal int8, packed art channels.
    dtype=np.dtype([('p','<i2',(3,)),('n','i1',(3,)),('shade','u1'),('edge','u1'),('alpha','u1'),('kind','u1'),('seed','u1'),('pad','u1',(2,))])
    packed=np.zeros(len(values),dtype=dtype)
    packed['p']=np.rint(values[:,:3]*8192).astype('<i2');packed['n']=np.rint(values[:,3:6]*127).astype('i1')
    for key,col in [('shade',6),('edge',7),('alpha',8)]:packed[key]=np.rint(np.clip(values[:,col],0,1)*255).astype('u1')
    packed['kind']=values[:,9];packed['seed']=rng.integers(0,256,len(values),dtype='u1')
    dest=ROOT/'assets/portrait';dest.mkdir(exist_ok=True)
    (dest/'saif-particles.bin').write_bytes(b'SPF1'+struct.pack('<I',len(values))+packed.tobytes())
    for name,count in [('mobile',22500),('balanced',43000)]:
        (dest/f'saif-particles-{name}.bin').write_bytes(b'SPF1'+struct.pack('<I',count)+packed[:count].tobytes())
    report=dict(selected='mesh3.obj',selection_reason='Calm closed-mouth source expression; clear three-quarter nose and jaw. Selection combines pose-aligned geometry inspection with supplied landmark/render images, not residual ranking.',meshes=report,boundary_vertices=len(boundary),point_count=len(values),bytes_per_point=16,seed=834)
    (ROOT/'docs/mesh-analysis.json').write_text(json.dumps(report,indent=2)+'\n')

    # True particle fallback from the same geometry/extension, never the artistic reference.
    a=-.32;R=np.array([[np.cos(a),0,-np.sin(a)],[0,1,0],[np.sin(a),0,np.cos(a)]])
    p=values[:,:3]@R;im=Image.new('RGB',(900,1080),(5,7,11));draw=ImageDraw.Draw(im,'RGBA')
    for j in np.argsort(p[:,2]):
        x,y,z=p[j];brightness=values[j,6];al=values[j,8]
        if values[j,9]==0: al*=smooth(-.2,.35,(values[j,3:6]@R)[2])
        if al<.02:continue
        px=455+x*255;py=453-y*255;r=.42+brightness*.35
        c=int(np.clip(230*brightness+32,0,255));gold=values[j,7]>.6 and packed['seed'][j]>234
        color=(c,int(c*.83),int(c*.64),int(al*230)) if gold else (c,min(255,c+4),min(255,c+9),int(al*235))
        draw.ellipse((px-r,py-r,px+r,py+r),fill=color)
    im.save(dest/'saif-particle-poster.webp',quality=88)
    print(json.dumps(report,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('folder',type=Path)
    main(parser.parse_args().folder)
