import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
import bpy, bmesh
OUT = os.environ.get('OUT', '/tmp/assets'); os.makedirs(OUT, exist_ok=True)
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
PREV = os.environ.get('PREV', '')
RES = int(os.environ.get('RES', '1024'))

def piece(name, m, fn):
    bm = bmesh.new(); fn(bm); o = obj_from_bm(bm, name); o.data.materials.append(m); return o

def finish(name, objs, res=RES, shots=None):
    o = join(objs, name)
    activate(o); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    bake_atlas(o, name, res)
    if PREV and shots: preview(f'{PREV}/{name}', [o], shots)
    export([o], f'{OUT}/{name}.glb')
    bpy.data.objects.remove(o)

# --------------------------------------------------------------- shared materials
def mats():
    return dict(
        stone=M_noise('stone', (.035, .034, .03), (.09, .085, .075), (.15, .14, .12), scale=5, rough=.9, bumps=.6),
        brick=M_brick('brick', (.22, .07, .04), (.3, .12, .07)),
        wood=M_wood('wood', (.06, .035, .02), (.16, .1, .055), scale=2.5, planks=6),
        wooddark=M_wood('wooddark', (.03, .02, .012), (.08, .05, .03), scale=3),
        shingle=M_shingle('shingle', (.05, .045, .04), (.09, .08, .07)),
        trim=M_flat('trim', (.7, .67, .6), .6),
        iron=M_metal('iron', (.05, .05, .055), .5),
        window=M_flat('window', (.05, .045, .04), .15, emis=(1, .6, .25), es=0.),
        glass=M_flat('glass', (.03, .035, .04), .05, .2),
        cloth=M_cloth('awning', (.35, .05, .04)),
    )

def win(bm_frame, bm_glass, c, w, h, face_y, sh=None, bm_sh=None, mull=True):
    """window on a wall whose outward normal is -Y (face_y is the wall surface y)."""
    y = face_y
    box(bm_glass, V(c.x, y - .01, c.z), (w, .04, h))
    for dz in (h / 2 + .05, -h / 2 - .06): box(bm_frame, V(c.x, y - .05, c.z + dz), (w + .22, .12, .1 if dz > 0 else .14))
    for dx in (-w / 2 - .05, w / 2 + .05): box(bm_frame, V(c.x + dx, y - .05, c.z), (.1, .1, h + .1))
    if mull:
        box(bm_frame, V(c.x, y - .04, c.z), (.04, .05, h)); box(bm_frame, V(c.x, y - .04, c.z + .05), (w, .05, .04))
    if bm_sh is not None:
        for dx in (-w / 2 - .32, w / 2 + .32):
            box(bm_sh, V(c.x + dx, y - .04, c.z), (.44, .05, h + .08))
            for k in range(6): box(bm_sh, V(c.x + dx, y - .075, c.z - h / 2 + .12 + k * (h - .2) / 5), (.38, .02, .03), (math.radians(25), 0, 0))

def gable_roof(bm, w, d, h, pitch, over=.45, thick=.16):
    half = d / 2; rise = half * math.tan(pitch); L = half / math.cos(pitch) + over
    for s in (-1, 1): box(bm, V(0, s * half / 2, h + rise / 2 + .08), (w + over * 2, L, thick), (s * pitch * -1 * -1 if False else -s * pitch, 0, 0))
    return rise

def house(name, w=6.5, d=5.5, h=3.4, pitch=.62, wall=(.75, .72, .66), shutter=(.1, .14, .12), door=(.3, .06, .05), porch=True, stories=1, wins=None, boarded=(), chimney=True, sign=None, store=False, M=None):
    M = M or mats(); objs = []
    fy = -d / 2; B0 = .5; H = h + B0
    sid = M_siding(name + '_siding', wall)
    objs.append(piece('found', M['stone'], lambda bm: box(bm, V(0, 0, B0 / 2), (w + .3, d + .3, B0))))
    objs.append(piece('walls', sid, lambda bm: box(bm, V(0, 0, B0 + h / 2), (w, d, h))))
    def gables(bm):
        half = d / 2; rise = half * math.tan(pitch)
        for sx in (-1, 1):
            vs = [bm.verts.new(V(sx * w / 2, -half, H)), bm.verts.new(V(sx * w / 2, half, H)), bm.verts.new(V(sx * w / 2, 0, H + rise))]
            f = bm.faces.new(vs if sx > 0 else vs[::-1])
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=.04)
    objs.append(piece('gables', sid, gables))
    def roof(bm):
        half = d / 2; rise = half * math.tan(pitch); L = half / math.cos(pitch) + .5
        for s in (-1, 1): box(bm, V(0, s * (half / 2 + .14), H + rise / 2 - .02), (w + .9, L, .16), (-s * pitch, 0, 0))
    objs.append(piece('roof', M['shingle'], roof))
    def trimf(bm):
        half = d / 2; rise = half * math.tan(pitch); L = half / math.cos(pitch) + .5
        for sx in (-1, 1):
            for sy in (-1, 1): box(bm, V(sx * w / 2, sy * d / 2, B0 + h / 2), (.18, .18, h))
            for s in (-1, 1): box(bm, V(sx * (w / 2 + .44), s * (half / 2 + .14), H + rise / 2 - .06), (.08, L, .26), (-s * pitch, 0, 0))
        for sy in (-1, 1): box(bm, V(0, sy * (d / 2 + .02), H - .12), (w + .14, .08, .24))
        box(bm, V(0, 0, H + rise + .1), (w + .92, .18, .12))
        # door frame
        box(bm, V(0, fy - .06, B0 + 2.32), (1.4, .14, .18));
        for sx in (-.6, .6): box(bm, V(sx, fy - .06, B0 + 1.15), (.14, .14, 2.3))
    objs.append(piece('trim', M['trim'], trimf))
    dm = M_wood(name + '_door', tuple(c * .5 for c in door), door, scale=4, planks=0)
    def doorf(bm):
        box(bm, V(0, fy - .03, B0 + 1.1), (1.05, .08, 2.2))
        for px, pz in ((-.24, .5), (.24, .5), (-.24, -.45), (.24, -.45)): box(bm, V(px, fy - .075, B0 + 1.1 + pz), (.34, .03, .76))
    objs.append(piece('door', dm, doorf))
    objs.append(piece('knob', M['iron'], lambda bm: sphere(bm, V(.38, fy - .11, B0 + 1.05), .045, 10, 6)))
    bmF, bmG, bmW, bmS = bmesh.new(), bmesh.new(), bmesh.new(), bmesh.new()
    wins = wins if wins is not None else [-w / 4 - .3, w / 4 + .3]
    rows = [B0 + 1.55] + ([B0 + h - 1.0] if stories > 1 else [])
    for ri, z in enumerate(rows):
        for i, x in enumerate(wins):
            if abs(x) < .9 and ri == 0: continue
            b = i in boarded
            win(bmF, bmG if b else bmW, V(x, 0, z), 1.0 if ri == 0 else .8, 1.25 if ri == 0 else .95, fy, bm_sh=bmS if ri == 0 else None)
            if b:
                for r in (.55, -.55): box(bmF, V(x, fy - .14, z), (1.3, .05, .16), (0, r, 0))
    # side windows
    for sx in (-1, 1):
        bm2f, bm2w = bmesh.new(), bmesh.new(); win(bm2f, bm2w, V(0, 0, B0 + 1.55), .8, 1.0, -w / 2, mull=True)
        rot = Matrix.Rotation(math.pi / 2 * (1 if sx > 0 else -1), 4, 'Z')
        for b_, dst in ((bm2f, bmF), (bm2w, bmW)):
            tmp = bpy.data.meshes.new('t'); b_.transform(rot); b_.to_mesh(tmp); b_.free(); dst.from_mesh(tmp); bpy.data.meshes.remove(tmp)
    for b_, nm, m in ((bmF, 'frames', M['trim']), (bmG, 'deadglass', M['glass']), (bmW, 'win', M['window']), (bmS, 'shutters', M_wood(name + '_shut', tuple(c * .5 for c in shutter), shutter, scale=5))):
        if len(b_.verts): o = obj_from_bm(b_, nm); o.data.materials.append(m); objs.append(o)
        else: b_.free()
    if chimney:
        half = d / 2; rise = half * math.tan(pitch)
        objs.append(piece('chim', M['brick'], lambda bm: (box(bm, V(w / 2 - 1.1, d / 4, H + rise * .5 + .6), (.75, .75, rise + 1.6)), box(bm, V(w / 2 - 1.1, d / 4, H + rise + 1.45), (.9, .9, .14)))))
    if porch:
        pw, pd = w * .8, 1.8
        def deck(bm):
            for k in range(int(pw / .16)): box(bm, V(-pw / 2 + .08 + k * .16, fy - pd / 2, B0 - .06), (.145, pd, .06))
            for s in range(2): box(bm, V(0, fy - pd - .15 - s * .3, .12 + s * .16), (1.6, .32, .14))
        objs.append(piece('deck', M['wood'], deck))
        def posts(bm):
            for sx in (-1, 1):
                cyl(bm, V(sx * (pw / 2 - .1), fy - pd + .1, B0 + 1.2), .07, 2.4, 12)
                box(bm, V(sx * (pw / 2 - .1), fy - pd + .1, B0 + .06), (.2, .2, .12))
                rl = pw / 2 - .85
                box(bm, V(sx * (pw / 2 - .1 - rl / 2), fy - pd + .1, B0 + .88), (rl, .07, .07)); box(bm, V(sx * (pw / 2 - .1 - rl / 2), fy - pd + .1, B0 + .12), (rl, .06, .05))
                for k in range(int(rl / .14)): box(bm, V(sx * (pw / 2 - .2 - k * .14), fy - pd + .1, B0 + .5), (.04, .04, .74))
        objs.append(piece('posts', M['trim'], posts))
        objs.append(piece('proof', M['shingle'], lambda bm: box(bm, V(0, fy - pd / 2 - .05, B0 + 2.5), (pw + .4, pd + .4, .1), (-.2, 0, 0))))
    if store:
        objs.append(piece('awn', M['cloth'], lambda bm: box(bm, V(0, fy - .9, B0 + 2.75), (w * .9, 1.6, .04), (-.42, 0, 0))))
    return objs

def cabin(M):
    o = house('cabin_x', w=6.4, d=5.2, h=3.0, wall=(.28, .18, .1), shutter=(.2, .1, .06), door=(.18, .1, .05), wins=[-2.05, 2.05], M=M)
    return o

def church(M):
    objs = []; w, d, h = 7, 11, 5.6
    objs.append(piece('nave', M['stone'], lambda bm: (box(bm, V(0, 0, h / 2), (w, d, h)), box(bm, V(0, 0, .2), (w + .4, d + .4, .4)))))
    def but(bm):
        for sx in (-1, 1):
            for y in (-4, -1.5, 1, 3.5): box(bm, V(sx * (w / 2 + .25), y, 2), (.5, .6, 4)); box(bm, V(sx * (w / 2 + .12), y, 4.3), (.45, .6, .9), (0, sx * .4, 0))
    objs.append(piece('but', M['stone'], but))
    def roof(bm):
        half = w / 2; pitch = .95; rise = half * math.tan(pitch); L = half / math.cos(pitch) + .45
        for s in (-1, 1): box(bm, V(s * (half / 2 + .12), 0, h + rise / 2), (L, d + .6, .18), (0, s * pitch, 0))
        for sy in (-1, 1):
            vs = [bm.verts.new(V(-half, sy * d / 2, h)), bm.verts.new(V(half, sy * d / 2, h)), bm.verts.new(V(0, sy * d / 2, h + rise))]
    objs.append(piece('roof', M['shingle'], roof))
    def gab(bm):
        half = w / 2; rise = half * math.tan(.95)
        for sy in (-1, 1):
            vs = [bm.verts.new(V(-half, sy * d / 2, h)), bm.verts.new(V(half, sy * d / 2, h)), bm.verts.new(V(0, sy * d / 2, h + rise))]
            bm.faces.new(vs if sy < 0 else vs[::-1])
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=.3)
    objs.append(piece('gab', M['stone'], gab))
    # tower at the front (-Y)
    def tower(bm):
        box(bm, V(0, -d / 2 - 1.5, 5.2), (3.2, 3.2, 10.4)); box(bm, V(0, -d / 2 - 1.5, 12.6), (3.5, 3.5, .3)); box(bm, V(0, -d / 2 - 1.5, 10.5), (3.4, 3.4, .25))
        for sx in (-1.4, 1.4):
            for sy in (-1.4, 1.4): box(bm, V(sx, -d / 2 - 1.5 + sy, 11.5), (.4, .4, 2.0))
    objs.append(piece('tower', M['stone'], tower))
    objs.append(piece('spire', M['shingle'], lambda bm: cyl(bm, V(0, -d / 2 - 1.5, 15.1), 2.5, 4.6, 4, (0, 0, math.pi / 4), r2=.02)))
    objs.append(piece('door', M['wooddark'], lambda bm: (box(bm, V(0, -d / 2 - 3.12, 1.4), (1.7, .1, 2.8)))))
    def arch(bm):
        for k in range(14):
            a = math.pi * k / 13; box(bm, V(math.cos(a) * .95, -d / 2 - 3.15, 2.8 + math.sin(a) * .95), (.22, .22, .22))
        for sx in (-.95, .95): box(bm, V(sx, -d / 2 - 3.15, 1.4), (.24, .24, 2.8))
        for k in range(3): box(bm, V(0, -d / 2 - 3.45 - k * .35, .1 + k * .16 - .16 * 2 + .32), (3.2 - k * .3, .4, .16))
    objs.append(piece('arch', M['stone'], arch))
    st = M_flat('stained', (.25, .03, .02), .2, emis=(1, .25, .1), es=0.); st.name = 'window'
    def sw(bm):
        for sx in (-1, 1):
            for y in (-2.8, -.25, 2.3): box(bm, V(sx * (w / 2 + .01), y, 3), (.06, .9, 2.2))
        cyl(bm, V(0, -d / 2 - 3.12, 7.3), .65, .08, 20, (math.pi / 2, 0, 0))
    objs.append(piece('stained', st, sw))
    def bell(bm):
        prof = [(.0, 0), (.3, 0), (.32, -.2), (.42, -.65), (.62, -1.0), (.65, -1.1)]
        for i in range(len(prof) - 1): cyl(bm, V(0, -d / 2 - 1.5, 12.0 + (prof[i][1] + prof[i + 1][1]) / 2), prof[i][0] + .01, prof[i][1] - prof[i + 1][1], 18, r2=prof[i + 1][0])
    o = piece('bell', M_metal('bronze', (.25, .17, .07), .6), bell); o.name = 'bell'
    objs.append(o)
    return objs

def garage(M):
    o = house('garage_x', w=9, d=7, h=4.4, pitch=.35, wall=(.5, .49, .45), porch=False, wins=[3.2], chimney=False, M=M)
    o.append(piece('gdoor', M_metal('gdoor', (.18, .17, .15), .7), lambda bm: [box(bm, V(-1.6, -3.56, .5 + .25 + k * .5), (4.2, .08, .48)) for k in range(6)]))
    return o

def gas_pump(M):
    objs = []
    objs.append(piece('canopy', M_flat('canw', (.6, .58, .52), .7), lambda bm: (box(bm, V(0, 0, 3.7), (5, 3.6, .3)), [cyl(bm, V(sx, sy, 1.8), .1, 3.6, 12) for sx in (-2, 2) for sy in (-1.4, 1.4)])))
    objs.append(piece('band', M_flat('canr', (.3, .04, .03), .5), lambda bm: box(bm, V(0, 0, 3.5), (5.05, 3.65, .16))))
    objs.append(piece('pump', M_metal('pumpm', (.32, .06, .04), .55), lambda bm: (box(bm, V(0, 0, .75), (.62, .46, 1.3)), sphere(bm, V(0, 0, 1.62), .24, 18, 10, (1, 1, .6)))))
    objs.append(piece('pg', M['window'], lambda bm: box(bm, V(0, -.24, 1.1), (.4, .02, .28))))
    objs.append(piece('island', M['stone'], lambda bm: box(bm, V(0, 0, .1), (1, .7, .2))))
    objs.append(piece('hose', M_flat('hose', (.02, .02, .02), .6), lambda bm: tube(bm, [V(.32, 0, 1.2), V(.45, -.1, .9), V(.4, -.2, .5), V(.33, -.25, .75)], .025, .025, 8)))
    return objs

def phone_booth(M):
    fr = M_metal('booth', (.06, .1, .16), .3); objs = []
    objs.append(piece('frame', fr, lambda bm: ([box(bm, V(sx, sy, 1.15), (.07, .07, 2.3)) for sx in (-.5, .5) for sy in (-.5, .5)], box(bm, V(0, 0, 2.36), (1.12, 1.12, .16)), box(bm, V(0, 0, .04), (1.1, 1.1, .08)))))
    objs.append(piece('glass', M['glass'], lambda bm: [box(bm, c, s) for c, s in ((V(0, .5, 1.25), (.95, .02, 1.9)), (V(-.5, 0, 1.25), (.02, .95, 1.9)), (V(.5, 0, 1.25), (.02, .95, 1.9)))]))
    objs.append(piece('phone', M_flat('phonebox', (.02, .02, .02), .4), lambda bm: (box(bm, V(0, .42, 1.4), (.25, .1, .4)), box(bm, V(.12, .34, 1.48), (.05, .05, .2)))))
    lt = M_flat('window', (.7, .75, .8), .3, emis=(.8, .9, 1), es=0.)
    objs.append(piece('sign', lt, lambda bm: box(bm, V(0, -.56, 2.25), (.6, .03, .1))))
    return objs

def well(M):
    objs = []
    def ring(bm):
        for i in range(22):
            a = i / 22 * math.tau
            for lay in range(4): box(bm, V(math.cos(a + lay * .14) * 1.05, math.sin(a + lay * .14) * 1.05, .12 + lay * .23), (.34, .3, .22), (0, 0, a + lay * .14))
    objs.append(piece('ring', M['stone'], ring))
    objs.append(piece('water', M_flat('water', (.01, .02, .025), .05, .3), lambda bm: cyl(bm, V(0, 0, .45), .9, .02, 24)))
    objs.append(piece('frame', M['wooddark'], lambda bm: ([box(bm, V(sx * 1.05, 0, 1.2), (.14, .14, 2.4)) for sx in (-1, 1)], cyl(bm, V(0, 0, 1.9), .06, 2.2, 10, (0, math.pi / 2, 0)))))
    objs.append(piece('wroof', M['shingle'], lambda bm: [box(bm, V(0, s * .45, 2.5), (2.8, 1.15, .08), (-s * .6, 0, 0)) for s in (-1, 1)]))
    objs.append(piece('bucket', M_wood('bucket', (.08, .05, .03), (.18, .11, .06), 6), lambda bm: (cyl(bm, V(0, 0, 1.05), .17, .26, 14, r2=.13), tube(bm, [V(0, 0, 1.18), V(0, 0, 1.85)], .01, .01, 4))))
    return objs

def ship_bin(M):
    return [piece('bin', M['wood'], lambda bm: (box(bm, V(0, 0, .4), (1.4, .9, .8)), box(bm, V(0, .2, .88), (1.5, 1.0, .08), (.45, 0, 0)))),
            piece('band', M['iron'], lambda bm: [box(bm, V(0, -.46, z), (1.45, .02, .06)) for z in (.15, .65)])]

def lamp_post(M):
    return [piece('pole', M['iron'], lambda bm: (cyl(bm, V(0, 0, 1.6), .06, 3.2, 10, r2=.045), box(bm, V(.28, 0, 3.12), (.6, .05, .05)), cyl(bm, V(0, 0, .15), .12, .3, 10))),
            piece('cage', M['iron'], lambda bm: (box(bm, V(.55, 0, 3.02), (.28, .28, .04)), box(bm, V(.55, 0, 2.7), (.24, .24, .04)), cyl(bm, V(.55, 0, 3.1), .16, .12, 4, (0, 0, math.pi / 4), r2=.02))),
            piece('glass', M['window'], lambda bm: box(bm, V(.55, 0, 2.86), (.2, .2, .3)))]

def gravestone(M, k):
    def g(bm):
        if k == 0: box(bm, V(0, 0, .45), (.7, .16, .9)); cyl(bm, V(0, 0, .9), .35, .16, 16, (math.pi / 2, 0, 0))
        elif k == 1: box(bm, V(0, 0, .6), (.16, .16, 1.2)); box(bm, V(0, 0, .85), (.7, .16, .16))
        else: box(bm, V(0, 0, .35), (.9, .2, .7), (0, .08, 0))
        sphere(bm, V(0, .8, -.05), .5, 12, 6, (.8, 1.6, .25))
    return [piece('grave', M['stone'], g)]

def altar(M):
    rune = M_noise('runestone', (.06, .06, .055), (.16, .15, .14), scale=4, rough=.9, bumps=.8)
    objs = [piece('stone', rune, lambda bm: box(bm, V(0, .5, 1.2), (.9, .45, 2.4), (0, .05, 0))),
            piece('slab', M['stone'], lambda bm: box(bm, V(0, -.35, .25), (1.3, .85, .5))),
            piece('ring', M['stone'], lambda bm: [sphere(bm, V(math.cos(a) * 2.2, math.sin(a) * 2.2, .08), .26, 8, 6, (1, 1, .7)) for a in [i / 7 * math.tau for i in range(7)]]),
            piece('candle', M_flat('wax', (.6, .56, .48), .5), lambda bm: cyl(bm, V(0, -.35, .66), .075, .32, 12))]
    rg = M_flat('window', (.03, .02, .01), .8, emis=(1, .45, .15), es=0.)
    objs.append(piece('runes', rg, lambda bm: [box(bm, V(0, .27, z), (w_, .02, .07), (0, r, 0)) for z, w_, r in ((1.9, .45, 0), (1.55, .06, 0), (1.3, .5, .7), (1.3, .5, -.7), (.95, .4, 0))]))
    return objs

def scarecrow(M):
    burl = M_cloth('sackcloth', (.3, .22, .12), 70, .5); coat = M_cloth('scoat', (.04, .035, .03), 50, .6); straw = M_wood('straw', (.15, .1, .04), (.4, .3, .14), 30)
    objs = [piece('post', M['wooddark'], lambda bm: (cyl(bm, V(0, 0, 1.3), .07, 2.6, 8), cyl(bm, V(0, 0, 1.95), .05, 2.0, 8, (0, math.pi / 2, 0)))),
            piece('coat', coat, lambda bm: (cyl(bm, V(0, 0, 1.55), .5, 1.1, 14, r2=.32), [cyl(bm, V(sx * .55, 0, 1.92), .16, .8, 10, (0, math.pi / 2, 0), r2=.12) for sx in (-1, 1)])),
            piece('straws', straw, lambda bm: [cone(bm, V(sx * .95, 0, 1.92), V(sx * (1.2 + random.random() * .15), random.uniform(-.1, .1), 1.92 + random.uniform(-.15, .1)), .03, 4) for sx in (-1, 1) for k in range(6)]),
            piece('head', burl, lambda bm: sphere(bm, V(0, 0, 2.45), .27, 20, 14, (1, 1, 1.18))),
            piece('hat', straw, lambda bm: (cyl(bm, V(0, 0, 2.7), .5, .03, 22), cyl(bm, V(0, 0, 2.88), .21, .36, 14, r2=.05)))]
    return objs

def fence(M):
    def f(bm):
        for x in (0, 2): box(bm, V(x, 0, .55), (.16, .16, 1.1), (random.uniform(-.06, .06), random.uniform(-.06, .06), 0))
        for z in (.4, .8): box(bm, V(1, 0, z), (2.1, .06, .1), (0, random.uniform(-.04, .04), 0))
    return [piece('fence', M['wood'], f)]

def picket(M):
    m = M_flat('picket', (.62, .6, .54), .7)
    def f(bm):
        for k in range(10):
            x = k * .2; box(bm, V(x, 0, .42), (.09, .025, .84)); cone(bm, V(x, 0, .84), V(x, 0, .94), .065, 4)
        for z in (.25, .62): box(bm, V(.9, .03, z), (2, .03, .06))
    return [piece('picket', m, f)]

def car(M, wreck=False):
    paint = M_metal('paint', (.32, .05, .04), .25 if not wreck else .7); P(paint.node_tree).inputs['Roughness'].default_value = .3; P(paint.node_tree).inputs['Metallic'].default_value = .55
    chrome = M_flat('chrome', (.7, .7, .72), .15, .95); rubber = M_flat('rubber', (.02, .02, .02), .85); inner = M_cloth('seat', (.08, .06, .05), 60, .4)
    objs = []
    def body(bm):
        prof = [(-2.2, .32), (-2.28, .7), (-2.0, .86), (-1.2, .93), (-1.12, .6), (1.0, .6), (1.06, .97), (2.08, .86), (2.28, .62), (2.24, .32)]
        for side in (-1, 1): pass
        vs0 = [bm.verts.new(V(-.82, -x, z)) for x, z in prof]; vs1 = [bm.verts.new(V(.82, -x, z)) for x, z in prof]
        bm.faces.new(vs0[::-1]); bm.faces.new(vs1)
        n = len(prof)
        for i in range(n): bm.faces.new((vs0[i], vs0[(i + 1) % n], vs1[(i + 1) % n], vs1[i]))
        for sx in (-1, 1): box(bm, V(sx * .82, .06, .78), (.08, 2.2, .36))
        box(bm, V(0, 1.15, .78), (1.62, .06, .36))
        box(bm, V(0, -.2, 1.42), (1.5, 1.32, .06))
    o = piece('body', paint, body); bevel_obj(o, .04, 3); objs.append(o)
    def pillars(bm):
        for sx in (-.74, .74):
            box(bm, V(sx, -.72, 1.18), (.06, .08, .62), (-.92, 0, 0)); box(bm, V(sx, 1.0, 1.15), (.06, .08, .5), (.62, 0, 0)); box(bm, V(sx, .2, 1.17), (.06, .07, .48))
    objs.append(piece('pillars', paint, pillars))
    def glassf(bm):
        box(bm, V(0, -.73, 1.17), (1.45, .02, .62), (-.92, 0, 0)); box(bm, V(0, .99, 1.15), (1.45, .02, .52), (.62, 0, 0))
        for sx in (-.75, .75): box(bm, V(sx, .15, 1.16), (.02, 1.7, .4))
    g = M['glass'] if not wreck else M_flat('glass_broken', (.05, .06, .07), .3, .3); objs.append(piece('glass', g, glassf))
    objs.append(piece('trim', chrome, lambda bm: (box(bm, V(0, -2.33, .42), (1.84, .07, .07)), box(bm, V(0, 2.36, .42), (1.84, .07, .07)), box(bm, V(0, -2.34, .62), (1.1, .03, .18)))))
    hl = M_flat('window', (.9, .88, .8), .1, emis=(1, .95, .8), es=0.); hl.name = 'headlight'
    objs.append(piece('lights', hl, lambda bm: [box(bm, V(sx, -2.31, .64), (.34, .06, .14)) for sx in (-.55, .55)]))
    tlm = M_flat('taillight', (.3, .02, .01), .2, emis=(1, .05, .02), es=0.)
    objs.append(piece('tails', tlm, lambda bm: [box(bm, V(sx, 2.36, .7), (.3, .06, .12)) for sx in (-.55, .55)]))
    def interior(bm):
        for sx in (-.38, .38): box(bm, V(sx, .35, .66), (.5, .5, .12)); box(bm, V(sx, .62, .95), (.5, .12, .6), (-.15, 0, 0))
        box(bm, V(0, 1.25, .66), (1.4, .5, .12)); box(bm, V(0, 1.5, .95), (1.4, .12, .55))
        box(bm, V(0, -.87, .78), (1.62, .32, .36)); box(bm, V(0, -.7, .95), (1.6, .12, .04))
    objs.append(piece('interior', inner, interior))
    def wheelset(bm):
        cyl(bm, V(-.38, -.6, .92), .035, .3, 8, (math.radians(65), 0, 0))
    objs.append(piece('column', rubber, wheelset))
    for nm, x, y in (('wheel_FL', -.83, -1.38), ('wheel_FR', .83, -1.38), ('wheel_RL', -.83, 1.36), ('wheel_RR', .83, 1.36)):
        t = piece(nm + '_t', rubber, lambda bm: cyl(bm, V(0, 0, 0), .37, .26, 24, (0, math.pi / 2, 0)))
        h = piece(nm + '_h', chrome, lambda bm: cyl(bm, V(0, 0, 0), .21, .27, 16, (0, math.pi / 2, 0)))
        w_ = join([t, h], nm); w_.location = (x, y, .37); objs.append(w_)
    sw = piece('steer_r', rubber, lambda bm: bmesh.ops.create_circle(bm, cap_ends=False, radius=.17, segments=24))
    activate(sw); bpy.ops.object.convert(target='CURVE'); sw.data.bevel_depth = .02; bpy.ops.object.convert(target='MESH'); sw.rotation_euler = (math.radians(-25) + math.pi / 2, 0, 0); sw.location = (-.38, -.62, 1.0); sw.name = 'steering'
    objs.append(sw)
    if wreck:
        bd = objs[0]
        for v in bd.data.vertices:
            if v.co.y < -1.6: v.co.z -= .15 * random.random(); v.co.y += .25 * random.random(); v.co.x *= .95
    return objs

def finish_multi(name, objs, keep=(), shots=None):
    """bake the static parts into one mesh; keep named movable parts (wheels, steering) as separate nodes"""
    movers = [o for o in objs if o.name.split('.')[0] in keep]
    static = [o for o in objs if o not in movers]
    base = join(static, name); activate(base)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    bake_atlas(base, name, RES)
    for m in movers:
        bake_atlas(m, m.name, 256); m.parent = base
    if PREV and shots: preview(f'{PREV}/{name}', [base], shots)
    export([base] + movers, f'{OUT}/{name}.glb')
    for o in [base] + movers: bpy.data.objects.remove(o)

ASSETS = {
    'cabin': lambda M: finish('cabin', cabin(M), shots=[((7, -10, 4), (0, 0, 2))]),
    'house_a': lambda M: finish('house_a', house('house_a', w=6.5, d=5.5, h=4.0, wall=(.55, .42, .18), stories=2, M=M), shots=[((7, -10, 4), (0, 0, 2.5))]),
    'house_b': lambda M: finish('house_b', house('house_b', w=6, d=5.5, h=3.4, wall=(.32, .36, .3), shutter=(.4, .38, .33), M=M), shots=[((7, -10, 4), (0, 0, 2))]),
    'house_c': lambda M: finish('house_c', house('house_c', w=6.5, d=5, h=3.6, wall=(.3, .1, .07), shutter=(.08, .08, .08), porch=False, boarded=(0,), M=M)),
    'house_d': lambda M: finish('house_d', house('house_d', w=8, d=6, h=4.2, wall=(.36, .38, .4), stories=2, boarded=(0, 1), M=M)),
    'store': lambda M: finish('store', house('store', w=7.5, d=6, h=3.9, wall=(.32, .08, .05), shutter=(.05, .05, .05), wins=[-2.4, 2.4], store=True, M=M), shots=[((7, -10, 4), (0, 0, 2))]),
    'church': lambda M: finish('church', church(M), res=2048, shots=[((14, -22, 8), (0, -2, 6))]),
    'garage': lambda M: finish('garage', garage(M)),
    'gas_pump': lambda M: finish('gas_pump', gas_pump(M), res=512),
    'phone_booth': lambda M: finish('phone_booth', phone_booth(M), res=512),
    'well': lambda M: finish('well', well(M), res=512, shots=[((3, -4, 2.5), (0, 0, 1))]),
    'ship_bin': lambda M: finish('ship_bin', ship_bin(M), res=256),
    'lamp_post': lambda M: finish('lamp_post', lamp_post(M), res=256),
    'grave_0': lambda M: finish('grave_0', gravestone(M, 0), res=256), 'grave_1': lambda M: finish('grave_1', gravestone(M, 1), res=256), 'grave_2': lambda M: finish('grave_2', gravestone(M, 2), res=256),
    'altar': lambda M: finish('altar', altar(M), res=512),
    'scarecrow': lambda M: finish_multi('scarecrow', scarecrow(M), keep=('head',)),
    'fence': lambda M: finish('fence', fence(M), res=256), 'picket': lambda M: finish('picket', picket(M), res=256),
    'car': lambda M: finish_multi('car', car(M), keep=('wheel_FL', 'wheel_FR', 'wheel_RL', 'wheel_RR', 'steering'), shots=[((4, -6, 2.5), (0, 0, .8)), ((-.36, .3, 1.24), (-.3, -3, 1.0))]),
    'car_wreck': lambda M: finish_multi('car_wreck', car(M, True), keep=('wheel_FL', 'wheel_FR', 'wheel_RL', 'wheel_RR', 'steering')),
}
reset(3)
for name, fn in ASSETS.items():
    if ONLY and name not in ONLY: continue
    M = mats(); fn(M)
    for m in list(bpy.data.materials):
        if m.users == 0: bpy.data.materials.remove(m)
    for im in list(bpy.data.images):
        if im.users == 0: bpy.data.images.remove(im)
