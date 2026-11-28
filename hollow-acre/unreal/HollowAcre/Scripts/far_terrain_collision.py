"""The far terrain gets collision on its real triangles (complex as simple), like the road's terrain, so the crashing
car lands on the valley's snow instead of falling through it, and rests on it on its roof (the owner: everything has
collision, nothing clips). Without its own collision Unreal would wrap the whole range in one hull; complex-as-simple
uses the surface itself. With Nanite on, the collision is built from the fallback mesh, so the fallback is kept at full
detail (the collision and the picture the same surface).

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

MESH = '/Game/HollowAcre/Mountain/Terrain_Far'
eal = unreal.EditorAssetLibrary


def log(msg):
    unreal.log('FarTerrain: ' + msg)


mesh = unreal.load_asset(MESH)
if not mesh:
    log('missing ' + MESH)
else:
    ns = mesh.get_editor_property('nanite_settings')
    log('triangles (LOD0): %d, nanite %s' % (mesh.get_num_triangles(0), ns.get_editor_property('enabled')))
    for prop in ('fallback_target', 'fallback_percent_triangles', 'fallback_relative_error', 'keep_percent_triangles'):
        try:
            log('  nanite %s = %s' % (prop, ns.get_editor_property(prop)))
        except Exception as e:      # (names differ between engine versions)
            log('  nanite %s: n/a' % prop)
    if ns.get_editor_property('enabled'):
        try:
            ns.set_editor_property('fallback_target', unreal.NaniteFallbackTarget.RELATIVE_ERROR)
            ns.set_editor_property('fallback_relative_error', 0.0)
            log('  fallback kept at full detail (relative error 0)')
        except Exception as e:
            ns.set_editor_property('fallback_percent_triangles', 1.0)
            log('  fallback kept at full detail (100%% of triangles): %s' % e)
        mesh.set_editor_property('nanite_settings', ns)
    bs = mesh.get_editor_property('body_setup')
    bs.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
    mesh.set_editor_property('body_setup', bs)
    eal.save_loaded_asset(mesh)
    log('collision: complex as simple; saved')
