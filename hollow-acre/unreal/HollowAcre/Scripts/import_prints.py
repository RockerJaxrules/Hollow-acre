"""Footprints in the snow (Part 2's play): imports the print textures (Saved/Generated/Prints, from
tools/make_footprints.py) and makes the decal they're pressed in with: M_PrintDecal (a deferred decal: the print's
normals, the snow at its bottom a little greyer where it was packed down, rougher, faded out round its rim) and its
instances MI_PrintBoot (the player's) and MI_PrintBare (the husk's long bare feet).
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Prints'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
SRC = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/Prints/')


def log(*a):
    unreal.log('[prints] ' + ' '.join(str(x) for x in a))


def import_tex(name, normal):
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', SRC + name + '.png')
    task.set_editor_property('destination_path', DEST)
    task.set_editor_property('destination_name', name)
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', False)
    tools.import_asset_tasks([task])
    t = unreal.load_asset(DEST + '/' + name)
    if normal:
        t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
        t.set_editor_property('srgb', False)
    else:
        t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_MASKS)
        t.set_editor_property('srgb', False)
    eal.save_loaded_asset(t)
    return t


def run():
    texs = {k: (import_tex('T_Print%s_N' % k, True), import_tex('T_Print%s_M' % k, False)) for k in ('Boot', 'Bare')}
    path = DEST + '/M_PrintDecal'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_PrintDecal', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('material_domain', unreal.MaterialDomain.MD_DEFERRED_DECAL)
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    nt = mel.create_material_expression(m, unreal.MaterialExpressionTextureSampleParameter2D, -600, 0)
    nt.set_editor_property('parameter_name', 'Normal')
    nt.set_editor_property('texture', texs['Boot'][0])
    nt.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    mt = mel.create_material_expression(m, unreal.MaterialExpressionTextureSampleParameter2D, -600, 300)
    mt.set_editor_property('parameter_name', 'Mask')
    mt.set_editor_property('texture', texs['Boot'][1])
    mt.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_MASKS)
    fade = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -600, 600)
    fade.set_editor_property('parameter_name', 'Fade')
    fade.set_editor_property('default_value', 1.0)
    # the colour: the snow's own, a little greyer at the packed bottom
    snow = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, -200)
    snow.set_editor_property('constant', unreal.LinearColor(0.78, 0.81, 0.86, 1.0))
    packed = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, -100)
    packed.set_editor_property('constant', unreal.LinearColor(0.6, 0.64, 0.7, 1.0))
    lerp = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -200, -150)
    mel.connect_material_expressions(snow, '', lerp, 'A')
    mel.connect_material_expressions(packed, '', lerp, 'B')
    mel.connect_material_expressions(mt, 'G', lerp, 'Alpha')
    mel.connect_material_property(lerp, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(nt, 'RGB', unreal.MaterialProperty.MP_NORMAL)
    rough = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -200, 150)
    rough.set_editor_property('r', 0.82)
    mel.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    op = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -200, 400)
    mel.connect_material_expressions(mt, 'R', op, 'A')
    mel.connect_material_expressions(fade, '', op, 'B')
    mel.connect_material_property(op, '', unreal.MaterialProperty.MP_OPACITY)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    for k in ('Boot', 'Bare'):
        ip = DEST + '/MI_Print%s' % k
        if eal.does_asset_exist(ip):
            eal.delete_asset(ip)
        mi = tools.create_asset('MI_Print%s' % k, DEST, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
        mel.set_material_instance_parent(mi, m)
        mel.set_material_instance_texture_parameter_value(mi, 'Normal', texs[k][0])
        mel.set_material_instance_texture_parameter_value(mi, 'Mask', texs[k][1])
        eal.save_loaded_asset(mi)
    log('made M_PrintDecal, MI_PrintBoot, MI_PrintBare')


run()
