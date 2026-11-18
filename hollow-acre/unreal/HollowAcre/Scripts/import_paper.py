"""Imports the journal's paper (Saved/Generated/Paper/T_JournalPaper.png, from tools/make_journal_paper.py) as
/Game/HollowAcre/UI/T_JournalPaper (a UI texture, its alpha the worn edge).
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

src = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/Paper/T_JournalPaper.png')
task = unreal.AssetImportTask()
task.set_editor_property('filename', src)
task.set_editor_property('destination_path', '/Game/HollowAcre/UI')
task.set_editor_property('destination_name', 'T_JournalPaper')
task.set_editor_property('replace_existing', True)
task.set_editor_property('automated', True)
task.set_editor_property('save', False)
unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
t = unreal.load_asset('/Game/HollowAcre/UI/T_JournalPaper')
t.set_editor_property('lod_group', unreal.TextureGroup.TEXTUREGROUP_UI)
t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_EDITOR_ICON)
t.set_editor_property('mip_gen_settings', unreal.TextureMipGenSettings.TMGS_NO_MIPMAPS)
unreal.EditorAssetLibrary.save_loaded_asset(t, only_if_is_dirty=False)
unreal.log('[paper] imported T_JournalPaper')
