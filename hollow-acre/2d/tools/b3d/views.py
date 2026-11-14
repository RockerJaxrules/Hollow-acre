"""Multi-view check sheet: the core of the render -> critique -> fix loop.

From a script that has built objects in the current bpy scene:
    import sys; sys.path.insert(0, '<this dir>'); import views
    views.sheet('out.png', objs=None, mode='shape')    # Workbench, ~1 s: silhouette + proportions
    views.sheet('out.png', objs=None, mode='look')     # Cycles CPU + denoise: materials and light
    views.sheet('out.png', cams=[views.cam_at((x,y,z),(tx,ty,tz),lens)])  # add the real in-game camera

Views: front, right side, back-3/4, top, front-3/4 (+ any cams you pass), each labelled, plus a
1.8 m person-height scale bar in 'shape' mode so proportions can be checked against real sizes.
"""
import math, os, tempfile
import bpy
from mathutils import Vector

def _bounds(objs):
    lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
    dg = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        ev = o.evaluated_get(dg)
        for c in ev.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
    return lo, hi

def cam_at(loc, target, lens=50, name='chk_cam'):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.clip_start = 0.001
    c = bpy.data.objects.new(name, cd); bpy.context.scene.collection.objects.link(c)
    c.location = loc
    d = Vector(target) - Vector(loc); c.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return c

def _setup(mode, res):
    sc = bpy.context.scene
    sc.render.resolution_x = sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    if mode == 'shape':
        sc.render.engine = 'BLENDER_WORKBENCH'
        sh = sc.display.shading
        sh.light = 'STUDIO'; sh.color_type = 'MATERIAL'; sh.show_cavity = True
        sh.cavity_type = 'BOTH'; sh.show_object_outline = True; sh.show_shadows = True
        sc.world.color = (0.55, 0.55, 0.58) if sc.world else None
    else:
        sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
        sc.cycles.samples = 48; sc.cycles.use_denoising = True
        try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
        except Exception: pass
        sc.view_settings.view_transform = 'AgX'

def _lights(ctr, size):
    """Neutral studio rig (key, fill, rim) + dim grey world, only if the scene has no lights."""
    sc = bpy.context.scene
    if any(o.type == 'LIGHT' for o in sc.objects): return []
    w = sc.world; w.use_nodes = True
    bg = w.node_tree.nodes.get('Background')
    if bg: bg.inputs['Color'].default_value = (0.42, 0.43, 0.46, 1); bg.inputs['Strength'].default_value = 0.35
    made = []
    for nm, d, e, sz in (('chk_key', (-0.6, -0.8, 0.7), 80, 1.0), ('chk_fill', (0.9, -0.4, 0.2), 20, 1.6), ('chk_rim', (0.3, 0.9, 0.6), 45, 0.8)):
        ld = bpy.data.lights.new(nm, 'AREA'); ld.energy = e * size * size; ld.size = sz * size
        lo = bpy.data.objects.new(nm, ld); sc.collection.objects.link(lo)
        v = Vector(d).normalized() * size * 2.2; lo.location = ctr + v
        lo.rotation_euler = (-v).to_track_quat('-Z', 'Y').to_euler(); made.append(lo)
    return made

def sheet(out, objs=None, mode='shape', res=360, cams=(), extra_views=True):
    sc = bpy.context.scene
    if sc.world is None: sc.world = bpy.data.worlds.new('chk_world')
    objs = objs or [o for o in sc.objects if o.type in ('MESH', 'CURVE', 'SURFACE', 'META', 'FONT') and not o.hide_render]
    lo, hi = _bounds(objs); ctr = (lo + hi) / 2; size = max((hi - lo).length, 0.05)
    dist = size * 1.6
    views = []
    if extra_views:
        for lab, d in (('front', (0, -1, 0.12)), ('side +x', (1, 0, 0.12)), ('back 3/4', (-0.7, 0.7, 0.35)),
                       ('top', (0.001, -0.001, 1)), ('front 3/4', (0.7, -0.7, 0.35))):
            v = Vector(d).normalized() * dist
            views.append((lab, cam_at(ctr + v, ctr, 50, 'chk_' + lab)))
    for i, c in enumerate(cams): views.append((getattr(c, 'name', f'cam{i}'), c))
    _setup(mode, res)
    lights = _lights(ctr, size) if mode == 'look' else []
    tmp = tempfile.mkdtemp(); shots = []
    old_cam = sc.camera
    for lab, c in views:
        sc.camera = c; p = os.path.join(tmp, f'{len(shots)}.png'); sc.render.filepath = p
        bpy.ops.render.render(write_still=True); shots.append((lab, p))
    sc.camera = old_cam
    for lab, c in views:
        if c.name.startswith('chk_'): bpy.data.objects.remove(c, do_unlink=True)
    for lt in lights: bpy.data.objects.remove(lt, do_unlink=True)
    from PIL import Image, ImageDraw
    cols = 3; rows = math.ceil(len(shots) / cols)
    per = []
    for o in objs[:8]:
        a, b = _bounds([o]); d = b - a; per.append(f'{o.name}: {d.x:.3f} x {d.y:.3f} x {d.z:.3f}')
    foot = 24 + 14 * len(per)
    S = Image.new('RGB', (cols * res, rows * res + foot), (20, 20, 22)); dr = ImageDraw.Draw(S)
    for i, (lab, p) in enumerate(shots):
        im = Image.open(p).convert('RGB'); x, y = (i % cols) * res, (i // cols) * res
        S.paste(im, (x, y)); dr.rectangle([x, y, x + 8 * len(lab) + 8, y + 16], fill=(0, 0, 0)); dr.text((x + 4, y + 2), lab, fill=(255, 255, 255))
    dims = hi - lo
    dr.text((6, rows * res + 6), f'{mode}  size x{dims.x:.3f} y{dims.y:.3f} z{dims.z:.3f} m  ({len(objs)} objs)', fill=(230, 230, 230))
    for i, t in enumerate(per): dr.text((6, rows * res + 22 + 14 * i), t + ' m', fill=(200, 200, 200))
    S.save(out); return out
