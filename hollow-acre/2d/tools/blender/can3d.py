"""The watering can as a small 3D blockout, rendered at the game's camera for the views a 2D artist gets wrong (owner, Nov 10:
facing down and up "the can is not oriented the right way"): spout toward us (facing down), spout away (facing up), and
the side view, each upright and tipped to pour. Toon shading in the can's own five tin tones (the letters s b m l e of
TOOL_PAL / METAL.tin, so the game's grade recolouring still works), a darker outline added after.
    python3 can3d.py out.json [preview.png]
Writes each view as letter art (K s b m l e) with the hand's grip point and the spout's tip in art pixels."""
import sys, math, json
import bpy, bmesh
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

TIN = {'s': (26, 58, 34), 'b': (44, 94, 52), 'm': (70, 136, 74), 'l': (118, 186, 108), 'e': (176, 222, 160)}
ORDER = 'sbmle'
LIGHT = Vector((-0.55, -0.45, 0.70)).normalized()   # top, slightly left and toward us
FW = FH = 24

def lin(c): return tuple(((v / 255) ** 2.2) for v in c) + (1,)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene; s.render.engine = 'CYCLES'; s.cycles.samples = 16; s.cycles.device = 'CPU'
    s.render.resolution_x, s.render.resolution_y = FW * 4, FH * 4; s.render.resolution_percentage = 100
    s.render.film_transparent = True; s.cycles.filter_width = .01; s.view_settings.view_transform = 'Standard'; s.cycles.use_denoising = False
    return s

def mat(name, dark=False, stops=(0, .3, .5, .7, .88), order=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    geo = nt.nodes.new('ShaderNodeNewGeometry'); dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'
    dot.inputs[1].default_value = LIGHT; nt.links.new(geo.outputs['Normal'], dot.inputs[0])
    ma = nt.nodes.new('ShaderNodeMath'); ma.operation = 'MULTIPLY_ADD'; ma.inputs[1].default_value = .5; ma.inputs[2].default_value = .5 if not dark else .05
    nt.links.new(dot.outputs['Value'], ma.inputs[0])
    if dark: ma.inputs[1].default_value = .08
    cr = nt.nodes.new('ShaderNodeValToRGB'); r = cr.color_ramp; r.interpolation = 'CONSTANT'
    order = order or ORDER
    while len(r.elements) < len(order): r.elements.new(.5)
    for el, p, k in zip(r.elements, stops, order): el.position = p; el.color = lin(TIN[k])
    nt.links.new(ma.outputs[0], cr.inputs['Fac']); nt.links.new(cr.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs[0], out.inputs['Surface'])
    return m

def depth_mat():
    m = bpy.data.materials.new('depth'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); cd = nt.nodes.new('ShaderNodeCameraData')
    ma = nt.nodes.new('ShaderNodeMath'); ma.operation = 'MULTIPLY_ADD'; ma.inputs[1].default_value = -.05; ma.inputs[2].default_value = 1.6   # depth 12..32 -> 1..0
    nt.links.new(cd.outputs['View Z Depth'], ma.inputs[0]); nt.links.new(ma.outputs[0], em.inputs['Strength'])
    em.inputs['Color'].default_value = (1, 1, 1, 1); nt.links.new(em.outputs[0], out.inputs['Surface']); return m

def seg(a, b, r0, r1, m, parent, verts=12):
    a, b = Vector(a), Vector(b); d = b - a
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r0, radius2=r1, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object; o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); o.data.materials.append(m)
    bpy.ops.object.shade_smooth(); o.parent = parent; return o

def build():
    M, D = mat('tin', stops=(0, .42, .7, .93), order='bmle'), mat('inside', True)
    HM = mat('handle', stops=(0, .5), order='sb')   # the handle a step darker than the lid it crosses
    root = bpy.data.objects.new('can', None); bpy.context.scene.collection.objects.link(root)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=.92, depth=1.4, location=(0, 0, .7)); b = bpy.context.active_object
    b.data.materials.append(M); bpy.ops.object.shade_smooth(); b.parent = root
    # the opening: a dark disc just inside the rim, and a rolled rim
    # a lidded top with a small fill hole at the back: an open top read as two eyes with the handle across it
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=.2, depth=.04, location=(-.45, 0, 1.43)); o = bpy.context.active_object; o.data.materials.append(D); o.parent = root
    bpy.ops.mesh.primitive_torus_add(major_radius=.85, minor_radius=.1, location=(0, 0, 1.4)); o = bpy.context.active_object; o.data.materials.append(M); bpy.ops.object.shade_smooth(); o.parent = root
    # the spout: from low on the body up and out along +x, ending in a rose (a short wide cone, the holes facing out)
    seg((.7, 0, .35), (2.0, 0, 1.45), .26, .16, M, root)
    tip = Vector((2.0, 0, 1.45)); dirv = (tip - Vector((.7, 0, .35))).normalized()
    seg(tip - dirv * .05, tip + dirv * .3, .18, .36, M, root)
    rose = tip + dirv * .3
    # the handle: an arch over the top from the back of the rim toward the front
    pts = [(-.95 + 1.55 * t, 0, 1.4 + 1.0 * math.sin(math.pi * t)) for t in [i / 12 for i in range(13)]]
    for p, q in zip(pts, pts[1:]): seg(p, q, .17, .17, HM, root, 10)
    grip = Vector((-.17, 0, 1.4 + 1.0))
    return root, rose, grip

def camera():
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = 5.5
    o = bpy.data.objects.new('cam', cam); bpy.context.scene.collection.objects.link(o); bpy.context.scene.camera = o
    el = math.radians(40)   # the game's 3/4 view: looking down 40 degrees, from the front (-y)
    o.location = (0, -20 * math.cos(el), 20 * math.sin(el) + .7); o.rotation_euler = (math.radians(90) - el, 0, 0)
    return o

VIEWS = {   # name: (yaw of the spout, tilt down)
    'can_e': (0, 0), 'can_et': (0, 40),
    'can_f': (-135, 0), 'can_ft': (-135, 32),    # spout toward us and to the left (toward the square in front of him): the handle and spout both read
    'can_b': (135, 0), 'can_bt': (135, 32),      # spout away and to the left
}

def render(name, yaw, tilt, root, rose, grip, camo, path):
    root.rotation_euler = (0, 0, 0)
    root.matrix_world = Matrix.Rotation(math.radians(yaw), 4, 'Z') @ Matrix.Rotation(math.radians(tilt), 4, 'Y')
    bpy.context.view_layer.update()
    sc = bpy.context.scene; sc.render.filepath = path; bpy.ops.render.render(write_still=True)
    # the same view in depth, for the lines where one part passes in front of another
    keep = {o: list(o.data.materials) for o in bpy.data.objects if o.type == 'MESH'}; dm = depth_mat()
    for o in keep: o.data.materials.clear(); o.data.materials.append(dm)
    sc.view_settings.view_transform = 'Raw' if 'Raw' in [v.identifier for v in type(sc.view_settings).bl_rna.properties['view_transform'].enum_items] else 'Standard'
    sc.render.image_settings.color_depth = '16'; sc.render.filepath = path.replace('.png', '_z.png'); bpy.ops.render.render(write_still=True)
    sc.render.image_settings.color_depth = '8'; sc.view_settings.view_transform = 'Standard'
    for o, ms in keep.items():
        o.data.materials.clear()
        for mm in ms: o.data.materials.append(mm)
    def px(p):
        v = world_to_camera_view(sc, camo, root.matrix_world @ p); return (v.x * FW, (1 - v.y) * FH)
    return px(rose), px(grip)

def to_art(path, rose, grip):
    from PIL import Image
    import numpy as np
    im = Image.open(path).convert('RGBA'); W, H = im.size; k = W // FW
    zi = np.asarray(Image.open(path.replace('.png', '_z.png')).convert('I;16') if False else Image.open(path.replace('.png', '_z.png'))).astype(float)
    if zi.ndim == 3: zi = zi[:, :, 0]
    zi = zi / zi.max() if zi.max() > 0 else zi
    # per art pixel: its mean depth (nearer = brighter)
    zs = zi[:FH * k, :FW * k].reshape(FH, k, FW, k).mean(axis=(1, 3))
    # downsample 4x by majority of opaque palette colours
    cols = {v: c for c, v in TIN.items()}
    def near(rgb):
        return min(TIN, key=lambda c: sum((a - b) ** 2 for a, b in zip(TIN[c], rgb)))
    g = [['.'] * FW for _ in range(FH)]
    for y in range(FH):
        for x in range(FW):
            cnt = {}; op = 0
            for j in range(k):
                for i in range(k):
                    p = im.getpixel((x * k + i, y * k + j))
                    if p[3] > 128: op += 1; c = near(p[:3]); cnt[c] = cnt.get(c, 0) + 1
            if op * 2 >= k * k: g[y][x] = max(cnt, key=cnt.get)
    # inner lines: where a part sits clearly in front of the one beside it, the farther pixel becomes a dark line
    o = [r[:] for r in g]
    for y in range(FH):
        for x in range(FW):
            if g[y][x] == '.': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < FH and 0 <= xx < FW and g[yy][xx] != '.' and zs[yy, xx] - zs[y, x] > .03: o[y][x] = 'K'; break
    g = o
    # outline: a dark rim around the silhouette
    o = [r[:] for r in g]
    for y in range(FH):
        for x in range(FW):
            if g[y][x] == '.' and any(0 <= y + dy < FH and 0 <= x + dx < FW and g[y + dy][x + dx] != '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): o[y][x] = 'K'
    rows = [''.join(r) for r in o]
    # crop to the art
    ys = [i for i, r in enumerate(rows) if r.strip('.')]; xs = [i for i in range(FW) if any(r[i] != '.' for r in rows)]
    y0, y1, x0, x1 = ys[0], ys[-1], xs[0], xs[-1]
    rows = [r[x0:x1 + 1] for r in rows[y0:y1 + 1]]
    return {'art': rows, 'px': round(grip[0] - x0, 1), 'py': round(grip[1] - y0, 1), 'tip': [round(rose[0] - x0, 1), round(rose[1] - y0, 1)]}

if __name__ == '__main__':
    out = sys.argv[1]; prev = sys.argv[2] if len(sys.argv) > 2 else None
    reset(); root, rose, grip = build(); camo = camera(); res = {}
    for n, (yaw, tilt) in VIEWS.items():
        p = f'/tmp/can3d_{n}.png'; r, gp = render(n, yaw, tilt, root, rose, grip, camo, p); res[n] = to_art(p, r, gp)
    json.dump(res, open(out, 'w'), indent=0)
    if prev:
        from PIL import Image
        PAL = dict(TIN); PAL['K'] = (26, 16, 12)
        W = sum(len(v['art'][0]) for v in res.values()) * 10 + 20 * len(res); Hh = max(len(v['art']) for v in res.values()) * 10
        im = Image.new('RGB', (W, Hh), (58, 74, 44)); x = 0
        for v in res.values():
            for yy, row in enumerate(v['art']):
                for xx, ch in enumerate(row):
                    if ch != '.':
                        for dy in range(10):
                            for dx in range(10): im.putpixel((x + xx * 10 + dx, yy * 10 + dy), PAL[ch])
            gx, gy = v['px'], v['py']; tx, ty = v['tip']
            for (cx, cy, col) in ((gx, gy, (255, 60, 60)), (tx, ty, (60, 160, 255))):
                for dy in range(-2, 3):
                    for dx in range(-2, 3):
                        X, Y = int(x + cx * 10 + dx), int(cy * 10 + dy)
                        if 0 <= X < W and 0 <= Y < Hh: im.putpixel((X, Y), col)
            x += len(v['art'][0]) * 10 + 20
        im.save(prev)
    print('ok', {k: (len(v['art'][0]), len(v['art'])) for k, v in res.items()})
