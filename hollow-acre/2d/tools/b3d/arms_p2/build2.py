# Judge renders for the t353 arms (r2+): shape and look sheets of the left hand, and in-cab night frames with both
# hands, each posed on its own (the right is the same mesh mirrored, but placed, curled and thumbed differently).
#   python3 build2.py <out> [--shape|--look|--game|--rest] [--high]      env: SKIN SHIRT MARRIED VIEW SAMPLES
import sys, os, math, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy
from mathutils import Matrix, Vector
import armbuild as A, scene as S, hands, views, mats
OUT = next(a for a in sys.argv[1:] if not a.startswith('--') and not a.endswith('.py'))
MODE = next((a[2:] for a in sys.argv if a in ('--shape', '--look', '--game', '--rest', '--thumb')), 'shape'); HIGH = '--high' in sys.argv
hexc = lambda k, d: tuple(int(os.environ.get(k, d)[i:i + 2], 16) / 255 for i in (0, 2, 4))
SKIN, SHIRT = hexc('SKIN', 'd49a70'), hexc('SHIRT', 'b8402c')
def desat(c, k=.2): l = .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; return tuple(x * (1 - k) + l * k for x in c)

A.reset(); sc = bpy.context.scene
arm = A.armature()
hand, nails = A.hand_and_nails(4 if HIGH else 2, HIGH)
ring = A.ring(); sleeve = A.sleeve(3 if HIGH else 2, n=15, detail=HIGH)
for o in (hand, sleeve): A.skin(o, arm)
A.skin(nails, arm, 'nails'); A.skin(ring, arm, 'ring1')
parts = [hand, nails, ring, sleeve]

def materials(objs, skin_tone, shirt):
    h, n, r, s = objs
    m = mats.skin(h, skin_tone); nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = .56; bsdf.inputs['Coat Weight'].default_value = .02      # less sheen
    bsdf.inputs['Subsurface Scale'].default_value = .0028
    # redder knuckles, fingertips and nail folds from the baked flush attribute; slightly cooler, darker creases and veins
    src = bsdf.inputs['Base Color'].links[0].from_socket
    at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'data'; sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(at.outputs['Color'], sp.inputs['Color'])
    lum = .2126 * skin_tone[0] + .7152 * skin_tone[1] + .0722 * skin_tone[2]
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; nt.links.new(src, mats.sock(mx.inputs, 'A'))
    mats.sock(mx.inputs, 'B').default_value = (*mats._lin((skin_tone[0] * 1.0, skin_tone[1] * .66, skin_tone[2] * .62)), 1)
    fm = nt.nodes.new('ShaderNodeMath'); fm.operation = 'MULTIPLY'; fm.inputs[1].default_value = .35 + .3 * min(1, lum / .65)
    nt.links.new(sp.outputs['Red'], fm.inputs[0]); nt.links.new(fm.outputs['Value'], mats.sock(mx.inputs, 'Factor', 'VALUE'))
    mx2 = nt.nodes.new('ShaderNodeMix'); mx2.data_type = 'RGBA'; mx2.blend_type = 'MULTIPLY'; nt.links.new(mats.sock(mx.outputs, 'Result'), mats.sock(mx2.inputs, 'A'))
    mats.sock(mx2.inputs, 'B').default_value = (.86, .9, .93, 1); nt.links.new(sp.outputs['Green'], mats.sock(mx2.inputs, 'Factor', 'VALUE'))
    nt.links.new(mats.sock(mx2.outputs, 'Result'), bsdf.inputs['Base Color'])
    # darker skin shows more sheen (roughness ~.4 on the back of the hand, a little less on the knuckles)
    dark = max(0., min(1., (.45 - lum) / .3)); r0 = .56 - .14 * dark
    rm = nt.nodes.new('ShaderNodeMapRange'); rm.inputs['To Min'].default_value = r0; rm.inputs['To Max'].default_value = r0 - .07 * dark
    nt.links.new(sp.outputs['Red'], rm.inputs['Value']); nt.links.new(rm.outputs['Result'], bsdf.inputs['Roughness'])
    mats.pbr(n, (min(1, skin_tone[0] * 1.08 + .08), skin_tone[1] * .98 + .06, skin_tone[2] * .95 + .07), rough=.28, name='nail')
    mats.cloth(s, desat(shirt, .22), weave=.42)
    if r is not None: mats.pbr(r, (.86, .68, .32), rough=.22, metal=1.0, name='gold')
def flat(objs, cols):
    for o, c in zip(objs, cols):
        m = bpy.data.materials.new(o.name + 'f'); m.diffuse_color = (*c, 1); o.data.materials.clear(); o.data.materials.append(m)

def split_hand_forearm(o, side='L'):
    """separate static copies named 'hand' and 'forearm' (cut at the wrist crease) so the sheet prints each size"""
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    V = np.zeros(len(me.vertices) * 3); me.vertices.foreach_get('co', V); V = V.reshape(-1, 3) @ S.BM
    can = S.to_can(V, S.HMS[side]); keep_hand = can[:, 1] > -.3
    out = []
    for nm, mask in (('hand', keep_hand), ('forearm', ~keep_hand)):
        idx = np.where(mask)[0]; remap = -np.ones(len(V), int); remap[idx] = np.arange(len(idx))
        F = [[remap[v] for v in p.vertices] for p in me.polygons if mask[list(p.vertices)].all()]
        ob = A.mesh_obj(nm + '_part', S.B(V[idx]), F); out.append(ob)
    return out

if MODE in ('shape', 'look', 'rest', 'thumb'):
    SIDE = os.environ.get('SIDE', 'L')
    if MODE != 'rest': A.pose(arm, SIDE)
    rim = A.rim_and_wheel()
    if MODE in ('look', 'thumb'): materials(parts, SKIN, SHIRT); mats.pbr(rim, (.05, .05, .055), rough=.5, bump=.2, bump_scale=200, name='leather')
    else: flat(parts + [rim], [(.86, .66, .55), (.95, .8, .75), (.9, .75, .3), (.6, .25, .2), (.08, .08, .09)])
    hp, fp = split_hand_forearm(hand, os.environ.get('SIDE', 'L')); hp.hide_render = fp.hide_render = True          # measured, not drawn (the cut would show)
    if MODE == 'rest':                                   # lay the flat hand on the axes: x thumb, y fingers, z back of hand
        rim.hide_render = True
        for o in parts: o.hide_render = True
        dg = bpy.context.evaluated_depsgraph_get(); objs = []
        for o, nm in ((hp, 'hand (wrist crease to fingertips)'), (fp, 'forearm (to the cuff)'), (nails, 'nails')):
            me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); c = A.link(bpy.data.objects.new(nm, me))
            V = A.verts(c) @ S.BM; A.set_verts(c, S.to_can(V) * .01); c.hide_render = False
            c.data.materials.clear(); c.data.materials.append(hand.data.materials[0]); objs.append(c)
        hp.hide_render = fp.hide_render = True
        views.sheet(OUT + '.png', objs=objs, mode='shape', res=360)
        sys.exit(0)
    HMs = S.HMS[SIDE]; Ws = HMs[:3, 3]; Ms = S.to_car(np.array(hands.FINGERS['middle']['mcp']), HMs)
    eye = Vector(S.B(S.EYE)); ctr = Vector(S.B((Ws * .4 + Ms * .6)))
    _o, _gx, _gy, _gz = S.rimf(S.rim_angle(Ms)); GY, GZ, GX = (Vector(S.B(v)) for v in (_gy, _gz, _gx))
    TJ = [Vector(S.B(S.to_car(p, HMs))) for p in S.thumb_fk(S.THUMB_Q[SIDE])[0]]; tc = (TJ[1] + TJ[2] + TJ[3]) / 3
    if MODE == 'thumb':
        views.sheet(OUT + '.png', objs=[hand, nails], mode='look', res=480, cams=[views.cam_at(eye, tc, 230, 'thumb check (driver eye)'), views.cam_at(tc + (GZ * .9 + GY * .4).normalized() * .22, tc, 85, 'thumb from above')], extra_views=False)
        sys.exit(0)
    cams = [views.cam_at(eye, tc, 230, 'thumb check'), views.cam_at(eye, ctr, 110, 'game eye close-up'), views.cam_at(ctr + (GY * .7 + GZ * .5 - GX * .2).normalized() * .32, ctr, 70, 'outer'),
            views.cam_at(ctr + (-GZ * .8 + GY * .5).normalized() * .32, ctr, 70, 'far side')]
    views.sheet(OUT + '.png', objs=[hand, hp, fp, nails, ring], mode='look' if MODE == 'look' else 'shape', res=360 if MODE != 'look' else 320, cams=cams if MODE != 'rest' else ())
    sys.exit(0)

# ---------------------------------------------------------------- in-cab frames: both arms, each posed on its own
dg = bpy.context.evaluated_depsgraph_get(); X0 = S.EYE[0]
mir = Matrix(((-1, 0, 0, 2 * X0), (0, 1, 0, 0), (0, 0, 1, 0), (0, 0, 0, 1)))
statics = {}
for side in ('L', 'R'):
    A.pose(arm, side); dg = bpy.context.evaluated_depsgraph_get()
    for o in parts:
        if o is ring and (side == 'R' or os.environ.get('MARRIED', '1') != '1'): continue
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); st = A.link(bpy.data.objects.new(o.name + side, me))
        if side == 'R': st.matrix_world = mir
        statics.setdefault(o.name, []).append(st)
for o in parts: o.hide_render = True
for nm, objs in statics.items():
    for o in objs: o.data.materials.clear()
materials([statics['hand'][0], statics['nails'][0], statics['ring'][0] if 'ring' in statics else None, statics['sleeve'][0]], SKIN, SHIRT)
for nm in ('hand', 'nails', 'sleeve'):
    statics[nm][1].data.materials.clear(); statics[nm][1].data.materials.append(statics[nm][0].data.materials[0])

# the wheel: leather rim with a sheen, three spokes, a boss; a gauge hood glowing amber behind it
rim = A.rim_and_wheel(); mats.pbr(rim, (.085, .078, .072), rough=.38, bump=.25, bump_scale=260, name='leather')
bpy.ops.mesh.primitive_cube_add(size=1); dash = bpy.context.object; dash.scale = (1.8, .55, .4); dash.location = Vector(S.B(np.array([0, .7, -.88])))
bev = dash.modifiers.new('bev', 'BEVEL'); bev.width = .03; bev.segments = 4
mats.pbr(dash, (.2, .185, .17), rough=.5, bump=.35, bump_scale=90, name='dash')
# the gauge hood and two dials, glowing a dim amber through the wheel
def disc(name, c, r, col, strength):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=.006, vertices=40); d = bpy.context.object; d.name = name
    d.location = Vector(S.B(c)); d.rotation_euler = Vector(S.B(hands.nrm(S.EYE - c))).to_track_quat('Z', 'Y').to_euler()
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; em = nt.nodes.new('ShaderNodeEmission')
    gr = nt.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'; tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Location'].default_value = (-.5, -.5, -.5) if False else (0, 0, 0); nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); mp.inputs['Scale'].default_value = (1 / r, 1 / r, 1 / r)
    nt.links.new(mp.outputs['Vector'], gr.inputs['Vector'])
    rp = nt.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].position = .0; rp.color_ramp.elements[0].color = (*col, 1); rp.color_ramp.elements[1].position = .35; rp.color_ramp.elements[1].color = (.02, .015, .01, 1)
    nt.links.new(gr.outputs['Color'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], em.inputs['Color']); em.inputs['Strength'].default_value = strength
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface']); d.data.materials.append(m)
for x in (-.052, .052): disc('dial', np.array([S.EYE[0] + x, .925, -.70]), .04, (1, .5, .18), .9)
bpy.ops.mesh.primitive_cube_add(size=1); hood = bpy.context.object; hood.scale = (.27, .14, .02); hood.location = Vector(S.B(np.array([S.EYE[0], .985, -.71])))
mats.pbr(hood, (.07, .065, .06), rough=.6, name='hood')
# the night outside the glass: deep blue, brighter low down where the headlamps hit the snow, a few flakes
bpy.ops.mesh.primitive_plane_add(size=1); sky = bpy.context.object; sky.scale = (7, 4, 1); sky.location = Vector(S.B(np.array([-.36, 1.4, -4.0]))); sky.rotation_euler = (math.radians(90), 0, 0)
sm = bpy.data.materials.new('night'); sm.use_nodes = True; nt = sm.node_tree
em = nt.nodes.new('ShaderNodeEmission'); tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Generated'], sep.inputs[0])
ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = (.035, .05, .085, 1); ramp.color_ramp.elements[1].color = (.004, .006, .014, 1); ramp.color_ramp.elements[0].position = .25; ramp.color_ramp.elements[1].position = .7
nt.links.new(sep.outputs['Y'], ramp.inputs['Fac'])
vor = nt.nodes.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 90; vor.feature = 'F1'
mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = .02; mr.inputs['From Max'].default_value = .0; mr.inputs['To Max'].default_value = .6
nt.links.new(vor.outputs['Distance'], mr.inputs['Value'])
mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; nt.links.new(ramp.outputs['Color'], mats.sock(mx.inputs, 'A')); mats.sock(mx.inputs, 'B').default_value = (.5, .55, .65, 1)
nt.links.new(mr.outputs['Result'], mats.sock(mx.inputs, 'Factor', 'VALUE')); nt.links.new(mats.sock(mx.outputs, 'Result'), em.inputs['Color']); em.inputs['Strength'].default_value = 1.0
nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface']); sky.data.materials.append(sm)
# lights: a dim warm cab lamp overhead behind you (casts the finger and rim shadows), the gauge glow, cold snow-light
def light(nm, kind, loc, tgt, energy, size, col):
    ld = bpy.data.lights.new(nm, kind); ld.energy = energy; ld.color = col
    if kind == 'AREA': ld.size = size
    else: ld.shadow_soft_size = size
    lo = A.link(bpy.data.objects.new(nm, ld)); lo.location = Vector(S.B(loc)); lo.rotation_euler = (Vector(S.B(tgt)) - lo.location).to_track_quat('-Z', 'Y').to_euler()
light('windscreen', 'AREA', np.array([-.36, 1.42, -1.05]), np.array([-.36, .98, -.45]), 2.4, 1.0, (.62, .72, 1.0))      # smaller: the rim throws a readable shadow across the fingers
light('gauges', 'AREA', np.array([-.36, .9, -.66]), np.array([-.36, 1.0, -.4]), .6, .22, (1.0, .55, .25))         # warm glow on the lower edges of the hands
light('sidefill', 'AREA', np.array([-.9, 1.35, -.1]), np.array([-.36, .95, -.45]), .35, 1.0, (.5, .58, .75))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (.002, .003, .006, 1)
phone = os.environ.get('VIEW', 'desk') == 'phone'
cd = bpy.data.cameras.new('game'); cd.sensor_fit = 'VERTICAL'; cd.angle_y = math.radians(84 if phone else 64); cd.clip_start = .01
cam = A.link(bpy.data.objects.new('game', cd)); eye = Vector(S.B(S.EYE)); cam.location = eye
pitch = .05 if phone else .07; tgt = S.EYE + np.array([0, -math.tan(pitch), -1])
if os.environ.get('AIM'):                      # same eye, zoomed: AIM = car-space point, FOV = vertical degrees
    tgt = np.array([float(v) for v in os.environ['AIM'].split(',')]); cd.angle_y = math.radians(float(os.environ.get('FOV', '30')))
cam.rotation_euler = (Vector(S.B(tgt)) - eye).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(os.environ.get('SAMPLES', '64')); sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(os.environ.get('EXPO', '0'))
sc.render.resolution_x, sc.render.resolution_y = (390 * 2, 844 * 2) if phone else (1280, 720)
sc.render.resolution_percentage = 50 if phone else 100
sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
