# Arm building blocks for Blender (t353): hand+nails, ring, sleeve, armature, weights, grip pose, UV atlas.
import sys, os, math, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..'))
import bpy, bmesh
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree
import scene as S, hands
from hands import nrm, perp, sstep

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
def link(ob): bpy.context.scene.collection.objects.link(ob); return ob
def mesh_obj(name, V, F, smooth=True):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in V], [], [list(f) for f in F]); me.validate(); me.update()
    for p in me.polygons: p.use_smooth = smooth
    ob = link(bpy.data.objects.new(name, me))
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    return ob
def subdivided(ob, levels, name):
    if levels == 0:
        me = ob.data.copy(); me.name = name; return link(bpy.data.objects.new(name, me))
    mod = ob.modifiers.new('sub', 'SUBSURF'); mod.levels = levels; mod.render_levels = levels; mod.quality = 3
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); ob.modifiers.remove(mod)
    me.name = name; return link(bpy.data.objects.new(name, me))
def verts(ob): a = np.zeros(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get('co', a); return a.reshape(-1, 3)
def set_verts(ob, V): ob.data.vertices.foreach_set('co', np.asarray(V, float).ravel()); ob.data.update()
def vnormals(ob): a = np.zeros(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get('normal', a); return a.reshape(-1, 3)
def set_data(ob, rgba):
    """per-vertex data for the bake: (flush, crease, material id, 1)"""
    at = ob.data.color_attributes.new('data', 'FLOAT_COLOR', 'POINT'); at.data.foreach_set('color', np.asarray(rgba, np.float32).ravel())
    ob.data.color_attributes.active_color = at

def hand_and_nails(lvl, detail, suffix='', relief=1.0):
    # relief: how much of the skin detail goes into the geometry (the game mesh keeps a little and leaves the rest to the
    # normal map; fine wrinkles in a decimated mesh become dents that read as dark spots on the knuckles)
    H = S.H
    cage = mesh_obj('cage' + suffix, H['V'], H['F'])
    hand = subdivided(cage, lvl, 'hand' + suffix); bpy.data.objects.remove(cage, do_unlink=True)
    V = verts(hand); N = vnormals(hand); hgt = np.zeros(len(V))
    if detail:
        dout = {}; hgt = hands.detail(V, N, H, out=dout); V = V + N * (hgt * relief)[:, None]; set_verts(hand, V)
    # flush: fingertips, knuckles, the skin round the nails, the heel of the hand; crease from the wrinkle valleys
    fl = np.zeros(len(V)); f = H['fingers']
    for n in hands.ORDER:
        J, Z, d, r = f[n]['joints'], f[n]['Z'], f[n]['d'], f[n]['r']
        fl = np.maximum(fl, np.clip(1 - np.linalg.norm(V - J[3], axis=1) / 1.6, 0, 1) * .95)
        fl = np.maximum(fl, np.clip(1 - np.linalg.norm(V - (J[0] + Z * 1.1), axis=1) / 1.25, 0, 1) * .6)
        fl = np.maximum(fl, np.clip(1 - np.linalg.norm(V - (J[1] + Z * r[1] * .9), axis=1) / .9, 0, 1) * .55)
        fl = np.maximum(fl, np.clip(1 - np.linalg.norm(V - (J[2] + Z * r[2] * .85), axis=1) / .7, 0, 1) * .45)
        cut = J[2] + d * hands.FINGERS[n]['L'][2] * .3 + Z * r[2] * .8
        fl = np.maximum(fl, np.clip(1 - np.linalg.norm(V - cut, axis=1) / .55, 0, 1) * .5)
    T = H['thumb']
    fl = np.maximum(fl, np.clip(1 - np.linalg.norm(V - T['joints'][3], axis=1) / 1.8, 0, 1) * .9)
    fl = np.maximum(fl, np.clip(1 - np.linalg.norm(V - T['joints'][2], axis=1) / 1.0, 0, 1) * .4)
    fl = np.maximum(fl, sstep(.3, -.6, N[:, 2]) * .25)                       # palm side a touch pinker
    cr = np.clip((-hgt - .016) / .02, 0, 1)
    if detail: cr = np.maximum(cr, dout['vein'] * .3)              # veins: a touch darker (the shader cools creases)
    set_data(hand, np.column_stack([fl, cr, np.zeros(len(V)), np.ones(len(V))]))
    # nails, ray cast onto this hand's own skin
    dg = bpy.context.evaluated_depsgraph_get(); bvh = BVHTree.FromObject(hand, dg)
    NV, NF, NE = [], [], []
    def nail(J2, J3, Lx, Zd, length, width):
        d = nrm(J3 - J2); Lx = perp(Lx, d); Zd = perp(Zd, d); nu, nv = 5, 4; base = len(NV)
        for j in range(nv):
            for i in range(nu):
                u = i / (nu - 1) * 2 - 1; v = j / (nv - 1)
                w = width / 2 * (0.86 + 0.14 * math.sqrt(max(0, 1 - (2 * v - 1) ** 2))) if v < .5 else width / 2 * (1 - .18 * (v - .5) ** 2 * 4)
                p0 = J2 + d * (np.linalg.norm(J3 - J2) * .31 + v * length) + Lx * u * w * .98 + Zd * 1.5        # from just above the nail bed, so a neighbouring finger never catches the ray
                hit = bvh.ray_cast(Vector(p0), Vector(-Zd))
                lift = .058 + .035 * v - .03 * (abs(u) ** 3) + (max(0, v - .9) * .25)
                if hit[0] is None: hit = bvh.find_nearest(Vector(p0 - Zd * 1.5))
                NV.append(np.array(hit[0]) + np.array(hit[1]) * lift); NE.append(v)
        for j in range(nv - 1):
            for i in range(nu - 1):
                a = base + j * nu + i; NF.append([a, a + 1, a + nu + 1, a + nu])
    for n in hands.ORDER:
        J = f[n]['joints']; nail(J[2], J[3], f[n]['L'], f[n]['Z'], hands.FINGERS[n]['L'][2] * .6, hands.FINGERS[n]['wt'] * .84)
    nail(T['joints'][2], T['joints'][3], nrm(np.cross(T['d'][2], T['Z'])), T['Z'], hands.THUMB['L'][2] * .5, 1.78)    # wide, short thumbnail
    nails = mesh_obj('nails' + suffix, np.array(NV), NF)
    sol = nails.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = .07; sol.offset = -1; sol.use_even_offset = True
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(nails.evaluated_get(dg)); nails.modifiers.clear(); nails.data = me
    NVs = verts(nails); tips = np.array([f[n]['joints'][3] for n in hands.ORDER] + [T['joints'][3]])
    edge = np.clip(1 - (np.min(np.linalg.norm(NVs[:, None] - tips[None], axis=2), 1) - .1) / .35, 0, 1)
    set_data(nails, np.column_stack([np.zeros(len(NVs)), np.zeros(len(NVs)), .5 + .15 * edge, np.ones(len(NVs))]))
    for ob in (hand, nails): set_verts(ob, S.B(S.to_car(verts(ob))))
    return hand, nails

def ring(suffix=''):
    f = S.H['fingers']; rf = f['ring']; RJ = [S.to_car(p) for p in rf['joints']]; rd = nrm(RJ[1] - RJ[0]); rC = RJ[0] + rd * .0115
    rZ = S.dir_car(rf['Z']); rL = nrm(np.cross(rd, rZ)); rr = rf['r'][0] * .0098 + .0002
    rv, rfc, M1, M2 = [], [], 16, 4
    for i in range(M1):
        a = 2 * np.pi * i / M1; e = np.cos(a) * rL + np.sin(a) * rZ * .9
        for j in range(M2):
            b = 2 * np.pi * (j + .5) / M2; rv.append(rC + e * (rr + .0009 + .0007 * np.cos(b)) + rd * .0013 * np.sin(b))
    for i in range(M1):
        for j in range(M2):
            a0 = i * M2 + j; a1 = ((i + 1) % M1) * M2 + j; b0 = i * M2 + (j + 1) % M2; b1 = ((i + 1) % M1) * M2 + (j + 1) % M2; rfc.append([a0, a1, b1, b0])
    ob = mesh_obj('ring' + suffix, S.B(np.array(rv)), rfc)
    set_data(ob, np.tile([0, 0, 1, 1], (len(rv), 1))); return ob

# ---------------------------------------------------------------- sleeve
CUFF_S = .02; SE0 = S.L_FORE - CUFF_S
SLEN = SE0 + np.linalg.norm(S.SH - S.ELB)
def path(s):
    fdir = S.dir_car(S.DFC); up = S.SH - S.ELB; Lu = np.linalg.norm(up); up = up / Lu
    if s < SE0 - .03: return S.fore_at(CUFF_S + s)
    if s > SE0 + .03: return S.ELB + up * min(s - SE0, Lu)
    t = (s - (SE0 - .03)) / .06; a = S.ELB - fdir * .03; b = S.ELB; c = S.ELB + up * .03
    return (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c
# sleeve cross-section follows the forearm's oval: (s, half width, half thickness); round and slim on the upper arm
PROF = [(0., .047, .037), (.03, .048, .038), (.08, .048, .039), (.14, .048, .040), (SE0, .046, .044), (SE0 + .08, .047, .046), (SLEN, .049, .048)]
def radius(s, a=0.0):
    xs = [p[0] for p in PROF]; rw = float(np.interp(s, xs, [p[1] for p in PROF])); rt = float(np.interp(s, xs, [p[2] for p in PROF]))
    return rw * rt / math.sqrt((rw * math.cos(a)) ** 2 + (rt * math.sin(a)) ** 2)      # a = 0 is the back of the forearm
def folds(s, a):
    v = 0; SE = SE0
    # pushed-up cloth bunching just above the hem band: four soft rolls, uneven round the arm, a little diagonal
    for k, (c0, amp) in enumerate([(.024, .0030), (.043, .0036), (.064, .0031), (.087, .0022)]):
        v += amp * math.exp(-((s - c0 - .006 * math.sin(a * 1.0 + k * 2.1)) / .0085) ** 2) * (.55 + .45 * math.cos(a - .5 + k * 1.3))
    # the inside of the bent elbow: compression folds; a couple of stretch creases across the outside
    inner = math.exp(-((((a + math.pi) % (2 * math.pi)) - math.pi + math.pi) % (2 * math.pi) - math.pi) ** 2 / .7) if False else math.exp(-((abs(((a % (2 * math.pi)) - math.pi))) ** 2) / .7)
    outer = math.exp(-((abs(((a + math.pi) % (2 * math.pi)) - math.pi)) ** 2) / .5)
    for k, (c0, amp) in enumerate([(-.045, .0026), (-.02, .0036), (.004, .004), (.028, .0034), (.055, .0022)]):
        v += amp * inner * math.exp(-((s - SE - c0 - .006 * math.sin(a * 2 + k)) / .0105) ** 2)
    for k, c0 in enumerate((-.012, .02)):
        v -= .0014 * outer * math.exp(-((s - SE - c0) / .007) ** 2)
    # long drape along the forearm
    v += .0011 * math.cos(3 * a + s * 9) * min(1, max(0, (s - .1) / .04)) * min(1, max(0, (SE - s) / .05))
    return v
_PS = np.linspace(-.004, SLEN, 900); _PP = np.array([path(max(s, 0)) + (nrm(path(.002) - path(0)) * min(s, 0)) for s in _PS])
def path_coords(Pc):
    """nearest arc length s and angle (0 = top of the arm) for car-space points"""
    from scipy.spatial import cKDTree
    _, i = cKDTree(_PP).query(Pc); s = _PS[i]
    out_a = np.zeros(len(Pc))
    for k in range(len(Pc)):
        p = path(max(s[k], 0)); d = nrm(path(max(s[k], 0) + 1e-3) - path(max(s[k], 0) - 1e-3)); x = perp(UPF(max(s[k], 0)), d); z = np.cross(d, x)
        v = Pc[k] - p; out_a[k] = math.atan2(v @ z, v @ x)
    return s, out_a
def UPF(s):
    d = nrm(path(min(s + 1e-3, SLEN)) - path(max(s - 1e-3, 0)))
    return perp(S.ND, d)
def sleeve(lvl, n=12, detail=False, suffix=''):
    ds = [0.0, .008, .013, .017, .024, .033, .043, .053, .064, .075, .087, .1, .125, .155, SE0 - .045, SE0 - .02, SE0, SE0 + .02, SE0 + .045, SE0 + .1, SLEN - .02]
    sv, sfc, s_of, a_of, ins = hands.sleeve(path, None, radius, folds, up=UPF, n=n, ds_list=ds)
    cage = mesh_obj('scage' + suffix, S.B(sv), sfc)
    ob = subdivided(cage, lvl, 'sleeve' + suffix); bpy.data.objects.remove(cage, do_unlink=True)
    Pc = verts(ob) @ S.BM; s, a = path_coords(Pc)
    rad_here = np.array([radius(max(x, 0), aa) for x, aa in zip(s, a)]); dist = np.linalg.norm(Pc - np.array([path(max(x, 0)) for x in s]), axis=1)
    inside = dist < rad_here - .0018
    cr = np.zeros(len(Pc))
    if detail:
        N = vnormals(ob) @ S.BM; h = np.zeros(len(Pc))
        out = ~inside
        # small creases in the cloth, stitched hem line with dashes, a soft seam along the underside
        h += .00035 * np.sin(a * 7 + s * 60) * np.sin(s * 35 + a * 2) * sstep(.02, .06, s)
        stitch = np.exp(-((s - .0128) / .0006) ** 2) * (np.sin(a * 85) > -.2)
        h -= .00045 * stitch
        seam = np.exp(-(((a - math.pi + 2 * math.pi) % (2 * math.pi) - math.pi) / .03) ** 2) * sstep(.03, .05, s)
        h -= .0004 * seam
        h *= out
        set_verts(ob, S.B(Pc + N * h[:, None])); cr = np.clip(stitch * .6 + seam * .4, 0, 1) * out
    set_data(ob, np.column_stack([np.zeros(len(Pc)), cr, np.full(len(Pc), .8), np.ones(len(Pc))]))
    return ob

# ---------------------------------------------------------------- armature, weights, pose
def armature():
    arm_d = bpy.data.armatures.new('rig'); arm = link(bpy.data.objects.new('rig', arm_d))
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
    for name, a, b, r in S.BONES:
        eb = arm_d.edit_bones.new(name); eb.head = Vector(S.B(a)); eb.tail = Vector(S.B(b))
    for name, a, b, r in S.BONES:
        if S.PARENT[name]: arm_d.edit_bones[name].parent = arm_d.edit_bones[S.PARENT[name]]
    bpy.ops.object.mode_set(mode='OBJECT')
    return arm
NAMES = [b[0] for b in S.BONES]
def skin(ob, arm, only=None):
    Vc = verts(ob) @ S.BM
    if only == 'nails':
        tips = {n: S.to_car(S.H['fingers'][n]['joints'][3]) for n in hands.ORDER}; tips['thumb'] = S.to_car(S.H['thumb']['joints'][3])
        Wm = np.zeros((len(Vc), len(NAMES)))
        for i, p in enumerate(Vc): Wm[i, NAMES.index(min(tips, key=lambda k: np.linalg.norm(tips[k] - p)) + '3')] = 1
    elif only: Wm = np.zeros((len(Vc), len(NAMES))); Wm[:, NAMES.index(only)] = 1
    else:
        Wm = hands.weights(Vc, S.BONES, S.joint_planes())
        if ob.name.startswith('hand'):                    # soften the finger webs so neighbouring fingers share them
            E = np.zeros(len(ob.data.edges) * 2, int); ob.data.edges.foreach_get('vertices', E); E = E.reshape(-1, 2)
            mcp = np.array([S.to_car(S.H['fingers'][n]['joints'][0]) for n in hands.ORDER])
            near = np.min(np.linalg.norm(Vc[:, None] - mcp[None], axis=2), 1) < .02
            Wm = hands.smooth_weights(Wm, E, near, iters=10)
    for k, nm in enumerate(NAMES):
        idx = np.where(Wm[:, k] > 1e-4)[0]
        vg = ob.vertex_groups.new(name=nm)
        for i in idx: vg.add([int(i)], float(Wm[i, k]), 'REPLACE')
    md = ob.modifiers.new('arm', 'ARMATURE'); md.object = arm
    return Wm
def pose(arm, side='L', curl=1.0, theta=0.0):
    D = S.pose_deltas(side, curl, theta)
    for nm in NAMES:
        pb = arm.pose.bones[nm]; rest = np.array(arm.data.bones[nm].matrix_local)
        pb.matrix = Matrix((S.B4(D[nm]) @ rest).tolist()); bpy.context.view_layer.update()
def rest(arm):
    for pb in arm.pose.bones: pb.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()

def rim_and_wheel():
    """the rim (the tube the hands were solved on), three spokes, the boss and the column, as one object"""
    M, Nn = 96, 16; V, F = [], []
    for i in range(M):
        a = 2 * math.pi * i / M
        for j in range(Nn):
            b = 2 * math.pi * j / Nn; V.append(((S.RR + S.RT * math.cos(b)) * math.cos(a), (S.RR + S.RT * math.cos(b)) * math.sin(a), S.RT * math.sin(b)))
    for i in range(M):
        for j in range(Nn): F.append([i * Nn + j, ((i + 1) % M) * Nn + j, ((i + 1) % M) * Nn + (j + 1) % Nn, i * Nn + (j + 1) % Nn])
    def box(c, ax, hx, hy, hz):                      # wheel-local box centred at c, long axis at angle ax
        ca, sa = math.cos(ax), math.sin(ax); base = len(V)
        for dx in (-hx, hx):
            for dy in (-hy, hy):
                for dz in (-hz, hz): V.append((c[0] + dx * ca - dy * sa, c[1] + dx * sa + dy * ca, c[2] + dz))
        for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)): F.append([base + k for k in f])
    for ax in (0, math.pi, -math.pi / 2):
        L = S.RR - .06; box(((L / 2 + .055) * math.cos(ax), (L / 2 + .055) * math.sin(ax), -.008), ax, L / 2, .014, .006)
    def cyl(r, z0, z1, n=32):
        base = len(V)
        for z in (z0, z1):
            for i in range(n): a = 2 * math.pi * i / n; V.append((r * math.cos(a), r * math.sin(a), z))
        for i in range(n): F.append([base + i, base + (i + 1) % n, base + n + (i + 1) % n, base + n + i])
        F.append([base + n + i for i in range(n)]); F.append([base + i for i in range(n)][::-1])
    cyl(.064, -.03, .022); cyl(.04, -.33, -.03, 20)
    ob = mesh_obj('rim', S.B(np.array(V) @ S.RX.T + S.WC), F)
    return ob

def select_only(objs, active=None):
    for o in bpy.context.scene.objects: o.select_set(False)
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = active or objs[0]
def unwrap(objs, box, margin=.004):
    """smart-project the objects together, then pack their islands into box = (u0, v0, u1, v1)"""
    select_only(objs); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(62), island_margin=margin, area_weight=0.0, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    u0, v0, u1, v1 = box
    for o in objs:
        uv = o.data.uv_layers.active.data; a = np.zeros(len(uv) * 2); uv.foreach_get('uv', a); a = a.reshape(-1, 2)
        a[:, 0] = u0 + a[:, 0] * (u1 - u0); a[:, 1] = v0 + a[:, 1] * (v1 - v0); uv.foreach_set('uv', a.ravel())
    select_only(objs); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(udim_source='ORIGINAL_AABB', rotate=True, scale=True, margin=margin, shape_method='CONCAVE')
    bpy.ops.object.mode_set(mode='OBJECT')
