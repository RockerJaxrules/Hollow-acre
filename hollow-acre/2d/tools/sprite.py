"""Pre-rendered pixel sprites: orthographic 3/4 camera (45deg), ground squared up afterwards, 32 px per metre."""
import os, math, bpy
from mathutils import Vector, Euler
PPM = 32          # pixels per metre on the ground plane
SS = 4            # supersampling
EL = math.radians(45)

def scene_setup(samples=12):
    s = bpy.context.scene; s.render.engine = 'CYCLES'; s.cycles.device = 'CPU'; s.cycles.samples = samples
    s.cycles.use_denoising = False; s.render.film_transparent = True; s.view_settings.view_transform = 'Standard'; s.view_settings.look = 'None'
    s.render.image_settings.file_format = 'PNG'; s.render.image_settings.color_mode = 'RGBA'
    s.cycles.max_bounces = 3; s.render.filter_size = .8
    w = bpy.data.worlds.new('w') if not s.world else s.world; s.world = w; w.use_nodes = True
    bg = w.node_tree.nodes.get('Background'); bg.inputs['Color'].default_value = (.32, .34, .4, 1); bg.inputs['Strength'].default_value = .55
    for o in [o for o in s.objects if o.type in ('LIGHT', 'CAMERA')]: bpy.data.objects.remove(o)
    def light(name, kind, rot, energy, col):
        ld = bpy.data.lights.new(name, kind); ld.energy = energy; ld.color = col
        if kind == 'SUN': ld.angle = math.radians(6)
        o = bpy.data.objects.new(name, ld); s.collection.objects.link(o); o.rotation_euler = Euler(rot); return o
    light('key', 'SUN', (math.radians(50), 0, math.radians(-35)), 3.6, (1, .95, .86))     # from upper-left, in front
    light('rim', 'SUN', (math.radians(-60), 0, math.radians(160)), 1.0, (.7, .78, 1))
    cd = bpy.data.cameras.new('cam'); cd.type = 'ORTHO'; cam = bpy.data.objects.new('cam', cd); s.collection.objects.link(cam); s.camera = cam
    return cam

def frame(cam, center, w_m, h_m, el=EL, stretch=True):
    """aim the camera so the box [center.x +- w/2] x [ground rows..] fills the frame. h_m is the screen height in 'squared' metres."""
    s = bpy.context.scene
    W = int(round(w_m * PPM)); H = int(round(h_m * PPM))
    Hr = H / math.sqrt(2) if stretch else H
    s.render.resolution_x = W * SS; s.render.resolution_y = int(round(Hr * SS)); s.render.resolution_percentage = 100
    cam.data.ortho_scale = max(w_m, Hr / PPM) if W >= Hr else Hr / PPM
    cam.data.sensor_fit = 'HORIZONTAL'; cam.data.ortho_scale = w_m
    d = 30; cam.rotation_euler = Euler((math.pi / 2 - el, 0, 0))
    fwd = Vector((0, math.cos(el), -math.sin(el)))   # camera looks along +Y, down
    cam.location = Vector(center) - fwd * d
    return W, H

def render(path):
    bpy.context.scene.render.filepath = path; bpy.ops.render.render(write_still=True)

def import_glb(path):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.data.objects if o not in before]

LIGHT = Vector((-.55, -.45, .7)).normalized()
def toonify(objs, bands=((0, .5), (.3, .74), (.62, 1.0)), rim=.18, light=LIGHT, sat=1.1):
    """swap every material for a flat emission toon shader: albedo x stepped lambert + soft rim. crisp bands survive pixelation."""
    done = set()
    for o in objs:
        for slot in getattr(o, 'material_slots', []):
            m = slot.material
            if not m or m.name in done: continue
            done.add(m.name); nt = m.node_tree; N = nt.nodes; L = nt.links
            pb = next((n for n in N if n.type == 'BSDF_PRINCIPLED'), None)
            if pb is None: continue
            bc = pb.inputs['Base Color']; alb = bc.links[0].from_socket if bc.links else None
            emc = pb.inputs['Emission Color']; ems = pb.inputs['Emission Strength'].default_value
            out = next(n for n in N if n.type == 'OUTPUT_MATERIAL')
            geo = N.new('ShaderNodeNewGeometry'); dot = N.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'
            L.new(geo.outputs['Normal'], dot.inputs[0]); dot.inputs[1].default_value = light
            rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.interpolation = 'CONSTANT'; cr = rp.color_ramp
            cr.elements[0].position = bands[0][0]; cr.elements[0].color = (bands[0][1],) * 3 + (1,)
            cr.elements[1].position = bands[-1][0]; cr.elements[1].color = (bands[-1][1],) * 3 + (1,)
            for p_, v in bands[1:-1]: e = cr.elements.new(p_); e.color = (v,) * 3 + (1,)
            mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -.35; mr.inputs['From Max'].default_value = 1; L.new(dot.outputs['Value'], mr.inputs['Value']); L.new(mr.outputs['Result'], rp.inputs[0])
            mul = N.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs[0].default_value = 1
            if alb: L.new(alb, mul.inputs[6])
            else: mul.inputs[6].default_value = bc.default_value
            L.new(rp.outputs['Color'], mul.inputs[7])
            lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = .25
            rr = N.new('ShaderNodeValToRGB'); rr.color_ramp.interpolation = 'CONSTANT'; rr.color_ramp.elements[0].color = (0, 0, 0, 1); rr.color_ramp.elements[1].position = .7; rr.color_ramp.elements[1].color = (rim, rim, rim * 1.1, 1)
            L.new(lw.outputs['Facing'], rr.inputs[0])
            add = N.new('ShaderNodeMix'); add.data_type = 'RGBA'; add.blend_type = 'ADD'; add.inputs[0].default_value = 1; L.new(mul.outputs[2], add.inputs[6]); L.new(rr.outputs['Color'], add.inputs[7])
            hs = N.new('ShaderNodeHueSaturation'); hs.inputs['Saturation'].default_value = sat; L.new(add.outputs[2], hs.inputs['Color'])
            em = N.new('ShaderNodeEmission'); L.new(hs.outputs['Color'], em.inputs['Color'])
            if ems > 0:
                e2 = N.new('ShaderNodeEmission'); e2.inputs['Color'].default_value = emc.default_value; e2.inputs['Strength'].default_value = 1.0
                ad2 = N.new('ShaderNodeAddShader'); L.new(em.outputs[0], ad2.inputs[0]); L.new(e2.outputs[0], ad2.inputs[1]); fin = ad2.outputs[0]
            else: fin = em.outputs[0]
            a = pb.inputs['Alpha']
            if a.default_value < .99 or a.links:
                tr = N.new('ShaderNodeBsdfTransparent'); mx = N.new('ShaderNodeMixShader')
                if a.links: L.new(a.links[0].from_socket, mx.inputs[0])
                else: mx.inputs[0].default_value = a.default_value
                L.new(tr.outputs[0], mx.inputs[1]); L.new(fin, mx.inputs[2]); fin = mx.outputs[0]
            for l in list(out.inputs['Surface'].links): L.remove(l)
            L.new(fin, out.inputs['Surface'])
