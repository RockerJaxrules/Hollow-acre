"""The crash cut's gore assets (the owner: realistic gore; at the smashed gap a blood trail in the snow):
T_BloodTrail (tools/make_blood_trail_tex.py) and M_BloodTrail, a deferred decal: old blood, glossy where it froze thick,
the snow's own shading under the thin halo. The director lays it beside the tyre tracks at the gap
(AEndingDirector::BeginCrashScene).
Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>
"""
import unreal

DEST = '/Game/HollowAcre/Materials/Blockout'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
MP = unreal.MaterialProperty


def run():
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir() + 'SourceArt/T_BloodTrail.png'))
    task.set_editor_property('destination_path', DEST)
    task.set_editor_property('destination_name', 'T_BloodTrail')
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    tools.import_asset_tasks([task])
    tex = unreal.load_asset(DEST + '/T_BloodTrail')
    path = DEST + '/M_BloodTrail'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_BloodTrail', DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('material_domain', unreal.MaterialDomain.MD_DEFERRED_DECAL)
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    t = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, -600, 0)
    t.set_editor_property('texture', tex)
    mel.connect_material_property(t, 'RGB', MP.MP_BASE_COLOR)
    mel.connect_material_property(t, 'A', MP.MP_OPACITY)
    lo = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -600, 300)
    lo.set_editor_property('r', 0.62)
    hi = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -600, 380)
    hi.set_editor_property('r', 0.24)
    lr = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -350, 300)
    mel.connect_material_expressions(lo, '', lr, 'A')
    mel.connect_material_expressions(hi, '', lr, 'B')
    mel.connect_material_expressions(t, 'A', lr, 'Alpha')
    mel.connect_material_property(lr, '', MP.MP_ROUGHNESS)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    unreal.log('[gore] M_BloodTrail made')


run()
