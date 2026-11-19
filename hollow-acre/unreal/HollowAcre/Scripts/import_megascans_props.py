"""Imports Quixel Megascans 3D assets (downloaded from Fab with the owner's approval, FBX 'high' zips at 4K, unpacked
outside git under C:/HollowAcreTools/Megascans3D/x/<pack>/) into /Game/HollowAcre/Megascans/Props/<Name>: the mesh
(Nanite on: the scans are dense), its maps (base colour, normal, roughness (from gloss when the pack has no roughness),
AO), and a material instance of M_MegaProp, a master that settles snow on whatever faces up (the town's fresh-snow scan,
as the buildings' materials do) so the props sit in the same night as the camp.

Env: HA_MS_REMASTER=1 rebuilds the two masters in place first (their instances keep them); HA_MS_ROOT (default C:/HollowAcreTools/Megascans3D/x), HA_MS_PACKS (comma list of pack folders; default all but
'mine'), HA_MS_SUB=1 to treat each subfolder of the packs as an asset (the Old Mine pack), HA_MS_SPLIT (comma list of
packs whose FBX holds several pieces, a kit: each piece its own mesh, sharing the one material).
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import glob
import os

import unreal

ROOT = os.environ.get('HA_MS_ROOT', 'C:/HollowAcreTools/Megascans3D/x')
DEST = '/Game/HollowAcre/Megascans/Props'
MASTER = '/Game/HollowAcre/Megascans/Props/M_MegaProp'
MASKED = '/Game/HollowAcre/Megascans/Props/M_MegaPropMasked'      # (the same, cut by an opacity map: glazed doors, windows)
SNOW_TEX = '/Game/HollowAcre/Megascans/FreshSnow'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def log(*a):
    unreal.log('[megaprops] ' + ' '.join(str(x) for x in a))


def import_file(path, dest, name, options=None):
    t = unreal.AssetImportTask()
    t.set_editor_property('filename', path)
    t.set_editor_property('destination_path', dest)
    t.set_editor_property('destination_name', name)
    t.set_editor_property('replace_existing', True)
    t.set_editor_property('automated', True)
    t.set_editor_property('save', True)
    if options:
        t.set_editor_property('options', options)
    tools.import_asset_tasks([t])
    return [unreal.load_asset(p) for p in t.get_editor_property('imported_object_paths')]


def tex(path, dest, name, kind):
    a = import_file(path, dest, name)
    tx = next((x for x in a if isinstance(x, unreal.Texture2D)), None)
    if not tx:
        return None
    if kind == 'Normal':
        tx.set_editor_property('srgb', False)
        tx.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
    elif kind != 'BaseColor':
        tx.set_editor_property('srgb', False)
        tx.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_GRAYSCALE)
    eal.save_loaded_asset(tx)
    return tx


def find_snow(kind):
    for p in eal.list_assets(SNOW_TEX, recursive=True):
        if p.split('.')[0].endswith('_' + kind):
            return unreal.load_asset(p.split('.')[0])
    return None


GRAY_DEFAULT = '/Game/HollowAcre/Megascans/Props/WoodenCrate/T_WoodenCrate_AO'      # (a linear greyscale map)
NORMAL_DEFAULT = '/Engine/EngineMaterials/DefaultNormal'


def master(masked=False, rebuild=False):
    """The props' master. Each texture parameter needs a default of its own sampler's kind (a normal map, a linear
    greyscale map) or the material fails to compile and the game draws the default material on every prop: the cause
    of the grey props."""
    path = MASKED if masked else MASTER
    if eal.does_asset_exist(path) and not rebuild:
        return unreal.load_asset(path)
    if eal.does_asset_exist(path):
        m = unreal.load_asset(path)
        mel.delete_all_material_expressions(m)
    else:
        m = tools.create_asset(path.split('/')[-1], DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_nanite', True)
    if masked:
        m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_MASKED)
        m.set_editor_property('two_sided', True)

    def param(cls, name, x, y, default=None, sampler=None):
        e = mel.create_material_expression(m, cls, x, y)
        e.set_editor_property('parameter_name', name)
        if default is None and sampler == unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL:
            default = unreal.load_asset(NORMAL_DEFAULT)
        elif default is None and sampler == unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE:
            default = unreal.load_asset(GRAY_DEFAULT)
        if default is not None:
            e.set_editor_property('texture', default)
        if sampler is not None:
            e.set_editor_property('sampler_type', sampler)
        return e
    bc = param(unreal.MaterialExpressionTextureSampleParameter2D, 'BaseColor', -1400, -300)
    nm = param(unreal.MaterialExpressionTextureSampleParameter2D, 'Normal', -1400, 0, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    rg = param(unreal.MaterialExpressionTextureSampleParameter2D, 'Roughness', -1400, 300, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE)
    ao = param(unreal.MaterialExpressionTextureSampleParameter2D, 'AO', -1400, 600, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE)
    inv = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -1400, 800)
    inv.set_editor_property('parameter_name', 'GlossToRough')     # (1: the map is gloss, flip it)
    one_minus = mel.create_material_expression(m, unreal.MaterialExpressionOneMinus, -1150, 380)
    mel.connect_material_expressions(rg, 'R', one_minus, '')
    rsel = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -950, 320)
    mel.connect_material_expressions(rg, 'R', rsel, 'A')
    mel.connect_material_expressions(one_minus, '', rsel, 'B')
    mel.connect_material_expressions(inv, '', rsel, 'Alpha')
    # snow settled on what faces up: the scan's own colour under it elsewhere
    wn = mel.create_material_expression(m, unreal.MaterialExpressionVertexNormalWS, -1400, 1000)
    upv = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -1400, 1150)
    upv.set_editor_property('constant', unreal.LinearColor(0, 0, 1, 1))
    dot = mel.create_material_expression(m, unreal.MaterialExpressionDotProduct, -1200, 1050)
    mel.connect_material_expressions(wn, '', dot, 'A')
    mel.connect_material_expressions(upv, '', dot, 'B')
    amt = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -1400, 1300)
    amt.set_editor_property('parameter_name', 'Snow')
    amt.set_editor_property('default_value', 0.7)
    # (mask: up-facing beyond about 45 degrees, sharpened, times the amount)
    sub = mel.create_material_expression(m, unreal.MaterialExpressionAdd, -1050, 1050)
    sub.set_editor_property('const_b', -0.55)
    mel.connect_material_expressions(dot, '', sub, 'A')
    mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -900, 1050)
    mul.set_editor_property('const_b', 4.0)
    mel.connect_material_expressions(sub, '', mul, 'A')
    sat = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, -750, 1050)
    mel.connect_material_expressions(mul, '', sat, '')
    mk = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -600, 1050)
    mel.connect_material_expressions(sat, '', mk, 'A')
    mel.connect_material_expressions(amt, '', mk, 'B')
    sb = find_snow('BaseColor')
    snow_c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -900, -500)
    snow_c.set_editor_property('constant', unreal.LinearColor(0.78, 0.8, 0.85, 1))
    col = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -400, -300)
    mel.connect_material_expressions(bc, 'RGB', col, 'A')
    if sb:
        ss = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, -900, -650)
        ss.set_editor_property('texture', sb)
        mel.connect_material_expressions(ss, 'RGB', col, 'B')
    else:
        mel.connect_material_expressions(snow_c, '', col, 'B')
    mel.connect_material_expressions(mk, '', col, 'Alpha')
    mel.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(nm, 'RGB', unreal.MaterialProperty.MP_NORMAL)
    rfin = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -400, 320)
    mel.connect_material_expressions(rsel, '', rfin, 'A')
    rsn = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -600, 450)
    rsn.set_editor_property('r', 0.8)
    mel.connect_material_expressions(rsn, '', rfin, 'B')
    mel.connect_material_expressions(mk, '', rfin, 'Alpha')
    mel.connect_material_property(rfin, '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.connect_material_property(ao, 'R', unreal.MaterialProperty.MP_AMBIENT_OCCLUSION)
    if masked:
        op = param(unreal.MaterialExpressionTextureSampleParameter2D, 'Opacity', -1400, 1500, sampler=unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE)
        mel.connect_material_property(op, 'R', unreal.MaterialProperty.MP_OPACITY_MASK)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log('made the master', path)
    return m


def asset(folder, name):
    fbxs = [f for f in glob.glob(os.path.join(folder, '*.fbx'))]
    if not fbxs:
        log('no fbx in', folder)
        return
    fbx = sorted(fbxs, key=lambda f: ('LOD0' not in f and 'High' not in f, f))[0]
    dest = '%s/%s' % (DEST, name)
    ui = unreal.FbxImportUI()
    ui.set_editor_property('import_mesh', True)
    ui.set_editor_property('import_as_skeletal', False)
    ui.set_editor_property('import_materials', False)
    ui.set_editor_property('import_textures', False)
    sm = ui.get_editor_property('static_mesh_import_data')
    split = os.path.basename(folder) in os.environ.get('HA_MS_SPLIT', '').split(',')
    sm.set_editor_property('combine_meshes', not split)
    sm.set_editor_property('generate_lightmap_u_vs', False)
    sm.set_editor_property('auto_generate_collision', True)
    meshes = [a for a in import_file(fbx, dest, 'SM_' + name, ui) if isinstance(a, unreal.StaticMesh)]
    if not meshes:
        log('FAILED mesh', name)
        return
    for mesh in meshes:
        ns = mesh.get_editor_property('nanite_settings')
        ns.set_editor_property('enabled', True)
        mesh.set_editor_property('nanite_settings', ns)
    maps = {}
    for f in glob.glob(os.path.join(folder, '*.jpg')):
        b = os.path.basename(f)
        for kind in ('BaseColor', 'Normal', 'Roughness', 'Gloss', 'AO', 'Opacity'):
            if '_%s' % kind in b and (kind != 'Normal' or 'LOD' not in b or 'LOD0' in b):
                maps.setdefault(kind, f)
    tx = {k: tex(p, dest, 'T_%s_%s' % (name, k), 'Normal' if k == 'Normal' else ('BaseColor' if k == 'BaseColor' else 'Gray')) for k, p in maps.items()}
    mip = '%s/MI_%s' % (dest, name)
    mi = unreal.load_asset(mip) if eal.does_asset_exist(mip) else         tools.create_asset('MI_' + name, dest, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
    mel.set_material_instance_parent(mi, master(masked='Opacity' in tx and tx['Opacity'] is not None))
    for k in ('BaseColor', 'Normal', 'AO', 'Opacity'):
        if tx.get(k):
            mel.set_material_instance_texture_parameter_value(mi, k, tx[k])
    if tx.get('Roughness'):
        mel.set_material_instance_texture_parameter_value(mi, 'Roughness', tx['Roughness'])
        mel.set_material_instance_scalar_parameter_value(mi, 'GlossToRough', 0.0)
    elif tx.get('Gloss'):
        mel.set_material_instance_texture_parameter_value(mi, 'Roughness', tx['Gloss'])
        mel.set_material_instance_scalar_parameter_value(mi, 'GlossToRough', 1.0)
    # (the snow piles and embankments are snow already: no extra settled on them)
    if 'Snow' in name:
        mel.set_material_instance_scalar_parameter_value(mi, 'Snow', 0.0)
    eal.save_loaded_asset(mi)
    for mesh in meshes:
        for k in range(len(mesh.static_materials)):
            mesh.set_material(k, mi)          # (not through the static_materials structs: that copy is never stored)
        eal.save_loaded_asset(mesh)
        bb = mesh.get_bounding_box()
        log('%s (%s): %s, maps %s, size %.0f x %.0f x %.0f cm' % (name, mesh.get_name(), os.path.basename(fbx), sorted(maps), bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z))


def camel(pack):
    parts = pack.split('_')[:-1] or [pack]
    return ''.join(p.title() for p in parts)


try:
    if os.environ.get('HA_MS_REMASTER') == '1':
        master(False, True)
        master(True, True)
        log('masters rebuilt')
    packs = os.environ.get('HA_MS_PACKS')
    packs = packs.split(',') if packs else [p for p in sorted(os.listdir(ROOT)) if p != 'mine']
    for p in packs:
        folder = os.path.join(ROOT, p)
        if os.environ.get('HA_MS_SUB') == '1':
            for s in sorted(os.listdir(folder)):
                if os.path.isdir(os.path.join(folder, s)):
                    asset(os.path.join(folder, s), 'Mine_' + s)
        else:
            asset(folder, camel(p))
except Exception as e:
    import traceback
    unreal.log_error('[megaprops] FAILED %r %s' % (e, traceback.format_exc()))
