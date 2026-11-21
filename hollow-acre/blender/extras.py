import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
import bpy, bmesh
OUT = os.environ.get('OUT', '/tmp/assets'); os.makedirs(OUT, exist_ok=True)
PREV = os.environ.get('PREV', '')
reset(31)

def piece(name, m, fn):
    bm = bmesh.new(); fn(bm); o = obj_from_bm(bm, name); o.data.materials.append(m); return o
def done(name, objs, res=512, sm=True):
    o = join(objs, name) if len(objs) > 1 else objs[0]; o.name = name
    if sm: smooth(o)
    activate(o); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    bake_atlas(o, name, res); return o

skin = M_noise('fpskin', (.4, .26, .18), (.5, .33, .24), (.56, .38, .28), scale=9, rough=.55, bumps=.05)
sleeve = M_cloth('fpsleeve', (.14, .1, .06), 70, .35); cuff = M_cloth('fpcuff', (.08, .06, .04), 90, .3)
brass = M_metal('brass', (.35, .25, .1), .3); P(brass.node_tree).inputs['Metallic'].default_value = .85
iron = M_metal('fpiron', (.05, .05, .055), .5); woodm = M_wood('fpwood', (.08, .05, .03), (.2, .13, .07), 6)

# first-person arm: forearm runs along -Y (forward) from the elbow at the origin; the fist closes around a handle at the tip
def fp_arm(name, side):
    def sl(bm): tube(bm, [V(0, .05, 0), V(0, -.15, .0), V(0, -.33, -.005)], .052, .044, 18, cap=True)
    def cu(bm): cyl(bm, V(0, -.35, -.005), .047, .05, 18, (math.pi / 2, 0, 0))
    def hand(bm):
        tube(bm, [V(0, -.36, -.005), V(0, -.4, -.008)], .034, .032, 14)
        sphere(bm, V(0, -.45, -.012), .045, 16, 12, (.95, 1.05, .7))
        for k in range(4):
            x = (k - 1.5) * .018
            tube(bm, [V(x, -.49, -.0), V(x, -.515, -.025), V(x, -.5, -.05), V(x, -.475, -.055)], .0105, .0095, 8, cap=True)
            sphere(bm, V(x, -.488, -.003), .011, 8, 6)
        tube(bm, [V(side * -.035, -.43, -.005), V(side * -.04, -.47, -.03), V(side * -.022, -.49, -.05)], .012, .01, 8, cap=True)
        for k in range(3): sphere(bm, V((k - 1) * .02, -.43, .03), .004, 6, 4)
    return done(name, [piece('sl', sleeve, sl), piece('cu', cuff, cu), piece('h', skin, hand)], 512)

def lantern():
    glass = M_flat('window', (.25, .16, .06), .05, emis=(1, .62, .25), es=0.); glass.name = 'lanternglass'
    flame = M_flat('glow', (1, .85, .5), .3, emis=(1, .8, .4), es=4.); flame.name = 'flame'
    objs = [piece('handle', iron, lambda bm: tube(bm, [V(math.cos(a) * .05, 0, math.sin(a) * .05) for a in [k / 12 * math.pi for k in range(13)]], .006, .006, 6)),
            piece('cap', brass, lambda bm: (cyl(bm, V(0, 0, -.075), .062, .05, 18, r2=.025), cyl(bm, V(0, 0, -.1), .064, .015, 18), cyl(bm, V(0, 0, -.245), .066, .03, 18, r2=.06))),
            piece('cage', iron, lambda bm: [cyl(bm, V(math.cos(a) * .056, math.sin(a) * .056, -.17), .0045, .13, 6) for a in [k / 4 * math.tau + .4 for k in range(4)]]),
            piece('glass', glass, lambda bm: cyl(bm, V(0, 0, -.17), .05, .13, 18, r2=.054)),
            piece('flame', flame, lambda bm: cyl(bm, V(0, 0, -.17), .012, .04, 8, r2=.001))]
    return done('lantern', objs, 256)

def tools():
    out = []
    out.append(done('hoe', [piece('h', woodm, lambda bm: tube(bm, [V(0, .1, 0), V(0, -1.1, 0)], .016, .014, 10, cap=True)),
                            piece('b', iron, lambda bm: (box(bm, V(0, -1.13, -.08), (.17, .015, .13), (.2, 0, 0)), cyl(bm, V(0, -1.12, 0), .022, .05, 10, (math.pi / 2, 0, 0))))], 256))
    zinc = M_metal('zinc', (.22, .26, .24), .4)
    out.append(done('can', [piece('c', zinc, lambda bm: (cyl(bm, V(0, -.05, -.14), .1, .2, 22, r2=.105), tube(bm, [V(0, -.1, -.15), V(0, -.25, -.07), V(0, -.36, .0)], .022, .012, 10),
                                                           cyl(bm, V(0, -.38, .01), .03, .03, 12, (math.radians(-55), 0, 0), r2=.02),
                                                           tube(bm, [V(0, -.0, -.06), V(0, .02, .02), V(0, -.06, .05), V(0, -.13, .0)], .011, .011, 8)))], 256))
    out.append(done('rod', [piece('r', M_flat('rodm', (.08, .05, .03), .4), lambda bm: tube(bm, [V(0, .1, 0), V(0, -1.9, 0)], .014, .004, 8, cap=True)),
                            piece('reel', iron, lambda bm: cyl(bm, V(.03, -.05, -.02), .03, .03, 14, (0, math.pi / 2, 0)))], 128))
    out.append(done('pouch', [piece('p', M_cloth('pouchm', (.22, .16, .08), 60, .4), lambda bm: (sphere(bm, V(0, -.02, -.06), .06, 16, 12, (1, 1, .9)), tube(bm, [V(0, -.02, -.0), V(0, -.02, .02)], .025, .015, 10)))], 128))
    return out

def crow():
    feather = M_noise('feather', (.004, .004, .006), (.015, .015, .02), (.04, .04, .05), scale=50, rough=.35, bumps=.4)
    beak = M_flat('beak', (.03, .03, .025), .3)
    bones = [('body', V(0, .12, .12), V(0, -.08, .14), None, V(0, 0, 1)), ('head', V(0, -.1, .17), V(0, -.2, .2), 'body', V(0, 0, 1)),
             ('wingL', V(.05, 0, .16), V(.3, .02, .16), 'body', V(0, 0, 1)), ('wingR', V(-.05, 0, .16), V(-.3, .02, .16), 'body', V(0, 0, 1)), ('tail', V(0, .12, .13), V(0, .28, .12), 'body', V(0, 0, 1))]
    rig = make_rig('crow_rig', bones)
    b = piece('b', feather, lambda bm: (sphere(bm, V(0, 0, .14), .07, 18, 12, (.85, 1.6, .85)), sphere(bm, V(0, -.13, .18), .05, 14, 10),
                                        [cyl(bm, V(sx * .015, .05, .03), .006, .1, 6) for sx in (-1, 1)]))
    bk = piece('k', beak, lambda bm: cone(bm, V(0, -.16, .18), V(0, -.23, .17), .016, 8))
    def wings(bm):
        for sx in (-1, 1):
            for k in range(6): box(bm, V(sx * (.07 + k * .04), .01 + k * .008, .16), (.05, .14 - k * .01, .008), (0, 0, sx * .1))
    w = piece('w', feather, wings); t = piece('t', feather, lambda bm: [box(bm, V(x, .2, .12), (.025, .16, .006), (0, 0, x * 2)) for x in (-.03, 0, .03)])
    eye = piece('e', M_flat('crowEye', (.05, .03, .01), .05), lambda bm: [sphere(bm, V(sx * .035, -.15, .195), .008, 8, 6) for sx in (-1, 1)])
    for o_, bn in ((b, None), (bk, 'head'), (eye, 'head'), (t, 'tail')):
        if bn: rigid_weight(o_, bn)
        else: auto_weights(o_, rig, ['body', 'head'])
    auto_weights(w, rig, ['wingL', 'wingR', 'body'], k=2)
    M = done('crow', [b, bk, w, t, eye], 256); bind(M, rig)
    def idle(t_, ph, R, PB): R('head', x=.3 * max(0, math.sin(ph * 2)) ** 8, z=.3 * math.sin(ph)); R('tail', x=.05 * math.sin(ph * 3))
    def fly(t_, ph, R, PB): f = math.sin(ph); R('wingL', y=.9 * f); R('wingR', y=-.9 * f); R('body', x=.1 * f); R('tail', x=-.1)
    clips(rig, [('idle', 3, idle), ('fly', .35, fly)]); return rig, M

def cat():
    fur = M_noise('catfur', (.05, .045, .04), (.13, .12, .1), (.2, .18, .15), scale=35, rough=.9, bumps=.5)
    def P(x, y, z): return V(x, y, z)
    bones = [('spine', P(0, .15, .22), P(0, -.12, .23), None, V(0, 0, 1)), ('head', P(0, -.14, .26), P(0, -.24, .3), 'spine', V(0, 0, 1)),
             ('tail1', P(0, .16, .23), P(0, .3, .3), 'spine', V(0, 0, 1)), ('tail2', P(0, .3, .3), P(0, .38, .44), 'tail1', V(0, 0, 1))]
    for nm, x, y in (('legFL', .05, -.1), ('legFR', -.05, -.1), ('legBL', .05, .12), ('legBR', -.05, .12)):
        bones.append((nm, P(x, y, .2), P(x, y - .01, .02), 'spine', V(0, -1, 0)))
    rig = make_rig('cat_rig', bones)
    bm_ = bmesh.new(); sk = []
    def vt(p, r): v = bm_.verts.new(p); sk.append(r); return v
    sp = [vt(P(0, .16, .22), .06), vt(P(0, 0, .23), .07), vt(P(0, -.12, .24), .06), vt(P(0, -.16, .27), .04)]
    for a, c in zip(sp, sp[1:]): bm_.edges.new((a, c))
    for x, y, i in ((.05, -.1, 2), (-.05, -.1, 2), (.05, .12, 0), (-.05, .12, 0)):
        l = [vt(P(x, y, .17), .028), vt(P(x, y, .08), .02), vt(P(x, y - .015, .015), .02)]; bm_.edges.new((sp[i], l[0])); bm_.edges.new((l[0], l[1])); bm_.edges.new((l[1], l[2]))
    tl = [vt(P(0, .24, .26), .018), vt(P(0, .32, .32), .015), vt(P(0, .38, .44), .012)]; bm_.edges.new((sp[0], tl[0])); bm_.edges.new((tl[0], tl[1])); bm_.edges.new((tl[1], tl[2]))
    body = obj_from_bm(bm_, 'catbody'); m = body.modifiers.new('s', 'SKIN')
    for r, sv in zip(sk, body.data.skin_vertices[0].data): sv.radius = (r, r)
    body.data.skin_vertices[0].data[0].use_root = True; apply_mods(body); m = body.modifiers.new('ss', 'SUBSURF'); m.levels = 2; apply_mods(body); body.data.materials.append(fur)
    head = piece('h', fur, lambda bm: (sphere(bm, P(0, -.21, .3), .065, 18, 12, (1, 1, .9)), [cone(bm, P(sx * .035, -.2, .34), P(sx * .045, -.19, .4), .022, 6) for sx in (-1, 1)], sphere(bm, P(0, -.265, .285), .025, 10, 8)))
    eyes = piece('e', M_flat('catEye', (.5, .45, .05), .05, emis=(.6, .55, .1), es=.4), lambda bm: [sphere(bm, P(sx * .028, -.265, .31), .011, 8, 6) for sx in (-1, 1)])
    auto_weights(body, rig); rigid_weight(head, 'head'); rigid_weight(eyes, 'head')
    M = done('cat', [body, head, eyes], 256); bind(M, rig)
    def idle(t, ph, R, PB): R('tail1', z=.4 * math.sin(ph)); R('tail2', z=.3 * math.sin(ph + 1)); R('head', z=.2 * math.sin(ph * .5)); R('spine', x=.01 * math.sin(ph * 2))
    def walk(t, ph, R, PB):
        s = math.sin(ph); R('legFL', x=.5 * s); R('legBR', x=.5 * s); R('legFR', x=-.5 * s); R('legBL', x=-.5 * s); R('tail1', z=.2 * math.sin(ph * .5)); R('head', x=.05 * s)
    clips(rig, [('idle', 3, idle), ('walk', .7, walk)]); return rig, M

def deer():
    fur = M_noise('deerfur', (.08, .05, .03), (.18, .12, .07), (.25, .18, .11), scale=30, rough=.9, bumps=.4)
    blood = M_flat('blood', (.06, .002, .002), .15, .2)
    objs = [piece('b', fur, lambda bm: (sphere(bm, V(.45, 0, .26), .3, 20, 14, (1.6, .9, .85)), tube(bm, [V(-.1, 0, .3), V(-.45, .05, .25), V(-.85, .1, .18)], .11, .07, 12), sphere(bm, V(-.95, .1, .17), .13, 14, 10, (1.5, .8, .8)),
                                       [tube(bm, [V(x, y, .25), V(x + dx, y + dy, .12), V(x + dx * 1.6, y + dy * 1.8, .04)], .04, .025, 8, cap=True) for x, y, dx, dy in ((.05, .15, -.2, .35), (.15, -.15, .1, -.4), (.75, .15, .3, .3), (.8, -.12, .35, -.25))])),
            piece('bl', blood, lambda bm: sphere(bm, V(.25, 0, .02), .9, 24, 6, (1.3, 1, .02)))]
    return done('deer', objs, 512)

objs = [fp_arm('armL', 1), fp_arm('armR', -1), lantern()] + tools()
export(objs, f'{OUT}/fp.glb')
if PREV:
    for i, o in enumerate(objs): o.location = ((i - 3) * .5, 0, 0)
    preview(f'{PREV}/fp', objs, [((0, -3, 1.2), (0, 0, -.2))], res=(1200, 500))
for o in objs: bpy.data.objects.remove(o)
for fn, name in ((crow, 'crow'), (cat, 'cat')):
    rig, M = fn(); export([rig, M], f'{OUT}/{name}.glb', anims=True); bpy.data.objects.remove(M); bpy.data.objects.remove(rig)
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
d = deer(); export([d], f'{OUT}/deer.glb')
