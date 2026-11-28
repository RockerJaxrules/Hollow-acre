"""Imports the car's keys (Saved/Generated/Key_*.obj, from unreal/tools/blender/make_keys.py) as static meshes in
/Game/HollowAcre/Car/Keys, with one simple lit material (M_KeyPart: colour, metal, roughness as parameters) that the
driver's arms (DriverArms.cpp) tint per part.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Car/Keys'
PARTS = ['Key_Ignition', 'Key_Lock', 'Key_Ring', 'Key_Spare', 'Key_Tag']

eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def log(msg):
    unreal.log('import_keys: ' + msg)


def part_material():
    name, path = 'M_KeyPart', DEST + '/M_KeyPart'
    if eal.does_asset_exist(path):
        m = unreal.load_asset(path)
        mel.delete_all_material_expressions(m)
    else:
        m = tools.create_asset(name, DEST, unreal.Material, unreal.MaterialFactoryNew())
    col = mel.create_material_expression(m, unreal.MaterialExpressionVectorParameter, -400, -100)
    col.set_editor_property('parameter_name', 'Color')
    col.set_editor_property('default_value', unreal.LinearColor(0.5, 0.5, 0.5, 1))
    met = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -400, 100)
    met.set_editor_property('parameter_name', 'Metallic')
    rou = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -400, 200)
    rou.set_editor_property('parameter_name', 'Roughness')
    rou.set_editor_property('default_value', 0.5)
    mel.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(met, '', unreal.MaterialProperty.MP_METALLIC)
    mel.connect_material_property(rou, '', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def main():
    src_dir = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/')
    mat = part_material()
    for name in PARTS:
        task = unreal.AssetImportTask()
        task.set_editor_property('filename', src_dir + name + '.obj')
        task.set_editor_property('destination_path', DEST)
        task.set_editor_property('destination_name', name)
        task.set_editor_property('replace_existing', True)
        task.set_editor_property('automated', True)
        task.set_editor_property('save', True)
        tools.import_asset_tasks([task])
        meshes = [unreal.load_asset(p) for p in task.get_editor_property('imported_object_paths')]
        meshes = [m for m in meshes if isinstance(m, unreal.StaticMesh)]
        if not meshes:
            log('FAILED: %s' % name)
            continue
        mesh = meshes[0]
        slots = mesh.static_materials
        for i, s in enumerate(slots):
            s.material_interface = mat
        mesh.set_editor_property('static_materials', slots)
        eal.save_loaded_asset(mesh)
        b = mesh.get_bounding_box()
        log('%s -> %s: slots %s; bounds min %s max %s' % (name, mesh.get_path_name(), [str(s.material_slot_name) for s in slots],
                                                         b.min, b.max))


main()
