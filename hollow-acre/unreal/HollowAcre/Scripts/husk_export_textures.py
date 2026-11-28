"""Export the husk MetaHuman's baked body and face colour textures (to Saved/Generated/Husk/*.png) so the briefs the
MetaHuman bakes into the body's skin can be painted out (tools/husk_skin.py)."""
import os

import unreal

OUT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/Husk')
MH = '/Game/HollowAcre/Creature/Husk/Built/Husk'


def log(*a):
    unreal.log('[huskt] ' + ' '.join(str(x) for x in a))


try:
    for path, name in ((MH + '/Body/Baked/T_Body_BC_VT', 'T_Body_BC'), (MH + '/Face/Baked/T_Head_BC_VT', 'T_Head_BC'), (MH + '/Body/Baked/T_Body_N_VT', 'T_Body_N')):
        t = unreal.load_asset(path)
        log(name, t.blueprint_get_size_x() if t else None, t.blueprint_get_size_y() if t else None)
        task = unreal.AssetExportTask()
        task.set_editor_property('object', t)
        task.set_editor_property('filename', os.path.join(OUT, name + '.png'))
        task.set_editor_property('automated', True)
        task.set_editor_property('prompt', False)
        task.set_editor_property('replace_identical', True)
        log(name, 'exported', unreal.Exporter.run_asset_export_task(task))
except Exception as e:
    unreal.log_error('[huskt] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
