"""The side window's glass pebbles look like glass (the owner saw blood at the side attack when nothing touches the
driver: dark green-black chunks flying in against the snow read as spatter). Tempered glass breaks into pale, glinting
cubes: lighter, a cool green-white, near mirror-smooth, with a faint glint so they catch the dark.

Changes M_GlassGranule in place (the director points at it). Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this>"""
import unreal

PATH = '/Game/HollowAcre/Materials/Blockout/M_GlassGranule'
mel = unreal.MaterialEditingLibrary
eal = unreal.EditorAssetLibrary

m = unreal.load_asset(PATH)
if not m:
    for a in eal.list_assets('/Game/HollowAcre', recursive=True):
        if a.split('.')[-1] == 'M_GlassGranule':
            m = unreal.load_asset(a)
            break
if not m:
    unreal.log_error('[granule] M_GlassGranule not found')
else:
    base = mel.get_material_property_input_node(m, unreal.MaterialProperty.MP_BASE_COLOR)
    if base:
        base.set_editor_property('constant', unreal.LinearColor(0.52, 0.6, 0.58, 1))
    rough = mel.get_material_property_input_node(m, unreal.MaterialProperty.MP_ROUGHNESS)
    if rough:
        rough.set_editor_property('r', 0.06)
    glint = mel.get_material_property_input_node(m, unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    if not glint:
        glint = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, 500)
        mel.connect_material_property(glint, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    glint.set_editor_property('constant', unreal.LinearColor(0.02, 0.026, 0.025, 1))
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    unreal.log('[granule] %s: pale glass, glinting' % m.get_path_name())
