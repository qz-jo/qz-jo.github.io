"""Offline, deterministic OBJ -> compact particle surface + artistic extension.

Usage: python tools/sample-portrait.py /path/to/extracted/my-face-512
Requires numpy, scipy, Pillow, fast-simplification. Reconstruction originals are intentionally not shipped.
"""
from pathlib import Path
import argparse, hashlib, json, struct
import numpy as np
import fast_simplification
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra, connected_components
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
    all_boundary = np.unique(unique[counts==1])
    open_edges = unique[counts==1]
    perimeter_graph=coo_matrix((np.ones(len(open_edges)*2),(np.r_[open_edges[:,0],open_edges[:,1]],np.r_[open_edges[:,1],open_edges[:,0]])),shape=(len(v),len(v))).tocsr()
    _, components=connected_components(perimeter_graph)
    labels, sizes=np.unique(components[all_boundary],return_counts=True)
    # The OBJ has TWO holes: outer 512-vertex perimeter + 92-vertex inner mouth.
    # Only the OUTER perimeter dissolves. Fading the mouth loop erased the lips.
    boundary=all_boundary[components[all_boundary]==labels[np.argmax(sizes)]]
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
    n = 50000
    chosen = rng.choice(len(f),n,p=weight/weight.sum())
    r = rng.random((n,2));sr=np.sqrt(r[:,0]);bary=np.c_[1-sr,sr*(1-r[:,1]),sr*r[:,1]]
    points = (v[f[chosen]]*bary[:,:,None]).sum(1)
    norm = (normals[f[chosen]]*bary[:,:,None]).sum(1)
    norm /= np.maximum(np.linalg.norm(norm,axis=1)[:,None],1e-8)
    faceUV=(uv[f[chosen]]*bary[:,:,None]).sum(1)
    lum = luminance(faceUV)
    edge = 1-smooth(.015,.29,(distances[f[chosen]]*bary).sum(1))
    alpha = (1-edge)**1.05*(.88+.12*np.clip(lum/.60,0,1))
    # Surface brightness retains brows, eye sockets, lips and beard from supplied UV.
    # Albedo provides detail, not holes: dark source texture must not erase lips/eyes.
    shade = (.62+.38*np.clip(lum/.64,0,1))*(.72+.28*np.clip(norm @ [.2,.5,.84],0,1))
    data = [np.c_[points,norm,shade,edge,alpha,np.zeros(n),faceUV]]

    # Optimized indexed original surface for the hybrid shaded core. No OBJ parser
    # or reconstruction photograph is needed at runtime; UVs retain real skin detail.
    dest=ROOT/'assets/portrait';dest.mkdir(exist_ok=True)
    coretype=np.dtype([('p','<i2',(3,)),('n','i1',(3,)),('edge','u1'),('uv','<u2',(2,)),('pad','u1',(2,))])
    cv,cf=fast_simplification.simplify(v,f,target_count=12000,preserve_border=True,agg=5)
    # Reproject shading/UV/boundary distance onto nearby ORIGINAL triangles.
    # This retains the mouth hole and continuous UVs without shipping 56k triangles.
    near=cKDTree(triangles.mean(1)).query(cv,k=16)[1]
    tri=triangles[near];a=tri[:,:,0];b=tri[:,:,1];c=tri[:,:,2]
    ab=b-a;ac=c-a;ap=cv[:,None,:]-a
    d00=(ab*ab).sum(2);d01=(ab*ac).sum(2);d11=(ac*ac).sum(2)
    d20=(ap*ab).sum(2);d21=(ap*ac).sum(2);den=np.maximum(d00*d11-d01*d01,1e-14)
    vb=(d11*d20-d01*d21)/den;vc=(d00*d21-d01*d20)/den
    weights=np.clip(np.stack([1-vb-vc,vb,vc],2),0,1);weights/=weights.sum(2)[:,:,None]
    projected=(tri*weights[:,:,:,None]).sum(2)
    error=np.linalg.norm(projected-cv[:,None,:],axis=2);best=error.argmin(1);rows=np.arange(len(cv))
    barycore=weights[rows,best];sourcefaces=f[near[rows,best]]
    cn=(normals[sourcefaces]*barycore[:,:,None]).sum(1);cn/=np.linalg.norm(cn,axis=1)[:,None]
    cuv=(uv[sourcefaces]*barycore[:,:,None]).sum(1);cd=(distances[sourcefaces]*barycore).sum(1)
    residual=error[rows,best]*75
    core=np.zeros(len(cv),dtype=coretype)
    core['p']=np.rint(cv*8192).astype('<i2');core['n']=np.rint(cn*127).astype('i1')
    core['edge']=np.rint((1-smooth(.02,.48,cd))*255).astype('u1')
    core['uv']=np.rint(np.clip(cuv,0,1)*65535).astype('<u2')
    # Curves are rooted on the real forehead, temple, cheek and jaw. Only the
    # unsupported extension is procedural; no reference geometry is introduced.
    pathroots=[(-.5,.87),(-.72,.75),(-.87,.45),(-.88,.10),(-.84,-.35),(-.67,-.75),(-.2,-1.0),(.25,-1.0)]
    paths=[]
    for i,(x,y) in enumerate(pathroots):
        source=v[np.argmin(np.linalg.norm(v[:,:2]-[x,y],axis=1))].copy()
        if i<2: source+=np.array([0,.22,-.22])
        end=source+np.array([-1.25-(i%3)*.25,.35 if i<3 else -.65-(i-3)*.23,-.50])
        c1=source+np.array([-.42,.4 if i<3 else -.12,-.20])
        c2=end+np.array([.25,.40,.10])
        paths.append(np.array([source,c1,c2,end]))
    # A few forward-depth lanes give the foreground large particles real Z.
    paths.extend([np.array([v[np.argmin(np.linalg.norm(v[:,:2]-[-.6,.5],axis=1))],[-1.1,.7,.9],[-1.8,.4,1.4],[-2.3,-.15,1.1]]),
                  np.array([v[np.argmin(np.linalg.norm(v[:,:2]-[-.4,-.9],axis=1))],[-.7,-1.4,.7],[-1.5,-1.5,1.3],[-1.9,-2.0,.8]])])
    paths=np.array(paths,dtype='<f4')
    # Core, path controls and sparse curl filaments are packed together below.
    Image.open(folder/'diffuseMap_0.png').convert('RGB').save(dest/'saif-face-albedo.webp',quality=94)

    # Hair grows from the actual forehead/temple boundary. Curved clusters flow
    # backward from those roots instead of placing a disconnected hemisphere above it.
    top = boundary[v[boundary,1]>.57]
    temples = boundary[(np.abs(v[boundary,0])>.75)&(v[boundary,1]>.20)&(v[boundary,1]<.70)]
    # Short, rooted curl bundles. Tufts have real layered volume above the forehead;
    # fine offshoots, rather than the entire hairstyle, dissolve backward.
    n=18000;clusters=150
    roots=np.r_[rng.choice(top,int(clusters*.78)),rng.choice(temples,clusters-int(clusters*.78))]
    root=v[cKDTree(v).query(v[roots]-[0,.18,0])[1]].copy();index=rng.integers(0,clusters,n);t=rng.random(n)
    width=rng.uniform(.06,.12,clusters);turn=rng.uniform(1.4,2.8,clusters)
    rise=rng.uniform(.16,.34,clusters);back=rng.uniform(.12,.45,clusters)
    layer=rng.choice([0.,.16,.32,.48],clusters);root[:,1]+=.01+layer*.30;root[:,2]-=layer
    phase=t*turn[index]*np.pi*2+index*2.39996
    envelope=np.sin(np.pi*t)**.65
    p=root[index].copy()
    p[:,0]+=width[index]*np.cos(phase)*envelope + np.sign(root[index,0])*.045*t
    p[:,1]+=rise[index]*t+.13*np.sin(np.pi*t)+width[index]*np.sin(phase)*envelope
    p[:,2]-=back[index]*t
    p[:,2]+=.065*np.cos(phase*.9)*envelope
    p+=rng.normal(0,.015,(n,3))
    # Every visible tuft remains dense; only the far tips dissolve.
    alpha=(.86+.14*rng.random(n))*(1-.45*smooth(.82,1,t))
    nn=np.c_[np.cos(phase)*.65,np.sin(phase)*.5+.20,np.cos(phase*.9)*.6+.20]
    nn/=np.linalg.norm(nn,axis=1)[:,None]
    shade=.30+.45*((np.cos(phase)*.5+.5)**2)+.06*rng.random(n)
    data.append(np.c_[p,nn,shade,.18+.64*t,alpha,np.ones(n),index/(clusters-1),t])
    # Sparse curl filaments underneath the point clumps provide directional
    # structure even at low density. Same roots/curls; no invented head surface.
    steps=36;ts=np.linspace(0,1,steps)
    lt=np.tile(np.c_[ts[:-1],ts[1:]].ravel(),clusters);li=np.repeat(np.arange(clusters),(steps-1)*2)
    lp=root[li].copy();phase2=lt*turn[li]*np.pi*2+li*2.39996;env=np.sin(np.pi*lt)**.65
    lp[:,0]+=width[li]*np.cos(phase2)*env+np.sign(root[li,0])*.045*lt
    lp[:,1]+=rise[li]*lt+.13*np.sin(np.pi*lt)+width[li]*np.sin(phase2)*env
    lp[:,2]-=back[li]*lt;lp[:,2]+=.065*np.cos(phase2*.9)*env
    ln=np.c_[np.cos(phase2)*.65,np.sin(phase2)*.5+.20,np.cos(phase2*.9)*.6+.20];ln/=np.linalg.norm(ln,axis=1)[:,None]
    ls=.30+.45*((np.cos(phase2)*.5+.5)**2)
    la=.75*(1-.55*smooth(.78,1,lt))
    hairlines=np.c_[lp,ln,ls,.18+.64*lt,la,np.ones(len(lt)),li/(clusters-1),lt]

    # Continuous edge break-up: emit from an INTERIOR geodesic band, never from
    # a single perimeter contour. Directed travel replaces random spherical noise.
    band=np.flatnonzero((distances>.015)&(distances<.45))
    n=4000;idx=rng.choice(band,n);t=rng.random(n)**1.4
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
    n=3000;idx=rng.choice(jaw,n);t=rng.random(n)
    p=v[idx].copy();spread=np.sign(p[:,0])*(.35+.65*t)*t
    p[:,0]+=spread;p[:,1]-=t*1.25;p[:,2]-=.18+t*.48
    p[:,0]+=.035*np.sin(t*18+idx*.03)
    p+=rng.normal(0,.014+t[:,None]*.045,(n,3))
    nn=normals[idx];alpha=(1-t)**1.6*rng.uniform(.15,.60,n)
    data.append(np.c_[p,nn,rng.uniform(.22,.62,n),.38+.61*t,alpha,np.ones(n)*2])

    # A few curved streams continue the hair/jaw gesture into open space. Points
    # along eight trajectories supply restrained trails within this same draw call.
    n=1000;lane=rng.integers(0,8,n);t=rng.random(n)
    roots2=v[rng.choice(band,8)].copy();roots2[:,0]-=.16
    p=roots2[lane].copy();p[:,0]-=t*1.5
    p[:,1]+=np.sin(t*3.3+lane*.13)*.28-t*(.4+lane*.11)
    p[:,2]-=t*.75
    p+=rng.normal(0,.008+t[:,None]*.018,(n,3))
    alpha=(1-t)**2*rng.uniform(.07,.40,n)
    data.append(np.c_[p,np.tile([0,0,1],(n,1)),rng.uniform(.33,.84,n),.7+.29*t,alpha,np.ones(n)*4])
    # Progressive prefixes retain actual face detail AND a visible hairstyle.
    values=np.concatenate([d if d.shape[1]==12 else np.pad(d,((0,0),(0,2))) for d in data]);rng.shuffle(values)
    # 16 bytes/point: position int16 (1/8192), normal int8, packed art channels.
    dtype=np.dtype([('p','<i2',(3,)),('n','i1',(3,)),('shade','u1'),('edge','u1'),('alpha','u1'),('kind','u1'),('seed','u1'),('pad','u1',(2,))])
    packed=np.zeros(len(values),dtype=dtype)
    packed['p']=np.rint(values[:,:3]*8192).astype('<i2');packed['n']=np.rint(values[:,3:6]*127).astype('i1')
    for key,col in [('shade',6),('edge',7),('alpha',8)]:packed[key]=np.rint(np.clip(values[:,col],0,1)*255).astype('u1')
    packed['pad']=np.rint(np.clip(values[:,10:12],0,1)*255).astype('u1')
    packed['kind']=values[:,9];packed['seed']=rng.integers(0,256,len(values),dtype='u1')
    lines=np.zeros(len(hairlines),dtype=dtype)
    lines['p']=np.rint(hairlines[:,:3]*8192).astype('<i2');lines['n']=np.rint(hairlines[:,3:6]*127).astype('i1')
    for key,col in [('shade',6),('edge',7),('alpha',8)]:lines[key]=np.rint(np.clip(hairlines[:,col],0,1)*255).astype('u1')
    lines['kind']=1;lines['seed']=np.rint(li/(clusters-1)*255).astype('u1');lines['pad']=np.rint(hairlines[:,10:12]*255).astype('u1')
    (dest/'saif-face-core.bin').write_bytes(b'SCF2'+struct.pack('<IIII',len(cv),cf.size,len(paths),len(lines))+core.tobytes()+cf.astype('<u2').tobytes()+paths.tobytes()+lines.tobytes())
    dest=ROOT/'assets/portrait';dest.mkdir(exist_ok=True)
    (dest/'saif-particles.bin').write_bytes(b'SPF1'+struct.pack('<I',len(values))+packed.tobytes())
    for name,count in [('mobile',22500),('balanced',43000)]:
        (dest/f'saif-particles-{name}.bin').write_bytes(b'SPF1'+struct.pack('<I',count)+packed[:count].tobytes())
    report=dict(selected='mesh3.obj',selection_reason='Calm closed-mouth source expression; clear nose and jaw. Selection combines pose-aligned geometry inspection with supplied landmark/render images, not residual ranking.',orientation='Right-handed UV eye/chin anatomical frame; source camera +Y down corrected by rigid rotation. Eyes horizontal, chin below eyes, nose forward verified.',landmarks=pose_check.tolist(),meshes=report,boundary_vertices=len(boundary),preserved_inner_boundary_vertices=len(all_boundary)-len(boundary),point_count=len(values),bytes_per_point=16,core_vertices=len(cv),core_triangles=len(cf),core_projection_error_mm=dict(mean=float(residual.mean()),p95=float(np.quantile(residual,.95)),max=float(residual.max())),flow_paths=len(paths),hair_filament_vertices=len(lines),seed=834)
    (ROOT/'docs/mesh-analysis.json').write_text(json.dumps(report,indent=2)+'\n')

    # Refresh the production hybrid poster with tools/capture-fallback.cjs after
    # rebuilding. That utility renders these exact GPU assets and shaders.
    print(json.dumps(report,indent=2))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('folder',type=Path)
    main(parser.parse_args().folder)
