"""Sheriff's cruiser built from the Kenney sedan (CC0): black-and-white paint, a red/blue lightbar, push bar; rendered in the game's 3/4 view."""
import os, sys, math, json
os.environ['MODE'] = 'none'
sys.path.insert(0, os.path.dirname(__file__))
import car2
from car2 import *
import bpy
from mathutils import Vector
OUT = car2.OUT
def police(blocks=False):
    car2.PAINT = (.012, .012, .016)
    cam, root, objs, _ = build(lights=False)
    M = car2.mat('pwhite', (.78, .78, .76), .35, 0, .6)
    body = next(o for o in objs if o.name == 'body'); me = body.data; me.materials.append(M); wi = len(me.materials) - 1
    ys = [v.co.y for v in me.vertices]; y0, y1 = min(ys), max(ys); L = y1 - y0; zs = [v.co.z for v in me.vertices]; z0, zt = min(zs), max(zs); H = zt - z0
    pi = [i for i, m in enumerate(me.materials) if m and m.name.startswith('paint')]
    for p in me.polygons:
        if p.material_index not in pi: continue
        c = p.center; n = p.normal; t = (c.y - y0) / L; h = (c.z - z0) / H
        door = abs(n.x) > .55 and .3 < t < .72 and h < .62
        roof = n.z > .75 and h > .85
        if door or roof: p.material_index = wi
    # lightbar on the roof, push bar on the nose
    def box(name, loc, size, mt):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.name = name; o.scale = size; o.data.materials.append(mt); o.parent = root; return o
    red = car2.mat('lred', (.75, .02, .02), .3, 0, 0, ((1, .03, .02), .9)); blue = car2.mat('lblue', (.02, .1, .85), .3, 0, 0, ((.05, .2, 1), .9)); blk = car2.mat('pbar', (.02, .02, .02), .6)
    bpy.context.view_layer.update(); mn, mx = car2.bbox(objs); top = mx.z + .01; cy = (mn.y + mx.y) / 2 + (mx.y - mn.y) * .06
    box('lr', (-.27, cy, top + .08), (.5, .24, .13), red); box('lb', (.27, cy, top + .08), (.5, .24, .13), blue); box('lbase', (0, cy, top + .01), (1.1, .28, .04), blk)
    box('push', (0, mn.y - .06, .42), (1.25, .08, .3), blk)
    if blocks:
        for o in objs:
            if o.name.startswith('wheel'): o.hide_render = True
    return cam, root, objs
meta = {}
for nm, blocks in (('police', False), ('police_blocks', True)):
    cam, root, objs = police(blocks)
    root.rotation_euler = (0, 0, -math.pi / 2 + .42)
    bpy.context.view_layer.update()
    box_ = car2.bbox([o for o in bpy.data.objects if o.type == 'MESH'])
    meta[nm] = car2.shoot(cam, f'{OUT}/{nm}.png', box_)
json.dump(meta, open(f'{OUT}/police.json', 'w')); print('META', json.dumps(meta))
