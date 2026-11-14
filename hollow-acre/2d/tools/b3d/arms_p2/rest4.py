# Rest-pose check sheet (skeleton-first, t353 r4): the flat left hand, palm down, laid on the axes
# (x toward the thumb, y toward the fingers, z = back of the hand), with the skeleton's numbers printed.
#   python3 rest4.py <out.png>
import sys, os, math, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'lib')); sys.path.insert(0, os.path.join(HERE, '..'))
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import hands, views
from hands import nrm, perp
OUT = sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def link(o): sc.collection.objects.link(o); return o
def mesh(name, V, F):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in V], [], [list(f) for f in F]); me.validate(); me.update()
    for p in me.polygons: p.use_smooth = True
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    return link(bpy.data.objects.new(name, me))
H = hands.build_hand(np.array([0, -1.0, 0]))           # straight forearm for the rest pose
cage = mesh('cage', H['V'] * .01, H['F'])
mod = cage.modifiers.new('s', 'SUBSURF'); mod.levels = 2; mod.render_levels = 2
dg = bpy.context.evaluated_depsgraph_get(); hand = link(bpy.data.objects.new('hand', bpy.data.meshes.new_from_object(cage.evaluated_get(dg))))
bpy.data.objects.remove(cage, do_unlink=True)
for p in hand.data.polygons: p.use_smooth = True
dg = bpy.context.evaluated_depsgraph_get(); bvh = BVHTree.FromObject(hand, dg)
NV, NF = [], []
def nail(J2, J3, Lx, Zd, length, width):               # cm in, metres out
    d = nrm(J3 - J2); Lx = perp(Lx, d); Zd = perp(Zd, d); nu, nv = 5, 4; base = len(NV)
    for j in range(nv):
        for i in range(nu):
            u = i / (nu - 1) * 2 - 1; v = j / (nv - 1); w = width / 2 * (.9 + .1 * math.sqrt(max(0, 1 - (2 * v - 1) ** 2)))
            p0 = (J2 + d * (np.linalg.norm(J3 - J2) * .31 + v * length) + Lx * u * w + Zd * 3) * .01
            hit = bvh.ray_cast(Vector(p0), Vector(-Zd))
            if hit[0] is None: hit = bvh.find_nearest(Vector(p0 - Zd * .03))
            NV.append(np.array(hit[0]) + np.array(hit[1]) * .0006)
    for j in range(nv - 1):
        for i in range(nu - 1):
            a = base + j * nu + i; NF.append([a, a + 1, a + nu + 1, a + nu])
f = H['fingers']
for n in hands.ORDER: J = f[n]['joints']; nail(J[2], J[3], f[n]['L'], f[n]['Z'], hands.FINGERS[n]['L'][2] * .6, hands.FINGERS[n]['wt'] * .84)
T = H['thumb']; tJ = T['joints']; nail(tJ[2], tJ[3], nrm(np.cross(T['d'][2], T['Z'])), T['Z'], hands.THUMB['L'][2] * .5, 1.78)
nails = mesh('nails', np.array(NV), NF)
for o, c in ((hand, (.86, .66, .55)), (nails, (.95, .55, .55))):
    m = bpy.data.materials.new(o.name); m.diffuse_color = (*c, 1); o.data.materials.append(m)
# ---- the numbers
cmc, mcp, ip, tip, (d1, d2, d3), tz = hands.thumb_skeleton()
idx = f['index']; free = nrm(tip - mcp)
ang_index = math.degrees(math.acos(np.clip(free @ idx['d'], -1, 1)))
ang_nail = math.degrees(math.acos(np.clip(perp(tz, d3) @ np.array([0, 0, 1.]), -1, 1)))
crease, knuckle = -0.3, idx['joints'][0][1]
web_y = max(hands.PALM[2][0], 0)                       # the thumb ray leaves the palm side between the wrist and palm station 2
lines = [f'thumb ray {np.linalg.norm(mcp - cmc) + np.linalg.norm(ip - mcp) + np.linalg.norm(tip - ip):.1f} cm (mc {hands.THUMB["L"][0]}, pp {hands.THUMB["L"][1]}, dp {hands.THUMB["L"][2]})',
         f'CMC at ({cmc[0]:.2f}, {cmc[1]:.2f}, {cmc[2]:.2f}) cm: radial side of the wrist, level with the metacarpal bases (y 1.5-2.5)',
         f'metacarpal: abduction {hands.THUMB["abd"]:.0f} deg, flexion {hands.THUMB["flex"]:.0f} deg, pronation {hands.THUMB["pron"]:.0f} deg; MCP {hands.THUMB["mcp_flex"]:.0f}, IP {hands.THUMB["ip_flex"]:.0f} (hinges)',
         f'thumb below the palm plane: MCP {-mcp[2]:.1f} cm, IP {-ip[2]:.1f} cm, tip {-tip[2]:.1f} cm (limit 2)',
         f'free thumb vs index finger: {ang_index:.0f} deg (want 30-45); thumb nail vs finger nails: {ang_nail:.0f} deg (want 60-90)',
         f'free thumb starts at the MCP, y {mcp[1]:.1f} cm; halfway wrist crease to index knuckle is y {(crease + knuckle) / 2:.1f} cm']
print('\n'.join(lines))
for o in (hand, nails): o.location = (0, 0, 0)
ctr = Vector((.01, .07, 0))
cams = [views.cam_at(ctr + Vector((0, 0, .42)), ctr, 50, 'top-down (back of hand)'), views.cam_at(ctr + Vector((.40, -.06, .04)), ctr, 50, 'thumb side'),
        views.cam_at(ctr + Vector((0, 0, -.42)), ctr, 50, 'palm')]
views.sheet(OUT, objs=[hand, nails], mode='shape', res=380, cams=cams)
from PIL import Image, ImageDraw
im = Image.open(OUT); W, Hh = im.size; out = Image.new('RGB', (W, Hh + 18 * len(lines) + 8), (20, 20, 22)); out.paste(im, (0, 0)); dr = ImageDraw.Draw(out)
for i, l in enumerate(lines): dr.text((6, Hh + 4 + 18 * i), l, fill=(235, 235, 200))
out.save(OUT)
