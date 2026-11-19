"""Sets the scanned pieces tools/make_town.py fitted into the town's buildings (Saved/Generated/fits.json: the
Megascans doors, windows, porch posts and fretwork brackets, each in its building's frame) into L_EndingDrive as
static actors, labelled "Fit <building> <n>" and attached to their building's "Town <building>" actor; the old ones
are cleared first, so it can be run again after the buildings are regenerated.
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import json
import os

import unreal

actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
levels = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)


def log(*a):
    unreal.log('[fits] ' + ' '.join(str(x) for x in a))


try:
    levels.load_level('/Game/HollowAcre/Maps/L_EndingDrive')
    gen = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/')
    fits = json.load(open(os.path.join(gen, 'fits.json')))
    every = actors.get_all_level_actors()
    gone = 0
    for a in every:
        if a.get_actor_label().startswith('Fit '):
            actors.destroy_actor(a)
            gone += 1
    towns = {a.get_actor_label()[5:]: a for a in actors.get_all_level_actors() if a.get_actor_label().startswith('Town ')}
    placed = 0
    for bld, lst in fits.items():
        t = towns.get(bld)
        if not t or not lst:
            continue
        tt = t.get_actor_transform()
        for i, f in enumerate(lst):
            mesh = unreal.load_asset('/Game/HollowAcre/Megascans/Props/%s/SM_%s' % (f['mesh'], f['mesh']))
            if not mesh:
                log('no mesh', f['mesh'])
                continue
            local = unreal.Transform(unreal.Vector(*f['at']), unreal.Rotator(0.0, 0.0, f['yaw']), unreal.Vector(*f['scale']))
            world = local.multiply(tt)
            a = actors.spawn_actor_from_class(unreal.StaticMeshActor, world.translation, world.rotation.rotator())
            a.set_actor_scale3d(unreal.Vector(*f['scale']) * tt.scale3d)
            a.set_actor_label('Fit %s %d' % (bld, i))
            c = a.static_mesh_component
            c.set_static_mesh(mesh)
            c.set_mobility(unreal.ComponentMobility.STATIC)
            lc = unreal.LightingChannels()
            lc.set_editor_property('channel0', True)
            lc.set_editor_property('channel1', True)
            c.set_editor_property('lighting_channels', lc)
            a.attach_to_actor(t, '', unreal.AttachmentRule.KEEP_WORLD, unreal.AttachmentRule.KEEP_WORLD, unreal.AttachmentRule.KEEP_WORLD, False)
            placed += 1
    levels.save_current_level()
    log('placed %d scanned pieces (%d old cleared) in %s' % (placed, gone, ', '.join(k for k, v in fits.items() if v)))
except Exception as e:
    import traceback
    unreal.log_error('[fits] FAILED %r %s' % (e, traceback.format_exc()))
