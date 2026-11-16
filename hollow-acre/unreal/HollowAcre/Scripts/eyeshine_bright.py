"""Brightens M_EyeShine in place (the eyes in the trees in the crash cut must glint, blooming, against the dark), without
recreating it, so the level's director keeps its reference. Same value as build_drive.make_eyeshine_mat."""
import unreal

GLOW = unreal.LinearColor(11.0, 13.0, 12.0, 1)

m = unreal.load_asset('/Game/HollowAcre/Materials/Blockout/M_EyeShine')
mel = unreal.MaterialEditingLibrary
e = mel.get_material_property_input_node(m, unreal.MaterialProperty.MP_EMISSIVE_COLOR)
e.set_editor_property('constant', GLOW)
mel.recompile_material(m)
unreal.EditorAssetLibrary.save_loaded_asset(m)
unreal.log('eyeshine: emissive now %s' % e.get_editor_property('constant'))
