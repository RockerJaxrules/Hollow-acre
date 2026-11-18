"""Materials for Part 2's play: M_FireGlow, an emissive surface whose glow the game sets (the stove's mica window lit
from inside: Glow, a colour times brightness, 0 when cold).
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Materials/Play'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def run():
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
