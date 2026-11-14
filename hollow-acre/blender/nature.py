import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
import bpy, bmesh
OUT = os.environ.get('OUT', '/tmp/assets'); os.makedirs(OUT, exist_ok=True)
PREV = os.environ.get('PREV', '')
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
reset(11)

def piece(name, m, fn):
    bm = bmesh.new(); fn(bm); o = obj_from_bm(bm, name); o.data.materials.append(m); return o

def done(name, objs, res=512, sm=True):
    o = join(objs, name) if len(objs) > 1 else objs[0]
    o.name = name
    if sm: smooth(o)
    activate(o); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    bake_atlas(o, name, res); return o

def displace(o, strength=.15, scale=1.2, kind='VORONOI'):
    t = bpy.data.textures.new(o.name + 'tx', kind); t.noise_scale = scale
    m = o.modifiers.new('d', 'DISPLACE'); m.texture = t; m.strength = strength; apply_mods(o)

def leaf_ribbon(bm, base, direction, length, width, droop=.5, seg=6, twist=0.):
    d = direction.normalized(); side = d.cross(V(0, 0, 1)).normalized() if abs(d.z) < .95 else V(1, 0, 0)
    up = side.cross(d).normalized(); prev = None
    for i in range(seg + 1):
        t = i / seg; w = width * math.sin(math.pi * min(1, t * 1.1 + .05)) * (1 - t * .3)
        p = base + d * length * t - up * droop * length * t * t
        s2 = side * math.cos(twist * t) + up * math.sin(twist * t)
        a = bm.verts.new(p - s2 * w / 2); b = bm.verts.new(p + s2 * w / 2); c = bm.verts.new(p + up * w * .12)
        if prev: bm.faces.new((prev[0], a, c, prev[2])); bm.faces.new((prev[2], c, b, prev[1]))
        prev = (a, b, c)

# ---------------------------------------------------------------- materials
bark = M_noise('bark', (.025, .018, .012), (.07, .05, .035), (.12, .09, .06), scale=14, rough=.95, bumps=.9)
def barkx(N, L, co, c):
    w = node(N, 'ShaderNodeTexWave', Scale=5., Distortion=10., Detail=6.); w.bands_direction = 'Z'; L.new(co, w.inputs['Vector'])
    r = ramp(N, L, w.outputs['Fac'], [(0, (.4, .4, .4)), (.5, (1, 1, 1)), (1, (1, 1, 1))]); return mix(N, L, c, r.outputs[0])
bark = M_noise('bark', (.03, .022, .015), (.08, .06, .04), (.13, .1, .07), scale=14, rough=.95, bumps=.9, extra=barkx)
needles = M_noise('needles', (.01, .025, .012), (.03, .06, .03), (.06, .09, .045), scale=30, rough=.85, bumps=.6, detail=12)
def leaves(nm, a, b, c): return M_noise(nm, a, b, c, scale=22, rough=.7, bumps=.5, detail=10)
autumnA = leaves('autumnA', (.18, .03, .01), (.45, .12, .02), (.6, .32, .04)); autumnB = leaves('autumnB', (.25, .1, .01), (.55, .3, .03), (.7, .55, .1))
green = leaves('leafgreen', (.02, .05, .015), (.05, .11, .03), (.1, .16, .05)); dry = leaves('dryleaf', (.12, .1, .04), (.28, .24, .11), (.4, .35, .18))
rock = M_noise('rock', (.03, .03, .028), (.08, .078, .07), (.16, .15, .13), scale=4, rough=.9, bumps=.8)
grassm = leaves('grassblade', (.02, .04, .01), (.06, .1, .03), (.14, .16, .06))
stem = M_flat('stem', (.07, .1, .03), .7)

def tree_branch(bm, p, d, L, r, depth, rng, out):
    end = p + d * L; mid = p + d * L * .5 + V(rng.uniform(-.1, .1), rng.uniform(-.1, .1), 0) * L
    tube(bm, [p, mid, end], r, r * .6, 7)
    if depth == 0: out.append(end); return
    for k in range(2 + (depth > 1)):
        nd = (d + V(rng.uniform(-.8, .8), rng.uniform(-.8, .8), rng.uniform(-.1, .5))).normalized()
        tree_branch(bm, end, nd, L * .66, r * .6, depth - 1, rng, out)

def pine(name, h=9., seed=1):
    rng = random.Random(seed)
    trunk = piece('trunk', bark, lambda bm: tube(bm, [V(0, 0, -.2), V(0, 0, h * .4), V(.05, 0, h * .85)], .32 * h / 9, .06, 10))
    def foli(bm):
        layers = 8
        for i in range(layers):
            t = i / layers; z = h * (.22 + .72 * t); R = (1 - t) * 2.2 * h / 9 + .25; seg = 18
            top = bm.verts.new(V(0, 0, z + h * .16)); ring = []
            for k in range(seg):
                a = k / seg * math.tau + rng.random() * .2; rr = R * (1 + rng.uniform(-.18, .12))
                ring.append(bm.verts.new(V(math.cos(a) * rr, math.sin(a) * rr, z - rng.uniform(0, .3) - R * .25)))
            mid = [bm.verts.new((top.co * .45 + v.co * .55) + V(0, 0, -.12)) for v in ring]
            for k in range(seg):
                bm.faces.new((top, mid[k], mid[(k + 1) % seg])); bm.faces.new((mid[k], ring[k], ring[(k + 1) % seg], mid[(k + 1) % seg]))
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=.08)
    f = piece('foliage', needles, foli)
    return done(name, [trunk, f], 512)

def autumn(name, mat, seed=2):
    rng = random.Random(seed); ends = []
    def tr(bm):
        tube(bm, [V(0, 0, -.2), V(.05, 0, 1.6), V(-.05, .05, 3.0)], .32, .2, 10)
        for k in range(4):
            a = k / 4 * math.tau + rng.random(); tree_branch(bm, V(0, 0, 2.6 + k * .2), V(math.cos(a), math.sin(a), 1.1).normalized(), 1.4, .14, 2, rng, ends)
    t = piece('trunk', bark, tr)
    def can(bm):
        for e in ends:
            sphere(bm, e + V(0, 0, .2), .9 + rng.random() * .5, 12, 8, (1, 1, .8))
        sphere(bm, V(0, 0, 4.3), 1.8, 16, 10, (1, 1, .75))
    c = piece('canopy', mat, can); displace(c, .45, .6, 'VORONOI')
    return done(name, [t, c], 512)

def dead(name, seed=3):
    rng = random.Random(seed); ends = []
    def tr(bm):
        tube(bm, [V(0, 0, -.2), V(.1, 0, 1.8), V(0, .1, 3.6)], .3, .12, 9)
        for k in range(5):
            a = k / 5 * math.tau + rng.random(); tree_branch(bm, V(0, 0, 1.8 + k * .4), V(math.cos(a), math.sin(a), .7).normalized(), 1.2, .1, 2, rng, ends)
    return done(name, [piece('dead', bark, tr)], 512)

def bush(name):
    b = piece('bush', green, lambda bm: [sphere(bm, V(random.uniform(-.5, .5), random.uniform(-.5, .5), .45 + random.random() * .3), .55 + random.random() * .3, 12, 8) for k in range(5)])
    displace(b, .2, .4); return done(name, [b], 256)

def rocks(name, seed):
    random.seed(seed)
    r = piece('rock', rock, lambda bm: bmesh.ops.create_icosphere(bm, subdivisions=4, radius=.6))
    r.scale = (1 + random.random() * .5, 1 + random.random() * .3, .55 + random.random() * .3); activate(r); bpy.ops.object.transform_apply(scale=True)
    displace(r, .25, .5); return done(name, [r], 256)

def grass(name):
    g = piece('grass', grassm, lambda bm: [leaf_ribbon(bm, V(random.uniform(-.12, .12), random.uniform(-.12, .12), 0), V(random.uniform(-.3, .3), random.uniform(-.3, .3), 1), .35 + random.random() * .3, .025, .35, 4, random.uniform(-1, 1)) for k in range(16)])
    return done(name, [g], 256, False)

def corn(name):
    stalkm = M_noise('stalk', (.12, .11, .04), (.25, .23, .1), scale=20, rough=.8, bumps=.2)
    s = piece('stalk', stalkm, lambda bm: tube(bm, [V(0, 0, 0), V(.02, 0, 1.2), V(-.02, .02, 2.3)], .025, .012, 6))
    def lv(bm):
        for k in range(7):
            a = k * 2.4; z = .35 + k * .27; leaf_ribbon(bm, V(0, 0, z), V(math.cos(a), math.sin(a), .5 + random.random() * .4), .65, .07, .55, 6, .4)
        sphere(bm, V(.04, 0, 1.35), .05, 10, 8, (1, 1, 3.2))
        for k in range(5): leaf_ribbon(bm, V(0, 0, 2.25), V(random.uniform(-.3, .3), random.uniform(-.3, .3), 1), .22, .012, .2, 3)
    l = piece('cornleaf', dry, lv)
    return done(name, [s, l], 256, False)

def reed(name):
    return done(name, [piece('reed', M_noise('reedm', (.05, .07, .02), (.12, .13, .05), scale=20), lambda bm: [leaf_ribbon(bm, V(random.uniform(-.15, .15), random.uniform(-.15, .15), 0), V(random.uniform(-.15, .15), random.uniform(-.15, .15), 1), 1.0 + random.random() * .6, .025, .15, 5) for k in range(9)])], 256, False)

def mushroom(name):
    cap = M_flat('glowcap', (.05, .2, .2), .4, emis=(.25, 1, .85), es=1.5); cap.name = 'glow'; st = M_flat('mstem', (.6, .58, .5), .6)
    objs = []
    for k in range(4):
        s = .6 + random.random() * .7; x, y = random.uniform(-.2, .2), random.uniform(-.2, .2)
        objs.append(piece('ms', st, lambda bm: cyl(bm, V(x, y, .08 * s), .025 * s, .16 * s, 8, r2=.018 * s)))
        objs.append(piece('mc', cap, lambda bm: sphere(bm, V(x, y, .16 * s), .09 * s, 14, 8, (1, 1, .45))))
    return done(name, objs, 128)

# crops ---------------------------------------------------------------
turnip_leaf = leaves('turnipleaf', (.03, .08, .02), (.08, .18, .05), (.15, .26, .08))
def bulbmat():
    m, nt, N, L = mat('turnipbulb'); p = P(nt); co = objco(N); sx = N.new('ShaderNodeSeparateXYZ'); L.new(co, sx.inputs[0])
    r = ramp(N, L, sx.outputs['Z'], [(0, (.6, .56, .5)), (.55, (.7, .66, .6)), (.75, (.3, .05, .28)), (1, (.22, .03, .2))])
    L.new(r.outputs[0], p.inputs['Base Color']); p.inputs['Roughness'].default_value = .4; return m
bulb = bulbmat()
pump = M_noise('pumpkin', (.35, .08, .005), (.6, .17, .01), (.75, .28, .03), scale=6, rough=.5, bumps=.2)
pumpg = M_noise('pumpkingreen', (.04, .08, .02), (.1, .17, .04), scale=6, rough=.5, bumps=.2)
soil = M_noise('soilm', (.02, .013, .008), (.05, .035, .022), (.09, .065, .04), scale=18, rough=.95, bumps=.9)

def ribbed(bm, c, r, h_scale=.74, ribs=10, seg=28):
    res = bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=18, radius=1)
    for v in res['verts']:
        x, y, z = v.co; a = math.atan2(y, x); k = 1 + .08 * math.cos(a * ribs); dim = -.25 * (z - .8) / .2 if z > .8 else 0
        v.co = V(x * k * r, y * k * r, (z * h_scale + dim) * r) + c

def turnip_stage(st):
    n = [2, 2, 5, 7][st]; L_ = [.0, .09, .2, .34][st]; objs = []
    objs.append(piece('mound', soil, lambda bm: sphere(bm, V(0, 0, 0), .16, 12, 6, (1, 1, .3))))
    if st > 0: objs.append(piece('lv', turnip_leaf, lambda bm: [leaf_ribbon(bm, V(0, 0, .04 + .05 * (st == 3)), V(math.cos(k / n * math.tau), math.sin(k / n * math.tau), 1.3), L_, .12 * L_ / .34 + .03, .6, 6, .3) for k in range(n)]))
    if st >= 2: objs.append(piece('b', bulb, lambda bm: sphere(bm, V(0, 0, .02 + .06 * (st == 3)), .11 if st == 3 else .06, 16, 10, (1, 1, 1.05))))
    return done(f'turnip_{st}', objs, 256)

def pumpkin_stage(st):
    objs = [piece('mound', soil, lambda bm: sphere(bm, V(0, 0, 0), .16, 12, 6, (1, 1, .3)))]
    if st >= 1:
        sz = [0, .1, .32, .42][st]
        objs.append(piece('lv', green, lambda bm: [leaf_ribbon(bm, V(0, 0, .03), V(math.cos(k * 1.3), math.sin(k * 1.3), .35), sz, sz * .9, .2, 5) for k in range(2 if st == 1 else 5)]))
    if st >= 2:
        objs.append(piece('vine', stem, lambda bm: (tube(bm, [V(0, 0, .02), V(.15, .1, .04), V(.32, -.05, .03), V(.45, .1, .03)], .015, .01, 6), tube(bm, [V(0, 0, .02), V(-.2, .05, .03), V(-.36, -.1, .03)], .014, .01, 6))))
    if st == 2: objs.append(piece('p', pumpg, lambda bm: ribbed(bm, V(.25, .05, .06), .07)))
    if st == 3:
        objs.append(piece('p', pump, lambda bm: ribbed(bm, V(.1, .05, .24), .32)))
        objs.append(piece('ps', stem, lambda bm: tube(bm, [V(.1, .05, .44), V(.12, .06, .52), V(.18, .04, .56)], .025, .018, 7)))
    return done(f'pumpkin_{st}', objs, 256)

# props ---------------------------------------------------------------
woodp = M_wood('woodp', (.05, .03, .018), (.14, .09, .05), 3, planks=5); iron = M_metal('ironp', (.05, .05, .05), .6)
hay = M_wood('hay', (.2, .15, .06), (.45, .36, .17), 30)
def prop_hay(): return done('hay', [piece('h', hay, lambda bm: cyl(bm, V(0, 0, .6), .6, 1.2, 24, (math.pi / 2, 0, 0)))], 256)
def prop_barrel():
    return done('barrel', [piece('b', woodp, lambda bm: [cyl(bm, V(0, 0, .12 + i * .24), .34 + .04 * math.sin((i + .5) / 4 * math.pi), .24, 18, r2=.34 + .04 * math.sin((i + 1.5) / 4 * math.pi)) for i in range(4)]),
                           piece('r', iron, lambda bm: [cyl(bm, V(0, 0, z), .38, .05, 18) for z in (.15, .8)])], 256)
def prop_crate(): return done('crate', [piece('c', woodp, lambda bm: (box(bm, V(0, 0, .35), (.7, .7, .7)), [box(bm, V(0, -.36, .35), (.75, .03, .1), (0, r, 0)) for r in (.78, -.78)]))], 256)
def prop_pumpkin(): return done('pumpkin', [piece('p', pump, lambda bm: ribbed(bm, V(0, 0, .3), .4)), piece('s', stem, lambda bm: tube(bm, [V(0, 0, .55), V(.03, 0, .66), V(.08, 0, .7)], .035, .025, 7))], 256)
def prop_jack():
    face = M_flat('glow', (.9, .5, .1), .3, emis=(1, .55, .1), es=0.); face.name = 'jackglow'
    def cut(bm):
        for sx in (-1, 1):
            a, b, c = V(sx * .13, -.4, .38), V(sx * .03, -.4, .46), V(sx * .06, -.4, .33); f = bm.faces.new([bm.verts.new(a), bm.verts.new(b), bm.verts.new(c)][::(1 if sx > 0 else -1)])
        pts = [V(-.2, -.39, .22), V(-.1, -.39, .17), V(-.05, -.39, .22), V(0, -.39, .16), V(.05, -.39, .22), V(.1, -.39, .17), V(.2, -.39, .22), V(.12, -.38, .08), V(-.12, -.38, .08)]
        bm.faces.new([bm.verts.new(p) for p in pts])
    return done('jack', [piece('p', pump, lambda bm: ribbed(bm, V(0, 0, .3), .4)), piece('f', face, cut), piece('s', stem, lambda bm: tube(bm, [V(0, 0, .55), V(.03, 0, .66)], .035, .025, 7))], 256)
def prop_shock():
    return done('cornshock', [piece('s', dry, lambda bm: [leaf_ribbon(bm, V(math.cos(a) * .4, math.sin(a) * .4, 0), V(-math.cos(a) * .2, -math.sin(a) * .2, 1), 1.9, .06, .05, 5) for a in [k / 26 * math.tau for k in range(26)]]),
                              piece('t', M_flat('twine', (.2, .14, .07), .9), lambda bm: tube(bm, [V(math.cos(a) * .18, math.sin(a) * .18, 1.3) for a in [k / 16 * math.tau for k in range(17)]], .02, .02, 5))], 256, False)
def prop_lily(): return done('lily', [piece('l', green, lambda bm: [sphere(bm, V(random.uniform(-.5, .5), random.uniform(-.5, .5), 0), .3, 14, 4, (1, 1, .05)) for k in range(3)])], 128)

# tileable ground textures (4D noise mapped on a torus so edges wrap)
def ground_tex(name, kind, res=1024):
    m, nt, N, L = mat('g_' + name); p = P(nt)
    uv = N.new('ShaderNodeTexCoord').outputs['UV']; sp = N.new('ShaderNodeSeparateXYZ'); L.new(uv, sp.inputs[0])
    def trig(src, f):
        a = N.new('ShaderNodeMath'); a.operation = 'MULTIPLY'; a.inputs[1].default_value = math.tau; L.new(src, a.inputs[0])
        b = N.new('ShaderNodeMath'); b.operation = f; L.new(a.outputs[0], b.inputs[0]); return b.outputs[0]
    cu, su, cv, sv = trig(sp.outputs['X'], 'COSINE'), trig(sp.outputs['X'], 'SINE'), trig(sp.outputs['Y'], 'COSINE'), trig(sp.outputs['Y'], 'SINE')
    cb = N.new('ShaderNodeCombineXYZ'); L.new(cu, cb.inputs[0]); L.new(su, cb.inputs[1]); L.new(cv, cb.inputs[2])
    def n4(scale, detail=8, vor=False):
        n = N.new('ShaderNodeTexVoronoi' if vor else 'ShaderNodeTexNoise')
        if vor: n.voronoi_dimensions = '4D'
        else: n.noise_dimensions = '4D'; n.inputs['Detail'].default_value = detail
        n.inputs['Scale'].default_value = scale; L.new(cb.outputs[0], n.inputs['Vector']); L.new(sv, n.inputs['W']); return n
    if kind == 'grass':
        a = n4(3); b = n4(40, 4); c = n4(140, 2)
        col = mix(N, L, ramp(N, L, a.outputs['Fac'], [(0, (.02, .03, .01)), (.5, (.05, .07, .025)), (1, (.09, .08, .04))]).outputs[0], ramp(N, L, b.outputs['Fac'], [(0, (.55, .6, .5)), (1, (1.2, 1.15, 1.0))]).outputs[0])
        col = mix(N, L, col, ramp(N, L, c.outputs['Fac'], [(0, (.6, .6, .6)), (1, (1.15, 1.2, 1.1))]).outputs[0]); h = c.outputs['Fac']; bs = .6
    elif kind == 'dirt':
        a = n4(4); b = n4(30); v = n4(25, vor=True)
        col = mix(N, L, ramp(N, L, a.outputs['Fac'], [(0, (.04, .03, .02)), (.6, (.1, .075, .05)), (1, (.16, .12, .08))]).outputs[0], ramp(N, L, v.outputs['Distance'], [(0, (.5, .48, .45)), (.25, (1, 1, 1)), (1, (1, 1, 1))]).outputs[0])
        h = v.outputs['Distance']; bs = .8
    elif kind == 'soil':
        a = n4(5); v = n4(40, vor=True)
        col = mix(N, L, ramp(N, L, a.outputs['Fac'], [(0, (.018, .012, .008)), (1, (.07, .05, .032))]).outputs[0], ramp(N, L, v.outputs['Distance'], [(0, (.4, .4, .4)), (.3, (1, 1, 1)), (1, (1, 1, 1))]).outputs[0])
        h = v.outputs['Distance']; bs = 1.
    elif kind == 'asphalt':
        a = n4(6); b = n4(300, 2)
        col = mix(N, L, ramp(N, L, a.outputs['Fac'], [(0, (.025, .025, .027)), (1, (.06, .06, .065))]).outputs[0], ramp(N, L, b.outputs['Fac'], [(0, (.5, .5, .5)), (1, (1.4, 1.4, 1.4))]).outputs[0])
        h = b.outputs['Fac']; bs = .3
    else:
        v = n4(6, vor=True); v.feature = 'DISTANCE_TO_EDGE'; a = n4(5)
        col = mix(N, L, ramp(N, L, v.outputs['Distance'], [(0, (.01, .01, .01)), (.05, (.03, .028, .026)), (.12, (.09, .085, .078)), (1, (.15, .14, .13))]).outputs[0], ramp(N, L, a.outputs['Fac'], [(0, (.6, .6, .6)), (1, (1.2, 1.2, 1.1))]).outputs[0])
        h = v.outputs['Distance']; bs = 1.
    L.new(col, p.inputs['Base Color']); L.new(bump(N, L, h, bs, .01), p.inputs['Normal'])
    bpy.ops.mesh.primitive_plane_add(size=1); pl = bpy.context.active_object; pl.data.materials.append(m)
    img = bpy.data.images.new(name, res, res); nimg = bpy.data.images.new(name + '_n', res, res); nimg.colorspace_settings.name = 'Non-Color'
    tn = nt.nodes.new('ShaderNodeTexImage'); nt.nodes.active = tn
    s = bpy.context.scene; s.render.engine = 'CYCLES'; s.cycles.samples = 2; s.render.bake.margin = 0
    for im, typ in ((img, 'DIFFUSE'), (nimg, 'NORMAL')):
        tn.image = im
        if typ == 'DIFFUSE': bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'})
        else: bpy.ops.object.bake(type='NORMAL')
        im.filepath_raw = f'{OUT}/tex_{name}{"_n" if typ == "NORMAL" else ""}.jpg'; im.file_format = 'JPEG'; im.save()
    bpy.data.objects.remove(pl)

GROUPS = {
    'nature': lambda: [pine('pine', 9, 1), pine('pine_b', 7, 5), autumn('autumn_a', autumnA, 2), autumn('autumn_b', autumnB, 4), dead('dead', 3), bush('bush'),
                       rocks('rock_0', 1), rocks('rock_1', 2), rocks('rock_2', 3), grass('grass'), corn('corn'), reed('reed'), mushroom('mushroom')],
    'crops': lambda: [turnip_stage(i) for i in range(4)] + [pumpkin_stage(i) for i in range(4)],
    'props': lambda: [prop_hay(), prop_barrel(), prop_crate(), prop_pumpkin(), prop_jack(), prop_shock(), prop_lily()],
}
for gname, fn in GROUPS.items():
    if ONLY and gname not in ONLY: continue
    objs = fn()
    for i, o in enumerate(objs): o.location.x = i * 0  # keep at origin; nodes are cloned by name in the game
    if PREV and gname == 'nature':
        for i, o in enumerate(objs): o.location.x = (i - 6) * 3.5
        preview(f'{PREV}/{gname}', objs, [((0, -40, 9), (0, 0, 3))], res=(1600, 500))
        for o in objs: o.location.x = 0
    export(objs, f'{OUT}/{gname}.glb')
    for o in objs: bpy.data.objects.remove(o)
if not ONLY or 'ground' in ONLY:
    for g in ('grass', 'dirt', 'soil', 'asphalt', 'cobble'): ground_tex(g, g)
    print('GROUND DONE')
