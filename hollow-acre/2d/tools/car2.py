"""Kenney Car Kit sedan (CC0) -> pixel sprites: driving car (yaw frames), side view, and a crumpled wreck."""
import sys, os, math, json, random
sys.path.insert(0, os.path.dirname(__file__))
import bpy, bmesh
from mathutils import Vector, Euler, noise
from bpy_extras.object_utils import world_to_camera_view
from sprite import *
ROOT=os.path.join(os.path.dirname(__file__),'..'); OUT=os.path.join(ROOT,'spr','raw','car'); os.makedirs(OUT,exist_ok=True)
K='/tmp/ck/Models/GLB format/'
SX,SY,SZ=1.22,1.78,1.05
PAINT=(0.16,0.028,0.026)
def mat(name,base,rough=.5,metal=0.,coat=0.,emit=None):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes=True; nt=m.node_tree; pb=nt.nodes.get('Principled BSDF')
    pb.inputs['Base Color'].default_value=(*base,1); pb.inputs['Roughness'].default_value=rough; pb.inputs['Metallic'].default_value=metal
    pb.inputs['Coat Weight'].default_value=coat
    if emit: pb.inputs['Emission Color'].default_value=(*emit[0],1); pb.inputs['Emission Strength'].default_value=emit[1]
    return m
def classify(c,y,ymin,ymax):
    r,g,b=c
    if r>.7 and g>.7 and b>.7 or (abs(r-.4)<.1 and g>.5): return 'glass'
    if r>.9 and g>.6 and b<.4: return 'head' if y<0 else 'tail'
    if r>.7 and g<.3: return 'tail'
    if r>.7 and g<.55: return 'paint'
    if r<.3 and g<.3: return 'black'
    if b>r+.1: return 'trim'
    if r>.5: return 'chrome'
    return 'trim'
def build(lights=False, wreck=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    cam=scene_setup(24); s=bpy.context.scene; s.cycles.tile_size=4096; s.cycles.max_bounces=4
    w=s.world.node_tree.nodes['Background']; w.inputs['Color'].default_value=(.42,.46,.55,1); w.inputs['Strength'].default_value=.7
    M=dict(paint=mat('paint',PAINT,.32,0,.8), glass=mat('glass',(.035,.05,.065),.08,0,.0), chrome=mat('chrome',(.75,.75,.78),.22,1),
           black=mat('black',(.018,.018,.02),.8), trim=mat('trim',(.03,.03,.035),.55),
           head=mat('head',(.85,.82,.7),.2,0,0,((1,.92,.7),4) if lights else None), tail=mat('tail',(.35,.015,.012),.3,0,0,((1,.06,.03),2.2) if lights else None),
           hub=mat('hub',(.5,.5,.52),.3,1))
    if wreck:
        M['head2']=mat('headbroken',(.05,.05,.05),.6)
        # cracked windshield: voronoi edges as white cracks
        g=M['glass']; nt=g.node_tree; pb=nt.nodes['Principled BSDF']; vo=nt.nodes.new('ShaderNodeTexVoronoi'); vo.feature='DISTANCE_TO_EDGE'; vo.inputs['Scale'].default_value=26
        rp=nt.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.interpolation='CONSTANT'; rp.color_ramp.elements[0].color=(.3,.33,.37,1); rp.color_ramp.elements[1].position=.03; rp.color_ramp.elements[1].color=(.035,.05,.065,1)
        nt.links.new(vo.outputs['Distance'],rp.inputs[0]); nt.links.new(rp.outputs['Color'],pb.inputs['Base Color'])
        # grime + rust on the paint
        p=M['paint']; nt=p.node_tree; pb=nt.nodes['Principled BSDF']; nz=nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value=7; nz.inputs['Detail'].default_value=8
        rp=nt.nodes.new('ShaderNodeValToRGB'); e=rp.color_ramp.elements; e[0].position=.5; e[0].color=(*PAINT,1); e[1].position=.68; e[1].color=(.07,.04,.025,1)
        nt.links.new(nz.outputs['Fac'],rp.inputs[0]); nt.links.new(rp.outputs['Color'],pb.inputs['Base Color']); pb.inputs['Roughness'].default_value=.6; pb.inputs['Coat Weight'].default_value=.2
    before=set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=K+'sedan.glb'); objs=[o for o in bpy.data.objects if o not in before]
    img=next(i for i in bpy.data.images if 'colormap' in i.name); W_,H_=img.size; px=list(img.pixels)
    def col(u,v):
        x=min(W_-1,int(u%1*W_)); y=min(H_-1,int(v%1*H_)); i=(y*W_+x)*4; return px[i:i+3]
    for o in objs:
        me=o.data; uv=me.uv_layers.active.data; me.materials.clear()
        names=['paint','glass','chrome','black','trim','head','tail','hub']+(['head2'] if wreck else [])
        for n in names: me.materials.append(M[n])
        ys=[v.co.y for v in me.vertices]; y0,y1=min(ys),max(ys)
        for p in me.polygons:
            u=sum(uv[l].uv[0] for l in p.loop_indices)/p.loop_total; v=sum(uv[l].uv[1] for l in p.loop_indices)/p.loop_total
            k=classify(col(u,v),(o.matrix_world@p.center).y,y0,y1)
            if o.name.startswith('wheel') and k=='chrome': k='hub'
            if wreck and k=='head' and (o.matrix_world@p.center).x>0: k='head2'
            p.material_index=names.index(k)
        o.rotation_mode='XYZ'
        o.location=(o.location.x*SX,o.location.y*SY,o.location.z*SZ)
        if o.name.startswith('wheel'): o.scale=(1.12,1.12,1.12)
        else:
            o.scale=(SX,SY,SZ)
            bv=o.modifiers.new('bv','BEVEL'); bv.width=.012; bv.segments=2; bv.limit_method='ANGLE'
    body=next(o for o in objs if o.name=='body')
    if wreck: crumple(body); wreck_wheels(objs)
    root=bpy.data.objects.new('root',None); s.collection.objects.link(root)
    for o in objs: o.parent=root
    extra=[]
    if wreck: extra=debris(M)
    return cam,root,objs,extra
def crumple(body):
    bpy.context.view_layer.objects.active=body
    sd=body.modifiers.new('sd','SUBSURF'); sd.subdivision_type='SIMPLE'; sd.levels=2; sd.render_levels=2
    bpy.ops.object.modifier_apply(modifier='sd')
    me=body.data; random.seed(3)
    ys=[v.co.y for v in me.vertices]; y0=min(ys); L=max(ys)-y0
    for v in me.vertices:
        f=max(0.,1-(v.co.y-y0)/(L*.42))          # 1 at the front bumper, 0 at 42% back
        if f<=0: continue
        side=max(0.,(v.co.x+.2))                 # the right-front corner took the tree
        push=f*f*(.34+side*.5)
        v.co.y+=push
        n=noise.noise(v.co*7.0); n2=noise.noise(v.co*17.0+Vector((3,1,2)))
        v.co.z+= f*(.10*n+.04*n2) + f*f*.10*math.sin(v.co.x*9)*(v.co.z>.45)
        v.co.x+= f*.05*n2 - f*f*side*.10
    # door ajar: nothing; dent the right side
    for v in me.vertices:
        if v.co.x<-.5 and .1<v.co.y<.6: v.co.x+=.05*(1+noise.noise(v.co*9))
def wreck_wheels(objs):
    for o in objs:
        if o.name=='wheel-front-right': o.rotation_euler=(0,math.radians(-24),math.radians(28)); o.location.y+=.25; o.location.z-=.06
        if o.name=='wheel-front-left': o.rotation_euler=(0,0,math.radians(-16)); o.location.y+=.1
def debris(M):
    out=[]
    def add(name,loc,rot,scale=1.):
        before=set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=K+name+'.glb'); new=[o for o in bpy.data.objects if o not in before]
        for o in new:
            o.location=loc; o.rotation_mode='XYZ'; o.rotation_euler=rot; o.scale=(scale,)*3
            for sl in o.material_slots:
                pass
            me=o.data
            # paint parts the car colour, the rest dark
            me.materials.clear(); me.materials.append(M['paint'] if name!='debris-tire' else M['black'])
        out.extend(new)
    add('debris-bumper',(-.75,-.75,.03),(0,math.radians(90),math.radians(-25)),1.0)
    add('debris-plate-a',(-1.35,.6,.02),(0,0,math.radians(40)),.8)
    add('debris-plate-small-a',(.25,-1.05,.01),(0,0,math.radians(-15)),.8)
    add('debris-tire',(1.55,1.2,.17),(0,math.radians(90),math.radians(70)),1.1)
    return out
def bbox(objs):
    bpy.context.view_layer.update(); pts=[o.matrix_world@Vector(c) for o in objs if o.type=='MESH' for c in o.bound_box]
    return Vector([min(p[i] for p in pts) for i in range(3)]),Vector([max(p[i] for p in pts) for i in range(3)])
def shoot(cam,path,box,margin=.1,anchor=(0,0,0)):
    mn,mx=box
    u0=mn.y+mn.z; u1=mx.y+mx.z
    w=(mx.x-mn.x)+2*margin; h=(u1-u0)+2*margin; cx=(mx.x+mn.x)/2; uc=(u0+u1)/2
    W,H=frame(cam,(cx,0,uc),w,h,stretch=True); render(path)
    bpy.context.view_layer.update(); c=world_to_camera_view(bpy.context.scene,cam,Vector(anchor))
    return dict(w=W,h=H,ax=round(c.x*W,1),ay=round((1-c.y)*H,1))
MODE=os.environ.get('MODE','drive')
meta={}
if MODE=='drive':
    YAWS=[0,.15,.3,.45,.6,.75,.9]
    cam,root,objs,_=build(lights=True)
    R=2.6; box=(Vector((-R,-R,0)),Vector((R,R,1.45)))
    for i,a in enumerate(YAWS):
        root.rotation_euler=(0,0,math.pi-a); meta[f'drive_{i}']=shoot(cam,f'{OUT}/drive_{i}.png',box)
    root.rotation_euler=(0,0,-math.pi/2); meta['side_W']=shoot(cam,f'{OUT}/side_W.png',(Vector((-2.4,-1.,0)),Vector((2.4,1.,1.45))))
    json.dump(meta,open(f'{OUT}/drive.json','w'))
if MODE=='wreck':
    for nm,lt in (('wreck',False),('wreck_n',True)):
        cam,root,objs,extra=build(lights=lt,wreck=True)
        # car sits with its nose at the origin (the tree), body running north; nosed into the ditch, skewed
        for o in objs: o.location.y+=2.05
        root.rotation_euler=(math.radians(-3),math.radians(4),math.radians(-17))
        box=bbox(objs+extra); meta[nm]=shoot(cam,f'{OUT}/{nm}.png',box); meta[nm]['foot']=[round(box[0].x,2),round(-box[1].y,2),round(box[1].x,2),round(-box[0].y,2)]
    json.dump(meta,open(f'{OUT}/wreck.json','w'))
print('META',json.dumps(meta))
