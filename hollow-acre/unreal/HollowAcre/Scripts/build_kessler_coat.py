"""SKM_Kessler_Coat: Kessler's chore coat as its own skinned mesh (the clothes layer over his body is skin-tight: blind
judges read it as a body suit). Built here in Unreal from his own body mesh with Geometry Script, written onto a copy of
his body mesh asset, so it has his exact skeleton and reference pose and follows his body as a leader-pose follower:
- his body's torso and arms, from the hips to the collar and down to the wrists (the hands, the neck above the collar
  and the legs cut away);
- pushed out from the skin by zone (a coat over a shirt and a vest: thick on the trunk, looser on the arms);
- below the chest it no longer follows him: the front falls straight from the chest and the back from the shoulder
  blades, as heavy canvas hangs;
- a skirt from the hip to mid-thigh, flaring a little, extruded from the hem's own edge;
- a collar stood up round the neck from the top edge, and cuffs a little proud at the wrists;
- skinned by transferring his body's own weights (the closest point on his body); the skirt's eased toward the pelvis
  ring by ring, so its front doesn't tear between the thighs as he walks.
Drawn by AKessler::DressUp with M_KesslerClothes in its coat zone (its buttons, pockets, folds and collar read from the
mesh's own positions). Every number from his reference pose (Kessler.cpp logged: shoulder (18.2, -2.9, 141.6), elbow
(34.4, -2.1, 120.4), wrist (47.0, 13.3, 105.3), pelvis 93, neck_01 151); MetaHumans face +Y.

Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>"""
import math

import unreal

BODY = '/Game/HollowAcre/Kessler/Built/Kessler/Body/SKM_MHC_Kessler_BodyMesh'
DIR = '/Game/HollowAcre/Kessler/Coat'
COAT = DIR + '/SKM_Kessler_Coat'
eal = unreal.EditorAssetLibrary
AU = unreal.GeometryScript_AssetUtils
Q = unreal.GeometryScript_MeshQueries
E = unreal.GeometryScript_MeshEdits
N = unreal.GeometryScript_Normals
BW = unreal.GeometryScript_BoneWeights
UV = unreal.GeometryScript_UVs
SEL = unreal.GeometryScript_MeshSelection
REP = unreal.GeometryScript_MeshRepair

SH = (18.2, -2.9, 141.6)
EL = (34.4, -2.1, 120.4)
WR = (47.0, 13.3, 105.3)
PELVIS_Z, NECK_Z = 93.0, 151.0
HEM_TOP = PELVIS_Z - 4.0          # (the torso shell's lower edge, above the crotch: the skirt hangs from it)
COLLAR_Z = NECK_Z + 2.0           # (the shell's upper edge round the neck)
CHEST_Z = 128.0
SKIRT_RINGS, SKIRT_LEN = 8, 31.0  # (to mid-thigh: about 58 cm off the ground)


def log(*a):
    unreal.log('[coat] ' + ' '.join(str(x) for x in a))


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def mul(a, s):
    return (a[0] * s, a[1] * s, a[2] * s)


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def norm(a):
    l = math.sqrt(dot(a, a)) or 1.0
    return (a[0] / l, a[1] / l, a[2] / l)


ARM_DIR = norm(sub(EL, SH))
FORE_DIR = norm(sub(WR, EL))


def zone(p):
    """(arm, beyond the wrist) for a point in the reference pose (both sides alike)."""
    pm = (abs(p[0]), p[1], p[2])
    d = dot(sub(pm, SH), ARM_DIR)
    on = add(SH, mul(ARM_DIR, max(0.0, min(d, 70.0))))
    arm_r = math.sqrt(dot(sub(pm, on), sub(pm, on)))
    fa = sub(pm, EL)
    t = dot(fa, FORE_DIR)
    on2 = mul(FORE_DIR, max(0.0, min(t, 48.0)))
    fore_r = math.sqrt(dot(sub(fa, on2), sub(fa, on2)))
    near_fore = fore_r < 9.5 and t > -2.0
    arm = (d > -3.0 and arm_r < 10.0 and p[2] > PELVIS_Z + 1.0) or near_fore
    beyond = near_fore and dot(sub(pm, WR), FORE_DIR) > -1.5
    return arm, beyond


def outs(r):
    """A Geometry Script call's out values, without the mesh it hands back."""
    if not isinstance(r, tuple):
        return r
    v = [x for x in r if not isinstance(x, unreal.DynamicMesh)]
    return v[0] if len(v) == 1 else v


L = unreal.GeometryScript_List


def items(v):
    """A Geometry Script list (vector, triangle, index, bone weights) as a Python list."""
    if isinstance(v, unreal.GeometryScriptVectorList):
        return list(L.convert_vector_list_to_array(v))
    if isinstance(v, unreal.GeometryScriptTriangleList):
        return list(L.convert_triangle_list_to_array(v))
    if isinstance(v, unreal.GeometryScriptIndexList):
        return list(L.convert_index_list_to_array(v))
    return list(v)


def vec_list(ps):
    return L.convert_array_to_vector_list([unreal.Vector(*p) for p in ps])


def tri_list(ts):
    return L.convert_array_to_triangle_list([unreal.IntVector(*t) for t in ts])


def mesh_state(dm):
    pos = [(v.x, v.y, v.z) for v in items(outs(Q.get_all_vertex_positions(dm, False))[0])]
    tris = [(t.x, t.y, t.z) for t in items(outs(Q.get_all_triangle_indices(dm, False))[0])]
    return pos, tris


def vertex_normals(pos, tris):
    n = [(0.0, 0.0, 0.0)] * len(pos)
    for a, b, c in tris:
        f = cross(sub(pos[b], pos[a]), sub(pos[c], pos[a]))      # (area-weighted)
        for i in (a, b, c):
            n[i] = add(n[i], f)
    return [norm(x) for x in n]


def boundary_loops(tris):
    """Ordered loops of boundary vertices, each following its triangles' winding (a -> b as in its triangle)."""
    count = {}
    nxt = {}
    for a, b, c in tris:
        for u, v in ((a, b), (b, c), (c, a)):
            k = (min(u, v), max(u, v))
            count[k] = count.get(k, 0) + 1
    for a, b, c in tris:
        for u, v in ((a, b), (b, c), (c, a)):
            if count[(min(u, v), max(u, v))] == 1:
                nxt[u] = v
    loops, seen = [], set()
    for s in list(nxt):
        if s in seen:
            continue
        loop, u = [], s
        while u not in seen and u in nxt:
            seen.add(u)
            loop.append(u)
            u = nxt[u]
        if len(loop) > 2:
            loops.append(loop)
    return loops


try:
    body = unreal.load_asset(BODY)
    dm = unreal.DynamicMesh()
    src = unreal.DynamicMesh()
    for m in (dm, src):
        log('copied from the body:', outs(AU.copy_mesh_from_skeletal_mesh(body, m, unreal.GeometryScriptCopyMeshFromAssetOptions(), unreal.GeometryScriptMeshReadLOD())))
    # --- keep the torso and arms
    pos, tris = mesh_state(dm)
    log('body: %d vertices, %d triangles' % (len(pos), len(tris)))
    keep = []
    for p in pos:
        arm, beyond = zone(p)
        keep.append((HEM_TOP <= p[2] <= COLLAR_Z or arm) and not beyond and p[2] <= COLLAR_Z)
    ids = items(outs(Q.get_all_triangle_i_ds(dm))[0])
    gone = [tid for tid, t in zip(ids, tris) if not (keep[t[0]] and keep[t[1]] and keep[t[2]])]
    il = L.convert_array_to_index_list(gone, unreal.GeometryScriptIndexType.TRIANGLE)
    sel = outs(SEL.convert_index_list_to_mesh_selection(dm, il, unreal.GeometryScriptMeshSelectionType.TRIANGLES))
    log('deleted', outs(E.delete_selected_triangles_from_mesh(dm, sel)))
    REP.remove_unused_vertices(dm)
    REP.compact_mesh(dm)
    pos, tris = mesh_state(dm)
    log('shell: %d vertices, %d triangles' % (len(pos), len(tris)))
    nrm = vertex_normals(pos, tris)
    # --- out from the skin by zone; below the chest the canvas falls straight, front and back
    arm_of = [zone(p)[0] for p in pos]
    chest_front, back_line = {}, {}
    for p, a in zip(pos, arm_of):
        if not a and CHEST_Z - 6.0 <= p[2] <= CHEST_Z + 8.0:
            xb = int(round(p[0] / 4.0))
            if p[1] > 0.0:
                chest_front[xb] = max(chest_front.get(xb, -1e9), p[1])
            else:
                back_line[xb] = min(back_line.get(xb, 1e9), p[1])
    new = []
    for p, n, a in zip(pos, nrm, arm_of):
        th = 2.6 if a else 3.3
        if p[2] > NECK_Z - 7.0 and not a:
            th = 3.6
        q = add(p, mul(n, th))
        if not a and p[2] < CHEST_Z:
            xb = int(round(p[0] / 4.0))
            drop = (CHEST_Z - p[2]) * 0.06
            if q[1] > 0.0 and xb in chest_front:
                q = (q[0], max(q[1], chest_front[xb] + 3.3 - drop), q[2])
            elif q[1] <= 0.0 and xb in back_line:
                q = (q[0], min(q[1], back_line[xb] - 3.3 + drop), q[2])
        new.append(q)
    E.set_all_mesh_vertex_positions(dm, vec_list(new))
    # --- its edges: the hem (the skirt hangs from it), the collar (stood up), the wrists (the cuffs)
    loops = boundary_loops(tris)
    log('edges:', [(len(l), round(sum(new[i][2] for i in l) / len(l), 1)) for l in loops])
    add_pos, add_tris = [], []
    base = len(new)
    skirt_ids = []

    def extrude(loop, rings, at):
        """Rings of new vertices beyond a loop (at(k, vertex position) -> position), stitched in the loop's winding."""
        prev = list(loop)
        made = []
        for k in range(1, rings + 1):
            ring = []
            for i in loop:
                add_pos.append(at(k, new[i]))
                ring.append(base + len(add_pos) - 1)
            m = len(loop)
            for j in range(m):
                a, b = prev[j], prev[(j + 1) % m]
                a1, b1 = ring[j], ring[(j + 1) % m]
                add_tris.append((b, a, a1))
                add_tris.append((b, a1, b1))
            made.append(ring)
            prev = ring
        return made

    for loop in loops:
        zs = [new[i][2] for i in loop]
        zm = sum(zs) / len(zs)
        cx = sum(new[i][0] for i in loop) / len(loop)
        cy = sum(new[i][1] for i in loop) / len(loop)
        if zm < HEM_TOP + 8.0:
            # (the skirt: straight down, flaring as it goes, its hem level)
            z0 = min(zs)

            def skirt(k, p, cx=cx, cy=cy, z0=z0):
                f = 1.0 + 0.016 * k
                return (cx + (p[0] - cx) * f, cy + (p[1] - cy) * f, z0 - SKIRT_LEN * k / SKIRT_RINGS - (p[2] - z0) * (1.0 - k / SKIRT_RINGS))
            rings = extrude(loop, SKIRT_RINGS, skirt)
            skirt_ids = rings
            log('skirt from the hem (%d round, at %.0f cm)' % (len(loop), z0))
        elif zm > NECK_Z - 8.0:
            # (the collar: up and a little out)
            def collar(k, p, cx=cx, cy=cy):
                d = norm((p[0] - cx, p[1] - cy, 0.0))
                return (p[0] + d[0] * 0.9 * k, p[1] + d[1] * 0.9 * k, p[2] + 2.6 * k)
            extrude(loop, 2, collar)
            log('collar (%d round)' % len(loop))
        else:
            # (a cuff: on a little toward the hand, a little proud)
            sx = 1.0 if cx > 0 else -1.0
            fd = (FORE_DIR[0] * sx, FORE_DIR[1], FORE_DIR[2])

            def cuff(k, p, cx=cx, cy=cy, fd=fd):
                c = (cx, cy, sum(new[i][2] for i in loop) / len(loop))
                d = norm(sub(p, c))
                return add(add(p, mul(fd, 2.2)), mul(d, 0.8))
            extrude(loop, 1, cuff)
            log('cuff (%d round)' % len(loop))
    ids_new = outs(E.add_vertices_to_mesh(dm, vec_list(add_pos)))
    log('added', len(items(ids_new)), 'vertices,', len(add_tris), 'triangles')
    E.add_triangles_to_mesh(dm, tri_list(add_tris))
    N.recompute_normals(dm, unreal.GeometryScriptCalculateNormalsOptions())
    UV.set_mesh_u_vs_from_box_projection(dm, 0, unreal.Transform(scale=unreal.Vector(40.0, 40.0, 40.0)), unreal.GeometryScriptMeshSelection())
    # --- his weights; the skirt eased toward the pelvis ring by ring
    BW.transfer_bone_weights_from_mesh(src, dm, unreal.GeometryScriptTransferBoneWeightsOptions())
    pel = outs(BW.get_bone_index(dm, 'pelvis'))
    if isinstance(pel, list):
        pel = [x for x in pel if isinstance(x, int)][-1] if any(isinstance(x, int) for x in pel) else -1
    log('pelvis bone', pel)
    eased = 0
    if isinstance(pel, int) and pel >= 0:
        prof = unreal.GeometryScriptBoneWeightProfile()
        for k, ring in enumerate(skirt_ids, start=1):
            share = 0.55 * (1.0 - 0.5 * k / SKIRT_RINGS)          # (the pelvis's share: most near the waist)
            for vid in ring:
                r = outs(BW.get_vertex_bone_weights(dm, vid, prof))
                ws = r[0] if isinstance(r, list) else r
                ws = items(ws)
                acc = {}
                for w in ws:
                    acc[w.bone_index] = acc.get(w.bone_index, 0.0) + w.weight * (1.0 - share)
                acc[pel] = acc.get(pel, 0.0) + share
                out = []
                for bi, wt in acc.items():
                    bw = unreal.GeometryScriptBoneWeight()
                    bw.set_editor_property('bone_index', bi)
                    bw.set_editor_property('weight', wt)
                    out.append(bw)
                BW.set_vertex_bone_weights(dm, vid, out, prof)
                eased += 1
    log('skirt weights eased:', eased)
    # --- onto a copy of his body asset (his skeleton and reference pose)
    if eal.does_asset_exist(COAT):
        eal.delete_asset(COAT)
    coat = eal.duplicate_asset(BODY, COAT)
    log('copy to', COAT, outs(AU.copy_mesh_to_skeletal_mesh(dm, coat, unreal.GeometryScriptCopyMeshToAssetOptions(), unreal.GeometryScriptMeshWriteLOD())))
    eal.save_loaded_asset(coat)
    log('saved', COAT, Q.get_mesh_info_string(dm)[:120])
except Exception as e:
    import traceback
    unreal.log_error('[coat] FAILED %r\n%s' % (e, traceback.format_exc()))
