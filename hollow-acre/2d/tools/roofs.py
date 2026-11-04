"""Gabled shingle roofs for the town houses, rendered at the game's 3/4 camera (32 px/m, ground squared)."""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(__file__))
import bpy, bmesh
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
from sprite import *
ROOT=os.path.join(os.path.dirname(__file__),'..'); OUT=os.path.join(ROOT,'spr','raw','roof'); os.makedirs(OUT,exist_ok=True)
JOBS=json.loads(os.environ['JOBS'])   # [[name, W, colour(lin rgb), chimney x or null], ...]
D=3.0; OV=.3; HR=1.25; TH=.12
def shingles(name,col):
    m=bpy.data.materials.new(name); m.use_nodes=True; nt=m.node_tree; N=nt.nodes; L=nt.links; pb=N['Principled BSDF']
    tc=N.new('ShaderNodeTexCoord'); mp=N.new('ShaderNodeMapping'); L.new(tc.outputs['Object'],mp.inputs[0])
    br=N.new('ShaderNodeTexBrick'); L.new(tc.outputs['UV'],br.inputs['Vector']); br.inputs['Scale'].default_value=1
    br.inputs['Brick Width'].default_value=.42; br.inputs['Row Height'].default_value=.28; br.inputs['Mortar Size'].default_value=.018; br.offset=.5
    c=[*col,1]; dk=[col[0]*.55,col[1]*.55,col[2]*.6,1]; lt=[min(1,col[0]*1.25),min(1,col[1]*1.25),min(1,col[2]*1.2),1]
    br.inputs['Color1'].default_value=c; br.inputs['Color2'].default_value=lt; br.inputs['Mortar'].default_value=[col[0]*.25,col[1]*.25,col[2]*.3,1]
    br.inputs['Bias'].default_value=-.2
    nz=N.new('ShaderNodeTexNoise'); L.new(tc.outputs['Object'],nz.inputs['Vector']); nz.inputs['Scale'].default_value=1.6; nz.inputs['Detail'].default_value=6
    rp=N.new('ShaderNodeValToRGB'); e=rp.color_ramp.elements; e[0].position=.55; e[0].color=(1,1,1,1); e[1].position=.75; e[1].color=(.42,.5,.3,1)   # moss/grime
    L.new(nz.outputs['Fac'],rp.inputs[0])
    mx=N.new('ShaderNodeMix'); mx.data_type='RGBA'; mx.blend_type='MULTIPLY'; mx.inputs[0].default_value=1; L.new(br.outputs['Color'],mx.inputs[6]); L.new(rp.outputs['Color'],mx.inputs[7])
    # each shingle course: lit top edge, shadowed bottom lip
    sep=N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['UV'],sep.inputs[0])
    dv=N.new('ShaderNodeMath'); dv.operation='DIVIDE'; L.new(sep.outputs['Y'],dv.inputs[0]); dv.inputs[1].default_value=.28
    fr=N.new('ShaderNodeMath'); fr.operation='FRACT'; L.new(dv.outputs[0],fr.inputs[0])
    rr=N.new('ShaderNodeValToRGB'); e=rr.color_ramp.elements; e[0].position=0; e[0].color=(.38,.38,.4,1); e[1].position=.35; e[1].color=(1,1,1,1)
    e2=rr.color_ramp.elements.new(.85); e2.color=(1.12,1.1,1.05,1); L.new(fr.outputs[0],rr.inputs[0])
    m2=N.new('ShaderNodeMix'); m2.data_type='RGBA'; m2.blend_type='MULTIPLY'; m2.inputs[0].default_value=1; L.new(mx.outputs[2],m2.inputs[6]); L.new(rr.outputs['Color'],m2.inputs[7])
    L.new(m2.outputs[2],pb.inputs['Base Color']); pb.inputs['Roughness'].default_value=.85
    bm_=N.new('ShaderNodeBump'); bm_.inputs['Strength'].default_value=.6; L.new(br.outputs['Fac'],bm_.inputs['Height']); L.new(bm_.outputs['Normal'],pb.inputs['Normal'])
    return m
def solid(name,col,rough=.8):
    m=bpy.data.materials.new(name); m.use_nodes=True; pb=m.node_tree.nodes['Principled BSDF']; pb.inputs['Base Color'].default_value=(*col,1); pb.inputs['Roughness'].default_value=rough; return m
def slab(name,verts,mat,uvscale=(1,1)):
    me=bpy.data.meshes.new(name); bm=bmesh.new(); vs=[bm.verts.new(v) for v in verts]
    faces=[(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]
    for f in faces: bm.faces.new([vs[i] for i in f])
    bm.normal_update(); uv=bm.loops.layers.uv.new()
    for f in bm.faces:
        n=f.normal
        for l in f.loops:
            co=l.vert.co; l[uv].uv=(co.x*uvscale[0], (co.y*.75+co.z)*uvscale[1]) if abs(n.z)>.3 else (co.x, co.z)
    bm.to_mesh(me); o=bpy.data.objects.new(name,me); bpy.context.scene.collection.objects.link(o); me.materials.append(mat); return o
meta={}
for name,W,col,chim in JOBS:
    bpy.ops.wm.read_factory_settings(use_empty=True); cam=scene_setup(20); s=bpy.context.scene; s.cycles.tile_size=4096
    x0,x1=-W/2-OV,W/2+OV; yf=-OV; yr=D/2; yb=D+OV
    sh=shingles('sh',col); trim=solid('trim',(col[0]*.35,col[1]*.33,col[2]*.33)); cap=solid('cap',(col[0]*.7,col[1]*.7,col[2]*.72),.6)
    # front slope, back slope (thick slabs), ridge cap, fascia boards
    dz=HR*(OV/(D/2+OV))
    slab('front',[(x0,yf,-dz),(x1,yf,-dz),(x1,yr,HR),(x0,yr,HR),(x0,yf,-dz+TH),(x1,yf,-dz+TH),(x1,yr,HR+TH),(x0,yr,HR+TH)][::1],sh)
    slab('back',[(x0,yr,HR),(x1,yr,HR),(x1,yb,-dz),(x0,yb,-dz),(x0,yr,HR+TH),(x1,yr,HR+TH),(x1,yb,-dz+TH),(x0,yb,-dz+TH)],sh)
    slab('ridge',[(x0-.02,yr-.12,HR+TH-.02),(x1+.02,yr-.12,HR+TH-.02),(x1+.02,yr+.12,HR+TH-.02),(x0-.02,yr+.12,HR+TH-.02),
                  (x0-.02,yr-.12,HR+TH+.08),(x1+.02,yr-.12,HR+TH+.08),(x1+.02,yr+.12,HR+TH+.08),(x0-.02,yr+.12,HR+TH+.08)],cap)
    slab('fascia',[(x0,yf-.04,-dz-.12),(x1,yf-.04,-dz-.12),(x1,yf+.02,-dz-.12),(x0,yf+.02,-dz-.12),(x0,yf-.04,-dz+TH),(x1,yf-.04,-dz+TH),(x1,yf+.02,-dz+TH),(x0,yf+.02,-dz+TH)],trim)
    for xe in (x0,x1):   # bargeboards along the gable edges
        d=.06*(1 if xe==x1 else -1)
        for (ya,za,yb_,zb) in ((yf,-dz,yr,HR),(yr,HR,yb,-dz)):
            slab('barge',[(xe,ya,za),(xe+d,ya,za),(xe+d,yb_,zb),(xe,yb_,zb),(xe,ya,za+TH+.06),(xe+d,ya,za+TH+.06),(xe+d,yb_,zb+TH+.06),(xe,yb_,zb+TH+.06)],trim)
    if chim is not None:
        brick=bpy.data.materials.new('brick'); brick.use_nodes=True; nt=brick.node_tree; br=nt.nodes.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value=9
        br.inputs['Color1'].default_value=(.32,.1,.06,1); br.inputs['Color2'].default_value=(.24,.07,.05,1); br.inputs['Mortar'].default_value=(.2,.18,.16,1)
        tcn=nt.nodes.new('ShaderNodeTexCoord'); nt.links.new(tcn.outputs['Object'],br.inputs['Vector']); nt.links.new(br.outputs['Color'],nt.nodes['Principled BSDF'].inputs['Base Color'])
        cx=chim; slab('chim',[(cx-.32,yr+.1,.6),(cx+.32,yr+.1,.6),(cx+.32,yr+.75,.6),(cx-.32,yr+.75,.6),(cx-.32,yr+.1,HR+.65),(cx+.32,yr+.1,HR+.65),(cx+.32,yr+.75,HR+.65),(cx-.32,yr+.75,HR+.65)],brick)
        slab('chimcap',[(cx-.38,yr+.04,HR+.65),(cx+.38,yr+.04,HR+.65),(cx+.38,yr+.81,HR+.65),(cx-.38,yr+.81,HR+.65),(cx-.38,yr+.04,HR+.75),(cx+.38,yr+.04,HR+.75),(cx+.38,yr+.81,HR+.75),(cx-.38,yr+.81,HR+.75)],solid('cc',(.12,.11,.1)))
    bpy.context.view_layer.update()
    objs=[o for o in s.objects if o.type=='MESH']; pts=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box]
    mn=Vector([min(p[i] for p in pts) for i in range(3)]); mx=Vector([max(p[i] for p in pts) for i in range(3)])
    u0=mn.y+mn.z; u1=mx.y+mx.z; w=mx.x-mn.x+.2; h=u1-u0+.2
    Wpx,Hpx=frame(cam,((mn.x+mx.x)/2,0,(u0+u1)/2),w,h,stretch=True); render(f'{OUT}/{name}.png')
    c=world_to_camera_view(s,cam,Vector((0,0,0))); meta[name]=dict(w=Wpx,h=Hpx,ax=round(c.x*Wpx,1),ay=round((1-c.y)*Hpx,1))
json.dump(meta,open(f'{OUT}/meta.json','w')); print('META',meta)
