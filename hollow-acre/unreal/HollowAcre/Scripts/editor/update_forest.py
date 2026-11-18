"""The level's spruce scatters refilled from Saved/Generated/mountain.json (tools/make_mountain.py's thickened forest):
each variant's actor ('Spruces <h> m') gets its rows; nothing else in L_EndingDrive is touched."""
import json
import unreal

actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
levels = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)


def log(m):
    unreal.log('[forest] ' + m)


try:
    levels.load_level('/Game/HollowAcre/Maps/L_EndingDrive')
    gen = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/')
    data = json.load(open(gen + 'mountain.json'))
    meta = json.load(open(gen + 'spruce.json'))
    by_label = {a.get_actor_label(): a for a in actors.get_all_level_actors()}
    total = 0
    for i, m in enumerate(meta):
        label = 'Spruces %.0f m' % (m['height_cm'] / 100.0)
        rows = [t for t in data['trees'] if int(t[5]) == i]
        a = by_label.get(label)
        if not a:
            log('%s: no actor (%d rows skipped)' % (label, len(rows)))
            continue
        xf = [unreal.Transform(location=unreal.Vector(r[0], r[1], r[2]), rotation=unreal.Rotator(yaw=r[3]), scale=unreal.Vector(r[4], r[4], r[4])) for r in rows]
        before = len(a.get_editor_property('instances'))
        a.set_editor_property('instances', xf)
        a.rebuild()
        total += len(xf)
        log('%s: %d -> %d trees' % (label, before, len(xf)))
    levels.save_current_level()
    log('saved: %d trees' % total)
except Exception as e:
    import traceback
    unreal.log_error('[forest] FAILED %r %s' % (e, traceback.format_exc()))
finally:
    unreal.SystemLibrary.quit_editor()
