"""The breath in the cold (Part 2's opening, EndingWakeBeats.cpp): M_Breath, for the soft puffs of fog out of the mouth. Lit
translucent (so it shows only where light reaches it: the flashlight's beam, a headlight), soft at its edges (thin where the
puff is seen edge-on), broken up by noise in the world, softened where it meets a surface; each puff's fade from its
material instance (Fade).

Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>"""
import unreal

DEST = '/Game/HollowAcre/Materials'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
MP = unreal.MaterialProperty


def node(m, cls, x, y, **props):
    n = mel.create_material_expression(m, cls, x, y)
    for k, v in props.items():
        n.set_editor_property(k, v)
    return n


def run():
    path = DEST + '/M_Breath'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_Breath', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('translucency_lighting_mode', unreal.TranslucencyLightingMode.TLM_VOLUMETRIC_PER_VERTEX_NON_DIRECTIONAL)
    m.set_editor_property('two_sided', False)
    fade = node(m, unreal.MaterialExpressionScalarParameter, -900, 300, parameter_name='Fade', default_value=1.0)
    # soft at the edges: the surface facing the eye is thick, the rim thin
    nrm = node(m, unreal.MaterialExpressionVertexNormalWS, -1100, 0)
    cam = node(m, unreal.MaterialExpressionCameraVectorWS, -1100, 100)
    dot = node(m, unreal.MaterialExpressionDotProduct, -900, 50)
    mel.connect_material_expressions(nrm, '', dot, 'A')
    mel.connect_material_expressions(cam, '', dot, 'B')
    sat = node(m, unreal.MaterialExpressionSaturate, -780, 50)
    mel.connect_material_expressions(dot, '', sat, '')
    pw = node(m, unreal.MaterialExpressionPower, -660, 50)
    mel.connect_material_expressions(sat, '', pw, 'Base')
    ex = node(m, unreal.MaterialExpressionConstant, -780, 130, r=1.8)
    mel.connect_material_expressions(ex, '', pw, 'Exp')
    # broken up by noise in the world (the puff's own wisps)
    wp = node(m, unreal.MaterialExpressionWorldPosition, -1100, 200)
    nz = node(m, unreal.MaterialExpressionNoise, -900, 180, scale=0.12, quality=1, levels=3, output_min=0.35, output_max=1.0)
    mel.connect_material_expressions(wp, '', nz, 'Position')
    # softened where it meets a surface
    df = node(m, unreal.MaterialExpressionDepthFade, -660, 220, fade_distance_default=6.0)
    a1 = node(m, unreal.MaterialExpressionMultiply, -540, 80)
    mel.connect_material_expressions(pw, '', a1, 'A')
    mel.connect_material_expressions(nz, '', a1, 'B')
    a2 = node(m, unreal.MaterialExpressionMultiply, -420, 120)
    mel.connect_material_expressions(a1, '', a2, 'A')
    mel.connect_material_expressions(fade, '', a2, 'B')
    k = node(m, unreal.MaterialExpressionConstant, -540, 220, r=0.22)
    a3 = node(m, unreal.MaterialExpressionMultiply, -300, 160)
    mel.connect_material_expressions(a2, '', a3, 'A')
    mel.connect_material_expressions(k, '', a3, 'B')
    ok = mel.connect_material_expressions(a3, '', df, 'Opacity')
    unreal.log('[breath] opacity into the depth fade: %s' % ok)
    mel.connect_material_property(df, '', MP.MP_OPACITY)
    col = node(m, unreal.MaterialExpressionConstant3Vector, -300, -100, constant=unreal.LinearColor(0.7, 0.72, 0.76, 1.0))
    mel.connect_material_property(col, '', MP.MP_BASE_COLOR)
    rough = node(m, unreal.MaterialExpressionConstant, -300, 0, r=1.0)
    mel.connect_material_property(rough, '', MP.MP_ROUGHNESS)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    unreal.log('[breath] made ' + path)


run()
