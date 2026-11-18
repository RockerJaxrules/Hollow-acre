"""Re-import the town's meshes in place (their actors and materials untouched): tools/make_town.py's new output."""
import io
import os
import unreal
PROJ = unreal.Paths.project_dir()
SRC = unreal.Paths.convert_relative_path_to_full(PROJ + 'Scripts/build_drive.py')
code = io.open(SRC, encoding='utf-8').read()
ns = {'__name__': 'build_drive_part', '__file__': SRC}
exec(compile(code[:code.index('\ntry:\n    main()')], SRC, 'exec'), ns)
eal = ns['eal']
try:
    for name in (os.environ.get('HA_TOWN_NAMES') or 'Ground,Store,Saloon,Hotel,CabinA,CabinB').split(','):
        before = unreal.load_asset('/Game/HollowAcre/Town/Town_' + name)
        slots0 = [str(s.get_editor_property('material_slot_name')) for s in before.static_materials] if before else []
        mesh = ns['import_obj']('Town_' + name, '/Game/HollowAcre/Town')
        nn = mesh.get_editor_property('nanite_settings')
        nn.set_editor_property('enabled', False)
        mesh.set_editor_property('nanite_settings', nn)
        bs = mesh.get_editor_property('body_setup')
        if bs:
            bs.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
            bs.set_editor_property('double_sided_geometry', True)
            mesh.set_editor_property('body_setup', bs)
        eal.save_loaded_asset(mesh)
        slots1 = [str(s.get_editor_property('material_slot_name')) for s in mesh.static_materials]
        unreal.log('[reimport town] %s: %d triangles; slots %s%s' % (name, mesh.get_num_triangles(0), slots1, '' if slots0 == slots1 else ' (WERE %s)' % slots0))
except Exception as e:
    import traceback
    unreal.log_error('[reimport town] FAILED %r %s' % (e, traceback.format_exc()))
