"""The Hollow, built and animated in Blender (the Dead Cells method), drawn from scratch: a gaunt figure with a carved
pumpkin head, a tattered coat, long stick limbs and bone hands. Each frame is posed from a small rigid skeleton,
rendered orthographically (a near face-on camera, as people are drawn in this game) with toon shading in our own
palette, plus a normal map per frame for the game's lighting.

    python3 hollow3d.py out_dir [clips...]      (clips: walk idle crawl scream lunge hurt; default walk idle)

Writes <out_dir>/<clip>_<dir>_<i>.png and <clip>_<dir>_<i>_n.png (normals), 96x176 each, feet at y=171.
"""
import sys, os, math
import bpy, bmesh
from mathutils import Vector, Matrix

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hollow3d'
CLIPS = sys.argv[2:] or ['walk', 'idle']
os.makedirs(OUT, exist_ok=True)
FW, FH, FOOT = 96, 176, 171
ELEV = 18                      # degrees: people and creatures are drawn nearly face-on
UNIT = 31.0                    # pixels per Blender unit
LIGHT = Vector((-.75, -.35, .55)).normalized()   # from the upper left and a little toward the viewer (-y is toward the camera)

# ---------------------------------------------------------------- palette (dark -> light; hue-shifted, our own)
PAL = {
    'pumpkin': ['#3a1410', '#7a2e12', '#b85418', '#e0822a', '#f4aa4a'],
    'stem':    ['#141a10', '#24301a', '#3a4a24', '#526a30', '#6e8a3c'],
    'coat':    ['#0e0a14', '#1a1326', '#2a2038', '#3c2e4c', '#504062'],
    'patch':   ['#140c0c', '#22161a', '#322228', '#423038', '#544048'],
    'thread':  ['#3a3430', '#544c44', '#6e665a', '#888070', '#a29a88'],
    'void':    ['#060408', '#0a070e', '#0e0a14', '#120c1a', '#160f20'],
    'button':  ['#2a0608', '#4e0c10', '#7a161a', '#a02424', '#c43a32'],
    'belt':    ['#0e0a08', '#1e1610', '#30241a', '#463424', '#5e4632'],
    'stick':   ['#0e0a0c', '#1c1418', '#2c2024', '#3e3032', '#544244'],
    'bone':    ['#2e2c2e', '#4c4a4e', '#6e6c70', '#8e8c8c', '#b0aca4'],
    'flesh':   ['#8a3a10', '#c8661c', '#e8923a', '#f6bc62', '#fde09a'],
    'glow':    ['#8a3410', '#d06a1c', '#f0a040', '#f8d27a', '#fcecb0'],
}
MOTTLE = {'coat': .16, 'patch': .12, 'pumpkin': .06, 'belt': .08}   # cloth and skin are never one flat colour


def hexrgb(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))


def srgb_to_lin(c): return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4


def _ramp(nt, ramp, stops):
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.interpolation = 'CONSTANT'; els = cr.color_ramp.elements
    while len(els) < len(ramp): els.new(.5)
    for e, pos, col in zip(els, stops, ramp):
        e.position = pos; r, g, b = hexrgb(col); e.color = (srgb_to_lin(r), srgb_to_lin(g), srgb_to_lin(b), 1)
    return cr


def _math(nt, op, a, b=None, c=None):
    m = nt.nodes.new('ShaderNodeMath'); m.operation = op
    for i, v in enumerate((a, b, c)):
        if v is None: continue
        if isinstance(v, (int, float)): m.inputs[i].default_value = v
        else: nt.links.new(v, m.inputs[i])
    return m.outputs[0]


def toon_material(name, ramp):
    """emission colour = a constant colour ramp, so every pixel is an exact palette colour.
    lit things:   value = (0.5 + 0.5 N.L) * (0.6 + 0.4 AO) + mottle
    flesh:        the carved walls, lit by the candle (brighter where they face up toward the flame's glow)
    glow:         the candle seen through the holes, brightest in the middle"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    if name == 'glow':
        cr = _ramp(nt, ramp, [0, .2, .4, .6, .8])
        lw = nt.nodes.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = .5
        v = _math(nt, 'MULTIPLY_ADD', lw.outputs['Facing'], -.45, 1.0)
    elif name == 'flesh':
        cr = _ramp(nt, ramp, [0, .25, .45, .65, .85])
        sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(geo.outputs['Normal'], sep.inputs[0])
        v = _math(nt, 'MULTIPLY_ADD', sep.outputs['Z'], -.35, .62)
    else:
        cr = _ramp(nt, ramp, [0, .26, .46, .64, .82])
        dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'; dot.inputs[1].default_value = LIGHT
        nt.links.new(geo.outputs['Normal'], dot.inputs[0])
        ao = nt.nodes.new('ShaderNodeAmbientOcclusion'); ao.inputs['Distance'].default_value = .3; ao.samples = 8
        a = _math(nt, 'MULTIPLY_ADD', dot.outputs['Value'], .5, .5)
        b = _math(nt, 'MULTIPLY_ADD', ao.outputs['AO'], .4, .6)
        v = _math(nt, 'MULTIPLY', a, b)
        if name in MOTTLE:
            tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise')
            nz.inputs['Scale'].default_value = 3.2; nz.inputs['Detail'].default_value = 1.0
            nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
            v = _math(nt, 'ADD', v, _math(nt, 'MULTIPLY_ADD', nz.outputs['Fac'], MOTTLE[name] * 2, -MOTTLE[name]))
    nt.links.new(v, cr.inputs['Fac'])
    nt.links.new(cr.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs[0], out.inputs['Surface'])
    return m


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene; s.render.engine = 'CYCLES'; s.cycles.samples = 32; s.cycles.device = 'CPU'
    s.render.resolution_x, s.render.resolution_y = FW, FH; s.render.resolution_percentage = 100
    s.render.film_transparent = True; s.cycles.filter_width = .01; s.view_settings.view_transform = 'Standard'
    s.cycles.use_denoising = False
    return s


def segment(name, a, b, r0, r1, mat, verts=10):
    """a tapered rod from point a to point b"""
    a, b = Vector(a), Vector(b); d = b - a; L = max(d.length, 1e-4)
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r0, radius2=r1, depth=L, location=(a + b) / 2)
    o = bpy.context.active_object; o.name = name
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); o.data.materials.append(mat)
    bpy.ops.object.shade_smooth(); return o


def ball(name, c, r, mat, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=r, location=c)
    o = bpy.context.active_object; o.name = name; o.scale = scale; o.data.materials.append(mat); bpy.ops.object.shade_smooth(); return o


def prism(name, pts, y0, y1, mat):
    """a flat outline (x, z points) pushed along y from y0 to y1: the cutters for the carved face"""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    front = [bm.verts.new((x, y0, z)) for x, z in pts]; back = [bm.verts.new((x, y1, z)) for x, z in pts]
    bm.faces.new(front); bm.faces.new(list(reversed(back)))
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n; bm.faces.new((front[i], back[i], back[j], front[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); bmesh.ops.triangulate(bm, faces=bm.faces[:])
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat); return o


def pumpkin(r, mats, mouth_open=0.0):
    """a ribbed pumpkin shell, really carved: the eyes and the grin are cut through it with a candle burning inside.
    Built round its own centre (0,0,0); the caller moves it."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, radius=r, location=(0, 0, 0))
    o = bpy.context.active_object; o.name = 'head'
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:   # eight ribs, squashed a little, a dimple at the top
        ang = math.atan2(v.co.y, v.co.x); k = 1 + .1 * math.cos(8 * ang) ** 3
        v.co.x *= k * 1.1; v.co.y *= k * 1.1; v.co.z *= .9
        if v.co.z > r * .8: v.co.z -= (v.co.z - r * .8) * .7
    bm.to_mesh(o.data); bm.free(); o.data.materials.append(mats['pumpkin']); o.data.materials.append(mats['flesh'])
    bpy.ops.object.shade_smooth()
    sol = o.modifiers.new('shell', 'SOLIDIFY'); sol.thickness = r * .1; sol.offset = -1
    # the cutters: two slanted eyes and a wide grin with teeth
    Y0, Y1 = -r * 1.6, -r * .2
    cuts = []
    for sx in (-1, 1):
        cx = sx * r * .44
        eye = [(cx - sx * r * .34, -r * .02), (cx + sx * r * .3, r * .1), (cx + sx * r * .04, r * .62)]
        if sx > 0: eye = list(reversed(eye))
        cuts.append(prism('eye', eye, Y0, Y1, mats['flesh']))
    w = r * .86; top = -r * .2; bot = -r * (.64 + mouth_open * .25)
    mouth = [(-w, top + r * .12), (-w * .62, top - r * .02), (-w * .45, top), (-w * .45, top - r * .1), (-w * .2, top - r * .1), (-w * .2, top + r * .02),
             (w * .2, top + r * .02), (w * .2, top - r * .1), (w * .45, top - r * .1), (w * .45, top), (w * .62, top - r * .02), (w, top + r * .12),
             (w * .7, bot + r * .12), (w * .32, bot), (w * .32, bot + r * .1), (w * .05, bot + r * .1), (w * .05, bot), (-w * .32, bot), (-w * .32, bot + r * .1),
             (-w * .55, bot + r * .1), (-w * .55, bot + r * .03), (-w * .78, bot + r * .16)]
    cuts.append(prism('mouth', list(reversed(mouth)), Y0, Y1, mats['flesh']))
    for c in cuts:
        bo = o.modifiers.new('carve', 'BOOLEAN'); bo.operation = 'DIFFERENCE'; bo.object = c; bo.solver = 'EXACT'
        try: bo.material_mode = 'TRANSFER'
        except Exception: pass
        c.hide_render = True
    candle = ball('candle', (0, 0, -r * .1), r * .82, mats['glow'], (1.05, 1.05, .9))
    stem = segment('stem', (0, 0, r * .62), (.06, .03, r * 1.12), .08, .05, mats['stem'], 6)
    return [o, candle, stem] + cuts


def coat(top, bot, r_top, r_bot, mats, sway=0.0, seed=1):
    """an A-line coat: narrow sloping shoulders flaring to a torn hem; open down the front; a patched, belted, buttoned
    old thing"""
    import random; R = random.Random(seed)
    bpy.ops.mesh.primitive_cone_add(vertices=28, radius1=r_bot, radius2=r_top, depth=top - bot, location=(0, 0, (top + bot) / 2), end_fill_type='NOTHING')
    o = bpy.context.active_object; o.name = 'coat'; H = top - bot
    bm = bmesh.new(); bm.from_mesh(o.data)
    step = 2 * math.pi / 28
    for v in bm.verts:   # turn half a step so one column of faces is centred on the front
        a0 = math.atan2(v.co.y, v.co.x) + step / 2; rr = math.hypot(v.co.x, v.co.y); v.co.x, v.co.y = rr * math.cos(a0), rr * math.sin(a0)
    for v in bm.verts:
        ang = math.atan2(v.co.y, v.co.x); down = .5 - v.co.z / H      # 0 at the collar, 1 at the hem
        fold = 1 + .09 * math.sin(ang * 7 + 1.3) * down
        v.co.x *= fold; v.co.y *= fold * .74
        if v.co.z < 0:   # the hem: torn into points, swinging with the stride
            v.co.z += R.uniform(-.24, .08); v.co.x += sway * .3 * down
    for f in bm.faces:
        c = f.calc_center_median()
        if abs(math.atan2(c.y, c.x) + math.pi / 2) < step * .6 and abs(c.x) < .2: f.material_index = 1
    bm.to_mesh(o.data); bm.free(); o.data.materials.append(mats['coat']); o.data.materials.append(mats['void'])
    sol = o.modifiers.new('cloth', 'SOLIDIFY'); sol.thickness = .03
    bpy.ops.object.shade_smooth()
    parts = [o]
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=1, location=(0, 0, top - .04))
    y = bpy.context.active_object; y.scale = (r_top * 1.15, r_top * .8, .16); y.data.materials.append(mats['coat']); bpy.ops.object.shade_smooth(); parts.append(y)

    def front(z, x=0.0):   # the point on the coat's front at height z (world), a hair proud of the cloth
        f = (top - z) / H; rr = r_top + (r_bot - r_top) * f
        return Vector((x, -.74 * math.sqrt(max(rr * rr - x * x, 0)) * 1.06 - .03, z))
    for k in range(4):   # buttons beside the opening, one missing
        if k == 2: continue
        parts.append(ball('button', front(top - .3 - k * .34, .12) + Vector((0, -.01, 0)), .045, mats['button']))
    zb = top - 1.25   # a rope belt, knotted
    bpy.ops.mesh.primitive_torus_add(major_radius=1, minor_radius=.05, location=(0, 0, zb))
    rb = r_top + (r_bot - r_top) * (top - zb) / H
    b = bpy.context.active_object; b.scale = (rb + .03, (rb + .03) * .76, 1); b.data.materials.append(mats['belt']); parts.append(b)
    kn = front(zb, -.18); parts += [ball('knot', kn, .07, mats['belt']), segment('rope', kn, kn + Vector((-.06, -.02, -.34)), .035, .025, mats['belt'], 5),
                                   segment('rope', kn, kn + Vector((.04, -.03, -.28)), .035, .025, mats['belt'], 5)]
    # a sewn-on patch low on the left, with big crude stitches
    pz, px_ = bot + .62, -.24; pc = front(pz, px_); nrm = Vector((px_ / max(r_bot, .1), -1, 0)).normalized()
    bpy.ops.mesh.primitive_cube_add(size=1, location=pc + nrm * .005)
    pt = bpy.context.active_object; pt.scale = (.3, .02, .3); pt.rotation_euler = (0, math.radians(8), math.atan2(nrm.x, -nrm.y))
    pt.data.materials.append(mats['patch']); parts.append(pt)
    side = Vector((-nrm.y, nrm.x, 0)).normalized()
    for i in range(3):
        c0 = pc + nrm * .03 + side * (-.15) + Vector((0, 0, -.1 + i * .1))
        parts.append(segment('stitch', c0 - side * .05, c0 + side * .05, .018, .018, mats['thread'], 4))
    for sx in (-1, 1):   # a torn high collar
        parts.append(segment('collar', (sx * .16, .02, top - .06), (sx * .28, .06, top + .3), .1, .012, mats['coat'], 4))
        parts.append(segment('collar', (sx * .05, -.1, top - .04), (sx * .1, -.12, top + .2), .07, .01, mats['coat'], 4))
    return parts


def hand(wrist, direction, mats, spread=1.0):
    """long bony fingers fanned from the wrist, bent at the knuckle"""
    d = Vector(direction).normalized(); parts = [ball('palm', wrist + d * .06, .09, mats['bone'], (1, .75, 1.2))]
    side = d.cross(Vector((0, 1, 0))).normalized() if abs(d.y) < .9 else Vector((1, 0, 0))
    curl = Vector((0, -1, 0))
    for k in range(4):
        off = (k - 1.5) * .05 * spread; base = Vector(wrist) + d * .1 + side * off
        kn = base + d * .2 + side * off * 1.2; tip = kn + (d * .8 + curl * .35).normalized() * .2
        parts += [segment('finger', base, kn, .03, .024, mats['bone'], 5), ball('knuckle', kn, .03, mats['bone']),
                  segment('finger', kn, tip, .024, .012, mats['bone'], 5)]
    return parts


HIP = 2.15


def _walk_legs(t, P, lift):
    for side, ph in (('L', 0), ('R', math.pi)):
        sw = math.sin(t * 2 * math.pi + ph); up = max(0, math.cos(t * 2 * math.pi + ph))   # the leg swinging forward lifts
        x = -.16 if side == 'L' else .16
        P['leg' + side] = [(x, 0, HIP + lift), (x, -sw * .3 - up * .12, HIP * .52 + up * .2), (x, -sw * .5, .02 + up * .3)]


def _stand_legs(P, front=0.0, back=0.0):
    for side, dy in (('L', front), ('R', back)):
        x = -.16 if side == 'L' else .16
        P['leg' + side] = [(x, 0, HIP), (x, dy * .5 - .03, HIP * .52), (x, dy, .02)]


def pose(t, clip):
    """the skeleton for the clip at phase t (0..1). The figure faces -y (toward the camera).
    Arms are [shoulder (in the torso's own space), elbow, wrist (in the world)]; the torso pitches about the hips
    ('pitch', + leans forward) and drops ('drop'); 'shift' slides the whole figure back so a reach stays in the frame."""
    P = {'pitch': 0, 'drop': 0, 'head_pitch': 0, 'head_tilt': 0, 'mouth': 0, 'sway': 0, 'bob': 0, 'shift': 0, 'sleeves': True,
         'coat': None, 'neck': 1.0, 'jit': 0}
    s = math.sin(t * 2 * math.pi); c = math.cos(t * 2 * math.pi)
    SH = lambda x, b=0: (x * 2.3, 0, 3.36 + b)
    if clip == 'walk':
        lift = abs(c) * .06; _walk_legs(t, P, lift)
        for side, ph in (('L', 0), ('R', math.pi)):
            x = -.16 if side == 'L' else .16; asw = -math.sin(t * 2 * math.pi + ph) * .5
            P['arm' + side] = [SH(x, lift), (x * 3.5, asw * .4 - .04, 2.48 + lift), (x * 4.3, asw, 1.56 + lift)]
        P.update(sway=s * .14, head_tilt=s * 5 - 3, bob=lift)
    elif clip == 'idle':
        br = s * .03; _stand_legs(P)
        for side in ('L', 'R'):
            x = -.16 if side == 'L' else .16
            P['arm' + side] = [SH(x, br), (x * 3.6, .02, 2.48 + br), (x * 4.4, -.04, 1.54 + br * 2)]
        P.update(sway=br, head_tilt=s * 6 - 7, bob=br)
    elif clip == 'crawl':   # on all fours like a spider: low body, knees and elbows high above it, head forward
        P.update(pitch=80, drop=1.15, head_pitch=-78, head_tilt=s * 8, coat=(HIP + 1.0, HIP - .35, .28, .45), neck=.35, sleeves=False, shift=.3)
        for side, ph in (('L', 0), ('R', math.pi)):
            x = -1 if side == 'L' else 1
            sw = math.sin(t * 2 * math.pi + ph); up = max(0, math.cos(t * 2 * math.pi + ph))
            P['leg' + side] = [(x * .16, 0, HIP - 1.15), (x * .58, .45 + sw * .08, 2.3 + up * .18), (x * .62, .85 - sw * .3, .02 + up * .16)]
            swa, upa = -sw, max(0, -math.cos(t * 2 * math.pi + ph))   # each arm moves with the opposite leg
            P['arm' + side] = [(x * .33, 0, HIP + .95), (x * .78, -1.0 + swa * .1, 2.25 + upa * .18), (x * .72, -1.35 - swa * .28, .05 + upa * .2)]
        P['bob'] = abs(c) * .04
    elif clip == 'scream':   # arms flung up and out, the head thrown back, the mouth tearing open
        k = min(1.0, t * 6 / 1.6); e = k * k * (3 - 2 * k); tr = math.sin(t * 2 * math.pi * 7) * .03 * (k >= 1)
        _stand_legs(P)
        for side in ('L', 'R'):
            x = -1 if side == 'L' else 1
            P['arm' + side] = [SH(x * .16), (x * (.56 + .24 * e) + tr, .0, 2.48 + 1.5 * e), (x * (.7 + .32 * e) - tr, -.04 + .04 * e, 1.54 + 3.0 * e + tr)]
        P.update(pitch=-9 * e, head_pitch=-16 * e, mouth=e, head_tilt=tr * 60, jit=tr)
    elif clip == 'lunge':   # it reaches for you
        k = [0.0, .7, 1.0, .45][int(round(t * 4)) % 4]; back = [1, 0, 0, 0][int(round(t * 4)) % 4]
        _stand_legs(P, front=-.45 * k, back=.35 * k)
        for side in ('L', 'R'):
            x = -1 if side == 'L' else 1; reach = k * (1.0 if side == 'L' else .85)
            el = (x * (.56 - .08 * reach), -.1 - .5 * reach + .25 * back, 2.48 + .75 * reach + .2 * back)
            wr = (x * (.68 - .22 * reach), -.04 - 1.2 * reach + .4 * back, 1.54 + 1.85 * reach + .55 * back)
            P['arm' + side] = [SH(x * .16), el, wr]
        P.update(pitch=24 * k - 8 * back, head_pitch=-14 * k, mouth=.6 * k, shift=.45 * k, head_tilt=-6 * k)
    elif clip == 'hurt':   # it recoils from the light: arms over its face, leaning away, shaking
        tr = math.sin(t * 2 * math.pi * 2) * .05
        _stand_legs(P, front=.1, back=.25)
        for side in ('L', 'R'):
            x = -1 if side == 'L' else 1
            P['arm' + side] = [SH(x * .16), (x * .62 + tr, -.35, 3.5), (-x * .12 + tr, -.85, 4.35 + x * .08)]
        P.update(pitch=-14, head_pitch=10, head_tilt=22 + tr * 80, mouth=.5, jit=tr, shift=-.1)
    return P


def build(clip, t, yaw):
    s = reset()
    mats = {k: toon_material(k, v) for k, v in PAL.items()}
    P = pose(t, clip); objs = []
    hipv = Vector((0, 0, HIP))
    T = Matrix.Translation((0, 0, -P['drop'])) @ Matrix.Translation(hipv) @ Matrix.Rotation(math.radians(P['pitch']), 4, 'X') @ Matrix.Translation(-hipv)
    for side in ('L', 'R'):
        hp, kn, ft = P['leg' + side]
        objs += [segment('thigh', hp, kn, .06, .05, mats['stick'], 8), segment('shin', kn, ft, .05, .04, mats['stick'], 8), ball('knee', kn, .07, mats['stick']),
                 ball('foot', (ft[0], ft[1] - .06, ft[2] + .02), .07, mats['stick'], (1, 1.8, .6))]
        sh, el, wr = P['arm' + side]; sh, el, wr = T @ Vector(sh), Vector(el), Vector(wr)
        if P['sleeves']:   # the sleeve runs all the way down; only the hand shows
            cuff = wr - (wr - el).normalized() * .08
            objs += [segment('sleeve', sh, el, .11, .09, mats['coat'], 10), ball('elbow', el, .09, mats['coat']),
                     segment('sleeve', el, cuff, .09, .115, mats['coat'], 10), segment('wrist', cuff, wr, .04, .04, mats['stick'], 6)]
        else:              # torn away: bare stick arms
            objs += [segment('upper', sh, el, .07, .05, mats['stick'], 8), ball('elbow', el, .065, mats['stick']), segment('fore', el, wr, .05, .04, mats['stick'], 8),
                     segment('rag', sh, sh + (el - sh) * .3, .12, .08, mats['coat'], 8)]
        objs += hand(wr, wr - el, mats)
    top, bot, rt, rb = P['coat'] or (3.5, 1.35 + P['bob'], .3, .66)
    torso = coat(top, bot, rt, rb, mats, P['sway'])
    neck_base = Vector((0, 0, top - .05 + P['bob'])); neck_top = neck_base + Vector((0, 0, P['neck']))
    torso.append(segment('neck', neck_base, neck_top, .05, .04, mats['stick'], 8))
    r = .5; head = pumpkin(r, mats, P['mouth'])
    piv = bpy.data.objects.new('headpivot', None); bpy.context.scene.collection.objects.link(piv); piv.location = neck_top
    piv.rotation_euler = (math.radians(P['head_pitch']), math.radians(P['head_tilt']), 0)
    for o in head: o.parent = piv; o.location = o.location + Vector((0, 0, r * .85))
    torso.append(piv)
    for o in torso: o.matrix_basis = T @ o.matrix_basis   # the torso, neck and head lean and drop together
    objs += torso
    # everything turns to face its direction (and slides back by 'shift' along its own facing)
    root = bpy.data.objects.new('root', None); bpy.context.scene.collection.objects.link(root)
    for o in objs: o.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw)); root.location = Matrix.Rotation(math.radians(yaw), 3, 'Z') @ Vector((P['jit'], P['shift'], 0))
    cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'; cam_d.ortho_scale = FH / UNIT
    cam = bpy.data.objects.new('cam', cam_d); s.collection.objects.link(cam); s.camera = cam
    e = math.radians(ELEV)
    cam.rotation_euler = (math.pi / 2 - e, 0, 0)   # world (0,0,0) lands on the frame's feet line, y=FOOT
    look = Vector((0, 0, (FH / 2 - (FH - FOOT)) / UNIT / math.cos(e)))
    cam.location = look + Vector((0, -30 * math.cos(e), 30 * math.sin(e)))
    return s


def render(clip, t, yaw, path):
    s = build(clip, t, yaw)
    s.render.filepath = path; s.frame_set(1); bpy.ops.render.render(write_still=True)


DIRS = {'S': 0, 'E': 90, 'N': 180, 'W': 270}
NFR = {'walk': 8, 'idle': 4, 'crawl': 6, 'scream': 6, 'lunge': 4, 'hurt': 4}
ONLY = {'hurt': ('S',)}
if __name__ == '__main__':
    for clip in CLIPS:
        for d, yaw in DIRS.items():
            if d not in ONLY.get(clip, DIRS): continue
            for i in range(NFR.get(clip, 4)):
                render(clip, i / NFR.get(clip, 4), yaw, os.path.join(OUT, f'{clip}_{d}_{i}.png'))
                print(clip, d, i, flush=True)
