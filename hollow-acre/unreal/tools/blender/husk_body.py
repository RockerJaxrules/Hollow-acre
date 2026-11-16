"""The frozen husk's body, from its MetaHuman base (Saved/Generated/Husk/body.fbx, exported by Scripts/husk_export_mh.py):
- stretched where a starving thing that runs on all fours would be long: the arms by a third, the hands, and the fingers
  by more (and the legs and toes a little), done on the bones so the skin follows;
- long black hooked claws on every finger and toe, on the bone of the last joint;
- frozen, matted hair in clumps along the spine and over the shoulders (hair cards);
- per vertex, how frostbitten (red: black at the fingers and toes) and how rimed with frost (green: on top);
- its movement: Gallop and GallopLookL (in place, on all fours) and Sighting (it runs in, skids to a halt turning to
  face the car, rises to its full height hunched, screams with its arms up and its claws spread, drops, wheels round
  and bolts), keyed on IK controls and baked onto the skeleton. (The jaw and the scream's face are the face mesh's:
  the game drives those.)

Writes Saved/Generated/Husk/HuskBody.fbx (the skeletal mesh and its takes, metres, facing -Y) and SourceArt/T_HuskHair.png.
Run: blender -b --factory-startup --python husk_body.py -- <Saved/Generated/Husk> <SourceArt> [preview dir]
"""
import math
import os
import random
import sys

import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
GEN = os.path.abspath(ARGS[0] if ARGS else '.')
ART = os.path.abspath(ARGS[1] if len(ARGS) > 1 else '.')
PREVIEW = os.path.abspath(ARGS[2]) if len(ARGS) > 2 and not ARGS[2].startswith('--') else None

FINGERS = ('thumb', 'index', 'middle', 'ring', 'pinky')
TOES = ('bigtoe', 'indextoe', 'middletoe', 'ringtoe', 'littletoe')
STRETCH = {'upperarm': 1.32, 'lowerarm': 1.32, 'hand': 1.12, 'thigh': 1.04, 'calf': 1.04}
FINGER_STRETCH = 1.4
TOE_STRETCH = 1.25


def smooth01(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def log(*a):
    print('husk:', *a)


# =====================================================================================================================
def load_body():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=os.path.join(GEN, 'body.fbx'), automatic_bone_orientation=True)
    arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    body = next(o for o in meshes if o.name.endswith('LOD0'))
    for o in meshes:
        if o is not body:
            bpy.data.objects.remove(o)
    # the FBX comes in centimetres under a scaled object: bake every transform so bones and skin are in metres in one
    # space (world = armature = mesh)
    log('import: armature parent', arm.parent.name if arm.parent else None, 'world scale', tuple(round(s, 4) for s in arm.matrix_world.to_scale()),
        'delta', tuple(arm.delta_scale), 'mesh parent', body.parent.name if body.parent else None)
    for o in (body, arm):
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
        o.delta_scale = (1, 1, 1)
    for o in (arm, body):
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for o in [x for x in bpy.data.objects if x.type == 'EMPTY']:
        bpy.data.objects.remove(o)
    body.parent = arm
    for m in body.modifiers:
        if m.type == 'ARMATURE':
            m.object = arm
    arm.name = 'root'                 # the skeleton's root keeps the MetaHuman's name (the face copies the body by name)
    body.name = 'HuskBody'
    log('loaded: armature scale', tuple(arm.scale), 'mesh height', round(max(v.co.z for v in body.data.vertices), 3),
        'hand_l', tuple(round(c, 3) for c in arm.data.bones['hand_l'].head_local))
    return arm, body


def stretch_names(arm):
    """Which bones stretch, and by how much (along themselves)."""
    out = {}
    for sd in ('_l', '_r'):
        for base, f in STRETCH.items():
            out[base + sd] = f
        for fg in FINGERS:
            for k in (1, 2, 3):
                out['%s_0%d%s' % (fg, k, sd)] = FINGER_STRETCH
        for t in TOES:
            for k in (1, 2):
                out['%s_0%d%s' % (t, k, sd)] = TOE_STRETCH
    return {n: f for n, f in out.items() if n in arm.data.bones}


def stretch(arm, body):
    """Scale the chosen bones along their length in pose, children keeping their own scale, bake the skin to it and
    make that the rest pose."""
    factors = stretch_names(arm)
    log('stretching', len(factors), 'bones, e.g.', sorted(factors)[:12])
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    keep = {}
    for eb in arm.data.edit_bones:
        keep[eb.name] = eb.inherit_scale
        eb.inherit_scale = 'NONE'
    bpy.ops.object.mode_set(mode='POSE')
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
        if pb.name in factors:
            pb.scale = (1.0, factors[pb.name], 1.0)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()
    # the skin takes the stretched pose for good
    mod = next(m for m in body.modifiers if m.type == 'ARMATURE')
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.select_all(action='SELECT')
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode='EDIT')
    for eb in arm.data.edit_bones:
        eb.inherit_scale = keep.get(eb.name, 'FULL')
    bpy.ops.object.mode_set(mode='OBJECT')
    m = body.modifiers.new('Armature', 'ARMATURE')
    m.object = arm
    hl, ml = arm.data.bones['hand_l'].head_local, arm.data.bones.get('middle_03_l')
    log('after stretching: hand_l at', tuple(round(c, 3) for c in hl), 'height', round(max(v.co.z for v in body.data.vertices), 3))


# =====================================================================================================================
def weighted_tip(body, group, direction):
    """The far end of the skin a bone carries, along a direction (a fingertip, a toe tip)."""
    gi = body.vertex_groups[group].index
    best, bp = -1e9, None
    for v in body.data.vertices:
        for g in v.groups:
            if g.group == gi and g.weight > 0.5:
                d = v.co.dot(direction)
                if d > best:
                    best, bp = d, v.co.copy()
    return bp


CLAWS = []


def claws(arm, body):
    """A hooked black claw from the end of every finger and toe, on its last bone."""
    out = []
    for sd in ('_l', '_r'):
        for f in FINGERS:
            last = f + '_03' + sd
            b = arm.data.bones.get(last)
            if not b or last not in body.vertex_groups:
                continue
            d = (b.tail_local - b.head_local).normalized()
            tip = weighted_tip(body, last, d)
            if tip is None:
                continue
            length = 0.06 if f != 'thumb' else 0.05
            CLAWS.append((tip - d * 0.008, d, length, 0.0075, last, Vector((0, 0, -1))))
        for t in TOES:
            last = t + '_02' + sd
            if last not in body.vertex_groups:
                continue
            tip = weighted_tip(body, last, Vector((0, -1, -0.2)).normalized())
            if tip is None:
                continue
            CLAWS.append((tip + Vector((0, 0.004, 0.006)), Vector((0, -1, -0.25)).normalized(),
                          0.04 if t == 'bigtoe' else 0.03, 0.007 if t == 'bigtoe' else 0.0055, last, Vector((0, 0, -1))))
    for base, d, length, rad, group, bend_dir in CLAWS:
        for k, (frac, r0, r1, bend) in enumerate(((0.55, 1.0, 0.62, 0.0), (0.5, 0.62, 0.06, 0.45))):
            dd = (d + bend_dir * bend).normalized()
            start = base if k == 0 else base + d * length * 0.55
            bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=rad * r0, radius2=rad * r1, depth=length * frac,
                                            location=start + dd * length * frac * 0.5)
            o = bpy.context.active_object
            o.rotation_mode = 'QUATERNION'
            o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(dd)
            o.scale = (1.0, 0.7, 1.0)                     # flattened side to side, like a talon
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            vg = o.vertex_groups.new(name=group)
            vg.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
            out.append(o)
    log('claws', len(CLAWS))
    return out


# =====================================================================================================================
def hair_texture(path):
    """Frozen, matted yeti fur: each card a dense mat of strands at the root, wet and stuck together into a few locks
    that taper to ragged, frost-whitened tips. Dirty grey-white, darker at the roots."""
    W, H, NV = 1024, 2048, 4
    r = np.random.default_rng(17)
    logT = np.zeros((H, W))
    csum = np.zeros((H, W, 3))
    asum = np.zeros((H, W))
    root = np.array([0.15, 0.14, 0.13])
    mids = [np.array([0.46, 0.44, 0.41]), np.array([0.38, 0.37, 0.35]), np.array([0.55, 0.54, 0.51])]
    frost = np.array([0.86, 0.89, 0.93])
    rows = np.arange(H)
    for k in range(NV):
        x_lo, cw = k * W // NV, W // NV
        nl = int(r.integers(3, 6))
        locks = [cw * (j + 0.5) / nl + r.uniform(-12, 12) for j in range(nl)]
        lock_len = [r.uniform(0.7, 1.0) for _ in locks]
        for i in range(240):
            x0 = r.uniform(0.04, 0.96) * cw
            li = min(range(nl), key=lambda j: abs(locks[j] - x0) + r.uniform(0, 30))
            x1 = locks[li] + r.uniform(-10, 10)
            tl = lock_len[li] * r.uniform(0.55, 1.0)
            w0 = r.uniform(1.6, 3.2)
            mid = mids[int(r.integers(0, 3))]
            tone = r.uniform(0.82, 1.12)
            icy = r.random() < 0.3
            n = int(tl * H)
            s_ = rows[:n] / max(1, n - 1)
            amp, fr, ph = r.uniform(2, 6), r.uniform(1.0, 2.5), r.uniform(0, 6.28)
            x = x0 + (x1 - x0) * np.clip(s_ / 0.8, 0, 1) ** 0.8 + amp * np.sin(fr * np.pi * s_ + ph) * s_
            w = w0 * (1 - s_) ** 0.5 + 0.6
            fade = np.clip((1 - s_) / 0.1, 0, 1)
            col = root[None, :] + (mid - root)[None, :] * np.clip(s_ / 0.45, 0, 1)[:, None]
            if icy:                                   # rime on the tips
                col = col + (frost - col) * np.clip((s_ - 0.6) / 0.4, 0, 1)[:, None] * 0.8
            col = col * tone
            for dx in range(-4, 5):
                cx = np.floor(x).astype(int) + dx
                ok = (cx >= 0) & (cx < cw)
                a = np.clip(w / 2 + 0.5 - np.abs(cx + 0.5 - x), 0, 1) * fade * ok
                rr, cc, aa = rows[:n][ok], cx[ok] + x_lo, a[ok]
                np.add.at(logT, (rr, cc), np.log(1 - 0.95 * aa))
                np.add.at(asum, (rr, cc), aa)
                np.add.at(csum, (rr, cc), aa[:, None] * col[ok])
    A = 1 - np.exp(logT)
    C = csum / np.maximum(asum, 1e-4)[:, :, None]
    mean = csum.reshape(-1, 3).sum(0) / max(asum.sum(), 1e-4)
    C = np.where(asum[:, :, None] > 1e-4, C, mean[None, None, :])
    img = bpy.data.images.new('T_HuskHair', W, H, alpha=True)
    img.pixels.foreach_set(np.concatenate([np.clip(C, 0, 1), A[:, :, None]], axis=2).astype(np.float32).ravel())
    img.filepath_raw = path
    img.file_format = 'PNG'
    img.save()
    return img


FUR_BARE = ('hand', 'foot', 'ball', 'calf', 'index', 'middle', 'ring', 'pinky', 'thumb', 'head', 'FACIAL')
FUR_LENGTH = {'back': (0.14, 0.32), 'front': (0.1, 0.22), 'arm': (0.08, 0.18), 'leg': (0.06, 0.14)}


def fur_density(c, n, bone, pelvis, neck, chest_z):
    """How thick the fur grows at a point of the skin (0..1), and which coat it is. The back, the shoulders and the
    back of the neck worst; the chest (thickest down the breastbone) and a line down the belly; the outsides of the
    arms; a little on the thighs. The hands, feet, calves and face bare. It faces -Y; its left is +X."""
    side = 1.0 if c.x >= 0 else -1.0
    if not bone or bone.startswith(FUR_BARE):
        return 0.0, ''
    if bone.startswith('neck'):
        return (1.0, 'back') if n.y > 0.1 else (0.0, '')
    if bone.startswith(('spine', 'pelvis', 'clavicle')):
        if c.z < pelvis.z + 0.02 and n.y < 0.15:
            return 0.0, ''                                   # not between its legs
        if n.y > 0.15:
            return (1.0 if c.z > pelvis.z + 0.05 else 0.6), 'back'
        if n.z > 0.45 and c.z > chest_z:
            return 1.0, 'back'                               # over the shoulders
        if n.y < -0.15:
            if c.z > chest_z - 0.12:
                return 0.3 + 0.55 * max(0.0, 1.0 - abs(c.x) / 0.16), 'front'
            if abs(c.x) < 0.06 and c.z > pelvis.z + 0.08:
                return 0.45, 'front'                         # the line down its belly
            return 0.1, 'front'
        return 0.6, 'back'                                   # its flanks
    if bone.startswith('upperarm'):
        return (0.75 if n.x * side + 0.6 * n.y > 0.1 else 0.25), 'arm'
    if bone.startswith('lowerarm'):
        return (0.45 if n.x * side + 0.6 * n.y > 0.1 else 0.08), 'arm'
    if bone.startswith('thigh'):
        if abs(c.x) < 0.1 and c.z > pelvis.z - 0.14:
            return 0.0, ''
        return (0.35 if n.x * side + n.y > 0.2 else 0.05), 'leg'
    return 0.0, ''


def hair_clumps(arm, body, count=6000, seed=5):
    """Frozen, matted clumps of fur (fur_density: thickest on the back and shoulders, the chest and a line down the
    belly, the arms, a little on the thighs): each card is laid along the skin (walked down it from its root), frozen
    flat to it, its tip lifting a little off; each of its points takes the bone weights of the skin under it, so it
    moves with the skin."""
    r = random.Random(seed)
    me = body.data
    me.calc_loop_triangles()
    neck = arm.data.bones['neck_01'].head_local
    pelvis = arm.data.bones['pelvis'].head_local
    bvh = BVHTree.FromPolygons([v.co for v in me.vertices], [tuple(t.vertices) for t in me.loop_triangles])
    chest_z = arm.data.bones['spine_04'].head_local.z
    gnames = {g.index: g.name for g in body.vertex_groups}
    dom = []
    for v in me.vertices:
        gs = [g for g in v.groups if g.weight > 0.0]
        dom.append(gnames[max(gs, key=lambda g: g.weight).group] if gs else '')
    skin = {i for i, m in enumerate(me.materials) if m and not m.name.startswith(('Claw', 'Hair'))}
    tris, areas, coats = [], [], []
    for t in me.loop_triangles:
        if skin and t.material_index not in skin:
            continue
        c, n = Vector(t.center), Vector(t.normal)
        w, coat = fur_density(c, n, dom[t.vertices[0]], pelvis, neck, chest_z)
        if w > 0.0:
            tris.append(t)
            areas.append(t.area * w)
            coats.append(coat)
    log('fur: %d triangles of skin grow it' % len(tris))
    cum = np.cumsum(areas)
    G = Vector((0, 0, -1))
    verts, faces, uvs = [], [], []
    for i in range(count):
        ti = int(np.searchsorted(cum, r.random() * cum[-1]))
        t = tris[ti]
        a, b, c = (Vector(me.vertices[v].co) for v in t.vertices)
        u, v = r.random(), r.random()
        if u + v > 1:
            u, v = 1 - u, 1 - v
        cur = a + (b - a) * u + (c - a) * v
        nrm = Vector(t.normal)
        L = r.uniform(*FUR_LENGTH[coats[ti]])
        width = r.uniform(0.03, 0.06)
        curl = math.radians(r.uniform(-25, 25))
        k = r.randrange(4)
        base = len(verts)
        for j in range(5):
            tt = j / 4
            if j:
                # down the skin: the way down along its surface, curling a little to one side
                down = G - nrm * G.dot(nrm)
                down = (down if down.length > 1e-3 else Vector((0, 1, 0))).normalized()
                down = Quaternion(nrm, curl * 0.5) @ down
                loc, n2, _, _ = bvh.find_nearest(cur + down * (L / 4))
                if loc is not None:
                    cur, nrm = loc, n2.normalized()
            down = G - nrm * G.dot(nrm)
            down = (down if down.length > 1e-3 else Vector((0, 1, 0))).normalized()
            wv = nrm.cross(down).normalized()
            off = 0.004 + 0.03 * tt * tt                 # matted to the skin at the root, the locks lifting off it
            q = cur + nrm * off
            w = width * (1.0 - 0.6 * tt)                 # matted thick at the root, thinning to the tip
            for sgn in (-1, 1):
                verts.append(q + wv * (sgn * w / 2))
                uvs.append(((k + (0.5 + sgn * 0.48)) / 4, tt))
            if j:
                i0 = base + (j - 1) * 2
                faces.append((i0, i0 + 1, i0 + 3, i0 + 2))
    cm = bpy.data.meshes.new('hair')
    cm.from_pydata([tuple(q) for q in verts], [], faces)
    uvl = cm.uv_layers.new(name=body.data.uv_layers[0].name)
    for poly in cm.polygons:
        for li in poly.loop_indices:
            uvl.data[li].uv = uvs[cm.loops[li].vertex_index]
    ob = bpy.data.objects.new('HuskHair', cm)
    bpy.context.scene.collection.objects.link(ob)
    kd = KDTree(len(me.vertices))
    for vi, vv in enumerate(me.vertices):
        kd.insert(vv.co, vi)
    kd.balance()
    names = {g.index: g.name for g in body.vertex_groups}
    groups = {}
    for hi, q in enumerate(verts):
        # the weights of the skin under each of its points (the three nearest skin points, by distance)
        acc = {}
        for co, vi, dist in kd.find_n(q, 3):
            f = 1.0 / max(dist, 1e-4)
            for g in me.vertices[vi].groups:
                if g.weight > 0.0:
                    acc[names[g.group]] = acc.get(names[g.group], 0.0) + g.weight * f
        tot = sum(acc.values()) or 1.0
        for nm, w in acc.items():
            if w / tot < 0.01:
                continue
            if nm not in groups:
                groups[nm] = ob.vertex_groups.new(name=nm)
            groups[nm].add([hi], w / tot, 'REPLACE')
    log('hair clumps', count)
    return ob


LIMB_ENDS = ('hand', 'index', 'middle', 'ring', 'pinky', 'thumb', 'foot', 'ball') + TOES


def frost_colours(o, tips):
    me = o.data
    names = {g.index: g.name for g in o.vertex_groups}
    attr = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    kd = KDTree(len(tips))
    for i, t in enumerate(tips):
        kd.insert(t, i)
    kd.balance()
    rr = random.Random(3)
    for v in me.vertices:
        _, _, dist = kd.find(v.co)
        gs = [g for g in v.groups if g.weight > 0.0]
        dom = names.get(max(gs, key=lambda g: g.weight).group, '') if gs else ''
        bite = smooth01((0.17 - dist) / 0.14) if dom.startswith(LIMB_ENDS) else 0.0
        rime = smooth01((v.normal.z - 0.55) / 0.35) * 0.45 * smooth01((1.86 - v.co.z) / 0.12) + 0.05 * rr.random()
        attr.data[v.index].color = (bite, min(1.0, rime), 0.0, 1.0)


# =====================================================================================================================
# the movement: controls (hands and feet with IK, poles), poses on them, blended, baked onto the skeleton.
#   It faces -Y; its left is +X. All its takes stay in place: the game moves and turns it (EndingDirector).
# =====================================================================================================================
FPS = 60
CYCLE = 28                       # frames: 0.467 s a stride
T_STRIDE = CYCLE / FPS
SPEED = 8.0                      # m/s on all fours
FWD = Vector((0, -1, 0))
X_AXIS, Z_AXIS = Vector((1, 0, 0)), Vector((0, 0, 1))
SIDES = (('_l', 1), ('_r', -1))
LIMBS = {   # touchdown (fraction of the stride), duty (fraction on the ground), lift (m): hind feet, then the hands
    'foot_l': (0.00, 0.30, 0.24), 'foot_r': (0.08, 0.30, 0.24),
    'hand_l': (0.40, 0.28, 0.3), 'hand_r': (0.49, 0.28, 0.3)}
SPINE = ('spine_01', 'spine_02', 'spine_03', 'spine_04', 'spine_05')
NECK = ('neck_01', 'neck_02', 'head')
REST = {}
HANDFRAME = {}                   # per side: the rest frame (direction, side, palm) of the hand
NEUTRAL = {}                     # stance positions worked out once (shoulders, hips, hand and foot spots)


def ctrl_name(limb, sd):
    return ('ctrl_hand' if limb == 'hand' else 'ctrl_foot') + sd


def rig_controls(arm, body):
    """IK controls for the hands and feet, poles behind the elbows and in front of the knees."""
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones
    # the limbs' bones point at their next joint (the IK reaches with a bone's tip)
    for sd, _ in SIDES:
        for bn, nxt in (('upperarm', 'lowerarm'), ('lowerarm', 'hand'), ('thigh', 'calf'), ('calf', 'foot')):
            eb[bn + sd].tail = eb[nxt + sd].head.copy()
    for sd, sg in SIDES:
        for limb, bn in (('hand', 'hand' + sd), ('foot', 'foot' + sd)):
            src = eb[bn]
            c = eb.new(ctrl_name(limb, sd))
            c.head, c.tail, c.roll = src.head.copy(), src.tail.copy(), src.roll
            c.use_deform = False
        el = eb['lowerarm' + sd].head
        p = eb.new('pole_arm' + sd)
        p.head, p.tail = el + Vector((0.15 * sg, 0.6, 0)), el + Vector((0.15 * sg, 0.7, 0))
        p.use_deform = False
        kn = eb['calf' + sd].head
        p = eb.new('pole_leg' + sd)
        p.head, p.tail = kn + Vector((0.05 * sg, -0.6, 0)), kn + Vector((0.05 * sg, -0.7, 0))
        p.use_deform = False
    bpy.ops.object.mode_set(mode='OBJECT')

    def pole_angle(base, tip, pole):
        bh, bt = base.head_local, base.tail_local
        normal = (tip.tail_local - bh).cross(pole - bh)
        proj = normal.cross(bt - bh)
        a = base.x_axis.angle(proj)
        if base.x_axis.cross(proj).dot(bt - bh) < 0:
            a = -a
        return a

    B = arm.data.bones
    for sd, sg in SIDES:
        for upper, lower, end, limb, pole in (('upperarm', 'lowerarm', 'hand', 'hand', 'pole_arm'), ('thigh', 'calf', 'foot', 'foot', 'pole_leg')):
            c = arm.pose.bones[lower + sd].constraints.new('IK')
            c.target, c.subtarget = arm, ctrl_name(limb, sd)
            c.pole_target, c.pole_subtarget = arm, pole + sd
            c.chain_count = 2
            c.pole_angle = pole_angle(B[upper + sd], B[lower + sd], B[pole + sd].head_local)
            calibrate_pole(arm, c, lower + sd)
            c2 = arm.pose.bones[end + sd].constraints.new('COPY_ROTATION')
            c2.target, c2.subtarget = arm, ctrl_name(limb, sd)
    for pb in arm.pose.bones:
        pb.rotation_mode = 'QUATERNION'
    REST.update({b.name: b.matrix_local.copy() for b in arm.data.bones})
    # the hand's own frame at rest: along it (wrist to the middle knuckle), the palm side (toward the palm's pads)
    gi = {g.name: g.index for g in body.vertex_groups}
    for sd, sg in SIDES:
        h = B['hand' + sd].head_local
        d = (B['middle_01' + sd].head_local - h).normalized()
        pts = [v.co for v in body.data.vertices if any(x.group == gi.get('middle_01_palm' + sd, -1) and x.weight > 0.3 for x in v.groups)]
        if not pts:
            pts = [v.co for v in body.data.vertices if any(x.group == gi.get('index_01_palm' + sd, -1) and x.weight > 0.3 for x in v.groups)]
        palm_c = sum(pts, Vector()) / max(1, len(pts))
        palm = palm_c - h
        palm = (palm - d * palm.dot(d)).normalized()
        side = palm.cross(d).normalized()
        HANDFRAME[sd] = (d, side, palm)
    log('controls: palm (left) points', tuple(round(c, 2) for c in HANDFRAME['_l'][2]))


def calibrate_pole(arm, c, joint):
    """Pick the pole angle that leaves the limb exactly as it rests when its control is at rest (the formula can be a
    quarter or half turn off, depending on how the bones are rolled)."""
    rest = arm.data.bones[joint].head_local.copy()
    best = (1e9, c.pole_angle)
    for k in range(-36, 36):
        c.pole_angle = math.radians(k * 5.0)
        bpy.context.view_layer.update()
        err = (arm.pose.bones[joint].head - rest).length
        if err < best[0]:
            best = (err, c.pole_angle)
    c.pole_angle = best[1]
    bpy.context.view_layer.update()
    log('pole', joint, round(math.degrees(best[1])), 'deg, off by', round(best[0] * 1000, 1), 'mm')


def lq(bone, axis, angle):
    """A rotation about an axis of the armature's frame, as the bone's own local rotation."""
    Bm = REST[bone].to_3x3().normalized()
    return (Bm.inverted() @ Quaternion(axis, angle).to_matrix() @ Bm).to_quaternion()


def nose_down(bone, a):
    return lq(bone, X_AXIS, a)        # + about X tips its front (-Y) end down


def yaw(bone, a):
    return lq(bone, Z_AXIS, a)        # + turns it to its left


def pelvis_m(dz=0.0, fwd=0.0, down=0.0, roll=0.0, turn=0.0):
    h = REST['pelvis'].translation
    R = Matrix.Rotation(turn, 4, 'Z') @ Matrix.Rotation(roll, 4, 'Y') @ Matrix.Rotation(down, 4, 'X')
    return Matrix.Translation(h + Vector((0, -fwd, dz))) @ R @ Matrix.Translation(-h) @ REST['pelvis']


def frame_m(d, side, palm):
    return Matrix((d, side, palm)).transposed()


def hand_m(sd, wrist, d, palm):
    """The hand control: the wrist at a point, the fingers along d, the palm facing palm."""
    d = d.normalized()
    palm = (palm - d * palm.dot(d)).normalized()
    side = palm.cross(d).normalized()
    d0, s0, p0 = HANDFRAME[sd]
    R = (frame_m(d, side, palm) @ frame_m(d0, s0, p0).transposed()).to_4x4()
    r0 = REST[ctrl_name('hand', sd)]
    return Matrix.Translation(wrist) @ R @ Matrix.Translation(-r0.translation) @ r0


def foot_m(sd, ankle, pitch=0.0):
    """The foot control: the ankle at a point, the foot flat, pitched (+ toes down) about its own ankle."""
    r0 = REST[ctrl_name('foot', sd)]
    return Matrix.Translation(ankle) @ Matrix.Rotation(pitch, 4, 'X') @ Matrix.Translation(-r0.translation) @ r0


def fingers(P, curl=0.35, spread=0.0, thumb=0.2):
    """Claws ready: the fingers curled toward the palm (radians at each joint) and spread."""
    for sd, sg in SIDES:
        d, side, palm = HANDFRAME[sd]
        for k, f in enumerate(('index', 'middle', 'ring', 'pinky')):
            fan = (-1.0 + k * 0.67) * spread
            for j in (1, 2, 3):
                n = '%s_0%d%s' % (f, j, sd)
                if n in REST:
                    q = lq(n, side, -curl * (1.0 if j > 1 else 0.6))
                    if j == 1 and fan:
                        q = lq(n, palm, fan * sg) @ q
                    P[n] = q
        for j in (2, 3):
            n = 'thumb_0%d%s' % (j, sd)
            if n in REST:
                P[n] = lq(n, side, -thumb)
    return P


def body_pose(pelvis, spine_down, neck_up, look=0.0, clav_up=0.0):
    """The trunk: the pelvis, the spine bent nose-down (radians over its five bones), the neck and head lifted
    (radians) to look ahead, turned (radians) to look aside."""
    P = {'pelvis': pelvis}
    w = (0.1, 0.15, 0.25, 0.25, 0.25)
    for n, k in zip(SPINE, w):
        P[n] = nose_down(n, spine_down * k)
    for n, k in zip(NECK, (0.35, 0.3, 0.35)):
        P[n] = nose_down(n, -neck_up * k) @ yaw(n, look * k)
    for sd, sg in SIDES:
        P['clavicle' + sd] = lq('clavicle' + sd, FWD, clav_up * sg)
    return P


def fk_points(arm, P):
    """Shoulders and hips once the trunk is posed (to place the hands and feet against)."""
    apply_trunk(arm, P)
    pb = arm.pose.bones
    return {sd: (pb['upperarm' + sd].head.copy(), pb['thigh' + sd].head.copy()) for sd, _ in SIDES}


def apply_trunk(arm, P):
    for p in arm.pose.bones:
        p.matrix_basis = Matrix.Identity(4)
    arm.pose.bones['pelvis'].matrix = P['pelvis']
    for n, q in P.items():
        if n != 'pelvis' and isinstance(q, Quaternion) and n in arm.pose.bones:
            arm.pose.bones[n].rotation_quaternion = q
    bpy.context.view_layer.update()


# ---- the stances ------------------------------------------------------------------------------------------------
QUAD = dict(dz=-0.47, down=math.radians(68), spine=math.radians(34), neck=math.radians(78))     # head low, hips high
BIPED = dict(dz=-0.05, down=math.radians(9), spine=math.radians(24), neck=math.radians(22))     # upright, hunched


def quad_trunk(dz=0.0, down=0.0, spine=0.0, neck=0.0, roll=0.0, turn=0.0, look=0.0):
    return body_pose(pelvis_m(QUAD['dz'] + dz, 0, QUAD['down'] + down, roll, turn), QUAD['spine'] + spine, QUAD['neck'] + neck, look)


def biped_trunk(dz=0.0, down=0.0, spine=0.0, neck=0.0, look=0.0, clav_up=0.0):
    return body_pose(pelvis_m(BIPED['dz'] + dz, 0, BIPED['down'] + down), BIPED['spine'] + spine, BIPED['neck'] + neck, look, clav_up)


def settle_stances(arm):
    """Work out once where the shoulders and hips are in each stance, and the hand and foot spots from them."""
    q = fk_points(arm, quad_trunk())
    b = fk_points(arm, biped_trunk())
    for sd, sg in SIDES:
        sh, hp = q[sd]
        ankle0 = REST[ctrl_name('foot', sd)].translation
        NEUTRAL['quad_hand' + sd] = Vector((sh.x * 1.25, sh.y - 0.3, 0.045))
        NEUTRAL['quad_foot' + sd] = Vector((ankle0.x * 1.1, hp.y + 0.12, ankle0.z))
        shb, hpb = b[sd]
        NEUTRAL['biped_shoulder' + sd] = shb
        NEUTRAL['biped_foot' + sd] = Vector((ankle0.x * 1.15, ankle0.y, ankle0.z))
        log('stance', sd, 'quad shoulder', tuple(round(c, 2) for c in sh), 'hip', tuple(round(c, 2) for c in hp),
            '| biped shoulder', tuple(round(c, 2) for c in shb))


def quad_limbs(P, phase=None, brace=0.0):
    """Hands and feet on the snow: standing (phase None), or galloping (phase 0..1)."""
    T = T_STRIDE
    for sd, sg in SIDES:
        for limb in ('hand', 'foot'):
            key = limb + sd
            base = NEUTRAL['quad_%s%s' % (limb, sd)].copy()
            ang, z, f, dx = 0.0, 0.0, 0.0, 0.0
            if phase is not None:
                t0, duty, lift = LIMBS[key]
                Ls = SPEED * duty * T
                s = (phase - t0) % 1.0
                if s < duty:
                    u = s / duty
                    f = Ls / 2 - Ls * u
                    ang = math.radians(35 * max(0.0, (u - 0.55) / 0.45) ** 1.5) if limb == 'foot' else 0.0
                else:
                    u = (s - duty) / (1 - duty)
                    f = -Ls / 2 + Ls * smooth01(u)
                    z = lift * math.sin(math.pi * u) ** 0.9
                    ang = math.radians(35 - 40 * smooth01(u)) if limb == 'foot' else 0.0
                    dx = -sg * 0.03 * math.sin(math.pi * u)
            if brace:
                f += (0.32 if limb == 'hand' else 0.18) * brace
            pos = base + FWD * f + Vector((dx, 0, z))
            if limb == 'hand':
                swinging = phase is not None and s >= duty
                curl_back = math.radians(70) * (math.sin(math.pi * u) if swinging else 0.0)
                d = Matrix.Rotation(curl_back, 3, 'X') @ Vector((0, -1, -0.45))
                P[ctrl_name('hand', sd)] = hand_m(sd, pos + Vector((0, 0, 0.06)), d, Vector((0, 0, -1)))
            else:
                P[ctrl_name('foot', sd)] = foot_m(sd, pos, ang)
                planted = phase is None or s < duty
                P['toeflex' + sd] = Quaternion((1.0, 0.0, 0.0), -ang if planted else 0.0)
    return P


def biped_limbs(P, raise_arms=0.0, step=0.0, shake=0.0, t=0.0):
    """Standing: the feet planted, the long arms hanging to its knees, or thrown up and out, claws spread, palms at
    the car."""
    for sd, sg in SIDES:
        ft = NEUTRAL['biped_foot' + sd] + FWD * (step if sd == '_l' else 0.0)
        P[ctrl_name('foot', sd)] = foot_m(sd, ft)
        sh = NEUTRAL['biped_shoulder' + sd]
        w = smooth01(raise_arms)
        hang = sh + Vector((0.14 * sg, -0.12, -0.98))
        up = sh + Vector((0.55 * sg, -0.38, 0.32))
        wrist = hang.lerp(up, w) + Vector((0, 0, 0.02 * math.sin(t * 57) * shake))
        d = Vector((0.05 * sg, -0.15, -1.0)).lerp(Vector((0.45 * sg, -0.35, 0.85)), w)
        palm = Vector((-sg, 0.0, 0.0)).lerp(Vector((0.0, -1.0, 0.0)), w)
        P[ctrl_name('hand', sd)] = hand_m(sd, wrist, d, palm)
    return P


def blend(a, b, w):
    w = max(0.0, min(1.0, w))
    out = {}
    for k in set(a) | set(b):
        if k not in a or k not in b:
            out[k] = a.get(k, b.get(k))
            continue
        if isinstance(a[k], Matrix):
            la, ra, _ = a[k].decompose()
            lb, rb, _ = b[k].decompose()
            out[k] = Matrix.LocRotScale(la.lerp(lb, w), ra.slerp(rb, w), None)
        else:
            out[k] = a[k].slerp(b[k], w)
    return out


def gallop(phase, look=0.0):
    tau = 2 * math.pi
    dz = -0.04 * math.cos(tau * (phase - 0.19))
    rock = math.radians(5) * math.cos(tau * (phase - 0.55))          # nose-down when the hands take the weight
    flex = math.radians(8) * math.cos(tau * (phase - 0.92))          # the back arched as the legs gather
    roll = math.radians(3) * math.sin(tau * phase)
    turn = math.radians(2) * math.sin(tau * (phase - 0.2))
    P = quad_trunk(dz, rock, flex, -(rock + flex) * 0.8, roll, turn, math.radians(look))
    P = quad_limbs(P, phase)
    return fingers(P, curl=0.25)


def stand4(dz=0.0):
    return fingers(quad_limbs(quad_trunk(dz)), curl=0.3)


def brace4():
    return fingers(quad_limbs(quad_trunk(-0.08, math.radians(-12), math.radians(-6), math.radians(10)), brace=1.0), curl=0.45)


def biped(raise_arms=0.0, chest=0.0, head_up=0.0, step=0.0, shake=0.0, t=0.0, look=0.0):
    P = biped_trunk(0.0, 0.0, -chest, math.radians(head_up) + chest * 0.5, math.radians(look), math.radians(14) * raise_arms)
    P = biped_limbs(P, raise_arms, step, shake, t)
    return fingers(P, curl=0.35 - 0.2 * raise_arms, spread=0.25 * raise_arms, thumb=0.3)


# the sighting (as in EndingDirector, which moves and turns it): in, halt turning to face the car, rise, scream, drop,
# wheel round, away
TA = T_STRIDE
TB = TA + 0.63
TC = TB + 0.75
TD = TC + 1.8
TE = TD + 0.6
TF = TE + 2 * T_STRIDE


def sighting(t):
    if t < TA:
        return gallop(t / T_STRIDE, 50.0)
    if t < TB:
        u = (t - TA) / (TB - TA)
        P = blend(gallop((t / T_STRIDE) % 1.0, 50.0 * (1 - smooth01(u))), brace4(), smooth01(u / 0.4))
        return blend(P, stand4(), smooth01((u - 0.55) / 0.45))
    if t < TC:
        u = (t - TB) / (TC - TB)
        return blend(stand4(), biped(), smooth01(u))
    if t < TD:
        r = t - TC
        raise_arms = smooth01(r / 0.4) * (1 - 0.4 * smooth01((r - 1.45) / 0.35))
        head_up = 18 * smooth01(r / 0.35) - 30 * smooth01((r - 0.35) / 0.15) + 12 * smooth01((r - 1.45) / 0.35)
        chest = math.radians(10) * smooth01((r - 0.3) / 0.2) * (1 - smooth01((r - 1.45) / 0.35))
        roaring = smooth01((r - 0.45) / 0.1) * (1 - smooth01((r - 1.4) / 0.1))
        look = 4 * math.sin(r * 44) * roaring
        return biped(raise_arms, chest, head_up, 0.25 * smooth01((r - 0.4) / 0.3), roaring, r, look)
    if t < TE:
        u = (t - TD) / (TE - TD)
        P = blend(biped(0.6, 0.0, 12), stand4(), smooth01(u) ** 1.3)
        return P
    tt = t - TE
    phase = ((t - TF) / T_STRIDE) % 1.0
    return blend(stand4(-0.05), gallop(phase), smooth01(tt / 0.35))


def apply_pose(arm, P):
    apply_trunk(arm, P)
    pb = arm.pose.bones
    for sd, _ in SIDES:
        for limb in ('hand', 'foot'):
            c = ctrl_name(limb, sd)
            if c in P:
                pb[c].matrix = P[c]
    bpy.context.view_layer.update()
    # a planted foot rolling up onto its toes: the toes turned back at the ball by as much, so they stay on the snow
    for sd, _ in SIDES:
        q = P.get('toeflex' + sd)
        if q is not None and 'ball' + sd in pb:
            ball = pb['ball' + sd]
            h = ball.head.copy()
            ball.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ ball.matrix
    bpy.context.view_layer.update()


ANIMATED = None


class GroundSolver:
    """Keeps every frame of a take out of the ground (z = 0): a hand or foot whose lowest point (its claws, toes, heel)
    is under is lifted by its control until that point just touches (a foot pushing off rolls up onto its toes, the
    heel rising, as it should); anything else of the body under (a knee, a shin, the belly) lifts the pelvis. The fur
    cards are left to lie as they fall. Measured on the deformed mesh, a few passes a frame."""

    def __init__(self, arm, body, tol=0.003):
        self.arm, self.body, self.tol = arm, body, tol
        names = {g.index: g.name for g in body.vertex_groups}
        me = body.data
        hair = {i for i, m in enumerate(me.materials) if m and m.name.startswith('Hair')}
        hair_v = np.zeros(len(me.vertices), bool)
        for poly in me.polygons:
            if poly.material_index in hair:
                hair_v[list(poly.vertices)] = True
        dom = []
        for v in me.vertices:
            gs = [g for g in v.groups if g.weight > 0.0]
            dom.append(names[max(gs, key=lambda g: g.weight).group] if gs else '')
        self.masks = {}
        for sd, _ in SIDES:
            foot = np.array([d.endswith(sd) and d.startswith(('foot', 'ball') + TOES) for d in dom])
            hand = np.array([d.endswith(sd) and d.startswith(('hand', 'index', 'middle', 'ring', 'pinky', 'thumb')) for d in dom])
            self.masks[ctrl_name('foot', sd)] = foot & ~hair_v
            self.masks[ctrl_name('hand', sd)] = hand & ~hair_v
        limbs = np.zeros(len(dom), bool)
        for m in self.masks.values():
            limbs |= m
        self.rest_mask = ~limbs & ~hair_v
        self.lifts = []

    def heights(self):
        dg = bpy.context.evaluated_depsgraph_get()
        ev = self.body.evaluated_get(dg)
        m = ev.to_mesh()
        co = np.empty(len(m.vertices) * 3, dtype=np.float32)
        m.vertices.foreach_get('co', co)
        ev.to_mesh_clear()
        co = co.reshape(-1, 3)
        return (np.c_[co, np.ones(len(co))] @ np.array(ev.matrix_world).T)[:, 2]

    def solve(self, P, passes=4):
        lift_total = 0.0
        for _ in range(passes):
            apply_pose(self.arm, P)
            z = self.heights()
            moved = False
            for key, mask in self.masks.items():
                if key in P and mask.any():
                    low = float(z[mask].min())
                    if low < -self.tol:
                        P[key] = Matrix.Translation((0.0, 0.0, -low + 0.001)) @ P[key]
                        moved = True
            low = float(z[self.rest_mask].min())
            if low < -self.tol:
                P['pelvis'] = Matrix.Translation((0.0, 0.0, -low + 0.002)) @ P['pelvis']
                lift_total += -low
                moved = True
            if not moved:
                break
        self.lifts.append(lift_total)
        return P


def bake_takes(arm, names, body=None):
    """Pose each take on the controls (kept out of the ground: GroundSolver), read the solved bones back every frame,
    then key those alone."""
    global ANIMATED
    sc = bpy.context.scene
    sc.render.fps = FPS
    arm.animation_data_create()
    ANIMATED = [b.name for b in arm.data.bones if b.use_deform and (
        b.name in ('pelvis',) + SPINE + NECK or any(b.name.startswith(p) for p in (
            'clavicle', 'upperarm', 'lowerarm', 'hand', 'thigh', 'calf', 'foot', 'ball', 'thumb', 'index', 'middle', 'ring', 'pinky')))]
    takes = {}
    for name in names:
        if name == 'Sighting':
            n = int(round(TF * FPS))
            poses = [sighting(f / FPS) for f in range(n + 1)]
        else:
            look = 50.0 if name == 'GallopLookL' else 0.0
            poses = [gallop((f % CYCLE) / CYCLE, look) for f in range(CYCLE + 1)]
        frames = []
        solver = GroundSolver(arm, body) if body is not None else None
        for P in poses:
            if solver:
                P = solver.solve(P)
            apply_pose(arm, P)
            frames.append({b: arm.convert_space(pose_bone=arm.pose.bones[b], matrix=arm.pose.bones[b].matrix,
                                                from_space='POSE', to_space='LOCAL').copy() for b in ANIMATED})
        takes[name] = frames
        if solver:
            log('take %s: kept out of the ground; the pelvis lifted on %d of %d frames (at most %.1f cm)'
                % (name, sum(1 for v in solver.lifts if v > 0), len(solver.lifts), max(solver.lifts or [0]) * 100))
    for pb in arm.pose.bones:
        for c in list(pb.constraints):
            pb.constraints.remove(c)
        pb.matrix_basis = Matrix.Identity(4)
    acts = []
    for name, frames in takes.items():
        act = bpy.data.actions.new(name)
        arm.animation_data.action = act
        for f, mats in enumerate(frames):
            for b in ANIMATED:
                p = arm.pose.bones[b]
                p.matrix_basis = mats[b]
                p.keyframe_insert('location', frame=f)
                p.keyframe_insert('rotation_quaternion', frame=f)
        act.use_fake_user = True
        act.use_frame_range = True
        act.frame_start, act.frame_end = 0, len(frames) - 1
        acts.append(act)
        log('take %s: %d frames (%.2f s), %d bones' % (name, len(frames), (len(frames) - 1) / FPS, len(ANIMATED)))
    arm.animation_data.action = acts[0]
    sc.frame_start, sc.frame_end = 0, max(len(f) for f in takes.values()) - 1
    return acts


# =====================================================================================================================
def main():
    arm, body = load_body()
    stretch(arm, body)
    claw_objs = claws(arm, body)
    hair_tex = hair_texture(os.path.join(ART, 'T_HuskHair.png'))
    hair = hair_clumps(arm, body)
    tips = [c[0] for c in CLAWS]
    # materials: the skin keeps its own slot; the hair cards and the claws get theirs
    m_hair = bpy.data.materials.new('Hair')
    m_claw = bpy.data.materials.new('Claw')
    hair.data.materials.append(m_hair)
    for o in claw_objs:
        o.data.materials.append(m_claw)
        uvl = o.data.uv_layers.get(body.data.uv_layers[0].name) or o.data.uv_layers.new(name=body.data.uv_layers[0].name)
    for o in [body, hair] + claw_objs:
        frost_colours(o, tips)
        o.data.color_attributes.active_color_name = 'Col'
    bpy.ops.object.select_all(action='DESELECT')
    for o in [hair] + claw_objs:
        o.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    ca = body.data.color_attributes
    for extra in [c.name for c in ca if c.name != 'Col']:     # the MetaHuman's own colour sets would be exported instead
        ca.remove(ca[extra])
    ca.active_color_name = 'Col'
    ca.render_color_index = ca.active_color_index
    log('mesh: %d triangles, slots %s, colours %s' % (sum(len(p.vertices) - 2 for p in body.data.polygons), [m.name for m in body.data.materials], [c.name for c in ca]))
    rig_controls(arm, body)
    settle_stances(arm)
    acts = bake_takes(arm, ['Gallop', 'GallopLookL', 'Sighting'], body)
    ground_check(arm, body, acts)
    for b in arm.data.bones:                 # every MetaHuman bone goes out (the face copies the head and neck by name)
        b.use_deform = not b.name.startswith(('ctrl_', 'pole_'))
    to_centimetres(arm, body)
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = arm
    out = os.path.join(GEN, 'HuskBody.fbx')
    bpy.ops.export_scene.fbx(filepath=out, use_selection=True, object_types={'ARMATURE', 'MESH'}, add_leaf_bones=False,
                             use_armature_deform_only=True, bake_anim=True, bake_anim_use_all_actions=True,
                             bake_anim_use_nla_strips=False, bake_anim_force_startend_keying=True, bake_anim_step=1.0,
                             bake_anim_simplify_factor=0.0, apply_scale_options='FBX_SCALE_ALL', mesh_smooth_type='FACE',
                             colors_type='LINEAR', axis_forward='-Z', axis_up='Y')
    log('wrote', out)
    if PREVIEW:
        log('(the preview is in centimetres now; it frames and lights for metres)')
        preview(arm, body, acts)


def ground_check(arm, body, acts, step=2, tol=0.005):
    """Every take, every step-th frame: the deformed mesh against the ground it is made on (z = 0). Logs the deepest
    point under it per take (m), on which frame and in which part of the body (the bone that skin hangs from most), and
    returns {take: [(frame, depth, part), ...]} for the frames where anything is more than tol under."""
    names = {g.index: g.name for g in body.vertex_groups}
    me = body.data
    part = []
    for v in me.vertices:
        gs = [g for g in v.groups if g.weight > 0.0]
        part.append(names[max(gs, key=lambda g: g.weight).group] if gs else '?')
    labels = sorted(set(part))
    pidx = np.array([labels.index(q) for q in part])
    sc = bpy.context.scene
    found = {}
    for act in acts:
        arm.animation_data.action = act
        worst = (0.0, 0, '')
        bad = []
        per = np.zeros(len(labels))
        for f in range(int(act.frame_start), int(act.frame_end) + 1, step):
            sc.frame_set(f)
            dg = bpy.context.evaluated_depsgraph_get()
            ev = body.evaluated_get(dg)
            m = ev.to_mesh()
            mw = ev.matrix_world
            zs = np.empty(len(m.vertices) * 3, dtype=np.float32)
            m.vertices.foreach_get('co', zs)
            zs = zs.reshape(-1, 3)
            wz = (np.c_[zs, np.ones(len(zs))] @ np.array(mw).T)[:, 2]
            i = int(np.argmin(wz))
            depth = float(-wz[i])
            if len(wz) == len(pidx):
                np.maximum.at(per, pidx, -wz)
            ev.to_mesh_clear()
            if depth > tol:
                bad.append((f, depth, part[i] if i < len(part) else '?'))
            if depth > worst[0]:
                worst = (depth, f, part[i] if i < len(part) else '?')
        found[act.name] = bad
        top = np.argsort(-per)[:14]
        log('ground %s, deepest per part: %s' % (act.name, ', '.join('%s %.1f' % (labels[k], per[k] * 100) for k in top if per[k] > tol)))
        log('ground %s: deepest %.1f cm under, frame %d (%s); %d of %d frames checked are under by more than %.1f cm'
            % (act.name, worst[0] * 100, worst[1], worst[2], len(bad), len(range(int(act.frame_start), int(act.frame_end) + 1, step)), tol * 100))
    arm.animation_data.action = acts[0]
    return found


def action_fcurves(act):
    """Every f-curve of an action (slotted actions keep theirs in channel bags)."""
    layers = getattr(act, 'layers', None)
    if layers is not None and len(layers):
        for layer in layers:
            for strip in layer.strips:
                for cb in getattr(strip, 'channelbags', []):
                    yield from cb.fcurves
    elif hasattr(act, 'fcurves'):
        yield from act.fcurves


def to_centimetres(arm, body):
    """Blender metres -> centimetres in the data itself (the rest pose, the mesh, the takes' bone moves; the scene's
    unit 0.01), so the export carries no scale on any bone: the MetaHuman face copies the body's bones, scale and all,
    and its own skin is bound at scale 1."""
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    arm.animation_data.action = None
    for o in (arm, body):
        o.location = o.location * 100.0
        o.scale = o.scale * 100.0
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    body.parent = arm
    body.matrix_parent_inverse = arm.matrix_world.inverted()
    n = 0
    for act in bpy.data.actions:
        for fc in action_fcurves(act):
            if fc.data_path.endswith('.location') or fc.data_path == 'location':
                for kp in fc.keyframe_points:
                    kp.co.y *= 100.0
                    kp.handle_left.y *= 100.0
                    kp.handle_right.y *= 100.0
                fc.update()
                n += 1
    bpy.context.scene.unit_settings.scale_length = 0.01
    log('in centimetres: %d location curves scaled' % n)


def preview(arm, body, acts):
    """For checking only: the stances and moments of the takes, flat grey."""
    sc = bpy.context.scene
    g = bpy.data.meshes.new('ground')
    g.from_pydata([(-20, -20, 0), (20, -20, 0), (20, 20, 0), (-20, 20, 0)], [], [(0, 1, 2, 3)])
    sc.collection.objects.link(bpy.data.objects.new('ground', g))
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
    sun.data.energy = 3.0
    sun.rotation_euler = (math.radians(55), 0, math.radians(-35))
    sc.collection.objects.link(sun)
    w = bpy.data.worlds.new('sky')
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.45, 0.5, 0.58, 1)
    sc.world = w
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    sc.collection.objects.link(cam)
    sc.camera = cam
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 16
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 700, 520
    os.makedirs(PREVIEW, exist_ok=True)
    by = {a.name: a for a in acts}

    def shot(tag, loc, tgt, lens=40):
        cam.location = loc
        cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        cam.data.lens = lens
        sc.render.filepath = os.path.join(PREVIEW, 'husk_%s.png' % tag)
        bpy.ops.render.render(write_still=True)

    arm.animation_data.action = by['Gallop']
    for f in (0, 7, 14, 21):
        sc.frame_set(f)
        shot('gallop_%02d' % f, (6.0, -0.4, 1.0), (0, -0.4, 0.8))
    arm.animation_data.action = by['Sighting']
    for tag, t in (('halt', TA + 0.4), ('rise', TB + 0.5), ('scream', TC + 0.9), ('drop', TD + 0.4)):
        sc.frame_set(int(round(t * FPS)))
        shot('sight_' + tag, (0.0, -7.0, 1.4), (0, 0, 1.2), 35)
        if tag == 'scream':
            shot('sight_scream_side', (6.5, 0.0, 1.4), (0, 0, 1.4), 35)


if __name__ == '__main__':
    main()
