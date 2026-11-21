"""Blood as a liquid (the owner: "blood is a liquid: it smears, it drips, it puddles"): the assets BloodFX.cpp uses.
  T_BloodSplat, T_BloodRun, T_BloodSmear, T_BloodPool (tools/make_blood_decals.py): R how much, G when it arrives, B how thick
  M_BloodDecal   a deferred decal: shows the blood that has arrived by its Grow (0..1), so a stain grows rather than
                 appears; fresh and wet: dark red where thin, near black where thick, glossy (low roughness)
  MI_Blood<Kind> one instance of it per texture
  M_BloodDrop    the flying and falling drops themselves (a small stretched sphere each): wet, dark red, glossy
Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>"""
import unreal

DEST = '/Game/HollowAcre/Materials/Blood'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
MP = unreal.MaterialProperty
KINDS = ('Splat', 'Run', 'Smear', 'Pool')


def log(*a):
    unreal.log('[blood] ' + ' '.join(str(x) for x in a))


def tex(name):
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir() + 'SourceArt/%s.png' % name))
    task.set_editor_property('destination_path', DEST)
    task.set_editor_property('destination_name', name)
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    tools.import_asset_tasks([task])
    t = unreal.load_asset('%s/%s' % (DEST, name))
    t.set_editor_property('srgb', False)                              # (data, not colour)
    t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_VECTOR_DISPLACEMENTMAP)
    eal.save_loaded_asset(t)
    return t


def const(m, v, x, y):
    if isinstance(v, tuple):
        c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, x, y)
        c.set_editor_property('constant', unreal.LinearColor(v[0], v[1], v[2], 1.0))
    else:
        c = mel.create_material_expression(m, unreal.MaterialExpressionConstant, x, y)
        c.set_editor_property('r', v)
    return c


def new_mat(name):
    path = '%s/%s' % (DEST, name)
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    return tools.create_asset(name, DEST, unreal.Material, unreal.MaterialFactoryNew())


def decal_material(default_tex):
    m = new_mat('M_BloodDecal')
    m.set_editor_property('material_domain', unreal.MaterialDomain.MD_DEFERRED_DECAL)
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    t = mel.create_material_expression(m, unreal.MaterialExpressionTextureSampleParameter2D, -900, 0)
    t.set_editor_property('parameter_name', 'Blood')
    t.set_editor_property('texture', default_tex)
    t.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
    grow = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -900, 300)
    grow.set_editor_property('parameter_name', 'Grow')
    grow.set_editor_property('default_value', 1.0)
    fade = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -900, 400)
    fade.set_editor_property('parameter_name', 'Fade')
    fade.set_editor_property('default_value', 1.0)
    # arrived: (Grow - G) * 14 + 0.5, saturated (a soft front as it spreads)
    sub = mel.create_material_expression(m, unreal.MaterialExpressionSubtract, -650, 250)
    mel.connect_material_expressions(grow, '', sub, 'A')
    mel.connect_material_expressions(t, 'G', sub, 'B')
    mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -500, 250)
    mel.connect_material_expressions(sub, '', mul, 'A')
    mel.connect_material_expressions(const(m, 14.0, -650, 330), '', mul, 'B')
    add = mel.create_material_expression(m, unreal.MaterialExpressionAdd, -380, 250)
    mel.connect_material_expressions(mul, '', add, 'A')
    mel.connect_material_expressions(const(m, 0.5, -500, 330), '', add, 'B')
    arrived = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, -260, 250)
    mel.connect_material_expressions(add, '', arrived, '')
    op = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -150, 150)
    mel.connect_material_expressions(t, 'R', op, 'A')
    mel.connect_material_expressions(arrived, '', op, 'B')
    op2 = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -40, 150)
    mel.connect_material_expressions(op, '', op2, 'A')
    mel.connect_material_expressions(fade, '', op2, 'B')
    mel.connect_material_property(op2, '', MP.MP_OPACITY)
    # fresh blood: dark red where thin, near black where thick; wet (glossy), thickest glossiest
    col = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -300, -150)
    mel.connect_material_expressions(const(m, (0.3, 0.012, 0.009), -500, -200), '', col, 'A')
    mel.connect_material_expressions(const(m, (0.07, 0.003, 0.0025), -500, -120), '', col, 'B')
    mel.connect_material_expressions(t, 'B', col, 'Alpha')
    mel.connect_material_property(col, '', MP.MP_BASE_COLOR)
    rough = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -300, 450)
    mel.connect_material_expressions(const(m, 0.28, -500, 450), '', rough, 'A')
    mel.connect_material_expressions(const(m, 0.05, -500, 520), '', rough, 'B')
    mel.connect_material_expressions(t, 'B', rough, 'Alpha')
    mel.connect_material_property(rough, '', MP.MP_ROUGHNESS)
    mel.connect_material_property(const(m, 0.6, -300, 600), '', MP.MP_SPECULAR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def drop_material():
    m = new_mat('M_BloodDrop')
    mel.connect_material_property(const(m, (0.2, 0.008, 0.006), -300, 0), '', MP.MP_BASE_COLOR)
    mel.connect_material_property(const(m, 0.06, -300, 120), '', MP.MP_ROUGHNESS)
    mel.connect_material_property(const(m, 0.7, -300, 200), '', MP.MP_SPECULAR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def run():
    texs = {k: tex('T_Blood' + k) for k in KINDS}
    base = decal_material(texs['Splat'])
    for k in KINDS:
        name = 'MI_Blood' + k
        path = '%s/%s' % (DEST, name)
        if eal.does_asset_exist(path):
            eal.delete_asset(path)
        mi = tools.create_asset(name, DEST, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
        mel.set_material_instance_parent(mi, base)
        mel.set_material_instance_texture_parameter_value(mi, 'Blood', texs[k])
        eal.save_loaded_asset(mi)
        log('made', path)
    drop_material()
    log('made M_BloodDecal, M_BloodDrop')


run()
