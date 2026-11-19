"""Imports the game's sound clips (Saved/GameAudio, from tools/make_game_audio.py) into /Game/HollowAcre/Audio/Play as
sound waves; the ambience beds (amb_*) loop. P2Audio (C++) plays them.
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import glob
import os

import unreal

SRC = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'GameAudio/')
DEST = '/Game/HollowAcre/Audio/Play'
tools = unreal.AssetToolsHelpers.get_asset_tools()
eal = unreal.EditorAssetLibrary
n = 0
for f in sorted(glob.glob(os.path.join(SRC, '*.wav'))):
    name = os.path.splitext(os.path.basename(f))[0]
    t = unreal.AssetImportTask()
    t.set_editor_property('filename', f)
    t.set_editor_property('destination_path', DEST)
    t.set_editor_property('destination_name', name)
    t.set_editor_property('replace_existing', True)
    t.set_editor_property('automated', True)
    t.set_editor_property('save', True)
    tools.import_asset_tasks([t])
    w = unreal.load_asset('%s/%s' % (DEST, name))
    if isinstance(w, unreal.SoundWave):
        if name.startswith('amb_'):
            w.set_editor_property('looping', True)
        eal.save_loaded_asset(w)
        n += 1
unreal.log('[game audio] imported %d clips' % n)
