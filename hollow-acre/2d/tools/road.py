"""Procedural rural two-lane road, rendered top-down at 32 px/m, seamless along its length (texture coords wrapped on a cylinder)."""
import bpy, math, os
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene; s.render.engine='CYCLES'; s.cycles.samples=8; s.cycles.use_denoising=False; s.render.film_transparent=True
s.view_settings.view_transform='Standard'; s.cycles.tile_size=4096
LEN=12.0; HW=5.0; PPM=32; SS=4
s.render.resolution_x=int(2*HW*PPM*SS); s.render.resolution_y=int(LEN*PPM*SS)
bpy.ops.mesh.primitive_plane_add(size=1); pl=bpy.context.object; pl.scale=(2*HW,LEN,1)
cd=bpy.data.cameras.new('c'); cd.type='ORTHO'; cd.ortho_scale=LEN; cam=bpy.data.objects.new('c',cd); s.collection.objects.link(cam); s.camera=cam; cam.location=(0,0,10)
m=bpy.data.materials.new('road'); m.use_nodes=True; nt=m.node_tree; N=nt.nodes; L=nt.links; N.clear()
out=N.new('ShaderNodeOutputMaterial')
tc=N.new('ShaderNodeTexCoord'); sep=N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'],sep.inputs[0])
def math_(op,a,b=None,v=None):
    n=N.new('ShaderNodeMath'); n.operation=op
    if isinstance(a,(int,float)): n.inputs[0].default_value=a
    else: L.new(a,n.inputs[0])
    if b is not None:
        if isinstance(b,(int,float)): n.inputs[1].default_value=b
        else: L.new(b,n.inputs[1])
    return n.outputs[0]
X=math_('MULTIPLY',sep.outputs['X'],2*HW); Y=math_('MULTIPLY',sep.outputs['Y'],LEN)     # metres
R=LEN/(2*math.pi); ang=math_('MULTIPLY',Y,2*math.pi/LEN)
cy=math_('MULTIPLY',math_('COSINE',ang),R); sy=math_('MULTIPLY',math_('SINE',ang),R)
cmb=N.new('ShaderNodeCombineXYZ'); L.new(X,cmb.inputs[0]); L.new(cy,cmb.inputs[1]); L.new(sy,cmb.inputs[2]); P=cmb.outputs[0]   # seamless coords
def noise(scale,detail=4,rough=.5):
    n=N.new('ShaderNodeTexNoise'); n.noise_dimensions='3D'; L.new(P,n.inputs['Vector']); n.inputs['Scale'].default_value=scale; n.inputs['Detail'].default_value=detail; n.inputs['Roughness'].default_value=rough; return n.outputs['Fac']
def ramp(fac,stops,const=False):
    r=N.new('ShaderNodeValToRGB'); 
    if const: r.color_ramp.interpolation='CONSTANT'
    e=r.color_ramp.elements; e[0].position,e[0].color=stops[0][0],(*stops[0][1],1); e[1].position,e[1].color=stops[-1][0],(*stops[-1][1],1)
    for p_,c in stops[1:-1]: x=e.new(p_); x.color=(*c,1)
    L.new(fac,r.inputs[0]); return r.outputs[0]
def mix(a,b,fac):
    n=N.new('ShaderNodeMix'); n.data_type='RGBA'; L.new(fac,n.inputs[0]) if not isinstance(fac,float) else None
    if isinstance(fac,float): n.inputs[0].default_value=fac
    for i,v in ((6,a),(7,b)):
        if isinstance(v,tuple): n.inputs[i].default_value=(*v,1)
        else: L.new(v,n.inputs[i])
    return n.outputs[2]
ax=math_('ABSOLUTE',X)
# asphalt: mottled dark grey + aggregate speckle
asph=ramp(noise(.9,6,.6),[(.35,(.028,.03,.034)),(.65,(.052,.052,.055))])
spk=ramp(noise(90,2,.3),[(.6,(0,0,0)),(.72,(1,1,1))],True)
asph=mix(asph,(.09,.09,.09),math_('MULTIPLY',ramp(noise(90,2,.3),[(.0,(0,0,0)),(.62,(0,0,0)),(.7,(1,1,1))],True),1.0) if False else spk)
# tar-sealed cracks
vo=N.new('ShaderNodeTexVoronoi'); vo.feature='DISTANCE_TO_EDGE'; L.new(P,vo.inputs['Vector']); vo.inputs['Scale'].default_value=1.3; vo.inputs['Randomness'].default_value=1
crk=math_('LESS_THAN',vo.outputs['Distance'],.011); crk=math_('MULTIPLY',crk,math_('GREATER_THAN',noise(.6,2),.57))
asph=mix(asph,(.012,.012,.014),crk)
# puddles in the wheel ruts
rut=math_('MULTIPLY',math_('LESS_THAN',math_('ABSOLUTE',math_('SUBTRACT',ax,1.7)),.75),math_('GREATER_THAN',noise(.7,3),.6))
asph=mix(asph,(.024,.03,.04),rut)
# paint: dashed yellow centre (3 m dash / 9 m gap), solid white edge lines, worn
wear=math_('GREATER_THAN',noise(14,3),.36)
dash=math_('MULTIPLY',math_('LESS_THAN',ax,.06),math_('LESS_THAN',math_('MODULO',math_('ADD',Y,6.0+LEN*4),LEN/4*1.0 if False else 12.0),3.0))
yel=math_('MULTIPLY',dash,wear); asph=mix(asph,(.62,.42,.04),yel)
edge=math_('MULTIPLY',math_('LESS_THAN',math_('ABSOLUTE',math_('SUBTRACT',ax,3.05)),.06),wear); asph=mix(asph,(.55,.55,.52),edge)
# gravel shoulder outside 3.2 m, ragged into the grass
grav=ramp(noise(60,2,.5),[(.3,(.06,.052,.04)),(.5,(.1,.088,.068)),(.7,(.04,.036,.03))])
grav=mix(grav,(.06,.05,.035),math_('GREATER_THAN',noise(2.5,3),.6))      # mud
edgeN=math_('ADD',3.2,math_('MULTIPLY',math_('SUBTRACT',noise(3,3),.5),.12))
isG=math_('GREATER_THAN',ax,edgeN); col=mix(asph,grav,isG)
outer=math_('ADD',4.3,math_('MULTIPLY',math_('SUBTRACT',noise(1.8,4),.5),1.1))
alpha=math_('LESS_THAN',ax,outer)
em=N.new('ShaderNodeEmission'); L.new(col,em.inputs['Color']); tr=N.new('ShaderNodeBsdfTransparent'); ms=N.new('ShaderNodeMixShader')
L.new(alpha,ms.inputs[0]); L.new(tr.outputs[0],ms.inputs[1]); L.new(em.outputs[0],ms.inputs[2]); L.new(ms.outputs[0],out.inputs['Surface'])
pl.data.materials.append(m)
s.render.filepath=os.path.join(os.path.dirname(__file__),'..','spr','raw','road.png'); bpy.ops.render.render(write_still=True)
