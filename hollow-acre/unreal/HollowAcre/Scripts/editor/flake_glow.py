"""M_Snowflake's emissive raised a little: flakes in a building's moon shadow read as black specks against the moonlit
snow beyond (blind judge, round 12); real flakes there catch the sky's light."""
import unreal
mel = unreal.MaterialEditingLibrary
m = unreal.load_asset('/Game/HollowAcre/Materials/Blockout/M_Snowflake')
e = mel.get_material_property_input_node(m, unreal.MaterialProperty.MP_EMISSIVE_COLOR)
unreal.log('[flake] emissive node %s' % (e.get_class().get_name() if e else None))
if e and isinstance(e, unreal.MaterialExpressionConstant3Vector):
    unreal.log('[flake] was %s' % e.get_editor_property('constant'))
    e.set_editor_property('constant', unreal.LinearColor(0.05, 0.055, 0.065, 1.0))
    mel.recompile_material(m)
    unreal.EditorAssetLibrary.save_loaded_asset(m)
    unreal.log('[flake] emissive now 0.05')
