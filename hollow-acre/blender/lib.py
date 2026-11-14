"""Shared helpers for building Hollow Acre assets in headless Blender."""
import bpy, bmesh, math, random, os, json, struct, base64
from mathutils import Vector, Matrix, Euler, noise
V = lambda *a: Vector(a)
scn = None

def reset(seed=1):
    global scn
    random.seed(seed)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scn = bpy.context.scene
    return scn

def activate(o, *more):
    for x in bpy.context.selected_objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o
    for m in more: m.select_set(True)

def obj_from_bm(bm, name):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); return o

def smooth(o, on=True):
    for p in o.data.polygons: p.use_smooth = on

def apply_mods(o):
    activate(o)
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

def join(objs, name):
    activate(objs[0], *objs[1:]); bpy.ops.object.join(); objs[0].name = name; return objs[0]

# ---------------------------------------------------------------- geometry helpers
def cone(bm, base, tip, r, seg=7, r2=None):
    d = tip - base; L = d.length; q = d.normalized().to_track_quat('Z', 'Y')
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=(r * .08 if r2 is None else r2), depth=L)
    for v in res['verts']: v.co = q @ v.co + base + d * .5

def tube(bm, pts, r0, r1, seg=8, cap=False):
    rings = []
    for i, p in enumerate(pts):
        t = i / (len(pts) - 1); r = r0 + (r1 - r0) * t
        d = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized(); q = d.to_track_quat('Z', 'Y')
        rings.append([bm.verts.new(p + q @ V(math.cos(a) * r, math.sin(a) * r, 0)) for a in [k / seg * math.tau for k in range(seg)]])
    for a, b in zip(rings, rings[1:]):
        for k in range(seg): bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
    if cap:
        bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    return rings

def box(bm, c, size, rot=(0, 0, 0)):
    res = bmesh.ops.create_cube(bm, size=1)
    m = Matrix.Translation(c) @ Euler(rot).to_matrix().to_4x4() @ Matrix.Diagonal((size[0], size[1], size[2], 1))
    for v in res['verts']: v.co = m @ v.co
    return res['verts']

def cyl(bm, c, r, h, seg=16, rot=(0, 0, 0), r2=None):
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=(r if r2 is None else r2), depth=h)
    m = Matrix.Translation(c) @ Euler(rot).to_matrix().to_4x4()
    for v in res['verts']: v.co = m @ v.co
    return res['verts']

def sphere(bm, c, r, seg=16, rings=10, scale=(1, 1, 1)):
    res = bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1)
    for v in res['verts']: v.co = V(v.co.x * r * scale[0], v.co.y * r * scale[1], v.co.z * r * scale[2]) + c
    return res['verts']

def bevel_obj(o, w=.02, seg=2):
    m = o.modifiers.new('bev', 'BEVEL'); m.width = w; m.segments = seg; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(40)

# ---------------------------------------------------------------- procedural materials
def mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; return m, m.node_tree, m.node_tree.nodes, m.node_tree.links

def P(nt): return nt.nodes['Principled BSDF']

def node(N, t, **kw):
    n = N.new(t)
    for k, v in kw.items():
        k2 = k.replace('_', ' ')
        if k2 in n.inputs: n.inputs[k2].default_value = v
        elif k in n.inputs: n.inputs[k].default_value = v
        else: setattr(n, k, v)
    return n

def ramp(N, L, src, stops):
    r = N.new('ShaderNodeValToRGB'); L.new(src, r.inputs[0]); cr = r.color_ramp
    cr.elements[0].position, cr.elements[0].color = stops[0][0], (*stops[0][1], 1)
    cr.elements[1].position, cr.elements[1].color = stops[-1][0], (*stops[-1][1], 1)
    for p, c in stops[1:-1]:
        e = cr.elements.new(p); e.color = (*c, 1)
    return r

def mix(N, L, a, b, mode='MULTIPLY', fac=1.):
    m = N.new('ShaderNodeMix'); m.data_type = 'RGBA'; m.blend_type = mode; m.inputs[0].default_value = fac
    L.new(a, m.inputs[6]); L.new(b, m.inputs[7]); return m.outputs[2]

def bump(N, L, h, s, d=.003):
    b = N.new('ShaderNodeBump'); b.inputs['Strength'].default_value = s; b.inputs['Distance'].default_value = d; L.new(h, b.inputs['Height']); return b.outputs[0]

def objco(N):
    return N.new('ShaderNodeTexCoord').outputs['Object']

def M_noise(name, c0, c1, c2=None, scale=6, rough=.8, bumps=.25, detail=8, extra=None):
    """Mottled base: noise ramp between colours, bump from noise."""
    m, nt, N, L = mat(name); p = P(nt); co = objco(N)
    n = node(N, 'ShaderNodeTexNoise', Scale=float(scale), Detail=float(detail)); L.new(co, n.inputs['Vector'])
    stops = [(0, c0), (1, c1)] if c2 is None else [(0, c0), (.5, c1), (1, c2)]
    r = ramp(N, L, n.outputs['Fac'], stops); col = r.outputs[0]
    if extra: col = extra(N, L, co, col)
    L.new(col, p.inputs['Base Color']); p.inputs['Roughness'].default_value = rough
    if bumps: L.new(bump(N, L, n.outputs['Fac'], bumps), p.inputs['Normal'])
    return m

def M_wood(name, c0, c1, scale=3, rough=.75, planks=0):
    m, nt, N, L = mat(name); p = P(nt); co = objco(N)
    w = node(N, 'ShaderNodeTexWave', Scale=float(scale), Distortion=6., Detail=4.); w.bands_direction = 'Z'; L.new(co, w.inputs['Vector'])
    n = node(N, 'ShaderNodeTexNoise', Scale=40., Detail=6.); L.new(co, n.inputs['Vector'])
    r = ramp(N, L, w.outputs['Fac'], [(0, c0), (1, c1)])
    rn = ramp(N, L, n.outputs['Fac'], [(0, (.6, .6, .6)), (1, (1, 1, 1))])
    col = mix(N, L, r.outputs[0], rn.outputs[0])
    if planks:
        pw = node(N, 'ShaderNodeTexWave', Scale=float(planks), Distortion=0.); pw.bands_direction = 'X'; pw.wave_profile = 'SAW'; L.new(co, pw.inputs['Vector'])
        rp = ramp(N, L, pw.outputs['Fac'], [(0, (.25, .25, .25)), (.06, (1, 1, 1)), (1, (1, 1, 1))]); col = mix(N, L, col, rp.outputs[0])
        L.new(bump(N, L, rp.outputs[0], .6), p.inputs['Normal'])
    else: L.new(bump(N, L, w.outputs['Fac'], .25), p.inputs['Normal'])
    L.new(col, p.inputs['Base Color']); p.inputs['Roughness'].default_value = rough; return m

def M_brick(name, c0, c1, mortar=(.2, .19, .17), scale=6):
    m, nt, N, L = mat(name); p = P(nt); co = objco(N)
    b = node(N, 'ShaderNodeTexBrick', Scale=float(scale)); L.new(co, b.inputs['Vector'])
    b.inputs['Color1'].default_value = (*c0, 1); b.inputs['Color2'].default_value = (*c1, 1); b.inputs['Mortar'].default_value = (*mortar, 1)
    n = node(N, 'ShaderNodeTexNoise', Scale=30.); L.new(co, n.inputs['Vector'])
    rn = ramp(N, L, n.outputs['Fac'], [(0, (.7, .7, .7)), (1, (1, 1, 1))])
    L.new(mix(N, L, b.outputs['Color'], rn.outputs[0]), p.inputs['Base Color']); p.inputs['Roughness'].default_value = .9
    L.new(bump(N, L, b.outputs['Fac'], .5), p.inputs['Normal']); return m

def M_siding(name, col, scale=9.):
    m, nt, N, L = mat(name); p = P(nt); co = objco(N)
    w = node(N, 'ShaderNodeTexWave', Scale=float(scale), Distortion=0.); w.bands_direction = 'Z'; w.wave_profile = 'SAW'; L.new(co, w.inputs['Vector'])
    rp = ramp(N, L, w.outputs['Fac'], [(0, (.45, .45, .45)), (.08, (.85, .85, .85)), (1, (1, 1, 1))])
    n = node(N, 'ShaderNodeTexNoise', Scale=8., Detail=8.); L.new(co, n.inputs['Vector'])
    rn = ramp(N, L, n.outputs['Fac'], [(0, (.55, .52, .48)), (.6, (1, 1, 1)), (1, (1, 1, 1))])
    base = node(N, 'ShaderNodeRGB'); base.outputs[0].default_value = (*col, 1)
    L.new(mix(N, L, mix(N, L, base.outputs[0], rp.outputs[0]), rn.outputs[0]), p.inputs['Base Color']); p.inputs['Roughness'].default_value = .8
    L.new(bump(N, L, w.outputs['Fac'], .5), p.inputs['Normal']); return m

def M_shingle(name, c0, c1):
    m, nt, N, L = mat(name); p = P(nt); co = objco(N)
    b = node(N, 'ShaderNodeTexBrick', Scale=7., Mortar_Size=.01); L.new(co, b.inputs['Vector'])
    b.inputs['Color1'].default_value = (*c0, 1); b.inputs['Color2'].default_value = (*c1, 1); b.inputs['Mortar'].default_value = (.02, .02, .02, 1)
    n = node(N, 'ShaderNodeTexNoise', Scale=5., Detail=8.); L.new(co, n.inputs['Vector'])
    moss = ramp(N, L, n.outputs['Fac'], [(0, (1, 1, 1)), (.62, (1, 1, 1)), (.75, (.35, .5, .25)), (1, (.3, .45, .2))])
    L.new(mix(N, L, b.outputs['Color'], moss.outputs[0]), p.inputs['Base Color']); p.inputs['Roughness'].default_value = .95
    L.new(bump(N, L, b.outputs['Fac'], .6), p.inputs['Normal']); return m

def M_flat(name, col, rough=.6, metal=0., emis=None, es=0.):
    m, nt, N, L = mat(name); p = P(nt); p.inputs['Base Color'].default_value = (*col, 1); p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal
    if emis: p.inputs['Emission Color'].default_value = (*emis, 1); p.inputs['Emission Strength'].default_value = es
    m['flat'] = 1; return m

def M_cloth(name, col, scale=80., var=.35):
    m, nt, N, L = mat(name); p = P(nt); co = objco(N)
    wx = node(N, 'ShaderNodeTexWave', Scale=scale); wx.bands_direction = 'X'; wy = node(N, 'ShaderNodeTexWave', Scale=scale); wy.bands_direction = 'Z'
    L.new(co, wx.inputs['Vector']); L.new(co, wy.inputs['Vector'])
    mx = N.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'; L.new(wx.outputs['Fac'], mx.inputs[0]); L.new(wy.outputs['Fac'], mx.inputs[1])
    n = node(N, 'ShaderNodeTexNoise', Scale=4., Detail=6.); L.new(co, n.inputs['Vector'])
    base = node(N, 'ShaderNodeRGB'); base.outputs[0].default_value = (*col, 1)
    rn = ramp(N, L, n.outputs['Fac'], [(0, (1 - var, 1 - var, 1 - var)), (1, (1, 1, 1))]); rw = ramp(N, L, mx.outputs[0], [(0, (.8, .8, .8)), (1, (1, 1, 1))])
    L.new(mix(N, L, mix(N, L, base.outputs[0], rn.outputs[0]), rw.outputs[0]), p.inputs['Base Color']); p.inputs['Roughness'].default_value = .95
    L.new(bump(N, L, mx.outputs[0], .2, .001), p.inputs['Normal']); return m

def M_metal(name, col, rust=.4):
    def ex(N, L, co, c):
        n = node(N, 'ShaderNodeTexNoise', Scale=12., Detail=10.); L.new(co, n.inputs['Vector'])
        r = ramp(N, L, n.outputs['Fac'], [(0, (1, 1, 1)), (1 - rust * .5, (1, 1, 1)), (1., (.35, .15, .06))]); return mix(N, L, c, r.outputs[0])
    m = M_noise(name, tuple(x * .8 for x in col), col, scale=3, rough=.45, bumps=.1, extra=ex)
    P(m.node_tree).inputs['Metallic'].default_value = .6; return m

# ---------------------------------------------------------------- baking
def uv_unwrap(o, margin=.004, angle=66):
    activate(o); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(angle), island_margin=margin); bpy.ops.object.mode_set(mode='OBJECT')

def bake_atlas(o, name, res=1024, keep_flat=True, rough=.8):
    """Bake every procedural material on `o` into one albedo + normal atlas and swap to a single textured material.
    Materials tagged flat (simple colours) are kept as they are."""
    uv_unwrap(o)
    alb = bpy.data.images.new(name + '_albedo', res, res); nrm = bpy.data.images.new(name + '_normal', res, res); nrm.colorspace_settings.name = 'Non-Color'
    bakeset = [s.material for s in o.material_slots if s.material and not (keep_flat and s.material.get('flat'))]
    bakeset = list(dict.fromkeys(bakeset))
    if not bakeset: return
    BN = {}
    for m in bakeset:
        nt = m.node_tree
        for old in [x for x in nt.nodes if x.name.startswith('BAKE')]: nt.nodes.remove(old)
        n = nt.nodes.new('ShaderNodeTexImage'); n.name = 'BAKE'; nt.nodes.active = n; BN[m] = n
    s = bpy.context.scene; s.render.engine = 'CYCLES'; s.cycles.device = 'CPU'; s.cycles.samples = 2; s.render.bake.margin = 4
    activate(o)
    for img, typ in ((alb, 'DIFFUSE'), (nrm, 'NORMAL')):
        for m in bakeset: BN[m].image = img
        if typ == 'DIFFUSE': bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, use_clear=True)
        else: bpy.ops.object.bake(type='NORMAL', use_clear=True)
    for img in (alb, nrm): img.pack()
    f = bpy.data.materials.new(name); f.use_nodes = True; nt = f.node_tree; p = nt.nodes['Principled BSDF']
    ta = nt.nodes.new('ShaderNodeTexImage'); ta.image = alb; nt.links.new(ta.outputs['Color'], p.inputs['Base Color'])
    tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = nrm; nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(tn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], p.inputs['Normal'])
    p.inputs['Roughness'].default_value = rough
    for sl in o.material_slots:
        if sl.material in bakeset: sl.material = f
    # merge duplicate slots
    return f

# ---------------------------------------------------------------- skinning
def seg_dist(p, a, b):
    ab = b - a; t = max(0, min(1, (p - a).dot(ab) / ab.length_squared)); return (p - (a + ab * t)).length

def auto_weights(o, rig, allowed=None, power=4, k=3):
    segs = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}
    names = allowed or list(segs)
    for n in segs:
        if n not in o.vertex_groups: o.vertex_groups.new(name=n)
    for v in o.data.vertices:
        p = o.matrix_world @ v.co
        ds = sorted((seg_dist(p, *segs[n]), n) for n in names)[:k]
        ws = [1 / (d + .004) ** power for d, _ in ds]; s = sum(ws)
        for (d, n), w in zip(ds, ws):
            if w / s > .02: o.vertex_groups[n].add([v.index], w / s, 'REPLACE')

def rigid_weight(o, bone):
    g = o.vertex_groups.get(bone) or o.vertex_groups.new(name=bone); g.add(list(range(len(o.data.vertices))), 1, 'REPLACE')

def make_rig(name, bones):
    """bones: list of (name, head, tail, parent, roll_vector)"""
    ad = bpy.data.armatures.new(name); rig = bpy.data.objects.new(name, ad); bpy.context.scene.collection.objects.link(rig)
    activate(rig); bpy.ops.object.mode_set(mode='EDIT')
    for nm, h, t, p, roll in bones:
        b = ad.edit_bones.new(nm); b.head = h; b.tail = t; b.align_roll(roll)
        if p: b.parent = ad.edit_bones[p]
    bpy.ops.object.mode_set(mode='OBJECT'); return rig

def bind(o, rig):
    o.parent = rig; m = o.modifiers.new('rig', 'ARMATURE'); m.object = rig

def clips(rig, defs, fps=30):
    """defs: list of (name, duration, fn(t, ph, R, PB)). R(bone, x, y, z) adds euler rotation."""
    activate(rig); bpy.ops.object.mode_set(mode='POSE')
    for pb in rig.pose.bones: pb.rotation_mode = 'XYZ'
    PB = rig.pose.bones
    def R(n, x=0, y=0, z=0):
        e = PB[n].rotation_euler; PB[n].rotation_euler = (e[0] + x, e[1] + y, e[2] + z)
    rig.animation_data_create()
    for name, dur, fn in defs:
        act = bpy.data.actions.new(name); act.use_fake_user = True; rig.animation_data.action = act
        n = max(2, int(dur * fps))
        for f in range(0, n + 1, 2):
            t = f / fps; ph = t / dur * math.tau
            for pb in PB: pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
            fn(t, ph, R, PB)
            for pb in PB:
                pb.keyframe_insert('rotation_euler', frame=f + 1)
                if pb.parent is None: pb.keyframe_insert('location', frame=f + 1)
    rig.animation_data.action = bpy.data.actions[defs[0][0]]
    bpy.ops.object.mode_set(mode='OBJECT')

# ---------------------------------------------------------------- export
def export(objs, path, anims=False):
    activate(objs[0], *objs[1:])
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_image_format='JPEG', export_jpeg_quality=84,
                              export_animations=anims, export_animation_mode='ACTIONS', export_skins=True, export_yup=True, export_apply=not anims,
                              export_force_sampling=True)
    to_json(path, path.replace('.glb', '.json'))
    print('EXPORTED', path, os.path.getsize(path))

def to_json(src, dst):
    d = open(src, 'rb').read(); o = 12; js = None; bn = b''
    while o < len(d):
        L, T = struct.unpack('<I4s', d[o:o + 8]); c = d[o + 8:o + 8 + L]; o += 8 + L
        if T == b'JSON': js = json.loads(c)
        elif T == b'BIN\x00': bn = c
    js['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(bn).decode()
    open(dst, 'w').write(json.dumps(js, separators=(',', ':')))

def preview(path, objs_focus, shots, res=(640, 640), samples=16):
    s = bpy.context.scene; s.render.engine = 'CYCLES'; s.cycles.samples = samples; s.render.resolution_x, s.render.resolution_y = res
    w = bpy.data.worlds.new('w'); s.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.05, .055, .06, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .6
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); s.collection.objects.link(cam); s.camera = cam
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3.5; sun.rotation_euler = (math.radians(50), 0, math.radians(35)); s.collection.objects.link(sun)
    for i, (cp, tgt) in enumerate(shots):
        cam.location = cp; cam.rotation_euler = (V(*tgt) - V(*cp)).to_track_quat('-Z', 'Y').to_euler()
        s.render.filepath = f'{path}_{i}.png'; bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam); bpy.data.objects.remove(sun)
