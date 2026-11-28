import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix, Euler, noise
random.seed(7)
OUT = sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else '/tmp/hollow.glb'
PREVIEW = os.environ.get('PREVIEW','')
bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene

def V(*a): return Vector(a)
def activate(o):
    for x in bpy.context.selected_objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o

# ------------------------------------------------------------------ skeleton (Z up, faces -Y)
J = {'pelvis':V(0,.02,1.55),'spine1':V(0,.03,1.78),'spine2':V(0,.06,2.02),'chest':V(0,.04,2.26),'neck':V(0,-.02,2.46),'head':V(0,-.1,2.62),'headtop':V(0,-.14,2.95),
     'jaw':V(0,-.1,2.73),'jawtip':V(0,-.34,2.66)}
FING = {}
for s,sx in (('L',1),('R',-1)):
    J['thigh'+s]=V(.11*sx,.02,1.5); J['knee'+s]=V(.13*sx,-.06,.8); J['ankle'+s]=V(.13*sx,.04,.09); J['toe'+s]=V(.13*sx,-.18,.02)
    J['shoulder'+s]=V(.21*sx,.05,2.36); J['elbow'+s]=V(.31*sx,.08,1.62); J['wrist'+s]=V(.35*sx,.02,.94); J['palm'+s]=V(.365*sx,-.0,.85)
    for f in range(4):
        sp=f-1.5; base=J['palm'+s]+V(.014*sp*sx,-.016*sp*0+(-.01),-.0)
        pts=[base]; d=V(.012*sp*sx,-.02,-1).normalized()
        for k,L in enumerate((.13,.12,.10)):
            d=(d+V(0,-.10,0)).normalized(); pts.append(pts[-1]+d*L)
        FING[(s,f)]=pts
    th=J['palm'+s]+V(-.03*sx,-.03,.03); FING[(s,'t')]=[th,th+V(-.02*sx,-.07,-.06),th+V(-.03*sx,-.12,-.11)]
BONES=[('pelvis','pelvis','spine1',None),('spine1','spine1','spine2','pelvis'),('spine2','spine2','chest','spine1'),('chest','chest','neck','spine2'),
       ('neck','neck','head','chest'),('head','head','headtop','neck'),('jaw','jaw','jawtip','head')]
for s in 'LR':
    BONES+= [('thigh'+s,'thigh'+s,'knee'+s,'pelvis'),('shin'+s,'knee'+s,'ankle'+s,'thigh'+s),('foot'+s,'ankle'+s,'toe'+s,'shin'+s),
             ('upperarm'+s,'shoulder'+s,'elbow'+s,'chest'),('forearm'+s,'elbow'+s,'wrist'+s,'upperarm'+s),('hand'+s,'wrist'+s,'palm'+s,'forearm'+s)]
FBONES=[]
for (s,f),pts in FING.items():
    par='hand'+s
    for k in range(len(pts)-1):
        nm=f'f{s}{f}{k}';FBONES.append((nm,pts[k],pts[k+1],par));par=nm

arm_data=bpy.data.armatures.new('HollowRig');rig=bpy.data.objects.new('HollowRig',arm_data);scn.collection.objects.link(rig)
activate(rig);bpy.ops.object.mode_set(mode='EDIT')
for nm,h,t,p in BONES:
    b=arm_data.edit_bones.new(nm);b.head=J[h];b.tail=J[t]
    b.align_roll(V(0,-1,0) if abs((J[t]-J[h]).normalized().z)>.5 else V(0,0,1))
    if p:b.parent=arm_data.edit_bones[p];b.use_connect=False
for nm,h,t,p in FBONES:
    b=arm_data.edit_bones.new(nm);b.head=h;b.tail=t;b.align_roll(V(0,-1,0));b.parent=arm_data.edit_bones[p]
bpy.ops.object.mode_set(mode='OBJECT')
SEGS={}
for b in arm_data.bones:SEGS[b.name]=(b.head_local.copy(),b.tail_local.copy())

# ------------------------------------------------------------------ body via skin modifier
bm=bmesh.new();sk=[]
def vtx(p,rx,ry=None):
    v=bm.verts.new(p);sk.append((v,rx,ry if ry is not None else rx));return v
def chain(pts):
    vs=[vtx(*p) for p in pts]
    for a,b in zip(vs,vs[1:]):bm.edges.new((a,b))
    return vs
torso=chain([(V(0,.02,1.42),.1,.075),(V(0,.02,1.52),.125,.09),(V(0,.04,1.7),.082,.066),(V(0,.05,1.88),.128,.098),(V(0,.05,2.08),.152,.108),(V(0,.04,2.26),.16,.1),
             (V(0,.01,2.38),.11,.07),(V(0,-.03,2.47),.042,.04),(V(0,-.07,2.58),.04,.038),(V(0,-.11,2.66),.05,.05)])
for s,sx in (('L',1),('R',-1)):
    leg=chain([(V(.1*sx,.02,1.47),.07),(V(.12*sx,-.02,1.15),.052),(V(.13*sx,-.06,.82),.044,.05),(V(.13*sx,-.02,.48),.031),(V(.13*sx,.03,.12),.026,.03),(V(.13*sx,-.06,.05),.03,.02),(V(.13*sx,-.18,.025),.024,.012)])
    bm.edges.new((torso[1],leg[0]))
    arm=chain([(V(.19*sx,.05,2.34),.048),(V(.26*sx,.07,2.0),.034),(V(.31*sx,.08,1.63),.031),(V(.33*sx,.05,1.28),.025),(V(.35*sx,.02,.95),.019,.015),(V(.362*sx,.0,.87),.03,.011)])
    bm.edges.new((torso[5],arm[0]))
    for f in list(range(4))+['t']:
        pts=FING[(s,f)];r0=.0085 if f!='t' else .01
        prev=arm[-1]
        for k,p in enumerate(pts[1:]):
            v=vtx(p,r0*(1-.22*k),r0*(1-.22*k)*.9);bm.edges.new((prev,v));prev=v
me=bpy.data.meshes.new('body');bm.to_mesh(me);bm.free()
body=bpy.data.objects.new('body',me);scn.collection.objects.link(body)
mod=body.modifiers.new('skin','SKIN');mod.branch_smoothing=.5;mod.use_smooth_shade=True
for (v,rx,ry),sv in zip(sk,body.data.skin_vertices[0].data):sv.radius=(rx,ry)
body.data.skin_vertices[0].data[0].use_root=True
activate(body);bpy.ops.object.modifier_apply(modifier='skin')
sub=body.modifiers.new('sub','SUBSURF');sub.levels=2;bpy.ops.object.modifier_apply(modifier='sub')
# bony detail: ribs, sternum, spine, collarbones, knobby joints, emaciated lumps
me=body.data;me.calc_loop_triangles() if hasattr(me,'calc_loop_triangles') else None
bm=bmesh.new();bm.from_mesh(me);bm.normal_update()
for v in bm.verts:
    p=v.co;n=v.normal;d=0
    if 1.86<p.z<2.3 and abs(p.x)<.17:
        side=abs(p.x)>.03
        rib=max(0,math.sin((p.z-1.86)*math.pi*17))**3
        if side:d+=.009*rib
        if p.y<-.02 and abs(p.x)<.025:d+=.007
    if p.y>.06 and abs(p.x)<.03 and 1.5<p.z<2.4:d+=.012*max(0,math.sin(p.z*55))**2
    if 2.28<p.z<2.36 and p.y<0 and .03<abs(p.x)<.2:d+=.01
    if 1.64<p.z<1.76 and abs(p.x)<.06 and p.y<.02:d-=.012
    for j in ('knee','elbow','ankle'):
        for s in 'LR':
            if (p-J[j+s]).length<.06:d+=.008*(1-(p-J[j+s]).length/.06)
    d+=(noise.noise(p*14)*.004)
    v.co=p+n*d
bm.to_mesh(me);bm.free()

# ------------------------------------------------------------------ sack head with jaw
bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=56,v_segments=36,radius=1)
HC=V(0,-.15,2.8)
for v in bm.verts:
    x,y,z=v.co;l=1+noise.noise(v.co*2.2+V(3,1,2))*.09
    sx,sy,sz=.235,.25,.29
    if z<-.55:k=(-z-.55)/.45;sx*=1-k*.55;sy*=1-k*.55
    if z>.6:sz*=1+(z-.6)*.25
    v.co=V(x*sx*l+(.06*(z-.6) if z>.6 else 0),y*sy*l,z*sz*l)+HC
for e in (V(-.085,-.36,2.84),V(.085,-.35,2.85)):
    for v in bm.verts:
        d=(v.co-e).length
        if d<.06:v.co+= (HC-v.co).normalized()*.04*(1-d/.06)**1.5
bm.normal_update()
jawf=[f for f in bm.faces if f.calc_center_median().z<2.745 and f.calc_center_median().y<-.24 and abs(f.calc_center_median().x)<.19]
for f in bm.faces:f.select=False
for f in jawf:f.select=True
bnd=[e for e in bm.edges if (any(f.select for f in e.link_faces) and not all(f.select for f in e.link_faces))]
bmesh.ops.split_edges(bm,edges=bnd)
jawverts=set(v for f in jawf for v in f.verts)
rimH=[];rimJ=[]
for e in bm.edges:
    if e.is_boundary:
        for v in e.verts:(rimJ if v in jawverts else rimH).append(v.co.copy())
sack=bpy.data.meshes.new('sack');bm.to_mesh(sack);bm.free()
sackO=bpy.data.objects.new('sack',sack);scn.collection.objects.link(sackO)
JAWSET=set(i for i,v in enumerate(sack.vertices) if v.co.z<2.75 and v.co.y<-.2 and abs(v.co.x)<.2)
# ------------------------------------------------------------------ helpers for rigid parts
PARTS=[]
def part(bm_,name,mat,bone,extra=None):
    m=bpy.data.meshes.new(name);bm_.to_mesh(m);bm_.free();o=bpy.data.objects.new(name,m);scn.collection.objects.link(o);o['bone']=bone;o['mat']=mat;PARTS.append(o);return o
def cone(bm_,base,tip,r,seg=7):
    d=(tip-base);L=d.length;q=d.normalized().to_track_quat('Z','Y')
    res=bmesh.ops.create_cone(bm_,cap_ends=True,segments=seg,radius1=r,radius2=r*.08,depth=L)
    for v in res['verts']:v.co=q@v.co+base+d*.5
def tube(bm_,pts,r0,r1,seg=6):
    rings=[]
    for i,p in enumerate(pts):
        t=i/(len(pts)-1);r=r0+(r1-r0)*t;d=(pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]).normalized();q=d.to_track_quat('Z','Y')
        rings.append([bm_.verts.new(p+q@V(math.cos(a)*r,math.sin(a)*r,0)) for a in [k/seg*math.tau for k in range(seg)]])
    for a,b in zip(rings,rings[1:]):
        for k in range(seg):bm_.faces.new((a[k],a[(k+1)%seg],b[(k+1)%seg],b[k]))
# teeth: broken, uneven, a few fangs
bmT=bmesh.new();bmJ=bmesh.new()
rimH=[p for p in rimH if p.y<-.27];rimJ=[p for p in rimJ if p.y<-.27];rimH.sort(key=lambda p:p.x);rimJ.sort(key=lambda p:p.x)
for i,p in enumerate(rimH[::2]):
    if random.random()<.12:continue
    fang=abs(p.x)>.055 and abs(p.x)<.075;L=.075 if fang else .018+random.random()*.028
    cone(bmT,p+V(0,.012,.006),p+V(random.uniform(-.006,.006),.01,-L),.011 if not fang else .009)
for i,p in enumerate(rimJ[::2]):
    if random.random()<.15:continue
    fang=abs(p.x)>.05 and abs(p.x)<.07;L=.06 if fang else .015+random.random()*.022
    cone(bmJ,p+V(0,.012,-.006),p+V(random.uniform(-.006,.006),.01,L),.01)
part(bmT,'teethU','teeth','head');part(bmJ,'teethL','teeth','jaw')
b=bmesh.new();bmesh.ops.create_uvsphere(b,u_segments=20,v_segments=14,radius=1)
for v in b.verts:v.co=V(v.co.x*.2,v.co.y*.21,v.co.z*.24)+HC+V(0,-.01,-.02)
bmesh.ops.reverse_faces(b,faces=b.faces);part(b,'maw','maw','head')
for e in (V(-.083,-.33,2.845),V(.083,-.32,2.855)):
    b=bmesh.new();bmesh.ops.create_uvsphere(b,u_segments=16,v_segments=12,radius=.021)
    for v in b.verts:v.co+=e
    part(b,'eye','eye','head')
# rope at the neck
b=bmesh.new();ring=[HC+V(math.cos(a)*.105,math.sin(a)*.1-.0,-.255) for a in [k/24*math.tau for k in range(25)]];tube(b,ring,.016,.016,6);part(b,'rope','straw','head')
# hat
b=bmesh.new();segs=40;inner=[];outer=[]
for k in range(segs):
    a=k/segs*math.tau;ro=.5+random.uniform(-.06,.03);droop=-.06*math.cos(a-.6)-.03
    inner.append(b.verts.new(V(math.cos(a)*.2,math.sin(a)*.2,0)));outer.append(b.verts.new(V(math.cos(a)*ro,math.sin(a)*ro,droop+random.uniform(-.015,.015))))
for k in range(segs):
    if random.random()<.06:continue
    b.faces.new((inner[k],inner[(k+1)%segs],outer[(k+1)%segs],outer[k]))
top=b.verts.new(V(.04,.02,.4));ring=[b.verts.new(V(math.cos(a)*.2,math.sin(a)*.2,0)) for a in [k/segs*math.tau for k in range(segs)]]
mid=[b.verts.new(V(math.cos(a)*.17+.02,math.sin(a)*.17,.22)) for a in [k/segs*math.tau for k in range(segs)]]
for k in range(segs):
    b.faces.new((ring[k],ring[(k+1)%segs],mid[(k+1)%segs],mid[k]))
    if random.random()>.08:b.faces.new((mid[k],mid[(k+1)%segs],top))
mt=Matrix.Translation(HC+V(.02,.03,.24))@Euler((0.12,-.32,.4)).to_matrix().to_4x4()
for v in b.verts:v.co=mt@v.co
part(b,'hat','straw','head')
# dead branches through the back of the skull
b=bmesh.new()
for sx in (-1,1):
    base=HC+V(.07*sx,.12,.14);pts=[base,base+V(.1*sx,.06,.16),base+V(.2*sx,.02,.33),base+V(.33*sx,.09,.46)];tube(b,pts,.016,.004)
    tube(b,[pts[1],pts[1]+V(.08*sx,.12,.05),pts[1]+V(.16*sx,.16,.04)],.009,.003);tube(b,[pts[2],pts[2]+V(0,.06,.14),pts[2]+V(-.03*sx,.03,.24)],.008,.002)
part(b,'branches','bark','head')
# straw poking from the neck and sleeves
b=bmesh.new()
for k in range(26):
    a=random.random()*math.tau;p=HC+V(math.cos(a)*.08,math.sin(a)*.08,-.27);cone(b,p,p+V(math.cos(a)*.12,math.sin(a)*.12,-.1-random.random()*.12),.007,4)
part(b,'straw','straw','head')
# ------------------------------------------------------------------ coat (open front, torn hem)
b=bmesh.new();segs=40;rings=[];prof=[(2.38,.17,.115),(2.25,.175,.12),(2.0,.16,.12),(1.75,.15,.115),(1.5,.2,.15),(1.25,.26,.19),(1.0,.32,.22),(.78,.35,.24)]
gap=.85
for z,rx,ry in prof:
    ring=[]
    for k in range(segs+1):
        a=-math.pi/2+gap/2+k/segs*(math.tau-gap)
        ring.append(b.verts.new(V(math.cos(a)*rx,math.sin(a)*ry+.03,z)))
    rings.append(ring)
for i,(ra,rb) in enumerate(zip(rings,rings[1:])):
    for k in range(segs):
        if i>=4 and random.random()<.07:continue
        b.faces.new((ra[k],ra[k+1],rb[k+1],rb[k]))
for v in rings[-1]:v.co.z-=random.random()*.35;v.co.x*=1+random.uniform(-.1,.1)
for v in rings[-2]:v.co.z-=random.random()*.12
bmesh.ops.solidify(b,geom=b.faces[:],thickness=.012)
coatO=part(b,'coat','cloth','auto')
# ------------------------------------------------------------------ materials (procedural, then baked)
def nodes_mat(name):
    m=bpy.data.materials.new(name);m.use_nodes=True;nt=m.node_tree;return m,nt,nt.nodes,nt.links
def principled(nt):return nt.nodes['Principled BSDF']
def tex(nodes,t,**kw):
    n=nodes.new(t)
    for k,v in kw.items():
        if k in n.inputs:n.inputs[k].default_value=v
        else:setattr(n,k,v)
    return n
def ramp(nodes,links,src,stops):
    r=nodes.new('ShaderNodeValToRGB');links.new(src,r.inputs[0]);cr=r.color_ramp
    cr.elements[0].position,cr.elements[0].color=stops[0];cr.elements[1].position,cr.elements[1].color=stops[-1]
    for p,c in stops[1:-1]:e=cr.elements.new(p);e.color=c
    return r
def bump(nodes,links,h,strength,dist=.003):
    bn=nodes.new('ShaderNodeBump');bn.inputs['Strength'].default_value=strength;bn.inputs['Distance'].default_value=dist;links.new(h,bn.inputs['Height']);return bn
MAT={}
# skin: pale, mottled, veined
m,nt,N,Lk=nodes_mat('skin');P=principled(nt)
n1=tex(N,'ShaderNodeTexNoise',Scale=7.,Detail=8.);v1=tex(N,'ShaderNodeTexVoronoi',Scale=22.)
w1=tex(N,'ShaderNodeTexWave',Scale=6.,Distortion=14.,Detail=6.);w1.wave_type='BANDS'
r1=ramp(N,Lk,n1.outputs['Fac'],[(0,(.07,.068,.058,1)),(.5,(.16,.152,.13,1)),(1,(.26,.245,.21,1))])
r2=ramp(N,Lk,w1.outputs['Fac'],[(0,(1,1,1,1)),(.92,(1,1,1,1)),(1,(.35,.28,.4,1))])
mx=N.new('ShaderNodeMix');mx.data_type='RGBA';mx.blend_type='MULTIPLY';mx.inputs[0].default_value=1;Lk.new(r1.outputs[0],mx.inputs[6]);Lk.new(r2.outputs[0],mx.inputs[7])
r3=ramp(N,Lk,v1.outputs['Distance'],[(0,(.55,.5,.45,1)),(.6,(1,1,1,1)),(1,(1,1,1,1))])
mx2=N.new('ShaderNodeMix');mx2.data_type='RGBA';mx2.blend_type='MULTIPLY';mx2.inputs[0].default_value=.7;Lk.new(mx.outputs[2],mx2.inputs[6]);Lk.new(r3.outputs[0],mx2.inputs[7])
Lk.new(mx2.outputs[2],P.inputs['Base Color']);P.inputs['Roughness'].default_value=.55
hb=N.new('ShaderNodeMath');hb.operation='ADD';Lk.new(n1.outputs['Fac'],hb.inputs[0]);Lk.new(v1.outputs['Distance'],hb.inputs[1])
Lk.new(bump(N,Lk,hb.outputs[0],.35).outputs[0],P.inputs['Normal']);MAT['skin']=m
# burlap sack: woven, stained, dark around holes
m,nt,N,Lk=nodes_mat('burlap');P=principled(nt)
tc=N.new('ShaderNodeTexCoord');wx=tex(N,'ShaderNodeTexWave',Scale=90.,Distortion=1.5);wx.bands_direction='X';wy=tex(N,'ShaderNodeTexWave',Scale=90.,Distortion=1.5);wy.bands_direction='Y'
Lk.new(tc.outputs['Object'],wx.inputs['Vector']);Lk.new(tc.outputs['Object'],wy.inputs['Vector'])
wv=N.new('ShaderNodeMath');wv.operation='MAXIMUM';Lk.new(wx.outputs['Fac'],wv.inputs[0]);Lk.new(wy.outputs['Fac'],wv.inputs[1])
st=tex(N,'ShaderNodeTexNoise',Scale=4.,Detail=10.);Lk.new(tc.outputs['Object'],st.inputs['Vector'])
rs=ramp(N,Lk,st.outputs['Fac'],[(0,(.03,.015,.008,1)),(.45,(.12,.08,.042,1)),(1,(.2,.145,.08,1))])
rw=ramp(N,Lk,wv.outputs[0],[(0,(.55,.55,.55,1)),(1,(1,1,1,1))])
mx=N.new('ShaderNodeMix');mx.data_type='RGBA';mx.blend_type='MULTIPLY';mx.inputs[0].default_value=1;Lk.new(rs.outputs[0],mx.inputs[6]);Lk.new(rw.outputs[0],mx.inputs[7])
ca=N.new('ShaderNodeVertexColor');ca.layer_name='dirt'
mx2=N.new('ShaderNodeMix');mx2.data_type='RGBA';mx2.blend_type='MULTIPLY';mx2.inputs[0].default_value=1;Lk.new(mx.outputs[2],mx2.inputs[6]);Lk.new(ca.outputs['Color'],mx2.inputs[7])
Lk.new(mx2.outputs[2],P.inputs['Base Color']);P.inputs['Roughness'].default_value=.95
Lk.new(bump(N,Lk,wv.outputs[0],.5,.002).outputs[0],P.inputs['Normal']);MAT['burlap']=m
# coat cloth
m,nt,N,Lk=nodes_mat('cloth');P=principled(nt)
n1=tex(N,'ShaderNodeTexNoise',Scale=5.,Detail=8.);r1=ramp(N,Lk,n1.outputs['Fac'],[(0,(.02,.018,.015,1)),(.6,(.07,.06,.05,1)),(1,(.16,.12,.08,1))])
Lk.new(r1.outputs[0],P.inputs['Base Color']);P.inputs['Roughness'].default_value=1.
w=tex(N,'ShaderNodeTexWave',Scale=60.);Lk.new(bump(N,Lk,w.outputs['Fac'],.3,.002).outputs[0],P.inputs['Normal']);MAT['cloth']=m
# straw
m,nt,N,Lk=nodes_mat('straw');P=principled(nt)
w=tex(N,'ShaderNodeTexWave',Scale=40.,Distortion=4.);r1=ramp(N,Lk,w.outputs['Fac'],[(0,(.08,.055,.02,1)),(1,(.3,.22,.1,1))])
Lk.new(r1.outputs[0],P.inputs['Base Color']);P.inputs['Roughness'].default_value=.9;Lk.new(bump(N,Lk,w.outputs['Fac'],.4).outputs[0],P.inputs['Normal']);MAT['straw']=m
# bark
m,nt,N,Lk=nodes_mat('bark');P=principled(nt)
n1=tex(N,'ShaderNodeTexNoise',Scale=30.,Detail=6.);r1=ramp(N,Lk,n1.outputs['Fac'],[(0,(.03,.02,.015,1)),(1,(.16,.12,.08,1))]);Lk.new(r1.outputs[0],P.inputs['Base Color']);MAT['bark']=m
def simple(name,col,rough,emis=None,es=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;P=m.node_tree.nodes['Principled BSDF'];P.inputs['Base Color'].default_value=col;P.inputs['Roughness'].default_value=rough
    if emis:P.inputs['Emission Color'].default_value=emis;P.inputs['Emission Strength'].default_value=es
    return m
MAT['teeth']=simple('teeth',(.42,.36,.22,1),.35);MAT['maw']=simple('maw',(.025,.002,.002,1),.35,(.06,.003,.002,1),.3);MAT['eye']=simple('eye',(.75,.7,.55,1),.04,(.4,.3,.15,1),.6)
# vertex colour on the sack: dark eye holes, torn mouth, blood tears
vc=sack.color_attributes.new('dirt','FLOAT_COLOR','POINT')
for i,v in enumerate(sack.vertices):
    p=v.co;c=1.
    for e in (V(-.085,-.36,2.84),V(.085,-.35,2.85)):
        d=(p-e).length;c=min(c,.04+.96*min(1,max(0,(d-.035)/.04)))
        if abs(p.x-e.x)<.018 and p.z<e.z-.03 and p.z>e.z-.2 and p.y<-.2:c=min(c,.45)
    if p.y<-.2 and abs(p.z-2.745)<.035 and abs(p.x)<.19:c=min(c,.18)
    vc.data[i].color=(c,c*.9 if c<.5 else c,c*.85 if c<.5 else c,1)
# ------------------------------------------------------------------ join + weights
def seg_dist(p,a,b):
    ab=b-a;t=max(0,min(1,(p-a).dot(ab)/ab.length_squared));return (p-(a+ab*t)).length
DEFORM=[n for n in SEGS]
def auto_weights(obj,allowed=None):
    for n in DEFORM:
        if n not in obj.vertex_groups:obj.vertex_groups.new(name=n)
    for v in obj.data.vertices:
        p=obj.matrix_world@v.co
        ds=sorted(((seg_dist(p,*SEGS[n]),n) for n in (allowed or DEFORM)))[:3]
        ws=[1/(d+.004)**4 for d,_ in ds];s=sum(ws)
        for (d,n),w in zip(ds,ws):
            if w/s>.02:obj.vertex_groups[n].add([v.index],w/s,'REPLACE')
NOF=[n for n in DEFORM if not n.startswith('f')]+[]
auto_weights(body)
coatO.data.materials.append(MAT['cloth']);auto_weights(coatO,[n for n in DEFORM if n in('pelvis','spine1','spine2','chest','thighL','thighR','shinL','shinR','upperarmL','upperarmR')])
sackO.data.materials.append(MAT['burlap'])
for n in ('head','jaw'):sackO.vertex_groups.new(name=n)
sackO.vertex_groups['head'].add([i for i in range(len(sack.vertices)) if i not in JAWSET],1,'REPLACE');sackO.vertex_groups['jaw'].add(list(JAWSET),1,'REPLACE')
body.data.materials.append(MAT['skin'])
for o in PARTS:
    if o['bone']=='auto':continue
    o.data.materials.append(MAT[o['mat']]);g=o.vertex_groups.new(name=o['bone']);g.add(list(range(len(o.data.vertices))),1,'REPLACE')
for o in [body,sackO]+PARTS:
    for poly in o.data.polygons:poly.use_smooth=o not in PARTS or o['mat'] in('teeth','eye','maw','straw')
activate(body)
for o in [sackO]+PARTS:o.select_set(True)
bpy.ops.object.join();hollow=body;hollow.name='Hollow'
# ------------------------------------------------------------------ UV + bake to an atlas
activate(hollow);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.004);bpy.ops.object.mode_set(mode='OBJECT')
RES=int(os.environ.get('RES','2048'))
alb=bpy.data.images.new('hollow_albedo',RES,RES);nrm=bpy.data.images.new('hollow_normal',RES,RES);nrm.colorspace_settings.name='Non-Color'
BAKED=('skin','burlap','cloth','straw','bark')
for k in BAKED:
    nt=MAT[k].node_tree;n=nt.nodes.new('ShaderNodeTexImage');n.name='BAKE';nt.nodes.active=n
scn.render.engine='CYCLES';scn.cycles.device='CPU';scn.cycles.samples=4;scn.render.bake.margin=6
for img,typ in ((alb,'DIFFUSE'),(nrm,'NORMAL')):
    for k in BAKED:MAT[k].node_tree.nodes['BAKE'].image=img
    if typ=='DIFFUSE':bpy.ops.object.bake(type='DIFFUSE',pass_filter={'COLOR'},use_clear=True)
    else:bpy.ops.object.bake(type='NORMAL',use_clear=True)
for img in (alb,nrm):img.pack()
final=bpy.data.materials.new('HollowSkin');final.use_nodes=True;nt=final.node_tree;P=nt.nodes['Principled BSDF']
ta=nt.nodes.new('ShaderNodeTexImage');ta.image=alb;nt.links.new(ta.outputs['Color'],P.inputs['Base Color'])
tn=nt.nodes.new('ShaderNodeTexImage');tn.image=nrm;nm=nt.nodes.new('ShaderNodeNormalMap');nt.links.new(tn.outputs['Color'],nm.inputs['Color']);nt.links.new(nm.outputs['Normal'],P.inputs['Normal'])
P.inputs['Roughness'].default_value=.7
for i,ms in enumerate(hollow.material_slots):
    if ms.material and ms.material.name.split('.')[0] in BAKED:ms.material=final
# ------------------------------------------------------------------ bind to rig
hollow.parent=rig;mo=hollow.modifiers.new('rig','ARMATURE');mo.object=rig
# ------------------------------------------------------------------ animation
activate(rig);bpy.ops.object.mode_set(mode='POSE')
for pb in rig.pose.bones:pb.rotation_mode='XYZ'
FPS=30;scn.render.fps=FPS
def clip(name,dur,fn,loop=True):
    act=bpy.data.actions.new(name);act.use_fake_user=True;rig.animation_data_create();rig.animation_data.action=act
    n=int(dur*FPS)
    for f in range(0,n+1,2):
        t=f/FPS;ph=t/dur*math.tau
        for pb in rig.pose.bones:pb.rotation_euler=(0,0,0);pb.location=(0,0,0)
        fn(t,ph)
        for pb in rig.pose.bones:
            pb.keyframe_insert('rotation_euler',frame=f+1);
            if pb.name=='pelvis':pb.keyframe_insert('location',frame=f+1)
    return act
PB=rig.pose.bones
def R(n,x=0,y=0,z=0):e=PB[n].rotation_euler;PB[n].rotation_euler=(e[0]+x,e[1]+y,e[2]+z)
def fingers(c,tw=0):
    for s in 'LR':
        for f in range(4):
            for k in range(3):R(f'f{s}{f}{k}',x=c*(.35+.15*k)+tw*math.sin(f*1.7+k))
SG=float(os.environ.get('SIGN','1'))
def idle(t,ph):
    br=math.sin(ph*2);R('spine2',x=.02*br);R('chest',x=.03*br+.12);R('spine1',x=.1);R('neck',x=.25,z=.05*math.sin(ph));R('head',z=.4+.06*math.sin(ph),x=-.1)
    R('jaw',x=-.06-.03*math.sin(ph*3));
    for s,sx in (('L',1),('R',-1)):R('upperarm'+s,x=.08*math.sin(ph+sx),z=.08*sx);R('forearm'+s,x=.15)
    fingers(.5,.08*math.sin(t*9))
def walk(t,ph):
    s=math.sin(ph);c=math.cos(ph)
    PB['pelvis'].location=(0,.04*abs(c)-.02,0);R('spine1',x=.18);R('chest',x=.1,y=.06*s);R('neck',x=.3);R('head',z=.35+.05*s,x=-.15)
    R('thighL',x=.55*s);R('thighR',x=-.55*s);R('shinL',x=-max(0,c)*1.0-.08);R('shinR',x=-max(0,-c)*1.0-.08);R('footL',x=.2*s);R('footR',x=-.2*s)
    R('upperarmL',x=-.25*s,z=.08);R('upperarmR',x=.25*s,z=-.08);R('forearmL',x=.2+.1*s);R('forearmR',x=.2-.1*s);fingers(.5,.1*math.sin(t*7));R('jaw',x=-.1)
def crawl(t,ph):
    s=math.sin(ph);c=math.cos(ph)
    PB['pelvis'].location=(0,-.74+.04*abs(c),0);R('pelvis',x=1.2);R('spine1',x=.08);R('chest',x=.04);R('neck',x=-.75);R('head',x=-.55,z=.15*s)
    R('thighL',x=1.55+.55*s,z=.12);R('thighR',x=1.55-.55*s,z=-.12);R('shinL',x=-1.75+.45*c);R('shinR',x=-1.75-.45*c);R('footL',x=.6);R('footR',x=.6)
    R('upperarmL',x=1.45+.6*s,z=.3);R('upperarmR',x=1.45-.6*s,z=-.3);R('forearmL',x=.3+.2*max(0,c));R('forearmR',x=.3+.2*max(0,-c));R('handL',x=-.9);R('handR',x=-.9);fingers(.1,.15*math.sin(t*11));R('jaw',x=-.95)
def lunge(t,ph):
    k=min(1,t/.35)
    R('spine1',x=.35*k);R('chest',x=.2*k);R('neck',x=-.2*k);R('head',x=-.3*k,z=.25*(1-k))
    for s,sx in (('L',1),('R',-1)):R('upperarm'+s,x=1.7*k,z=.25*sx*k);R('forearm'+s,x=.2);fingers(.1+.1*math.sin(t*20))
    R('thighL',x=.5*k);R('shinL',x=-.6*k);R('thighR',x=-.3*k);R('jaw',x=-1.0*k-.05*math.sin(t*40))
def scream(t,ph):
    k=math.sin(min(1,t/1.2)*math.pi)
    R('chest',x=-.25*k);R('neck',x=-.4*k);R('head',x=-.35*k+.05*math.sin(t*50),z=.1*math.sin(t*30));R('jaw',x=-1.05*k)
    for s,sx in (('L',1),('R',-1)):R('upperarm'+s,x=.4*k,z=.7*sx*k);R('forearm'+s,x=.6*k)
    fingers(-.1*k,.2*math.sin(t*25))
def frozen(t,ph):
    idle(t,ph);j=lambda:random.uniform(-1,1)
    R('head',x=.06*j(),y=.08*j(),z=.12*j());R('neck',x=.04*j());R('jaw',x=-.25);fingers(.2,.4*j())
def snap(t,ph):
    idle(t,ph);k=min(1,t/.12);R('head',z=1.0*k+.03*math.sin(t*60))
clip('idle',4,idle);clip('walk',1.7,walk);clip('crawl',.9,crawl);clip('lunge',1.2,lunge,False);clip('scream',1.5,scream,False);clip('frozen',1,frozen);clip('headsnap',1.2,snap,False)
rig.animation_data.action=bpy.data.actions['idle']
bpy.ops.object.mode_set(mode='OBJECT')
# ------------------------------------------------------------------ preview renders (for checking)
if PREVIEW:
    scn.render.resolution_x=640;scn.render.resolution_y=800;scn.cycles.samples=24
    w=bpy.data.worlds.new('w');scn.world=w;w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(.02,.025,.03,1)
    cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam'));scn.collection.objects.link(cam);scn.camera=cam
    for nm,pos,en in (('key',(1.6,-3,3.4),380),('rim',(-1.5,2.5,3),260),('fill',(-2,-2,1),60)):
        l=bpy.data.objects.new(nm,bpy.data.lights.new(nm,'AREA'));l.data.energy=en;l.data.size=1.5;l.location=pos;scn.collection.objects.link(l)
        tr=l.constraints.new('TRACK_TO');tr.target=hollow;tr.track_axis='TRACK_NEGATIVE_Z';tr.up_axis='UP_Y'
    for i,(act,frame,cp,tgt) in enumerate(PREVIEW_SHOTS if 'PREVIEW_SHOTS' in dir() else [('idle',30,(1.6,-5.2,1.9),(0,0,1.5)),('idle',30,(.35,-1.55,2.85),(0,-.2,2.78)),('crawl',10,(3.2,-3.6,1.4),(0,-.4,.8)),('scream',24,(.3,-1.5,2.75),(0,-.2,2.75))]):
        rig.animation_data.action=bpy.data.actions[act];scn.frame_set(frame)
        cam.location=cp;d=(V(*tgt)-V(*cp));cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
        scn.render.filepath=f'{PREVIEW}_{i}.png';bpy.ops.render.render(write_still=True)
    rig.animation_data.action=bpy.data.actions['idle']
# ------------------------------------------------------------------ export
activate(rig);hollow.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_image_format='JPEG',export_jpeg_quality=86,export_animations=True,export_animation_mode='ACTIONS',
                          export_skins=True,export_yup=True,export_apply=False,export_force_sampling=True)
bpy.ops.export_scene.gltf(filepath=OUT.replace('.glb','.gltf'),export_format='GLTF_EMBEDDED',use_selection=True,export_image_format='JPEG',export_jpeg_quality=86,export_animations=True,export_animation_mode='ACTIONS',export_skins=True,export_yup=True,export_apply=False,export_force_sampling=True)
print('EXPORTED',OUT,os.path.getsize(OUT),'verts',len(hollow.data.vertices))
