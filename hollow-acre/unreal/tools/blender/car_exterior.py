"""The outside of the player's car, built in the same Blender session as car_interior.py (which imports and runs it).

The car is modelled on one specific car: a 1980s compact executive sedan of the Mercedes-Benz 190 (W201) type, the
pre-facelift version (study only: _references/SOURCES.txt; photos and a 3D model viewed in a web viewer; nothing copied
or shipped; no badges, no star, no brand grille). Its real numbers: length 4.42 m, wheelbase 2.665 m, width 1.68 m,
height 1.38 m. It still matches the Part 1 pixel car (2d/spr/lpc/obj/car_beaten.png): red, silver bumpers, rectangular
headlights with a grille between them, red taillights, steel wheels with hubcaps, rust along the sills and a grey
primer patch low on the passenger front door.

The shape, from the references:
- a wedge: the hood slopes down to a low nose, the trunk is high and short, the tail tall and squared off;
- the windshield is raked (about 59 degrees from upright), the rear window too, the roof short and crowned;
- the sides bulge low down and the upper doors lean in hard to a crisp beltline crease; the side glass leans in
  further (tumblehome), so the roof is much narrower than the body;
- the nose narrows in plan view and its corners are round; the bumpers are deep and wrap round to the wheel arches;
- ribbed taillights, a wide C pillar with a small vent, a thin rub strip low on the doors, round arches with a lip.

Car frame (cm): X forward, Y right, Z up, the driver's eye at (0, 0, 118), the car's centre line at Y = YC, ground z=0.
"u" below is the sideways offset from the centre line (positive to the right).
"""
import functools
import math

import bmesh
import bpy
from mathutils import Vector

YC = 37.0
W = 84.0                        # half the body width at its widest
FRONT, REAR = 243.0, -183.0     # body ends (bumpers stand off these): 4.42 m long over the bumpers
AXLE_F, AXLE_R = 170.0, -95.0   # wheelbase 2.65 m
TYRE_R, ARCH_R = 30.5, 35.5
BELT = 97.3                     # beltline along the doors (it rises toward the tail)
HOOD_X = 106.5                  # back edge of the hood (the cowl sits between it and the windshield)
TRUNK_X = -134.0                # where the rear window meets the trunk lid
WS_TOP_X, WS_TOP_Z = 40.0, 134.5   # top of the windshield (must match car_interior.windshield_edges)
ROOF_REAR = -88.0               # where the roof meets the rear window
C_FRONT = (-80.0, -84.0)        # front edge of the C pillar (rear door's back edge) at the beltline and at the roof
END_F, END_R = 5.0, 6.0         # how round the body's front and rear edges are
SHOULDER_R, SILL_R = 3.0, 5.0   # a crisp beltline crease, a soft sill
GLASS_U0, GLASS_Z0, GLASS_Z1 = 76.5, 99.0, 134.0
LEAN = 9.5                      # the side glass leans in this much from the beltline to the roof (tumblehome)
ROOF_U, ROOF_Z0, ROOF_Z1, ROOF_CROWN = 70.0, 134.6, 138.4, 2.6
HOOD_EDGE_U = 73.6              # hood and trunk-lid shut lines


def _ext():
    import sys
    return sys.modules['__main__']   # the helpers live in car_interior.py, which Blender runs as __main__


# ---------------- shape functions ----------------
def lerp_table(tab, x):
    if x <= tab[0][0]:
        return tab[0][1]
    for (x0, y0), (x1, y1) in zip(tab, tab[1:]):
        if x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return tab[-1][1]


def smoothstep(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def glass_u(z):
    return GLASS_U0 - LEAN * (z - GLASS_Z0) / (GLASS_Z1 - GLASS_Z0)


def deck_z(x):
    """Height of the body's top edge along the car: hood falling to a low nose, flat beltline, high short trunk."""
    if x >= HOOD_X:
        return 94.0 - 17.5 * ((x - HOOD_X) / (FRONT - HOOD_X)) ** 1.5
    return lerp_table([(REAR, 100.0), (REAR + 14, 100.9), (-160.0, 100.8), (TRUNK_X - 2, 99.9), (C_FRONT[0] - 2, 97.6),
                       (-40.0, BELT), (94.0, BELT), (HOOD_X, 94.0)], x)


def bottom_z(x):
    return lerp_table([(REAR, 33.0), (REAR + 14, 25.0), (FRONT - 16, 25.0), (FRONT, 31.0)], x)


def half_width(x):
    """Plan view: full width along the doors; the nose narrows, the tail a little."""
    return (W - 4.0 * max(0.0, (x - (FRONT - 70)) / 70) ** 2 - 2.5 * max(0.0, ((REAR + 50) - x) / 50) ** 2)


def end_inset(x):
    """How far the cross-section shrinks at the rounded front and rear ends."""
    e = x - (FRONT - END_F)
    if e > 0:
        return END_F - math.sqrt(max(0.0, END_F * END_F - e * e))
    e = (REAR + END_R) - x
    if e > 0:
        return END_R - math.sqrt(max(0.0, END_R * END_R - e * e))
    return 0.0


def crease_z(x):
    """The body-side crease (the 190's feature line at door-handle height): from the top of the headlamps, along the
    wings and doors, to the top of the taillights."""
    return lerp_table([(REAR, 84.5), (-150.0, 85.0), (0.0, 82.5), (120.0, 79.5), (200.0, 74.0), (FRONT, 67.0)], x)


def tuck(z, zb, zt, zc):
    """Widest low on the doors; the side steps in at the crease and leans in hard above it to the beltline; the sill
    tucks under."""
    zw = min(54.0, zc - 4.0)
    if z < zw:
        return 3.5 * ((zw - z) / max(1.0, zw - zb)) ** 2
    if z <= zc:
        return 1.0 * ((z - zw) / max(1.0, zc - zw)) ** 2
    return 1.0 + 3.8 * (z - zc) / max(1.0, zt - zc)


def deck_shape(x, u, ue):
    """Crown of the hood/trunk, the hood's two creases (converging toward the grille) round a raised centre, and the
    cowl channel."""
    au = abs(u)
    z = 1.8 * max(0.0, 1 - (au / ue) ** 2)
    if x >= HOOD_X:
        c = 40.0 - 9.0 * (x - HOOD_X) / (FRONT - HOOD_X)
        z += 0.9 * (1 - smoothstep(c - 3, c + 3, au)) * smoothstep(HOOD_X, HOOD_X + 6, x)
    z -= 2.2 * (1 - smoothstep(66, 74, au)) * smoothstep(95, 98, x) * (1 - smoothstep(HOOD_X - 1.0, HOOD_X + 0.4, x))
    return z


def rounded_rect(w, zb, zt, rb, rt, nb=4, na=5, ns=12, nt=20, zc=None, ns_lo=9, ns_hi=5):
    """A closed cross-section: bottom centre, up the right side, top centre, down the left side.
    Returns [(u, z, part)] with part in bottom / arc_b / side / crease / arc_t / top. With zc, the side has a point
    exactly on the crease (so the crease can be a crisp edge)."""
    right = []
    for i in range(nb):
        right.append(((w - rb) * i / nb, zb, 'bottom'))
    for i in range(na + 1):
        a = -math.pi / 2 + (math.pi / 2) * i / na
        right.append((w - rb + rb * math.cos(a), zb + rb + rb * math.sin(a), 'arc_b'))
    za, zz = zb + rb, zt - rt
    if zc is None:
        for i in range(1, ns):
            right.append((w, za + (zz - za) * i / ns, 'side'))
    else:
        zc = min(max(zc, za + 1.0), zz - 1.0)
        for i in range(1, ns_lo):
            right.append((w, za + (zc - za) * i / ns_lo, 'side'))
        right.append((w, zc, 'crease'))
        for i in range(1, ns_hi):
            right.append((w, zc + (zz - zc) * i / ns_hi, 'side'))
    for i in range(na + 1):
        a = (math.pi / 2) * i / na
        right.append((w - rt + rt * math.cos(a), zt - rt + rt * math.sin(a), 'arc_t'))
    for i in range(1, nt + 1):
        right.append(((w - rt) * (1 - i / nt), zt, 'top'))
    left = [(-u, z, p) for u, z, p in reversed(right[1:-1])]
    return right + left


def body_ring(x, d=None):
    """The body's cross-section at x: [(u, z, part, ue)]."""
    if d is None:
        d = end_inset(x)
    w = half_width(x) - d
    zt = deck_z(x) - d
    zb = bottom_z(x) + d
    zc = min(max(crease_z(x), zb + SILL_R + 1.0), zt - SHOULDER_R - 1.0)
    ue = w - SHOULDER_R
    out = []
    for u, z, part in rounded_rect(w, zb, zt, SILL_R, SHOULDER_R, zc=zc):
        s = 1.0 - tuck(z, zb, zt, zc) / W
        if part in ('top', 'arc_t'):
            wgt = 1.0 if part == 'top' else max(0.0, (z - (zt - SHOULDER_R)) / SHOULDER_R)
            z += wgt * deck_shape(x, u, ue)
        out.append((u * s, z, part, ue * s))
    return out


def surface_u(x, z):
    """How far out the body's side skin is at (x, z) (right side; the car is symmetric)."""
    ring = body_ring(x)
    side = [(u, zz) for u, zz, part, _ in ring if u > 0 and part in ('arc_b', 'side', 'arc_t')]
    side.sort(key=lambda p: p[1])
    if z <= side[0][1]:
        return side[0][0]
    for (u0, z0), (u1, z1) in zip(side, side[1:]):
        if z <= z1:
            return u0 + (u1 - u0) * (z - z0) / max(1e-6, z1 - z0)
    return side[-1][0]


def deck_surface_z(x, u):
    """Height of the top surface (hood, trunk lid) at (x, u)."""
    pts = sorted((abs(uu), z) for uu, z, part, _ in body_ring(x) if part == 'top' and uu >= 0)
    au = abs(u)
    for (u0, z0), (u1, z1) in zip(pts, pts[1:]):
        if au <= u1:
            return z0 + (z1 - z0) * (au - u0) / max(1e-6, u1 - u0)
    return pts[-1][1]


def side_normal(x, z, sgn):
    """Outward normal of the body side at (x, z)."""
    du_dz = surface_u(x, z + 0.5) - surface_u(x, z - 0.5)
    du_dx = surface_u(x + 0.5, z) - surface_u(x - 0.5, z)
    return Vector((-du_dx, sgn * 1.0, -du_dz)).normalized()


@functools.lru_cache(maxsize=None)
def _end_x(u10, z10, front):
    u, z = u10 / 10.0, z10 / 10.0
    if front:
        x = FRONT
        while x > FRONT - 20 and surface_u(x, z) < u:
            x -= 0.25
    else:
        x = REAR
        while x < REAR + 20 and surface_u(x, z) < u:
            x += 0.25
    return x


def front_x_at(u, z):
    """Where the body's front face is at sideways offset u and height z (scanning back from the nose)."""
    return _end_x(round(abs(u) * 10), round(z * 10), True)


def rear_x_at(u, z):
    """Where the body's tail is at sideways offset u and height z."""
    return _end_x(round(abs(u) * 10), round(z * 10), False)


def arch_span(ax, z, margin=0.0):
    """Where a wheel arch (with its lip) crosses height z: (x_front, x_rear)."""
    r = ARCH_R + margin
    dz = z - TYRE_R
    if abs(dz) >= r:
        return None
    dx = math.sqrt(r * r - dz * dz)
    return ax + dx, ax - dx


# ---------------- mesh builders ----------------
def loft(name, rings, mats, face_mat=None, uv_fn=None, caps=(True, True), cap_bulge=(0.0, 0.0), closed=False, sharp=None):
    """A solid through rings of points (each ring a list of (Vector, info)); fan caps close the ends (or the rings
    close into a loop). face_mat(infos, centre) -> material index; uv_fn(co, info, mat_index, is_cap) -> (u, v);
    sharp(info_a, info_b) -> True marks the lengthwise edge between two rings' matching points as a crisp crease."""
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.verify()
    info = {}
    vr = []
    for ring in rings:
        row = []
        for p, inf in ring:
            v = bm.verts.new(p)
            info[v] = inf
            row.append(v)
        vr.append(row)
    n = len(vr[0])
    body_faces, cap_faces = [], []
    segs = len(vr) if closed else len(vr) - 1
    for i in range(segs):
        a, b = vr[i], vr[(i + 1) % len(vr)]
        for j in range(n):
            body_faces.append(bm.faces.new((a[j], b[j], b[(j + 1) % n], a[(j + 1) % n])))
    for end, do in enumerate(caps if not closed else (False, False)):
        if not do:
            continue
        ring, prev = (vr[0], vr[1]) if end == 0 else (vr[-1], vr[-2])
        c = sum((v.co for v in ring), Vector()) / n
        axis = sum(((a.co - b.co) for a, b in zip(ring, prev)), Vector()).normalized()
        cv = bm.verts.new(c + axis * cap_bulge[end])
        info[cv] = info[ring[0]]
        for j in range(n):
            cap_faces.append(bm.faces.new((ring[j], ring[(j + 1) % n], cv)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if sharp:
        for i in range(segs):
            a, b = vr[i], vr[(i + 1) % len(vr)]
            for j in range(n):
                if sharp(info[a[j]], info[b[j]]):
                    e = bm.edges.get((a[j], b[j]))
                    if e:
                        e.smooth = False
    for f, is_cap in [(f, False) for f in body_faces] + [(f, True) for f in cap_faces]:
        k = face_mat([info[v] for v in f.verts], f.calc_center_median()) if face_mat else 0
        f.material_index = k
        for l in f.loops:
            l[uvl].uv = uv_fn(l.vert.co, info[l.vert], k, is_cap) if uv_fn else (l.vert.co.x / 20.0, l.vert.co.z / 20.0)
    bm.to_mesh(me)
    bm.free()
    obj = ci.link(bpy.data.objects.new(name, me), mats[0])
    for m in mats[1:]:
        obj.data.materials.append(ci.material(m))
    return obj


def sheet(name, mat, rows, toward=None, away=None, uv_fn=None):
    """An open surface through rows of points, its front facing toward (or away from) a point."""
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.verify()
    vs = [[bm.verts.new(p) for p in row] for row in rows]
    for r in range(len(rows) - 1):
        for c in range(len(rows[0]) - 1):
            bm.faces.new((vs[r][c], vs[r + 1][c], vs[r + 1][c + 1], vs[r][c + 1]))
    bm.normal_update()
    bm.faces.ensure_lookup_table()
    f = bm.faces[len(bm.faces) // 2]
    ref = toward if toward is not None else away
    facing = f.normal.dot(ref - f.calc_center_median()) > 0
    if facing != (toward is not None):
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    for f in bm.faces:
        for l in f.loops:
            co = l.vert.co
            l[uvl].uv = uv_fn(co) if uv_fn else (co.x / 20.0, co.z / 20.0)
    bm.to_mesh(me)
    bm.free()
    obj = ci.link(bpy.data.objects.new(name, me), mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def side_uv(co):
    """Body-side mapping: U along the car in metres, V metres down from the beltline (rust is keyed to it)."""
    return (co.x / 100.0, min(0.995, 1.0 - (BELT - co.z) / 100.0))


def lean_prism(name, mat, pts_xz, du0, du1, sgn, bevel=0.6):
    """A flat shape in the side view (x, z), from du0 to du1 off the leaning side-glass line (pillars, vents)."""
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    a = [bm.verts.new((x, YC + sgn * (glass_u(z) + du0), z)) for x, z in pts_xz]
    b = [bm.verts.new((x, YC + sgn * (glass_u(z) + du1), z)) for x, z in pts_xz]
    bm.faces.new(a)
    bm.faces.new(list(reversed(b)))
    k = len(pts_xz)
    for i in range(k):
        bm.faces.new((a[i], a[(i + 1) % k], b[(i + 1) % k], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ci.box_uv(bm)
    bm.to_mesh(me)
    bm.free()
    return ci.finish(ci.link(bpy.data.objects.new(name, me), mat), bevel=bevel, segs=3)


def side_strip(name, mat, x0, x1, z0, z1, proud, sgn, step=4.0):
    """A trim strip lying on the curved body side (rub strip, sill trim), standing `proud` cm off the skin."""
    h = z1 - z0
    prof = [(z0, -0.6), (z0, proud * 0.55), (z0 + 0.25 * h, proud), (z1 - 0.25 * h, proud), (z1, proud * 0.55), (z1, -0.6)]
    n = max(2, int((x1 - x0) / step))
    rings = []
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        rings.append([(Vector((x, YC + sgn * (surface_u(x, z) + o), z)), None) for z, o in prof])
    obj = loft(name, rings, [mat])
    return _ext().finish(obj)


def sweep(name, mat, path, prof):
    """A solid swept along a plan-view path [(x, u, nx, nu)] (point and outward normal); prof = [(n, z)]."""
    rings = [[(Vector((x + n * nx, YC + u + n * nu, z)), None) for n, z in prof] for x, u, nx, nu in path]
    return _ext().finish(loft(name, rings, [mat], uv_fn=lambda co, inf, k, cap: (co.x / 20.0 + co.y / 20.0, co.z / 20.0)))


def bumper_path(x_face, sgn_x, side_u, R=15.0, ret=22.0):
    """Centre line of a wrap-around bumper: back along the right side, round the corner, across, round, back along
    the left side. Points are (x, u, outward nx, outward nu)."""
    pts = []
    xc = -R                                     # corner centres, relative to the bumper face (local x)
    uc = side_u - R
    for i in range(4):
        pts.append((xc - ret * (1 - i / 4), side_u, 0.0, 1.0))
    for i in range(9):
        a = (math.pi / 2) * i / 8
        pts.append((xc + R * math.sin(a), uc + R * math.cos(a), math.sin(a), math.cos(a)))
    for i in range(1, 8):
        pts.append((1.2 * (1 - ((1 - 2 * i / 8) ** 2)), uc - 2 * uc * i / 8, 1.0, 0.0))   # bowed a little forward
    for i in range(9):
        b = (math.pi / 2) * i / 8
        pts.append((xc + R * math.cos(b), -uc - R * math.sin(b), math.cos(b), -math.sin(b)))
    for i in range(1, 5):
        pts.append((xc - ret * i / 4, -side_u, 0.0, -1.0))
    return [(x_face + sgn_x * lx, u, sgn_x * nx, nu) for lx, u, nx, nu in pts]


def rrect_profile(n0, n1, z0, z1, r):
    """A rounded rectangle in (n, z) for sweeps."""
    pts = []
    corners = [((n1 - r, z0 + r), -90), ((n1 - r, z1 - r), 0), ((n0 + r, z1 - r), 90), ((n0 + r, z0 + r), 180)]
    for (cn, cz), a0 in corners:
        for i in range(4):
            a = math.radians(a0 + 90 * i / 3)
            pts.append((cn + r * math.cos(a), cz + r * math.sin(a)))
    return pts


# ---------------- the parts ----------------
def cutter(name, mat, lo, hi):
    """A box that a Boolean modifier subtracts (its faces keep `mat`, so gaps read dark)."""
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    lo, hi = Vector(lo), Vector(hi)
    for v in bm.verts:
        v.co = Vector((lo.x + (v.co.x + 0.5) * (hi.x - lo.x), lo.y + (v.co.y + 0.5) * (hi.y - lo.y), lo.z + (v.co.z + 0.5) * (hi.z - lo.z)))
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.data.materials.append(ci.material(mat))
    bpy.context.collection.objects.link(obj)
    obj['cutter'] = True
    obj.display_type = 'WIRE'
    return obj


def cyl_cutter(name, mat, c, r, length):
    ci = _ext()
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=64, radius1=r, radius2=r, depth=length)
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=__import__('mathutils').Matrix.Rotation(math.radians(90), 3, 'X'))
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector(c))
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    obj.data.materials.append(ci.material(mat))
    bpy.context.collection.objects.link(obj)
    obj['cutter'] = True
    obj.display_type = 'WIRE'
    return obj


def subtract(obj, cutters):
    for c in cutters:
        m = obj.modifiers.new('cut_' + c.name, 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.solver = 'EXACT'
        m.material_mode = 'TRANSFER'
        m.object = c


def v_cutter(name, pts, normals, width=0.5, depth=1.3, mat='gap', closed=False):
    """A V-shaped groove cutter along points on the skin (shut lines): `width` wide at the surface, `depth` deep, so the
    panel edges either side roll into a real gap."""
    out_h = 1.5
    w_out = (width / 2) * (depth + out_h) / depth
    rings = []
    k = len(pts)
    for i, (p, n) in enumerate(zip(pts, normals)):
        if closed:
            t = (pts[(i + 1) % k] - pts[(i - 1) % k]).normalized()
        else:
            t = (pts[min(i + 1, k - 1)] - pts[max(i - 1, 0)]).normalized()
        side = t.cross(n).normalized()
        rings.append([(p + n * out_h + side * w_out, None), (p + n * out_h - side * w_out, None), (p - n * depth, None)])
    obj = loft(name, rings, [mat], closed=closed)
    obj['cutter'] = True
    obj.display_type = 'WIRE'
    return obj


def side_seam_v(x, z0, z1, sgn, step=2.5):
    n = max(2, int((z1 - z0) / step))
    zs = [z0 + (z1 - z0) * i / n for i in range(n + 1)]
    pts = [Vector((x, YC + sgn * surface_u(x, z), z)) for z in zs]
    return v_cutter('seam', pts, [side_normal(x, z, sgn) for z in zs])


def side_seam_h(x0, x1, z, sgn, step=4.0):
    n = max(2, int((x1 - x0) / step))
    xs = [x0 + (x1 - x0) * i / n for i in range(n + 1)]
    pts = [Vector((x, YC + sgn * surface_u(x, z), z)) for x in xs]
    return v_cutter('seam', pts, [side_normal(x, z, sgn) for x in xs])


def deck_seam(pts_xu):
    """A shut line across the top (hood, trunk lid): points (x, u) on the deck."""
    pts, nrm = [], []
    for x, u in pts_xu:
        z = deck_surface_z(x, u)
        dzdx = deck_surface_z(x + 0.5, u) - deck_surface_z(x - 0.5, u)
        dzdu = deck_surface_z(x, u + 0.5) - deck_surface_z(x, u - 0.5)
        pts.append(Vector((x, YC + u, z)))
        nrm.append(Vector((-dzdx, -dzdu, 1.0)).normalized())
    return v_cutter('seam', pts, nrm, width=0.45, depth=1.2)


def flap_seam(x0, x1, z0, z1, r, sgn):
    """A closed groove round a rounded-corner panel on the side (fuel flap)."""
    pts2 = []
    for (cx, cz), a0 in (((x1 - r, z0 + r), -90), ((x1 - r, z1 - r), 0), ((x0 + r, z1 - r), 90), ((x0 + r, z0 + r), 180)):
        for i in range(5):
            a = math.radians(a0 + 90 * i / 4)
            pts2.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    pts = [Vector((x, YC + sgn * surface_u(x, z), z)) for x, z in pts2]
    return v_cutter('flap_seam', pts, [side_normal(x, z, sgn) for x, z in pts2], width=0.35, depth=0.9, closed=True)


def stations():
    xs = []
    for i in range(7):                                   # rear end, rounding over
        a = math.pi / 2 * (1 - i / 6)
        xs.append((REAR + END_R - END_R * math.sin(a), END_R * (1 - math.cos(a))))
    n = int((FRONT - END_F - REAR - END_R) / 3.5)
    for i in range(1, n):
        xs.append((REAR + END_R + (FRONT - END_F - REAR - END_R) * i / n, 0.0))
    for i in range(7):                                   # front end
        a = math.pi / 2 * i / 6
        xs.append((FRONT - END_F + END_F * math.sin(a), END_F * (1 - math.cos(a))))
    return xs


def body_shell():
    rings = []
    for x, d in stations():
        rings.append([(Vector((x, YC + u, z)), (part, u, ue)) for u, z, part, ue in body_ring(x, d)])

    def face_mat(infos, c):
        return 1 if c.x > HOOD_X and all(i[0] == 'top' for i in infos) else 0

    def uv_fn(co, inf, k, cap):
        part, u, ue = inf
        if k == 1:                                       # hood: 0-1 over the top, like the pixel car's hood texture
            return ((74.5 - u) / 149.0, (co.x - HOOD_X) / (FRONT - HOOD_X))
        if cap:
            return (u / 100.0, min(0.995, 1.0 - (BELT - co.z) / 100.0))
        if part == 'top':
            return (co.x / 100.0, 0.995 - (ue - abs(u)) / 200.0)
        return side_uv(co)

    body = loft('body', rings, ['bodypaint', 'hoodpaint'], face_mat, uv_fn, cap_bulge=(0.0, 0.4),
                sharp=lambda a, b: a[0] == 'crease' and b[0] == 'crease')
    for p in body.data.polygons:
        p.use_smooth = True
    cuts = [cutter('cabin_hollow', 'gap', (TRUNK_X + 4, YC - 74.0, 34), (100, YC + 74.0, 150))]
    for ax in (AXLE_F, AXLE_R):
        cuts.append(cyl_cutter('arch', 'gap', (ax, YC, TYRE_R), ARCH_R, 2 * W + 10))
    E = HOOD_EDGE_U + 0.25
    for sgn in (-1, 1):
        # door shut lines as real grooves: front edge, between the doors, rear edge (above the arch), the door bottoms
        for x, z0 in ((100.5, 30.0), (-20.5, 30.0), (C_FRONT[0], 61.0)):
            cuts.append(side_seam_v(x, z0, BELT + 1.2, sgn))
        cuts.append(side_seam_h(-60.0, 100.8, 31.7, sgn))
        # hood and trunk-lid edges along the tops of the wings
        cuts.append(deck_seam([(HOOD_X + (FRONT + 2 - HOOD_X) * i / 30, sgn * E) for i in range(31)]))
        cuts.append(deck_seam([(TRUNK_X - 2.5 + (REAR - 1.0 - TRUNK_X + 2.5) * i / 16, sgn * E) for i in range(17)]))
        # door handle pockets (the handles sit in a recess in the skin)
        for x in (14.0, -48.0):
            u = surface_u(x, 87.2)
            lo, hi = sorted((YC + sgn * (u - 1.2), YC + sgn * (u + 4.0)))
            cuts.append(cutter('handle_pocket', 'paint', (x - 7.6, lo, 84.6), (x + 7.6, hi, 89.8)))
        # lamp, indicator, grille and plate housings: real openings, not stickers
        cy = YC + sgn * 53.0
        cuts.append(cutter('lamp_pocket', 'chrome', (FRONT - 4.5, cy - 17.4, 56.8), (FRONT + 8, cy + 17.4, 70.6)))
        lo, hi = sorted((YC + sgn * 70.3, YC + sgn * 80.0))
        cuts.append(cutter('indicator_pocket', 'gap', (FRONT - 8.0, lo, 56.8), (FRONT + 8, hi, 70.6)))
        lo, hi = sorted((YC + sgn * 25.0, YC + sgn * 80.0))
        cuts.append(cutter('tail_pocket', 'gap', (REAR - 8.0, lo, 61.8), (REAR + 2.2, hi, 86.2)))
    cuts.append(deck_seam([(HOOD_X, -E + 2 * E * i / 30) for i in range(31)]))                 # hood's rear edge
    cuts.append(deck_seam([(TRUNK_X - 2.5, -E + 2 * E * i / 24) for i in range(25)]))         # trunk lid's front edge
    cuts.append(cutter('grille_pocket', 'gap', (FRONT - 7.0, YC - 31.6, 56.0), (FRONT + 8, YC + 31.6, 71.8)))
    cuts.append(cutter('plate_pocket', 'gap', (REAR - 8.0, YC - 23.0, 64.0), (REAR + 1.4, YC + 23.0, 80.0)))
    cuts.append(flap_seam(-152.0, -138.0, 80.0, 91.0, 2.5, 1))                               # fuel flap, right side
    subtract(body, cuts)
    _ext().finish(body, bevel=0.45, segs=3, angle=40)
    return body


def arch_lips_and_wells():
    """Rolled lips round the wheel arches, and dark wells behind them so the arches look deep."""
    prof = [(-0.8, -1.2), (-0.8, 0.4), (0.3, 1.1), (1.8, 1.2), (3.4, 0.7), (5.0, -0.5)]   # (radius offset, outward)
    for ax in (AXLE_F, AXLE_R):
        for sgn in (-1, 1):
            rows = []
            for k in range(41):
                th = math.radians(-6 + 192 * k / 40)
                row = []
                for dr, o in prof:
                    r = ARCH_R + dr
                    x = ax + r * math.cos(th)
                    z = TYRE_R + r * math.sin(th)
                    row.append(Vector((x, YC + sgn * (surface_u(x, max(z, 27.0)) + o), z)))
                rows.append(row)
            sheet('arch_lip', 'bodypaint', rows, away=Vector((ax, YC, TYRE_R)), uv_fn=side_uv)
            well, back = [], []
            for k in range(29):
                th = math.radians(-14 + 208 * k / 28)
                cs, sn = math.cos(th), math.sin(th)
                well.append([Vector((ax + (ARCH_R - 0.4) * cs, YC + sgn * uu, TYRE_R + (ARCH_R - 0.4) * sn)) for uu in (W - 30.0, W - 1.5)])
                back.append([Vector((ax + r * cs, YC + sgn * (W - 30.0), TYRE_R + r * sn)) for r in (3.0, ARCH_R - 0.4)])
            sheet('well', 'gap', well, toward=Vector((ax, YC + sgn * (W - 15.0), TYRE_R)))
            sheet('well_back', 'gap', back, toward=Vector((ax, YC + sgn * W, TYRE_R)))


def roof():
    rings = []
    x0, x1, r0, r = ROOF_REAR - 1.0, WS_TOP_X + 1.5, 9.0, 4.0
    xs = [(x0 + r0 - r0 * math.sin(math.pi / 2 * (1 - i / 7)), r0 * (1 - math.cos(math.pi / 2 * (1 - i / 7)))) for i in range(8)]
    n = 34
    xs += [(x0 + r0 + (x1 - x0 - r0 - r) * i / n, 0.0) for i in range(1, n)]
    xs += [(x1 - r + r * math.sin(math.pi / 2 * i / 5), r * (1 - math.cos(math.pi / 2 * i / 5))) for i in range(6)]
    for x, d in xs:
        ring = []
        k = 0.45 if x < 0 else 0.6                       # the rear end falls further, toward the rear window
        w, zb, zt = ROOF_U - d * 0.25, ROOF_Z0 + d * 0.12, ROOF_Z1 - d * k
        ue = w - 3.5
        # the roof's crown also falls toward its front and rear edges
        along = 1.0 - ((x - (x0 + x1) / 2) / ((x1 - x0) / 2)) ** 4
        for u, z, part in rounded_rect(w, zb, zt, 0.8, 3.5, nb=3, na=4, ns=2, nt=16):
            if part == 'top':
                z += ROOF_CROWN * (1 - (u / ue) ** 2) * (0.35 + 0.65 * along)
            ring.append((Vector((x, YC + u, z)), part))
        rings.append(ring)
    face_mat = lambda infos, c: 1 if all(i in ('bottom', 'arc_b') for i in infos) else 0   # underside = headliner
    obj = loft('roof', rings, ['paint', 'headliner'], face_mat,
               uv_fn=lambda co, inf, k, cap: (co.x / 20.0, co.y / 20.0))
    return _ext().finish(obj)


def a_pillar(sgn):
    """A curved bridge from the windshield's edge to the front edge of the side glass; trim-coloured on the inside."""
    rings = []
    m = 12
    base, top = Vector((100.0, sgn * 66.0, 96.8)), Vector((WS_TOP_X, sgn * 58.0, WS_TOP_Z))
    d = (top - base).normalized()
    for k in range(m + 1):
        t = -0.03 + 1.06 * k / m
        pw = base + (top - base) * t + Vector((0, YC, 0))
        z = GLASS_Z0 + (GLASS_Z1 - 0.5 - GLASS_Z0) * t
        ps = Vector((99 - (99 - WS_TOP_X - 3) * t, YC + sgn * glass_u(z), z))
        chord = ps - pw
        n = d.cross(chord).normalized()
        if n.dot(Vector((1.0, sgn * 1.0, 0.6))) < 0:
            n = -n
        ring = []
        for i in range(9):                               # outer face, bulging out
            s = i / 8
            ring.append((pw + chord * s + n * (1.7 * math.sin(math.pi * s) + 0.3), ('outer', s)))
        for i in range(7, 0, -1):                        # inner face
            s = i / 8
            ring.append((pw + chord * s - n * (0.9 * math.sin(math.pi * s)), ('inner', s)))
        rings.append(ring)
    def face_mat(infos, c):
        if sum(i[0] == 'inner' for i in infos) >= 3:
            return 1                                     # trim, seen from inside
        if max(i[1] for i in infos) <= 0.26:
            return 2                                     # the black seal along the windshield's edge
        return 0
    obj = loft('a_pillar_out', rings, ['paint', 'trim', 'blackplastic'], face_mat)
    return _ext().finish(obj)


def c_pillar(sgn, zr):
    """The wide C pillar as a gently curved panel (not a flat slab): from the rear door's back edge to the rear window,
    from the trunk up into the roof; its outer face crowns outward, its inner face is trimmed like the headliner."""
    rings = []
    zs = [deck_z(C_FRONT[0]) + 0.3 + (zr + 2.0 - deck_z(C_FRONT[0]) - 0.3) * k / 10 for k in range(11)]
    for z in zs:
        f = (z - zs[0]) / (zs[-1] - zs[0])
        xf = C_FRONT[0] + (C_FRONT[1] - C_FRONT[0]) * f                  # front edge (the rear door glass)
        xr = TRUNK_X - 4 + (ROOF_REAR - 3 - TRUNK_X + 4) * f              # rear edge (the rear window)
        zz = max(z, deck_z(xr) + 0.3) if f < 0.05 else z
        g = glass_u(zz)
        ring = []
        for i in range(9):                                                 # outer face, crowned
            s_ = i / 8
            x = xf + (xr - xf) * s_
            ring.append((Vector((x, YC + sgn * (g - 0.3 + 1.1 * math.sin(math.pi * s_) - 2.5 * s_ ** 3), zz)), 'outer'))
        for i in range(8, -1, -1):                                         # inner face
            s_ = i / 8
            x = xf + (xr - xf) * s_
            ring.append((Vector((x, YC + sgn * (g - 10.5), zz)), 'inner'))
        rings.append(ring)
    face_mat = lambda infos, c: 1 if sum(i == 'inner' for i in infos) >= 3 else 0
    obj = loft('c_pillar', rings, ['paint', 'headliner'], face_mat, uv_fn=lambda co, inf, k, cap: (co.x / 20.0, co.z / 20.0))
    return _ext().finish(obj, bevel=1.2, segs=3, angle=45)


def greenhouse():
    ci = _ext()
    roof()
    zr = ROOF_Z0 + 0.5
    for sgn in (-1, 1):
        a_pillar(sgn)
        # B pillar (black window frame) and the wide C pillar (body colour), both leaning with the glass
        lean_prism('b_pillar', 'blackplastic', [(-17.5, BELT), (-24.5, BELT), (-25.5, zr), (-18.5, zr)], -2.5, 1.2, sgn)
        c_pillar(sgn, zr)
        # the little slatted vent at the foot of the C pillar
        lean_prism('c_vent', 'blackplastic', [(-112.0, 101.6), (-90.0, 100.6), (-90.0, 103.8), (-112.0, 104.8)], -0.6, 0.15, sgn, bevel=0.2)
        for k in range(4):
            z = 101.2 + 0.75 * k
            lean_prism('c_vent_slat', 'chrome', [(-111.5, z + 0.7), (-90.5, z - 0.3), (-90.5, z), (-111.5, z + 1.0)], 0.1, 0.35, sgn, bevel=0.0)
        # drip rail along the roof edge, a black frame along the top of the windows, the window sill trim on the belt
        lo, hi = sorted((YC + sgn * (ROOF_U - 0.5), YC + sgn * (ROOF_U + 0.9)))
        ci.box('drip_rail', 'blackplastic', (ROOF_REAR - 1, lo, ROOF_Z0 - 0.4), (WS_TOP_X + 1.5, hi, ROOF_Z0 + 1.6), bevel=0.5)
        lo, hi = sorted((YC + sgn * (glass_u(GLASS_Z1) - 1.0), YC + sgn * (glass_u(GLASS_Z1) + 1.0)))
        ci.box('window_frame', 'blackplastic', (ROOF_REAR + 6, lo, GLASS_Z1 - 1.2), (WS_TOP_X + 4.0, hi, ROOF_Z0 + 0.3), bevel=0.5)
        lo, hi = sorted((YC + sgn * (glass_u(98) - 1.2), YC + sgn * (glass_u(98) + 2.2)))
        ci.box('belt_trim', 'blackplastic', (C_FRONT[0] - 2, lo, 96.3), (100, hi, 99.4), bevel=0.6, segs=3)
        ci.box('belt_chrome', 'chrome', (C_FRONT[0] - 2, min(lo, hi) + (2.6 if sgn > 0 else 0.4), 98.9), (100, max(lo, hi) - (0.4 if sgn > 0 else 2.6), 99.6), bevel=0.2)
        # side glass: the rear door window both sides, and the passenger's front door window (the driver's door
        # already has its pane from the interior)
        panes = [(-25.0, C_FRONT[0])]
        if sgn > 0:
            panes.append((99.0, -17.5))
        for xa, xb in panes:
            rows = []
            for k in range(6):
                f = k / 5
                z = GLASS_Z0 + (GLASS_Z1 - 0.5 - GLASS_Z0) * f
                xs = xa - (xa - WS_TOP_X - 3) * f * (1.0 if xa > 90 else 0.0)
                xe = xb + (C_FRONT[1] - xb) * f * (1.0 if xb == C_FRONT[0] else 0.0)
                rows.append([Vector((xs + (xe - xs) * j / 9, YC + sgn * glass_u(z), z)) for j in range(10)])
            ci.grid('side_glass_out', 'extglass', rows, outward=True)
    # rear window between the C pillars, raked and curved
    rows = []
    for k in range(6):
        f = k / 5
        x = ROOF_REAR - 3 + (TRUNK_X + 3 - ROOF_REAR + 3) * f
        z = ROOF_Z0 - 0.3 - (ROOF_Z0 - 0.3 - deck_z(TRUNK_X) - 2.4) * f
        hw = glass_u(z) - 10.0
        rows.append([Vector((x - 2.5 * (1 - s * s), YC + s * hw, z + 1.0 * (1 - s * s))) for s in (-1 + 2 * j / 13 for j in range(14))])
    ci.grid('rear_window', 'extglass', rows, outward=True)


def trim():
    ci = _ext()
    for sgn in (-1, 1):
        # rub strip low on the doors and wings, broken by the wheel arches, with a bright insert
        z0, z1 = 46.5, 50.5
        fa, ra = arch_span(AXLE_F, 48.5, 6.0), arch_span(AXLE_R, 48.5, 6.0)
        for xa, xb in ((fa[0], FRONT - 3.0), (ra[0], fa[1]), (REAR + 3.0, ra[1])):
            side_strip('rub_strip', 'blackplastic', xa, xb, z0, z1, 1.3, sgn)
            side_strip('rub_strip_chrome', 'chrome', xa + 0.5, xb - 0.5, 48.2, 48.8, 1.55, sgn)
        x0, x1 = AXLE_R + ARCH_R + 6.0, AXLE_F - ARCH_R - 6.0     # sill trim between the arches
        side_strip('sill_trim', 'blackplastic', x0, x1, 25.0, 30.6, 1.0, sgn)
        side_strip('sill_chrome', 'chrome', x0 + 0.5, x1 - 0.5, 29.8, 30.4, 1.25, sgn)
        # door handles: a chunky black grab handle across each pocket, a key lock on the front doors
        for x, lock in ((14.0, True), (-48.0, False)):
            u = surface_u(x, 87.2)
            lo, hi = sorted((YC + sgn * (u - 0.8), YC + sgn * (u + 1.9)))
            ci.box('door_handle', 'blackplastic', (x - 6.6, lo, 85.7), (x + 6.6, hi, 88.9), bevel=1.2, segs=4)
            for xe in (x - 6.0, x + 6.0):                # its two mounting feet, into the pocket
                lo2, hi2 = sorted((YC + sgn * (u - 1.6), YC + sgn * (u + 0.6)))
                ci.box('door_handle_foot', 'blackplastic', (xe - 1.0, lo2, 86.0), (xe + 1.0, hi2, 88.6), bevel=0.4)
            if lock:
                ci.cylinder('door_lock', 'chrome', Vector((x + 10.2, YC + sgn * (surface_u(x + 10.2, 87.2) + 0.2), 87.2)),
                            Vector((0, sgn, 0)), 1.05, 0.9, segs=20, bevel=0.25)
                ci.cylinder('door_lock_slot', 'gap', Vector((x + 10.2, YC + sgn * (surface_u(x + 10.2, 87.2) + 0.62), 87.2)),
                            Vector((0, sgn, 0)), 0.35, 0.2, segs=10, bevel=0.0)
    # the pixel car's grey primer patch, low on the passenger front door, lying on the curved skin
    rows = []
    for k in range(10):                                  # (the rub strip runs across it, standing proud)
        z = 33.0 + 29.0 * k / 9
        rows.append([Vector((x, YC + surface_u(x, z) + 0.15, z)) for x in (35.0 + 60.0 * j / 15 for j in range(16))])
    sheet('primer_patch', 'primer', rows, away=Vector((66.0, YC, 47.0)), uv_fn=lambda co: (co.x / 60.0, co.z / 30.0))
    # door mirrors, both sides: modelled as their own part (car_parts.py)
    import car_parts
    for sgn in (-1, 1):
        car_parts.door_mirror(sgn)


def lens(name, mat, x_of, u0, u1, z0, z1, nu, nz, toward):
    """A lamp lens: a grid whose depth x_of(u, z) carries the bulge and the ribs/flutes (real geometry)."""
    rows = []
    for k in range(nz + 1):
        z = z0 + (z1 - z0) * k / nz
        rows.append([Vector((x_of(u0 + (u1 - u0) * j / nu, z), YC + u0 + (u1 - u0) * j / nu, z)) for j in range(nu + 1)])
    return sheet(name, mat, rows, toward=toward)


def frame_bars(name, mat, x0, x1, u0, u1, z0, z1, t, bevel=0.4):
    """A rectangular trim ring (four bars) round an opening, t thick."""
    ci = _ext()
    ci.box(name, mat, (x0, YC + u0 - t, z1), (x1, YC + u1 + t, z1 + t), bevel=bevel)
    ci.box(name, mat, (x0, YC + u0 - t, z0 - t), (x1, YC + u1 + t, z0), bevel=bevel)
    ci.box(name, mat, (x0, YC + u0 - t, z0), (x1, YC + u0, z1), bevel=bevel)
    ci.box(name, mat, (x0, YC + u1, z0), (x1, YC + u1 + t, z1), bevel=bevel)


def ends():
    """Deep bumpers wrapping round to the arches; headlamp units (chrome reflector, bulb, fluted glass lens, chrome
    bezel); ribbed amber corner lights; a grille with real depth; ribbed taillights; exhaust."""
    ci = _ext()
    for x_face, sgn_x, z0, z1, side_u, ret in ((FRONT + 4.5, 1.0, 33.0, 52.0, W - 3.5, 20.0), (REAR - 5.0, -1.0, 33.0, 55.0, W - 3.0, 22.0)):
        path = bumper_path(x_face, sgn_x, side_u, ret=ret)
        sweep('bumper', 'bumper', path, rrect_profile(-5.0, 5.0, z0, z1, 3.5))
        zm = (z0 + z1) / 2
        sweep('bumper_strip', 'rubber', path[1:-1], rrect_profile(3.8, 6.2, zm - 2.6, zm + 2.6, 0.9))
    ahead = Vector((FRONT + 300.0, YC, 64.0))
    behind = Vector((REAR - 300.0, YC, 74.0))
    for sgn in (-1, 1):
        uc = sgn * 53.0
        u0, u1 = sorted((uc - 16.2, uc + 16.2))
        zc0, zc1 = 57.4, 70.0
        # reflector bowl (lit when the headlights are on), the bulb, the fluted glass lens, the chrome bezel
        def dish(u, z, uc=uc):
            return FRONT - 4.0 + 2.6 * (((u - uc) / 16.2) ** 2 + ((z - 63.7) / 6.3) ** 2) / 2
        lens('headlamp_reflector', 'headlamp', dish, u0, u1, zc0, zc1, 24, 10, ahead)
        ci.cylinder('headlamp_bulb', 'chrome', Vector((FRONT - 3.0, YC + uc, 63.7)), Vector((1, 0, 0)), 1.3, 2.6, segs=16, bevel=0.5)

        def flutes(u, z, uc=uc):
            bulge = 0.7 * (1 - ((u - uc) / 16.2) ** 2) * (1 - ((z - 63.7) / 6.3) ** 2)
            return FRONT + 0.9 + bulge + 0.14 * math.cos(2 * math.pi * (u - uc) / 1.5)
        lens('headlamp_lens', 'lamplens', flutes, u0, u1, zc0, zc1, 88, 8, ahead)
        frame_bars('headlamp_bezel', 'chrome', FRONT - 0.8, FRONT + 2.0, u0, u1, zc0, zc1, 1.0)
        # amber corner light, wrapping round the corner, its lens a grid of little pillows
        a0, a1 = sorted((sgn * 70.6, sgn * 79.0))

        def facets(u, z):
            base = front_x_at(abs(u), 63.7)
            return base + 0.5 + 0.28 * abs(math.sin(math.pi * u / 1.3)) * abs(math.sin(math.pi * (z - 57.4) / 1.3))
        lens('indicator_lens', 'amberlens', facets, a0, a1, zc0, zc1, 24, 30, ahead + Vector((0, sgn * 400.0, 0)))
        # taillight: horizontal ribs you can feel, red with amber at the outer end, in a black surround
        t0, t1 = sorted((sgn * 25.6, sgn * 64.0))
        m0, m1 = sorted((sgn * 64.0, sgn * 79.4))

        def ribs(u, z):
            k = abs(math.sin(math.pi * (z - 62.4) / 3.2)) ** 0.6
            return rear_x_at(u, 74.0) - 0.9 - 0.45 * k - 0.3 * (1 - (abs(u) - 52) ** 2 / 900.0)   # follows the corner
        lens('taillight_lens', 'taillamp', ribs, t0, t1, 62.4, 85.6, 16, 58, behind)
        lens('taillight_amber', 'amberlens', ribs, m0, m1, 62.4, 85.6, 10, 58, behind)
        lo, hi = sorted((sgn * 25.0, sgn * 80.0))
        frame_bars('taillight_surround', 'blackplastic', REAR - 0.8, REAR + 1.6, lo, hi, 62.0, 86.0, 0.6, bevel=0.25)
    # grille: chrome surround, slats with dark space behind them
    frame_bars('grille_surround', 'chrome', FRONT - 1.5, FRONT + 2.8, -31.6, 31.6, 56.0, 71.8, 1.8, bevel=0.7)
    for k in range(6):
        z = 57.6 + k * 2.5
        ci.box('grille_slat', 'chrome', (FRONT - 2.5, YC - 31.4, z), (FRONT + 1.0, YC + 31.4, z + 1.1), bevel=0.35)
    ci.box('grille_bar', 'chrome', (FRONT - 2.5, YC - 0.8, 56.2), (FRONT + 1.6, YC + 0.8, 71.6), bevel=0.4)
    ci.cylinder('trunk_lock', 'chrome', Vector((REAR - 0.3, YC, 82.0)), Vector((-1, 0, 0)), 1.2, 1.2, segs=20, bevel=0.3)
    ci.cylinder('exhaust', 'steelwheel', Vector((REAR - 2, YC + 50, 22)), Vector((1, 0, 0)), 2.6, 18.0, segs=20, bevel=0.3)


def wheels():
    ci = _ext()
    k = TYRE_R / 31.5
    R = TYRE_R
    prof = [(20.5 * k, -9.2), (25 * k, -9.9), (29.5 * k, -9.6), (R - 0.6, -8.2), (R, -7.0)]
    for g in (-3.5, 0.0, 3.5):                           # three tread grooves round the tyre
        prof += [(R, g - 0.75), (R - 0.9, g - 0.45), (R - 0.9, g + 0.45), (R, g + 0.75)]
    prof += [(R, 7.0), (R - 0.6, 8.2), (29.5 * k, 9.6), (25 * k, 9.9), (20.5 * k, 9.2)]
    for ax in (AXLE_F, AXLE_R):
        for sgn in (-1, 1):
            c = Vector((ax, YC + sgn * (W - 11.0), TYRE_R))
            me = bpy.data.meshes.new('tyre')
            bm = bmesh.new()
            rings = []
            segs = 72
            for i in range(segs):
                a_ = 2 * math.pi * i / segs
                rings.append([bm.verts.new(c + Vector((math.cos(a_) * r, w, math.sin(a_) * r))) for r, w in prof])
            for i in range(segs):
                for j in range(len(prof) - 1):
                    bm.faces.new((rings[i][j], rings[(i + 1) % segs][j], rings[(i + 1) % segs][j + 1], rings[i][j + 1]))
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            ci.box_uv(bm, 10.0)
            bm.to_mesh(me)
            bm.free()
            ci.finish(ci.link(bpy.data.objects.new('tyre', me), 'tyre'))
            out = Vector((0, sgn, 0))
            ci.cylinder('rim', 'steelwheel', c + out * 4.5, out, 20.0 * k, 9.0, segs=48, bevel=0.6)
            # flat hubcap with a ring of round holes (the period's plain steel-wheel cover)
            ci.cylinder('hubcap', 'chrome', c + out * 9.6, out, 17.0 * k, 1.4, segs=48, bevel=0.6)
            ci.cylinder('hubcap_centre', 'steelwheel', c + out * 10.5, out, 4.0, 0.8, segs=24, bevel=0.3)
            for j in range(15):
                a_ = 2 * math.pi * j / 15
                p = c + out * 10.35 + Vector((math.cos(a_) * 12.0 * k, 0, math.sin(a_) * 12.0 * k))
                ci.cylinder('hubcap_hole', 'gap', p, out, 1.5, 0.5, segs=12, bevel=0.1)


def seat(cy, x0=-21.0):
    """A front bucket seat (the period's cloth seats): cushion with side bolsters, a slightly reclined backrest with
    bolsters, a headrest on two chrome posts, the frame and runners underneath. cy is the seat's centre line."""
    ci = _ext()
    ci.box('seat_cushion', 'seat', (x0, cy - 24.0, 42.0), (x0 + 50.0, cy + 24.0, 50.5), bevel=3.0, segs=4)
    for sgn in (-1, 1):
        lo, hi = sorted((cy + sgn * 18.0, cy + sgn * 26.0))
        ci.box('seat_bolster', 'seat', (x0 + 4.0, lo, 44.0), (x0 + 48.0, hi, 54.5), bevel=3.0, segs=4)
    up = Vector((-0.17, 0, 1)).normalized()            # the backrest leans back about 10 degrees
    m = ci.frame(Vector((x0 + 4.0, cy, 50.0)) + up * 31.0, Vector((0, 1, 0)), up, up.cross(Vector((0, 1, 0))).normalized())
    ci.box('seat_back', 'seat', (-24.0, -31.0, -6.0), (24.0, 31.0, 6.0), bevel=3.5, segs=4, matrix=m)
    for sgn in (-1, 1):
        ci.box('seat_back_bolster', 'seat', (sgn * 19.0 - 5.0, -28.0, -4.0), (sgn * 19.0 + 5.0, 26.0, 9.0), bevel=3.5, segs=4, matrix=m)
    top = Vector((x0 + 4.0, cy, 50.0)) + up * 62.0
    for dy in (-7.0, 7.0):
        ci.cylinder('headrest_post', 'chrome', top + Vector((0, dy, 0)) + up * 3.0, up, 0.55, 9.0, segs=12, bevel=0.1)
    hc = top + up * 12.0
    ci.box('headrest', 'seat', (hc.x - 4.0, cy - 13.0, hc.z - 8.0), (hc.x + 4.0, cy + 13.0, hc.z + 8.0), bevel=3.0, segs=4)
    ci.box('seat_frame', 'blackplastic', (x0 + 3.0, cy - 20.0, 36.0), (x0 + 47.0, cy + 20.0, 42.5), bevel=1.0)
    for sgn in (-1, 1):
        ci.box('seat_runner', 'steelwheel', (x0 - 4.0, cy + sgn * 15.0 - 1.5, 34.0), (x0 + 52.0, cy + sgn * 15.0 + 1.5, 36.5), bevel=0.4)


def cabin_rest():
    """What the windows show from outside: both front seats, the rear bench, the parcel shelf, carpet, and trim panels
    on the other three doors (the driver's door is in car_interior.py)."""
    ci = _ext()
    seat(0.0)
    seat(2 * YC)
    # rear bench: cushion and a more reclined back across the car, a fold-down armrest in the middle
    ci.box('rear_cushion', 'seat', (-112.0, YC - 66.0, 40.0), (-62.0, YC + 66.0, 49.0), bevel=3.5, segs=4)
    up = Vector((-0.42, 0, 1)).normalized()
    m = ci.frame(Vector((-108.0, YC, 49.0)) + up * 26.0, Vector((0, 1, 0)), up, up.cross(Vector((0, 1, 0))).normalized())
    ci.box('rear_back', 'seat', (-66.0, -27.0, -6.0), (66.0, 27.0, 7.0), bevel=3.5, segs=4, matrix=m)
    ci.box('rear_armrest', 'seat', (-5.0, -20.0, 6.5), (5.0, 18.0, 10.5), bevel=2.0, segs=3, matrix=m)
    for dy in (-38.0, 38.0):
        hc = Vector((-108.0, YC + dy, 49.0)) + up * 58.0
        ci.box('rear_headrest', 'seat', (hc.x - 4.0, hc.y - 12.0, hc.z - 6.0), (hc.x + 4.0, hc.y + 12.0, hc.z + 6.0), bevel=2.5, segs=4)
    # parcel shelf under the rear window, with the third-brake-light-less plain board and two speaker grilles
    ci.box('parcel_shelf', 'trim', (TRUNK_X + 2.0, YC - 66.0, 98.0), (-112.0, YC + 66.0, 100.5), bevel=0.8)
    for dy in (-40.0, 40.0):
        ci.cylinder('speaker_grille', 'vent', Vector((TRUNK_X + 12.0, YC + dy, 100.6)), Vector((0, 0, 1)), 6.0, 0.4, segs=24, bevel=0.1)
    # carpet over the floor, a raised tunnel down the middle
    ci.box('carpet', 'carpet', (-128.0, YC - 73.0, 33.0), (74.0, YC + 73.0, 35.0), bevel=0.5)
    ci.box('tunnel', 'carpet', (-110.0, YC - 13.0, 34.0), (70.0, YC + 13.0, 44.0), bevel=4.0, segs=4)
    # door trim panels: passenger front, both rear doors (inner skin, armrest, pull handle, window sill)
    for sgn, (x0, x1) in ((1, (-20.0, 97.0)), (1, (-79.0, -22.0)), (-1, (-79.0, -22.0))):
        yi = YC + sgn * 72.8
        lo, hi = sorted((yi, yi + sgn * 2.2))
        ci.box('door_panel', 'door', (x0, lo, 40.0), (x1, hi, 96.5), bevel=1.2)
        lo, hi = sorted((yi, yi - sgn * 6.0))
        ci.box('armrest', 'door', (x0 + 10.0, lo, 64.0), (x1 - 12.0, hi, 70.0), bevel=1.6, segs=4)
        lo, hi = sorted((yi - sgn * 0.5, yi + sgn * 9.0))
        ci.box('door_sill', 'blackplastic', (x0, lo, 95.5), (x1, hi, 99.0), bevel=1.2)


def build():
    body_shell()
    arch_lips_and_wells()
    greenhouse()
    trim()
    ends()
    wheels()
    cabin_rest()
