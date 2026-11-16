"""The car's collision is its own surface, from both sides (the owner: the creature still phases through the front of
the car). The car's meshes collide on their real triangles (complex as simple), double sided, so nothing reaches
through glass or panels whose faces point inward (one-sided collision lets a test from the wrong side straight
through). With Nanite on, collision is built from the fallback mesh, so the fallback is kept at full detail.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

MESHES = ['/Game/HollowAcre/Car/Car', '/Game/HollowAcre/Car/Car_Glass', '/Game/HollowAcre/Car/Car_Wheel',
          '/Game/HollowAcre/Car/Car_Wiper0', '/Game/HollowAcre/Car/Car_Wiper1']
eal = unreal.EditorAssetLibrary


def log(msg):
    unreal.log('CarCollision: ' + msg)


for path in MESHES:
    mesh = unreal.load_asset(path)
    if not mesh:
        log('missing ' + path)
        continue
    ns = mesh.get_editor_property('nanite_settings')
    bs = mesh.get_editor_property('body_setup')
    log('%s: %d triangles, nanite %s (fallback %s, %.2f of triangles, error %.2f), collision %s, double sided %s' % (
        path.split('/')[-1], mesh.get_num_triangles(0), ns.get_editor_property('enabled'),
        ns.get_editor_property('fallback_target'), ns.get_editor_property('fallback_percent_triangles'),
        ns.get_editor_property('fallback_relative_error'),
        bs.get_editor_property('collision_trace_flag') if bs else None, bs.get_editor_property('double_sided_geometry') if bs else None))
    if ns.get_editor_property('enabled'):
        ns.set_editor_property('fallback_target', unreal.NaniteFallbackTarget.RELATIVE_ERROR)
        ns.set_editor_property('fallback_relative_error', 0.0)
        mesh.set_editor_property('nanite_settings', ns)
    if bs:
        bs.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
        bs.set_editor_property('double_sided_geometry', True)
        mesh.set_editor_property('body_setup', bs)
    eal.save_loaded_asset(mesh)
    log('  now: complex as simple, double sided; saved')
