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

    uv, f = meshes[3][1:]
    v = meshes[3][0].copy()
    # The reconstruction uses camera coordinates (+Y DOWN). Establish a proper,
    # right-handed anatomical frame from the supplied UV's eyes and chin instead
    # of guessing Euler angles or mirroring individual axes. Rigid transform only.
    def landmark(px, py):
        target = np.array([px/512, 1-py/512])
        indices = np.argsort(np.linalg.norm(uv-target, axis=1))[:8]
        return v[indices].mean(0)
    left, right, chin, nose = landmark(194,120), landmark(320,120), landmark(256,339), landmark(256,170)
    eye_mid = (left+right)/2
    lateral = right-left; lateral /= np.linalg.norm(lateral)
    up = eye_mid-chin; up -= lateral*np.dot(up,lateral); up /= np.linalg.norm(up)
    forward = np.cross(lateral,up)
    frame = np.column_stack([lateral,up,forward])
    origin = v.mean(0)
    v = (v-origin) @ frame / 75
    pose_check = np.array([left,right,chin,nose])
    pose_check = (pose_check-origin) @ frame / 75
    assert abs(pose_check[0,1]-pose_check[1,1]) < 1e-8
    assert pose_check[2,1] < pose_check[:2,1].mean()
    assert pose_check[3,2] > pose_check[:2,2].mean()
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
    weight = area*(1+feature)*(.025+.975*smooth(.005,.28,distances[f].mean(1)))
    n = 56000
    chosen = rng.choice(len(f),n,p=weight/weight.sum())
    r = rng.random((n,2));sr=np.sqrt(r[:,0]);bary=np.c_[1-sr,sr*(1-r[:,1]),sr*r[:,1]]
    points = (v[f[chosen]]*bary[:,:,None]).sum(1)
    norm = (normals[f[chosen]]*bary[:,:,None]).sum(1)
    norm /= np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-8)
    lum = luminance((uv[f[chosen]]*bary[:,:,None]).sum(1))
    edge = 1-smooth(.025,.38,(distances[f[chosen]]*bary).sum(1))
    alpha = (1-edge)**1.35*(.34+.66*np.clip(lum/.60,0,1))
    # Surface brightness retains brows, eye sockets, lips and beard from supplied UV.
    shade = (.33+.67*np.clip(lum/.64,0,1))*(.38+.62*np.clip(norm @ [.2,.5,.84],0,1))
    data = [np.c_[points,norm,shade,edge,alpha,np.zeros(n)]]

    # Hair grows from the actual forehead/temple boundary. Curved clusters flow
    # backward from those roots instead of placing a disconnected hemisphere above it.
    roots = boundary[(v[boundary,1]>.52)|((np.abs(v[boundary,0])>.70)&(v[boundary,1]>.10))]
    n=16500;clusters=125;root=v[rng.choice(roots,clusters)].copy()
    direction=np.c_[rng.uniform(-.30,.12,clusters),rng.uniform(.25,.58,clusters),rng.uniform(-.92,-.45,clusters)]
    curl_radius=rng.uniform(.025,.085,clusters)
    index=rng.integers(0,clusters,n);t=rng.random(n);phase=t*17+index*2.39996
    p=root[index]+direction[index]*t[:,None]
    p[:,0]+=curl_radius[index]*np.sin(phase)*np.sin(np.pi*t)
    p[:,1]+=curl_radius[index]*np.cos(phase)*np.sin(np.pi*t)+.17*np.sin(np.pi*t)
    p[:,2]+=.04*np.sin(phase*.7)
    p+=rng.normal(0,.012,(n,3))
    nn=np.tile([-.1,.5,.85],(n,1));nn/=np.linalg.norm(nn,axis=1)[:,None]
    hairalpha=(.15+.85*np.sin(np.pi*np.clip(t*.9+.08,0,1))) * rng.uniform(.28,.78,n)
    data.append(np.c_[p,nn,rng.uniform(.24,.83,n),.28+.67*t,hairalpha,np.ones(n)])

    # Continuous edge break-up: emit from an INTERIOR geodesic band, never from
    # a single perimeter contour. Directed travel replaces random spherical noise.
    band=np.flatnonzero((distances>.015)&(distances<.45))
    n=13500;idx=rng.choice(band,n);t=rng.random(n)**1.4
    p=v[idx].copy();source=p.copy()
    direction=np.c_[np.where(p[:,0]<0,-1,.35),np.where(p[:,1]>.35,.30,-.65),np.ones(n)*-.48]
    travel=t*(.25+1.05*(1-smooth(.015,.45,distances[idx])))
    p+=direction*travel[:,None]
    p[:,0]+=.055*np.sin(t*10+source[:,1]*7)*t
    p[:,1]+=.07*np.sin(t*8+source[:,0]*9)*t
    p+=rng.normal(0,.008+t[:,None]*.015,(n,3))
    alpha=(1-t)**1.8*rng.uniform(.12,.52,n)*smooth(.005,.08,distances[idx])
    data.append(np.c_[p,normals[idx],rng.uniform(.28,.86,n),.55+.44*t,alpha,np.ones(n)*3])

    # Abstract neck/shoulder ribbons start at the actual lower jaw, then spread
    # down and back. Irregular lanes make the edge untraceable without a solid skull.
    jaw=boundary[v[boundary,1]<-.72]
    n=9500;idx=rng.choice(jaw,n);t=rng.random(n)
    p=v[idx].copy();spread=np.sign(p[:,0])*(.35+.65*t)*t
    p[:,0]+=spread;p[:,1]-=t*1.25;p[:,2]-=.18+t*.48
    p[:,0]+=.035*np.sin(t*18+idx*.03)
    p+=rng.normal(0,.014+t[:,None]*.045,(n,3))
    nn=normals[idx];alpha=(1-t)**1.6*rng.uniform(.15,.60,n)
    data.append(np.c_[p,nn,rng.uniform(.22,.62,n),.38+.61*t,alpha,np.ones(n)*2])

    # A few curved streams continue the hair/jaw gesture into open space. Points
    # along eight trajectories supply restrained trails within this same draw call.
    n=6500;lane=rng.integers(0,8,n);t=rng.random(n)
    roots2=v[rng.choice(band,8)].copy();roots2[:,0]-=.16
    p=roots2[lane].copy();p[:,0]-=t*1.5
    p[:,1]+=np.sin(t*3.3+lane*.13)*.28-t*(.4+lane*.11)
    p[:,2]-=t*.75
    p+=rng.normal(0,.008+t[:,None]*.018,(n,3))
    alpha=(1-t)**2*rng.uniform(.07,.40,n)
    data.append(np.c_[p,np.tile([0,0,1],(n,1)),rng.uniform(.33,.84,n),.7+.29*t,alpha,np.ones(n)*4])
    # Spend the high-tier budget on identity first. Uniform prefix sampling of this
    # mixed set preserves ~74% genuine facial points even at low quality.
    extensions=np.concatenate(data[1:])
    extensions=extensions[rng.choice(len(extensions),20000,replace=False)]
    values=np.concatenate([data[0],extensions]);rng.shuffle(values)
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
    report=dict(selected='mesh3.obj',selection_reason='Calm closed-mouth source expression; clear nose and jaw. Selection combines pose-aligned geometry inspection with supplied landmark/render images, not residual ranking.',orientation='Right-handed UV eye/chin anatomical frame; source camera +Y down corrected by rigid rotation. Eyes horizontal, chin below eyes, nose forward verified.',landmarks=pose_check.tolist(),meshes=report,boundary_vertices=len(boundary),point_count=len(values),bytes_per_point=16,seed=834)
    (ROOT/'docs/mesh-analysis.json').write_text(json.dumps(report,indent=2)+'\n')

    # True particle fallback from the same geometry/extension, never the artistic reference.
    a=.38;R=np.array([[np.cos(a),0,-np.sin(a)],[0,1,0],[np.sin(a),0,np.cos(a)]])
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
