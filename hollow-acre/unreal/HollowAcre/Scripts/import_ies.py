"""Imports the flashlight's light profile (Saved/Generated/IES_Flashlight.ies, from tools/make_flashlight_ies.py) as
/Game/HollowAcre/Wake/IES_Flashlight.
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

src = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/IES_Flashlight.ies')
task = unreal.AssetImportTask()
task.set_editor_property('filename', src)
task.set_editor_property('destination_path', '/Game/HollowAcre/Wake')
task.set_editor_property('destination_name', 'IES_Flashlight')
task.set_editor_property('replace_existing', True)
task.set_editor_property('automated', True)
task.set_editor_property('save', True)
unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
paths = task.get_editor_property('imported_object_paths')
unreal.log('[import_ies] imported %s' % (list(paths),))
for p in paths:
    unreal.EditorAssetLibrary.save_asset(p.split('.')[0])
