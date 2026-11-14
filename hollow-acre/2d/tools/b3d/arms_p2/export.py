# Bake and export the left arm for three.js: arm.glb (skinned, one mesh), arm_n.webp (tangent normals), arm_d.webp
# (R: ambient occlusion in the grip, G: flush, B: crease, A: material id), rig.json (bones, grip, constants).
import sys, os, math, json, time, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy
from mathutils import Matrix, Vector
import armbuild as A, scene as S, hands
from hands import nrm
OUT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True); t0 = time.time()
RES = int(os.environ.get('RES', '1024'))
def log(*a): print(f'[{time.time()-t0:5.0f}s]', *a, flush=True)

A.reset(); sc = bpy.context.scene
arm = A.armature()
hand_L, nails_L = A.hand_and_nails(2, True, '_L', relief=float(os.environ.get('RELIEF', '.35')))
dec = hand_L.modifiers.new('dec', 'DECIMATE'); dec.ratio = float(os.environ.get('DEC', '.235')); dec.use_collapse_triangulate = False
dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(hand_L.evaluated_get(dg)); hand_L.modifiers.clear(); hand_L.data = me
ring_L = A.ring('_L'); sleeve_L = A.sleeve(1, n=11, suffix='_L')
# the other sleeve types, same topology, kept as positions for morph targets
SLEEVE_BASE = A.verts(sleeve_L).copy(); SLEEVE_VAR = {}
for kind in ('knit', 'hoodie', 'jacket', 'coat'):
    A.set_sleeve(kind); o = A.sleeve(1, n=11, suffix='_' + kind); SLEEVE_VAR[kind] = A.verts(o).copy(); bpy.data.objects.remove(o, do_unlink=True)
    assert len(SLEEVE_VAR[kind]) == len(SLEEVE_BASE), kind
A.set_sleeve('woven')
hand_H, nails_H = A.hand_and_nails(4, True, '_H'); ring_H = A.ring('_H'); sleeve_H = A.sleeve(3, n=11, detail=True, suffix='_H')
lows = [hand_L, nails_L, sleeve_L, ring_L]; highs = [hand_H, nails_H, sleeve_H, ring_H]
tri = lambda o: sum(len(p.vertices) - 2 for p in o.data.polygons)
log('tris low', {o.name: tri(o) for o in lows}, 'total', sum(tri(o) for o in lows), 'high', sum(tri(o) for o in highs))

# ---- UVs: hand + nails on top, sleeve below, the ring in a corner; second UV set = cylinder coords on the sleeve
A.unwrap([hand_L, nails_L], (0, .30, 1, 1), .012); A.unwrap([sleeve_L], (0, 0, .955, .285), .012)      # r4: wide gutters so mipmaps never mix a nail island into a knuckle seam
A.select_only([ring_L]); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=.01); bpy.ops.object.mode_set(mode='OBJECT')
uv = ring_L.data.uv_layers.active.data; a = np.zeros(len(uv) * 2); uv.foreach_get('uv', a); a = a.reshape(-1, 2)
a = np.column_stack([.968 + a[:, 0] * .027, .004 + a[:, 1] * .022]); uv.foreach_set('uv', a.ravel())
for o in lows:
    o.data.uv_layers.active.name = 'UVMap'
    cyl = o.data.uv_layers.new(name='cyl'); c = np.zeros((len(cyl.data), 2))
    if o is sleeve_L:
        Pc = A.verts(o) @ S.BM; s, ang = A.path_coords(Pc)
        lv = np.zeros(len(o.data.loops), int); o.data.loops.foreach_get('vertex_index', lv)
        u = ((ang + math.pi) % (2 * math.pi)) / (2 * math.pi)       # seam on the underside
        for p in o.data.polygons:
            ids = [lv[l] for l in p.loop_indices]; uu = u[ids]
            if uu.max() - uu.min() > .5: uu = np.where(uu < .5, uu + 1, uu)
            for k, l in enumerate(p.loop_indices): c[l] = (uu[k] * .28, s[ids[k]])
    cyl.data.foreach_set('uv', c.ravel()); o.data.uv_layers.active = o.data.uv_layers['UVMap']
    o.data.uv_layers['UVMap'].active_render = True
log('uv done')

# ---- weights (low and high: the AO bake is done with the hand closed on the rim)
for o in (hand_L, sleeve_L, hand_H, sleeve_H): A.skin(o, arm)
for o in (nails_L, nails_H): A.skin(o, arm, 'nails')
for o in (ring_L, ring_H): A.skin(o, arm, 'ring1')
log('weights done')

# ---- bake setup
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 1
def img(name):
    im = bpy.data.images.new(name, RES, RES, alpha=True, float_buffer=True, is_data=True); return im
I_N, I_D, I_A = img('nrm'), img('data'), img('ao')
bake_mat = bpy.data.materials.new('bake'); bake_mat.use_nodes = True
tex = bake_mat.node_tree.nodes.new('ShaderNodeTexImage'); bake_mat.node_tree.nodes.active = tex
for o in lows: o.data.materials.clear(); o.data.materials.append(bake_mat)
def high_mats(kind):
    for o in highs:
        m = bpy.data.materials.new(o.name + kind); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        if kind == 'normal':
            b = nt.nodes.new('ShaderNodeBsdfPrincipled'); nt.links.new(b.outputs['BSDF'], out.inputs['Surface'])
            if o is hand_H:                                  # pores and fine lines: tiny bump
                n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 260; n2.inputs['Detail'].default_value = 2
                ad = nt.nodes.new('ShaderNodeMath'); ad.operation = 'MULTIPLY'; ad.inputs[1].default_value = 1.0; nt.links.new(n2.outputs['Factor'], ad.inputs[0])
                bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .05; bp.inputs['Distance'].default_value = .0002
                nt.links.new(ad.outputs['Value'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
            if o is sleeve_H:                                # wool fuzz
                n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 160; n1.inputs['Detail'].default_value = 2
                bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .05; bp.inputs['Distance'].default_value = .0003
                nt.links.new(n1.outputs['Factor'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
        else:
            e = nt.nodes.new('ShaderNodeEmission'); at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'data'
            nt.links.new(at.outputs['Color'], e.inputs['Color']); nt.links.new(e.outputs['Emission'], out.inputs['Surface'])
        o.data.materials.clear(); o.data.materials.append(m)
def bake(kind, image, **kw):
    tex.image = image; first = True
    for lo, hi in zip(lows, highs):
        A.select_only([hi, lo], active=lo)
        bpy.ops.object.bake(type=kind, use_selected_to_active=True, cage_extrusion=float(os.environ.get('CAGE', '.0018')), max_ray_distance=float(os.environ.get('MAXR', '.005')), margin=6,
                            use_clear=first, target='IMAGE_TEXTURES', save_mode='INTERNAL', **kw)
        first = False
    log('baked', kind)
high_mats('normal'); bake('NORMAL', I_N, normal_space='TANGENT')
high_mats('emit'); bake('EMIT', I_D)
# AO with the hand closed round the rim; the low copies stay out of the way of the rays
A.pose(arm, 'L', 1.0); rim = A.rim_and_wheel(); rim.hide_render = True     # r4: self-occlusion only; the rim's own shadow and contact darkening are worked out live in the shader (the two hands hold it differently)
for o in lows: o.visible_diffuse = False; o.visible_shadow = False; o.visible_glossy = False
sc.cycles.samples = int(os.environ.get('AO_SAMPLES', '96')); sc.world = bpy.data.worlds.new('w')
bake('AO', I_A)
for o in lows: o.visible_diffuse = True; o.visible_shadow = True; o.visible_glossy = True
A.rest(arm); bpy.data.objects.remove(rim, do_unlink=True)

def px(im): a = np.zeros(RES * RES * 4, np.float32); im.pixels.foreach_get(a); return a.reshape(RES, RES, 4)[::-1]
from PIL import Image
N_ = px(I_N); D_ = px(I_D); AO_ = px(I_A)
covered = D_[..., 3] > .5
nv = N_[..., :3] * 2 - 1; nz = nv[..., 2]
bad = (nz < .55) & (N_[..., 3] > .5)                      # stray rays: tangent normals never tilt this far on this mesh
k = np.clip((nz - .3) / .25, 0, 1)[..., None]; nv = nv * k + np.array([0, 0, 1.]) * (1 - k); nv /= np.linalg.norm(nv, axis=-1, keepdims=True)
# r4: soften the bake (a 1 px blur inside the islands) so thin ridges never read as streaks on a phone
from scipy.ndimage import gaussian_filter
cov = (N_[..., 3] > .5).astype(np.float32); wsum = gaussian_filter(cov, float(os.environ.get('NBLUR', '1.0'))) + 1e-6
nv = np.stack([gaussian_filter(nv[..., c] * cov, float(os.environ.get('NBLUR', '1.0'))) / wsum for c in range(3)], -1)
nv[..., 2] = np.maximum(nv[..., 2], .2); nv /= np.linalg.norm(nv, axis=-1, keepdims=True)
log('normal outliers fixed', int(bad.sum()))
nrm8 = np.clip((nv * .5 + .5) * 255 + .5, 0, 255).astype(np.uint8); nrm8[~(N_[..., 3] > .5)] = (128, 128, 255)
data8 = np.zeros((RES, RES, 4), np.uint8)
data8[..., 0] = np.clip(AO_[..., 0] * 255 + .5, 0, 255); data8[..., 1] = np.clip(D_[..., 0] * 255 + .5, 0, 255)
data8[..., 2] = np.clip(D_[..., 1] * 255 + .5, 0, 255); data8[..., 3] = np.clip(D_[..., 2] * 255 + .5, 0, 255)
data8[~covered] = (255, 0, 0, 0)
Image.fromarray(nrm8, 'RGB').save(f'{OUT}/arm_n.png'); Image.fromarray(data8, 'RGBA').save(f'{OUT}/arm_d.png')
Image.fromarray(nrm8, 'RGB').save(f'{OUT}/arm_n.webp', lossless=True, quality=100, method=6)
Image.fromarray(data8, 'RGBA').save(f'{OUT}/arm_d.webp', lossless=True, quality=100, method=6)
log('textures written')

# ---- one mesh, one material, the armature in its rest pose -> GLB
for o in highs: bpy.data.objects.remove(o, do_unlink=True)
A.select_only(lows, active=hand_L); bpy.ops.object.join(); armob = hand_L; armob.name = 'arm'
pm = bpy.data.materials.new('armmat'); armob.data.materials.clear(); armob.data.materials.append(pm)
while armob.data.color_attributes: armob.data.color_attributes.remove(armob.data.color_attributes[0])
armob.parent = arm
for p in armob.data.polygons: p.use_smooth = True
# sleeve types as shape keys (morph targets): match the joined mesh's sleeve vertices to the base sleeve
from scipy.spatial import cKDTree
JV = A.verts(armob); dist, idx = cKDTree(SLEEVE_BASE).query(JV); onsl = dist < 1e-6
armob.shape_key_add(name='Basis')
for kind, VV in SLEEVE_VAR.items():
    sk = armob.shape_key_add(name=kind); co = JV.copy(); co[onsl] = VV[idx[onsl]]
    sk.data.foreach_set('co', co.ravel())
log('sleeve morphs', list(SLEEVE_VAR), 'verts', int(onsl.sum()))
A.select_only([armob, arm], active=armob)
bpy.ops.export_scene.gltf(filepath=f'{OUT}/arm.glb', export_format='GLB', use_selection=True, export_yup=True, export_apply=False,
                          export_skins=True, export_animations=False, export_morph=True, export_morph_normal=False, export_morph_tangent=False, export_tangents=True, export_texcoords=True,
                          export_normals=True, export_materials='PLACEHOLDER', export_image_format='NONE', export_rest_position_armature=True,
                          export_leaf_bone=False, export_influence_nb=4, export_extras=False)
log('glb', os.path.getsize(f'{OUT}/arm.glb'), 'tris', tri(armob))
os.system(f'python3 {HERE}/glb_quant.py {OUT}/arm.glb {OUT}/arm_q.glb')

# ---- rig.json: everything three.js needs to pose the arm (car space)
def L(v): return [float(x) for x in np.asarray(v).ravel()]
f = S.H['fingers']
rig = dict(EYE=L(S.EYE), WC=L(S.WC), TILT=S.TILT, RR=S.RR, RT=S.RT, A_GRIP=S.A_GRIP, AXIS=L(S.AXIS), SH=L(S.SH), ELB=L(S.ELB), W=L(S.W),
           L_UP=float(np.linalg.norm(S.ELB - S.SH)), L_FORE=float(np.linalg.norm(S.W - S.ELB)), POLE=L(S.POLE),
           ND=L(S.ND), FH=L(S.FH), XH=L(S.XH),
           bones=[dict(name=b[0], head=L(b[1]), tail=L(b[2]), parent=S.PARENT[b[0]]) for b in S.BONES],
           fingers={n: dict(joints=[L(S.to_car(p)) for p in f[n]['joints']], axis=L(S.flex_axis(n))) for n in hands.ORDER},
           O=L(S.O), GX=L(S.GX),
           spreadAxis=L(S.SPREAD_AX),
           hands={side: dict(hand=L(S.HD[side]), spread={n: S.SPREAD[side][n] for n in hands.ORDER},
                             grip={n: [float(x) for x in S.GRIP_SIDE[side][n]] for n in hands.ORDER},
                             thumb=[L(D) for D in S.THUMB_D[side]]) for side in ('L', 'R')},
           tris=tri(armob))
json.dump(rig, open(f'{OUT}/rig.json', 'w'))
bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/arm.blend')
log('done', {k: os.path.getsize(f'{OUT}/{k}') for k in ('arm.glb', 'arm_q.glb', 'arm_n.webp', 'arm_d.webp', 'arm_n.png', 'arm_d.png')})
