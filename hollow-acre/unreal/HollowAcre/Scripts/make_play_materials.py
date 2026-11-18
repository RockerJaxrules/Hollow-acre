"""Materials for Part 2's play: M_FireGlow, an emissive surface whose glow the game sets (the stove's mica window lit
from inside: Glow, a colour times brightness, 0 when cold); M_Breath, the breath's vapour in the cold.
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Materials/Play'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def breath():
    """M_Breath: the breath's vapour in the cold. A soft puff (a sphere seen face-on: thick in its middle, nothing at its
    rim), broken into wisps by a 3D noise that drifts with time, lit per pixel so it shows only where a light catches it
    (the flashlight's beam, the fire, a little moon), as real breath does at night. Opacity is the game's (it fades)."""
    path = DEST + '/M_Breath'
    if eal.does_asset_exist(path):
        unreal.log('[play mats] M_Breath already there')
        return
    m = tools.create_asset('M_Breath', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('translucency_lighting_mode', unreal.TranslucencyLightingMode.TLM_SURFACE_PER_PIXEL_LIGHTING)
    col = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, -200)
    col.set_editor_property('constant', unreal.LinearColor(0.82, 0.84, 0.86, 1.0))
    mel.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    rough = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, -50)
    rough.set_editor_property('r', 1.0)
    mel.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    # (thick where it faces the eye, nothing at its rim)
    fr = mel.create_material_expression(m, unreal.MaterialExpressionFresnel, -1100, 150)
    fr.set_editor_property('exponent', 1.2)
    om = mel.create_material_expression(m, unreal.MaterialExpressionOneMinus, -950, 150)
    mel.connect_material_expressions(fr, '', om, '')
    sq = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -800, 150)
    mel.connect_material_expressions(om, '', sq, 'A')
    mel.connect_material_expressions(om, '', sq, 'B')
    # (wisps: a 3D noise in world space, drifting up with time)
    wp = mel.create_material_expression(m, unreal.MaterialExpressionWorldPosition, -1400, 400)
    tm = mel.create_material_expression(m, unreal.MaterialExpressionTime, -1400, 550)
    up = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -1250, 550)
    mel.connect_material_expressions(tm, '', up, 'A')
    up.set_editor_property('const_b', 6.0)
    drift = mel.create_material_expression(m, unreal.MaterialExpressionAppendVector, -1100, 550)
    zero2 = mel.create_material_expression(m, unreal.MaterialExpressionConstant2Vector, -1250, 650)
    mel.connect_material_expressions(zero2, '', drift, 'A')
    mel.connect_material_expressions(up, '', drift, 'B')
    pos = mel.create_material_expression(m, unreal.MaterialExpressionSubtract, -950, 450)
    mel.connect_material_expressions(wp, '', pos, 'A')
    mel.connect_material_expressions(drift, '', pos, 'B')
    nz = mel.create_material_expression(m, unreal.MaterialExpressionNoise, -800, 450)
    nz.set_editor_property('scale', 0.09)
    nz.set_editor_property('levels', 3)
    nz.set_editor_property('output_min', 0.15)
    nz.set_editor_property('output_max', 1.0)
    mel.connect_material_expressions(pos, '', nz, 'Position')
    mix = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -600, 250)
    mel.connect_material_expressions(sq, '', mix, 'A')
    mel.connect_material_expressions(nz, '', mix, 'B')
    op = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -600, 450)
    op.set_editor_property('parameter_name', 'Opacity')
    op.set_editor_property('default_value', 0.2)
    out = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -400, 250)
    mel.connect_material_expressions(mix, '', out, 'A')
    mel.connect_material_expressions(op, '', out, 'B')
    # (soft where it meets anything: the near plane, a wall)
    df = mel.create_material_expression(m, unreal.MaterialExpressionDepthFade, -250, 300)
    df.set_editor_property('fade_distance_default', 12.0)
    mel.connect_material_expressions(out, '', df, 'Opacity')
    mel.connect_material_property(df, '', unreal.MaterialProperty.MP_OPACITY)
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    unreal.log('[play mats] made M_Breath')


def run():
    breath()
    path = DEST + '/M_FireGlow'
    if eal.does_asset_exist(path):
        unreal.log('[play mats] M_FireGlow already there')
        return
    m = tools.create_asset('M_FireGlow', DEST, unreal.Material, unreal.MaterialFactoryNew())
    base = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, -100)
    base.set_editor_property('constant', unreal.LinearColor(0.05, 0.035, 0.02, 1.0))
    mel.connect_material_property(base, '', unreal.MaterialProperty.MP_BASE_COLOR)
    glow = mel.create_material_expression(m, unreal.MaterialExpressionVectorParameter, -400, 100)
    glow.set_editor_property('parameter_name', 'Glow')
    glow.set_editor_property('default_value', unreal.LinearColor(0.0, 0.0, 0.0, 1.0))
    mel.connect_material_property(glow, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    rough = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, 250)
    rough.set_editor_property('r', 0.3)
    mel.connect_material_property(rough, '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    unreal.log('[play mats] made M_FireGlow')


run()
