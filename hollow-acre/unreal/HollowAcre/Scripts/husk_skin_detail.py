"""The husk's skin given a surface (blind judge, run 52: "a smooth, low-detail rubbery mesh"; "skin pores, veins, a wet
sheen"). Two free Quixel scans (Fab, professional licence, ASSETS_EPIC.md), at 2K, unpacked outside git under
C:/HollowAcreTools/Megascans3D/skin/:
- a: "Animal Skin" (rkqor3p0), pale skin with pores, follicle pits and fine wrinkles. Its normal is blended over the
  body's own (angle-corrected), its cavity darkens the pores, and its roughness varies the wet film (wetter in the
  creases, drier on the ridges), tiled over the body's UVs about every 20 cm.
- c: "Rotten Animal Skin" (rlsvbmp0), its dark blotches read at a larger tile as frostbite and bruising under the
  pallor: they darken and cool the base colour.
Both skin materials (M_HuskSkin on the body, M_HuskFaceSkin on the face). Changed in place once (marked 'skin detail');
run after husk_cold_skin.py.
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import glob
import os

import unreal

DEST = '/Game/HollowAcre/Creature/HuskGame'
TEXD = DEST + '/Detail'
SRC = 'C:/HollowAcreTools/Megascans3D/skin'
mel = unreal.MaterialEditingLibrary
MP = unreal.MaterialProperty
eal = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
TILE = {'M_HuskSkin': 10.0, 'M_HuskFaceSkin': 4.0}     # (the body's UVs span about 2 m, the face's about 0.8 m)


def log(*a):
    unreal.log('[husk detail] ' + ' '.join(str(x) for x in a))


def tex(pack, kind, name):
    path = '%s/%s' % (TEXD, name)
    if eal.does_asset_exist(path):
        return unreal.load_asset(path)
    f = glob.glob(os.path.join(SRC, pack, '*_%s.jpg' % kind))
    if not f:
        log('no', pack, kind)
        return None
    t = unreal.AssetImportTask()
    t.set_editor_property('filename', f[0])
    t.set_editor_property('destination_path', TEXD)
    t.set_editor_property('destination_name', name)
    t.set_editor_property('replace_existing', True)
    t.set_editor_property('automated', True)
    t.set_editor_property('save', True)
    tools.import_asset_tasks([t])
    x = unreal.load_asset(path)
    if kind == 'Normal':
        x.set_editor_property('srgb', False)
        x.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
    elif kind != 'BaseColor':
        x.set_editor_property('srgb', False)
        x.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_GRAYSCALE)
    eal.save_loaded_asset(x)
    return x


T = {
    'n': tex('a', 'Normal', 'T_HuskPores_N'),
    'cav': tex('a', 'Cavity', 'T_HuskPores_Cavity'),
    'r': tex('a', 'Roughness', 'T_HuskPores_R'),
    'blot': tex('c', 'BaseColor', 'T_HuskBlotch_BC'),
}

for name in ('M_HuskSkin', 'M_HuskFaceSkin'):
    m = unreal.load_asset(DEST + '/' + name)
    if not m:
        log('no', name)
        continue
    base = mel.get_material_property_input_node(m, MP.MP_BASE_COLOR)
    if base is not None and base.get_editor_property('desc') == 'skin detail':
        log(name, 'already done')
        continue
    nrm = mel.get_material_property_input_node(m, MP.MP_NORMAL)
    nrm_out = mel.get_material_property_input_node_output_name(m, MP.MP_NORMAL) if nrm else ''
    rgh = mel.get_material_property_input_node(m, MP.MP_ROUGHNESS)
    rgh_out = mel.get_material_property_input_node_output_name(m, MP.MP_ROUGHNESS) if rgh else ''
    base_out = mel.get_material_property_input_node_output_name(m, MP.MP_BASE_COLOR)

    def E(cls, x, y):
        return mel.create_material_expression(m, cls, x, y)

    def S(t, x, y, kind):
        s = E(unreal.MaterialExpressionTextureSample, x, y)
        s.set_editor_property('texture', t)
        s.set_editor_property('sampler_type', kind)
        return s
    uv = E(unreal.MaterialExpressionTextureCoordinate, -1800, 600)
    uv.set_editor_property('u_tiling', TILE[name])
    uv.set_editor_property('v_tiling', TILE[name])
    uv2 = E(unreal.MaterialExpressionTextureCoordinate, -1800, 900)
    uv2.set_editor_property('u_tiling', TILE[name] * 0.3)
    uv2.set_editor_property('v_tiling', TILE[name] * 0.3)
    sn = S(T['n'], -1550, 600, unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    sc = S(T['cav'], -1550, 750, unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE)
    sr = S(T['r'], -1550, 820, unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE)
    sb = S(T['blot'], -1550, 900, unreal.MaterialSamplerType.SAMPLERTYPE_COLOR)
    links = [(uv, '', sn, 'UVs'), (uv, '', sc, 'UVs'), (uv, '', sr, 'UVs'), (uv2, '', sb, 'UVs')]
    # normal: the pores over the body's own, angle-corrected
    if nrm is not None:
        bl = E(unreal.MaterialExpressionMaterialFunctionCall, -1200, 600)
        bl.set_editor_property('material_function', unreal.load_asset('/Engine/Functions/Engine_MaterialFunctions02/Utility/BlendAngleCorrectedNormals'))
        links += [(nrm, nrm_out, bl, 'BaseNormal'), (sn, 'RGB', bl, 'AdditionalNormal')]
    # base colour: pores darkened (cavity), blotches (the rotten scan's darkness) cooling and darkening it
    cavk = E(unreal.MaterialExpressionLinearInterpolate, -1200, 750)
    cavk.set_editor_property('const_a', 0.55)
    cavk.set_editor_property('const_b', 1.0)
    links += [(sc, 'R', cavk, 'Alpha')]
    lum = E(unreal.MaterialExpressionDesaturation, -1200, 900)
    links += [(sb, 'RGB', lum, '')]
    blk = E(unreal.MaterialExpressionPower, -1050, 900)
    blk.set_editor_property('const_exponent', 1.6)
    links += [(lum, '', blk, 'Base')]
    bruise = E(unreal.MaterialExpressionConstant3Vector, -1050, 980)
    bruise.set_editor_property('constant', unreal.LinearColor(0.42, 0.44, 0.62, 1.0))
    blt = E(unreal.MaterialExpressionLinearInterpolate, -900, 900)
    links += [(bruise, '', blt, 'A'), (blk, '', blt, 'Alpha')]
    blt.set_editor_property('const_b', 1.0)
    m1 = E(unreal.MaterialExpressionMultiply, -750, 800)
    m2 = E(unreal.MaterialExpressionMultiply, -600, 800)
    m2.set_editor_property('desc', 'skin detail')
    links += [(base, base_out, m1, 'A'), (cavk, '', m1, 'B'), (m1, '', m2, 'A'), (blt, '', m2, 'B')]
    # roughness: wetter in the creases and pits, drier on the ridges
    if rgh is not None:
        rk = E(unreal.MaterialExpressionLinearInterpolate, -900, 1100)
        rk.set_editor_property('const_a', 0.75)
        rk.set_editor_property('const_b', 1.2)
        rm = E(unreal.MaterialExpressionMultiply, -750, 1100)
        links += [(sr, 'R', rk, 'Alpha'), (rgh, rgh_out, rm, 'A'), (rk, '', rm, 'B')]
    ok = True
    for (f, fo, t, ti) in links:
        r = mel.connect_material_expressions(f, fo, t, ti)
        if not r:
            log(name, 'link failed: %s.%s -> %s.%s' % (f.get_name(), fo, t.get_name(), ti))
        ok = ok and r
    if not ok:
        log(name, 'LINKS FAILED: not saved')
        continue
    mel.connect_material_property(m2, '', MP.MP_BASE_COLOR)
    if nrm is not None:
        mel.connect_material_property(bl, 'Result', MP.MP_NORMAL)
    if rgh is not None:
        mel.connect_material_property(rm, '', MP.MP_ROUGHNESS)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log(name, 'detailed (normal %s, roughness %s)' % (nrm is not None, rgh is not None))
