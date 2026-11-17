"""Imports the props for Part 2's opening (Saved/Generated/Wake_*.obj, from unreal/tools/blender/make_wake_props.py) as
static meshes in /Game/HollowAcre/Wake. The flashlight, the handbook and the papers take the keys' simple lit material
(/Game/HollowAcre/Car/Keys/M_KeyPart: colour, metal, roughness as parameters), tinted per slot by the director
(EndingWakeBeats.cpp); the snow takes the mountain's snow (M_Snow).

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Wake'
PARTS = ['Wake_Flashlight', 'Wake_Manual', 'Wake_Papers', 'Wake_SnowSlab', 'Wake_SnowLump', 'Wake_Buckle', 'Wake_Latch', 'Wake_Strap',
         'Wake_Pebble0', 'Wake_Pebble1', 'Wake_Pebble2', 'Wake_Pebble3', 'Wake_Cassette', 'Wake_Coin', 'Wake_Pen']

eal = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def log(msg):
    unreal.log('import_wake_props: ' + msg)


def main():
    src_dir = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/')
    part = unreal.load_asset('/Game/HollowAcre/Car/Keys/M_KeyPart')
    snow = unreal.load_asset('/Game/HollowAcre/Materials/Blockout/M_Snow')
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
        for s in slots:
            s.material_interface = snow if name.startswith('Wake_Snow') else part
        mesh.set_editor_property('static_materials', slots)
        eal.save_loaded_asset(mesh)
        # (the imported materials the OBJ named are not used: removed)
        for p in task.get_editor_property('imported_object_paths'):
            a = unreal.load_asset(p)
            if a and not isinstance(a, unreal.StaticMesh):
                eal.delete_asset(p)
        b = mesh.get_bounding_box()
        log('%s -> %s: slots %s; bounds min %s max %s' % (name, mesh.get_path_name(), [str(s.material_slot_name) for s in slots],
                                                         b.min, b.max))


main()
