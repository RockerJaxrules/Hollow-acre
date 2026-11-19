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
_bt = {}


def surf_ns():
    """build_town.py's material recipes (its definitions, not its run)."""
    if not _bt:
        src = unreal.Paths.convert_relative_path_to_full(PROJ + 'Scripts/build_town.py')
        c = io.open(src, encoding='utf-8').read()
        exec(compile(c[:c.index('\ntry:\n')], src, 'exec'), _bt)
        _bt['make'] = lambda slot: _bt['surface_mat'](slot, *_bt['SURF'][slot], snowy=True) if slot in _bt['SURF'] else None
    return _bt
dirty = False
try:
    unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).load_level('/Game/HollowAcre/Maps/L_EndingDrive')
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
        # (a slot new to this mesh: its town material by name, M_Town_<Slot>, made if need be by build_town.py's recipe)
        sm = mesh.static_materials
        changed = False
        for k, sl in enumerate(sm):
            sn = str(sl.get_editor_property('material_slot_name'))
            mi = sl.get_editor_property('material_interface')
            if mi is None or mi.get_name() in ('WorldGridMaterial', 'DefaultMaterial'):
                path = '/Game/HollowAcre/Town/Materials/M_Town_%s' % sn.title()
                if not eal.does_asset_exist(path):
                    surf_ns()['make'](sn)
                if eal.does_asset_exist(path):
                    sl.set_editor_property('material_interface', unreal.load_asset(path))
                    changed = True
        if changed:
            mesh.set_editor_property('static_materials', sm)
        eal.save_loaded_asset(mesh)
        # (the placed buildings carry their materials as per-slot overrides, by index: re-set them by the slots' names,
        # which may have moved)
        if os.environ.get('HA_TOWN_RESLOT') or slots0 != [str(s.get_editor_property('material_slot_name')) for s in mesh.static_materials]:
            for a in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
                comp = a.get_component_by_class(unreal.StaticMeshComponent)
                if not comp or comp.static_mesh != mesh:
                    continue
                for i, sl in enumerate(mesh.static_materials):
                    path = '/Game/HollowAcre/Town/Materials/M_Town_%s' % str(sl.get_editor_property('material_slot_name')).title()
                    if eal.does_asset_exist(path):
                        comp.set_material(i, unreal.load_asset(path))
                unreal.log('[reimport town] %s: materials re-set by slot on %s' % (name, a.get_actor_label()))
                dirty = True
        slots1 = [str(s.get_editor_property('material_slot_name')) for s in mesh.static_materials]
        unreal.log('[reimport town] %s: %d triangles; slots %s%s' % (name, mesh.get_num_triangles(0), slots1, '' if slots0 == slots1 else ' (WERE %s)' % slots0))
    if dirty:
        unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
except Exception as e:
    import traceback
    unreal.log_error('[reimport town] FAILED %r %s' % (e, traceback.format_exc()))
