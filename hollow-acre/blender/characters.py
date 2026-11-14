import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
import bpy, bmesh
OUT = os.environ.get('OUT', '/tmp/assets'); os.makedirs(OUT, exist_ok=True)
PREV = os.environ.get('PREV', '')
ONLY = os.environ.get('ONLY', '').split(',') if os.environ.get('ONLY') else None
RES = int(os.environ.get('RES', '1024'))
reset(21)
UPR = V(0, -1, 0); SIDE = V(0, 0, 1)

def skin_mat(name, c):
    def ex(N, L, co, col):
        v = node(N, 'ShaderNodeTexVoronoi', Scale=60.); L.new(co, v.inputs['Vector'])
        r = ramp(N, L, v.outputs['Distance'], [(0, (.9, .86, .84)), (1, (1, 1, 1))]); return mix(N, L, col, r.outputs[0])
    return M_noise(name, tuple(x * .85 for x in c), c, tuple(min(1, x * 1.08) for x in c), scale=9, rough=.55, bumps=.08, extra=ex)

def person(key, o):
    """o: dict(look). Returns (rig, mesh)."""
    S = o.get('height', 1.0) * (.62 if o.get('kid') else 1.0); HK = 1.15 if o.get('kid') else 1.0; bw = o.get('build', 1.0)
    def P_(x, y, z): return V(x * bw, y, z) * S
    J = dict(pelvis=P_(0, .0, .95), spine1=P_(0, .01, 1.1), spine2=P_(0, .02, 1.26), chest=P_(0, .01, 1.42), neck=P_(0, -.01, 1.52), head=P_(0, -.02, 1.6), headtop=P_(0, -.02, 1.6) + V(0, 0, .25 * HK * S))
    for s, sx in (('L', 1), ('R', -1)):
        J['thigh' + s] = P_(.09 * sx, 0, .93); J['knee' + s] = P_(.1 * sx, -.02, .5); J['ankle' + s] = P_(.1 * sx, .02, .08); J['toe' + s] = P_(.1 * sx, -.13, .02)
        J['shoulder' + s] = P_(.19 * sx, .02, 1.43); J['elbow' + s] = P_(.22 * sx, .04, 1.14); J['wrist' + s] = P_(.245 * sx, .0, .88); J['palm' + s] = P_(.25 * sx, -.005, .8); J['ftip' + s] = P_(.252 * sx, -.02, .72)
    bones = [('pelvis', J['pelvis'], J['spine1'], None, UPR), ('spine1', J['spine1'], J['spine2'], 'pelvis', UPR), ('spine2', J['spine2'], J['chest'], 'spine1', UPR), ('chest', J['chest'], J['neck'], 'spine2', UPR),
             ('neck', J['neck'], J['head'], 'chest', UPR), ('head', J['head'], J['headtop'], 'neck', UPR)]
    for s in 'LR':
        bones += [('thigh' + s, J['thigh' + s], J['knee' + s], 'pelvis', UPR), ('shin' + s, J['knee' + s], J['ankle' + s], 'thigh' + s, UPR), ('foot' + s, J['ankle' + s], J['toe' + s], 'shin' + s, SIDE),
                  ('upperarm' + s, J['shoulder' + s], J['elbow' + s], 'chest', UPR), ('forearm' + s, J['elbow' + s], J['wrist' + s], 'upperarm' + s, UPR), ('hand' + s, J['wrist' + s], J['palm' + s], 'forearm' + s, UPR),
                  ('fingers' + s, J['palm' + s], J['ftip' + s], 'hand' + s, UPR)]
    rig = make_rig(key + '_rig', bones)
    # ---- body through the skin modifier
    bm = bmesh.new(); sk = []
    def vt(p, rx, ry=None):
        v = bm.verts.new(p); sk.append((rx * S, (ry if ry is not None else rx) * S)); return v
    def ch(pts):
        vs = [vt(*p) for p in pts]
        for a, b in zip(vs, vs[1:]): bm.edges.new((a, b))
        return vs
    wide = o.get('wide', 1.0)
    torso = ch([(P_(0, 0, .86), .12 * wide, .09), (P_(0, 0, .97), .155 * wide, .11), (P_(0, .01, 1.1), .14 * wide, .1), (P_(0, .015, 1.26), .15 * wide, .105), (P_(0, .01, 1.4), .175 * wide, .11),
                (P_(0, .0, 1.48), .13, .08), (P_(0, -.005, 1.53), .055, .055), (P_(0, -.01, 1.58), .05, .05)])
    for s, sx in (('L', 1), ('R', -1)):
        leg = ch([(P_(.09 * sx, 0, .9), .085), (P_(.095 * sx, -.01, .7), .072), (P_(.1 * sx, -.02, .5), .056), (P_(.1 * sx, 0, .3), .05), (P_(.1 * sx, .02, .1), .04), (P_(.1 * sx, -.03, .045), .05, .04), (P_(.1 * sx, -.13, .03), .045, .03)])
        bm.edges.new((torso[1], leg[0]))
        arm = ch([(P_(.18 * sx, .02, 1.42), .06), (P_(.2 * sx, .03, 1.28), .05), (P_(.22 * sx, .04, 1.14), .042), (P_(.235 * sx, .02, 1.0), .038), (P_(.245 * sx, .0, .88), .03, .026),
                  (P_(.25 * sx, -.005, .81), .04, .016), (P_(.252 * sx, -.02, .73), .035, .013)])
        bm.edges.new((torso[4], arm[0]))
    me = bpy.data.meshes.new(key); bm.to_mesh(me); bm.free(); body = bpy.data.objects.new(key, me); bpy.context.scene.collection.objects.link(body)
    m = body.modifiers.new('skin', 'SKIN'); m.branch_smoothing = .6
    for (rx, ry), sv in zip(sk, body.data.skin_vertices[0].data): sv.radius = (rx, ry)
    body.data.skin_vertices[0].data[0].use_root = True
    apply_mods(body); m = body.modifiers.new('sub', 'SUBSURF'); m.levels = 2; apply_mods(body)
    # ---- materials by region
    skinM = skin_mat(key + '_skin', o['skin']); shirtM = M_cloth(key + '_shirt', o.get('shirt', o.get('dress', (.3, .1, .08)))); pantsM = M_cloth(key + '_pants', o.get('pants', o.get('dress', (.1, .12, .2))), 70, .3)
    bootM = M_noise(key + '_boot', (.02, .015, .01), (.06, .04, .025), scale=20, rough=.5, bumps=.2)
    for mm in (skinM, shirtM, pantsM, bootM): body.data.materials.append(mm)
    for f in body.data.polygons:
        c = f.center / S; z = c.z; ax = abs(c.x) / bw
        if z < .09: f.material_index = 3
        elif z < .96 and ax < .16: f.material_index = 2 if not o.get('dress') else (1 if z > .5 else 2)
        elif ax > .2 and z < .86: f.material_index = 0
        elif z > 1.5: f.material_index = 0
        else: f.material_index = 1
        if o.get('dress') and z < .55 and z > .09: f.material_index = 2
    if o.get('short_sleeves'):
        for f in body.data.polygons:
            c = f.center / S
            if abs(c.x) / bw > .2 and c.z < 1.25 and c.z > .86: f.material_index = 0
    parts = []
    def part(nm, mm, fn, bone):
        b = bmesh.new(); fn(b); ob = obj_from_bm(b, nm); ob.data.materials.append(mm); ob['bone'] = bone; parts.append(ob); return ob
    # ---- head: sculpted from a sphere
    HC = J['head'] + V(0, -.01, .11 * HK * S); R0 = .108 * HK * S
    def headf(b):
        res = bmesh.ops.create_uvsphere(b, u_segments=40, v_segments=28, radius=1)
        for v in res['verts']:
            x, y, z = v.co; k = 1.0
            if z < 0: k = 1 - min(.4, -z * .45)
            nx, ny, nz = x * .86 * k, y * (1 - .06 * (z < -.4)), z * 1.15
            f = -y
            if f > .6 and abs(x) < .16 and -.25 < z < .12: ny -= .11 * (1 - abs(x) / .16) ** .7 * max(0, 1 - abs(z + .08) / .2)
            if f > .55 and .14 < abs(x) < .45 and .02 < z < .3: ny += .05
            if f > .65 and abs(x) < .45 and .3 < z < .42: ny -= .04
            if f > .7 and abs(x) < .2 and -.45 < z < -.32: ny -= .03
            if z < -.55 and f > .4: ny -= .04
            v.co = V(nx, ny, nz) * R0 + HC
        for sx in (-1, 1): sphere(b, HC + V(sx * .86 * R0, .02 * R0, 0), .26 * R0, 10, 8, (.45, .8, 1.15))
    part('headm', skinM, headf, 'head')
    eyeW = M_flat(key + '_eye', (.42, .38, .34), .15); iris = M_flat(key + '_iris', o.get('eyec', (.08, .05, .03)), .1)
    for sx in (-1, 1):
        ec = HC + V(sx * .3 * R0, -.8 * R0, .14 * R0)
        part('eyeball', eyeW if not o.get('ghost') else M_flat('void', (0, 0, 0), 1), lambda b: sphere(b, ec, .1 * R0, 12, 8, (1, .6, .8)), 'head')
        part('iris', iris if not o.get('ghost') else M_flat('void2', (0, 0, 0), 1), lambda b: sphere(b, ec + V(0, -.065 * R0, 0), .055 * R0, 10, 6, (1, .4, 1)), 'head')
    part('brows', hairM if False else M_flat(key + '_brow', tuple(x * .6 for x in o.get('hair', (.06, .04, .02))), .8), lambda b: [sphere(b, HC + V(sx * .3 * R0, -.86 * R0, .33 * R0), .16 * R0, 10, 6, (1.3, .3, .25)) for sx in (-1, 1)], 'head')
    lips = M_flat(key + '_lips', tuple(x * .7 for x in o['skin'][:1]) + (o['skin'][1] * .45, o['skin'][2] * .45), .5)
    part('lips', lips, lambda b: sphere(b, HC + V(0, -.9 * R0, -.38 * R0), .2 * R0, 12, 6, (1.2, .3, .35)), 'head')
    hairM = M_noise(key + '_hair', tuple(x * .6 for x in o.get('hair', (.06, .04, .02))), o.get('hair', (.06, .04, .02)), scale=60, rough=.6, bumps=.6, detail=4)
    hs = o.get('hairstyle', 'short')
    if hs != 'bald':
        def hairf(b):
            res = bmesh.ops.create_uvsphere(b, u_segments=32, v_segments=20, radius=1)
            kill = []
            for v in res['verts']:
                x, y, z = v.co
                keep = z > (-.15 if -y < .3 else .28) or (hs in ('long', 'cover') and -y < .35 and z > -.9) or (hs == 'cover')
                if not keep: kill.append(v)
                v.co = V(x * .92, y * 1.04, z * 1.18 + (.05 if z > .3 else 0)) * R0 * 1.07 + HC
            bmesh.ops.delete(b, geom=kill, context='VERTS')
            if hs == 'bun': sphere(b, HC + V(0, .7 * R0, .9 * R0), .4 * R0, 14, 10)
            bmesh.ops.solidify(b, geom=b.faces[:], thickness=.008)
        part('hair', hairM, hairf, 'head')
    if o.get('beard'):
        part('beard', M_noise(key + '_beard', (.04, .03, .02), o['beard'], scale=70, bumps=.6), lambda b: sphere(b, HC + V(0, -.62 * R0, -.6 * R0), .62 * R0, 16, 10, (1, .7, .7)), 'head')
    if o.get('mustache'):
        part('stache', M_flat(key + '_m', o['mustache'], .7), lambda b: sphere(b, HC + V(0, -.92 * R0, -.25 * R0), .22 * R0, 12, 6, (1.4, .35, .3)), 'head')
    hat = o.get('hat'); hc = o.get('hatc', (.2, .15, .1))
    if hat:
        hm = M_cloth(key + '_hat', hc, 60, .3) if hat not in ('straw',) else M_wood(key + '_hat', (.18, .13, .05), (.42, .33, .16), 30)
        top = HC + V(0, 0, 1.0 * R0)
        if hat in ('straw', 'black', 'sheriff'):
            def hf(b):
                cyl(b, top + V(0, 0, -.1 * R0), (1.95 if hat != 'black' else 1.75) * R0, .025, 30)
                cyl(b, top + V(0, 0, .28 * R0), .92 * R0, (.75 if hat != 'black' else 1.05) * R0, 22, r2=.85 * R0)
            part('hat', hm, hf, 'head')
            part('band', M_flat(key + '_band', (.12, .03, .02) if hat != 'black' else (.02, .02, .02), .6), lambda b: cyl(b, top + V(0, 0, .02 * R0), .95 * R0, .14 * R0, 22), 'head')
        elif hat == 'cap':
            def cf(b):
                res = bmesh.ops.create_uvsphere(b, u_segments=24, v_segments=12, radius=1)
                bmesh.ops.delete(b, geom=[v for v in res['verts'] if v.co.z < .05], context='VERTS')
                for v in b.verts: v.co = V(v.co.x, v.co.y, v.co.z * .8) * R0 * 1.12 + HC + V(0, 0, .2 * R0)
                box(b, HC + V(0, -1.2 * R0, .3 * R0), (1.2 * R0, .8 * R0, .03), (.2, 0, 0))
            part('hat', hm, cf, 'head')
        elif hat == 'bonnet':
            def bf(b):
                res = bmesh.ops.create_uvsphere(b, u_segments=24, v_segments=14, radius=1)
                bmesh.ops.delete(b, geom=[v for v in res['verts'] if v.co.y < -.55 or v.co.z < -.5], context='VERTS')
                for v in b.verts: v.co = v.co * R0 * 1.22 + HC + V(0, .1 * R0, .1 * R0)
                bmesh.ops.solidify(b, geom=b.faces[:], thickness=.01)
            part('hat', hm, bf, 'head')
    # ---- clothing pieces skinned to the body
    if o.get('dress'):
        dm = M_cloth(key + '_dress', o['dress'], 70, .35)
        def df(b):
            rings = []
            for i, (z, r) in enumerate(((1.0, .17), (.75, .24), (.5, .29), (.38 if not o.get('kid') else .45, .31))):
                rings.append([b.verts.new(P_(math.cos(a) * r, math.sin(a) * r * .85, z) / bw * 1) for a in [k / 28 * math.tau for k in range(28)]])
            for a, c in zip(rings, rings[1:]):
                for k in range(28): b.faces.new((a[k], a[(k + 1) % 28], c[(k + 1) % 28], c[k]))
            bmesh.ops.solidify(b, geom=b.faces[:], thickness=.008)
        part('dress', dm, df, 'auto')
    if o.get('coat'):
        cm = M_cloth(key + '_coat', o['coat'], 60, .3)
        def coatf(b):
            rings = []; gap = .5
            for z, r in ((1.47, .19), (1.25, .18), (1.0, .19), (.75, .23), (.55, .26)):
                rings.append([b.verts.new(P_(math.cos(a) * r, math.sin(a) * r * .7, z)) for a in [-math.pi / 2 + gap / 2 + k / 28 * (math.tau - gap) for k in range(29)]])
            for a, c in zip(rings, rings[1:]):
                for k in range(28): b.faces.new((a[k], a[k + 1], c[k + 1], c[k]))
            bmesh.ops.solidify(b, geom=b.faces[:], thickness=.01)
        part('coat', cm, coatf, 'auto')
    if o.get('overalls'):
        om = M_cloth(key + '_ov', o['overalls'], 70, .3)
        part('bib', om, lambda b: (box(b, P_(0, -.115, 1.2), (.24 * S, .02, .26 * S)), [box(b, P_(sx * .08, -.1, 1.38), (.04 * S, .02, .22 * S), (.2, 0, 0)) for sx in (-1, 1)]), 'spine2')
    if o.get('apron'):
        part('apron', M_cloth(key + '_ap', o['apron'], 80, .2), lambda b: box(b, P_(0, -.135, .85), (.3 * S, .01, .5 * S)), 'auto')
    if o.get('badge'):
        part('badge', M_flat(key + '_badge', (.6, .45, .1), .3, .8), lambda b: cyl(b, P_(-.07, -.13, 1.33), .025 * S, .01, 6, (math.pi / 2, 0, 0)), 'chest')
    part('belt', M_flat(key + '_belt', (.04, .025, .015), .5), lambda b: cyl(b, P_(0, 0, .97), .162 * S * wide, .04 * S, 24, r2=None), 'pelvis')
    # ---- weights, join, bake
    auto_weights(body, rig, [n for n in [b.name for b in rig.data.bones]])
    for p in parts:
        if p['bone'] == 'auto': auto_weights(p, rig, ['pelvis', 'spine1', 'spine2', 'chest', 'thighL', 'thighR', 'shinL', 'shinR'])
        else: rigid_weight(p, p['bone'])
    smooth(body)
    for p in parts: smooth(p)
    M = join([body] + parts, key)
    bake_atlas(M, key, RES if not o.get('kid') else RES // 2, rough=.75)
    if o.get('ghost'):
        for s in M.material_slots:
            if s.material: P(s.material.node_tree).inputs['Alpha'].default_value = .6
    bind(M, rig)
    hunch = o.get('hunch', 0)
    def idle(t, ph, R, PB):
        br = math.sin(ph * 2); R('spine1', x=hunch * .5); R('chest', x=.02 * br + hunch * .5); R('neck', x=.03 + .02 * math.sin(ph)); R('head', z=.12 * math.sin(ph), x=-.02)
        for s, sx in (('L', 1), ('R', -1)): R('upperarm' + s, x=.03 * math.sin(ph + sx), z=.06 * sx); R('forearm' + s, x=.18); R('fingers' + s, x=.3)
        PB['pelvis'].location = (0, .006 * br, 0)
    def walk(t, ph, R, PB):
        s, c = math.sin(ph), math.cos(ph)
        PB['pelvis'].location = (0, .025 * abs(c) - .012, 0); R('pelvis', y=.06 * s); R('spine1', x=.04 + hunch * .5, y=-.05 * s); R('chest', y=-.06 * s, x=hunch * .5); R('head', y=.05 * s)
        R('thighL', x=.5 * s); R('thighR', x=-.5 * s); R('shinL', x=-max(0, c) * .95 - .05); R('shinR', x=-max(0, -c) * .95 - .05); R('footL', z=.25 * max(0, -s)); R('footR', z=.25 * max(0, s))
        R('upperarmL', x=-.38 * s, z=.06); R('upperarmR', x=.38 * s, z=-.06); R('forearmL', x=.25 + .2 * max(0, -s)); R('forearmR', x=.25 + .2 * max(0, s)); R('fingersL', x=.35); R('fingersR', x=.35)
    def talk(t, ph, R, PB):
        idle(t, ph, R, PB); g = math.sin(ph * 2)
        R('upperarmR', x=.5 + .2 * g, z=-.15); R('forearmR', x=.9 + .25 * math.sin(ph * 3)); R('handR', x=-.3); R('head', x=.06 * math.sin(ph * 4), z=.1 * math.sin(ph))
    def stand(t, ph, R, PB):
        R('spine1', x=hunch * .5); R('head', x=.15, z=.35); R('neck', x=.1)
        for s, sx in (('L', 1), ('R', -1)): R('upperarm' + s, z=.02 * sx); R('fingers' + s, x=.1)
    clips(rig, [('idle', 4, idle), ('walk', 1.1, walk), ('talk', 3, talk), ('stand', 2, stand)])
    return rig, M

PEOPLE = {
    'mae': dict(skin=(.55, .37, .27), dress=(.18, .08, .2), apron=(.55, .5, .42), hair=(.35, .34, .32), hairstyle='bun', build=1.06, wide=1.1),
    'hale': dict(skin=(.5, .33, .25), shirt=(.02, .02, .025), pants=(.02, .02, .025), coat=(.015, .015, .02), hat='black', hatc=(.01, .01, .012), hair=(.5, .5, .5), height=1.06),
    'tobias': dict(skin=(.6, .42, .3), shirt=(.1, .2, .32), pants=(.18, .12, .07), hat='cap', hatc=(.35, .06, .04), hair=(.2, .12, .05), kid=True),
    'hollis': dict(skin=(.5, .33, .23), shirt=(.25, .25, .23), pants=(.1, .14, .1), overalls=(.1, .14, .1), hat='cap', hatc=(.25, .04, .03), hair=(.1, .08, .06), beard=(.12, .09, .07), build=1.15, wide=1.15),
    'agnes': dict(skin=(.58, .45, .38), dress=(.03, .025, .03), hair=(.7, .68, .64), hairstyle='bun', hunch=.35, build=.92),
    'dunn': dict(skin=(.48, .31, .22), shirt=(.35, .29, .18), pants=(.14, .1, .06), hat='sheriff', hatc=(.32, .24, .12), hair=(.06, .05, .04), mustache=(.06, .04, .03), badge=True, build=1.12, wide=1.12),
    'ruth': dict(skin=(.55, .55, .52), dress=(.7, .7, .66), hair=(.01, .01, .01), hairstyle='cover', kid=True, ghost=True),
    'farmer': dict(skin=(.55, .37, .26), shirt=(.25, .07, .05), coat=(.2, .14, .08), pants=(.1, .12, .18), hair=(.08, .05, .03)),
}
for key, o in PEOPLE.items():
    if ONLY and key not in ONLY: continue
    rig, M = person(key, o)
    if PREV:
        rig.animation_data.action = bpy.data.actions['idle']
        preview(f'{PREV}/{key}', [M], [((1.2, -3.2, 1.5), (0, 0, 1.0 if not o.get('kid') else .65)), ((.3, -.9, 1.65 if not o.get('kid') else 1.05), (0, 0, 1.62 if not o.get('kid') else 1.02))], res=(480, 640))
    export([rig, M], f'{OUT}/{key}.glb', anims=True)
    bpy.data.objects.remove(M); bpy.data.objects.remove(rig)
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
    for m in list(bpy.data.materials):
        if m.users == 0: bpy.data.materials.remove(m)
