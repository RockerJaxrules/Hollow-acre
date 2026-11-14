"""Physically based material presets for Blender 5.2 (socket names checked with api.py).

    import mats
    mats.skin(obj, tone=(0.86, 0.66, 0.55))       # sRGB tone, e.g. from the save's skin colour
    mats.cloth(obj, (0.18, 0.30, 0.20), weave=1)  # flannel/denim-like: sheen + weave bump
    mats.pbr(obj, (0.45, 0.42, 0.38), rough=0.8, bump=0.3, bump_scale=40)   # rock, wood, metal...

Real-world rules baked in (see LESSONS.md): skin = random-walk-skin SSS with red scattering furthest,
millimetre scale, roughness ~0.45, varied colour (redder at knuckles/creases, never one flat tone),
pore-scale bump; cloth = sheen + weave; nothing is pure black or pure white; roughness is never 0.
"""
import bpy

def _lin(c):  # sRGB -> linear
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

def _new(obj, name):
    m = bpy.data.materials.new(name)
    try: m.use_nodes = True
    except Exception: pass
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    if obj is not None:
        if obj.data.materials: obj.data.materials[0] = m
        else: obj.data.materials.append(m)
    return m, nt, bsdf

def sock(sockets, name, kind='RGBA'):
    """Pick a socket by name AND type: Mix nodes have several sockets with the same name."""
    for x in sockets:
        if x.name == name and x.type == kind: return x
    return sockets[name]

def _mix(nt):
    m = nt.nodes.new('ShaderNodeMix'); m.data_type = 'RGBA'
    return m, sock(m.inputs, 'A'), sock(m.inputs, 'B'), sock(m.outputs, 'Result'), sock(m.inputs, 'Factor', 'VALUE')

def _noise(nt, scale, detail=6.0, rough=0.55):
    n = nt.nodes.new('ShaderNodeTexNoise')
    n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = detail
    n.inputs['Roughness'].default_value = rough
    return n

def _bump(nt, bsdf, height_out, strength, distance=0.001):
    b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = strength
    b.inputs['Distance'].default_value = distance
    nt.links.new(height_out, b.inputs['Height']); nt.links.new(b.outputs['Normal'], bsdf.inputs['Normal'])
    return b

def skin(obj, tone=(0.86, 0.66, 0.55), flush=(0.80, 0.42, 0.38), name='skin'):
    m, nt, bsdf = _new(obj, name)
    bsdf.subsurface_method = 'RANDOM_WALK_SKIN'
    bsdf.inputs['Subsurface Weight'].default_value = 1.0
    bsdf.inputs['Subsurface Radius'].default_value = (1.0, 0.35, 0.2)   # red travels furthest
    bsdf.inputs['Subsurface Scale'].default_value = 0.004                # metres (~4 mm)
    bsdf.inputs['Roughness'].default_value = 0.46
    bsdf.inputs['Specular IOR Level'].default_value = 0.5
    bsdf.inputs['IOR'].default_value = 1.4
    bsdf.inputs['Coat Weight'].default_value = 0.06; bsdf.inputs['Coat Roughness'].default_value = 0.35  # faint oil sheen
    # colour variation: blotchy mix of base tone and flush, plus redder in creases (AO)
    blot = _noise(nt, 18.0, 4.0, 0.5)
    mix, mA, mB, mR, mF = _mix(nt)
    mA.default_value = (*_lin(tone), 1); mB.default_value = (*_lin(flush), 1)
    ramp = nt.nodes.new('ShaderNodeMapRange'); ramp.inputs['From Min'].default_value = 0.42; ramp.inputs['From Max'].default_value = 0.75
    ramp.inputs['To Max'].default_value = 0.35
    nt.links.new(blot.outputs['Factor'], ramp.inputs['Value']); nt.links.new(ramp.outputs['Result'], mF)
    ao = nt.nodes.new('ShaderNodeAmbientOcclusion'); ao.inputs['Distance'].default_value = 0.01
    mix2, m2A, m2B, m2R, m2F = _mix(nt)
    inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    nt.links.new(ao.outputs['AO'], inv.inputs[1])
    sc = nt.nodes.new('ShaderNodeMath'); sc.operation = 'MULTIPLY'; sc.inputs[1].default_value = 0.6
    nt.links.new(inv.outputs['Value'], sc.inputs[0]); nt.links.new(sc.outputs['Value'], m2F)
    nt.links.new(mR, m2A); m2B.default_value = (*_lin(flush), 1)
    nt.links.new(m2R, bsdf.inputs['Base Color'])
    # pores + fine lines
    pores = _noise(nt, 900.0, 2.0, 0.6)
    _bump(nt, bsdf, pores.outputs['Factor'], 0.08, 0.0004)
    return m

def cloth(obj, color, weave=1.0, name='cloth'):
    m, nt, bsdf = _new(obj, name)
    bsdf.inputs['Base Color'].default_value = (*_lin(color), 1)
    bsdf.inputs['Roughness'].default_value = 0.85
    bsdf.inputs['Sheen Weight'].default_value = 0.6; bsdf.inputs['Sheen Roughness'].default_value = 0.4
    bsdf.inputs['Specular IOR Level'].default_value = 0.3
    if weave:
        w = nt.nodes.new('ShaderNodeTexWave'); w.inputs['Scale'].default_value = 350.0 * weave
        w2 = nt.nodes.new('ShaderNodeTexWave'); w2.inputs['Scale'].default_value = 350.0 * weave
        w2.bands_direction = 'Y'
        add = nt.nodes.new('ShaderNodeMath'); add.operation = 'ADD'
        nt.links.new(w.outputs['Factor'], add.inputs[0])
        nt.links.new(w2.outputs['Factor'], add.inputs[1])
        _bump(nt, bsdf, add.outputs['Value'], 0.15, 0.0005)
    return m

def pbr(obj, color, rough=0.6, metal=0.0, bump=0.0, bump_scale=30.0, name='pbr'):
    m, nt, bsdf = _new(obj, name)
    n = _noise(nt, bump_scale * 0.3, 3.0, 0.5)
    mix, mA, mB, mR, mF = _mix(nt)
    c = _lin(color); mA.default_value = (*c, 1); mB.default_value = (*(x * 0.7 for x in c), 1)
    nt.links.new(n.outputs['Factor'], mF); nt.links.new(mR, bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = max(rough, 0.05); bsdf.inputs['Metallic'].default_value = metal
    if bump:
        b = _noise(nt, bump_scale, 8.0, 0.6); _bump(nt, bsdf, b.outputs['Factor'], bump, 0.002)
    return m
