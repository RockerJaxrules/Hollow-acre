"""Re-import the spruces in place (tools/blender/spruce.py's new snow pads); their scatter actors keep them."""
import io, json
import unreal
PROJ = unreal.Paths.project_dir()
SRC = unreal.Paths.convert_relative_path_to_full(PROJ + 'Scripts/build_drive.py')
code = io.open(SRC, encoding='utf-8').read()
ns = {'__name__': 'build_drive_part', '__file__': SRC}
exec(compile(code[:code.index('\ntry:\n    main()')], SRC, 'exec'), ns)
eal = ns['eal']
try:
    meta = json.load(open(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/spruce.json')))
    for m in meta:
        name = m['name']
        old = unreal.load_asset(ns['MTN'] + '/' + name) if 'MTN' in ns else None
        mats0 = [s.get_editor_property('material_interface') for s in old.static_materials] if old else []
        slots0 = [str(s.get_editor_property('material_slot_name')) for s in old.static_materials] if old else []
        mesh = ns['import_obj'](name)
        sme = unreal.get_editor_subsystem(unreal.StaticMeshEditorSubsystem)
        bs = sme.get_lod_build_settings(mesh, 0)
        bs.set_editor_property('recompute_normals', False)
        bs.set_editor_property('recompute_tangents', True)
        sme.set_lod_build_settings(mesh, 0, bs)
        slots1 = [str(s.get_editor_property('material_slot_name')) for s in mesh.static_materials]
        if slots0 == slots1 and mats0:
            for k, mt in enumerate(mats0):
                mesh.set_material(k, mt)
        eal.save_loaded_asset(mesh)
        unreal.log('[reimport spruce] %s: %d triangles; slots %s%s' % (name, mesh.get_num_triangles(0), slots1, '' if slots0 == slots1 else ' (WERE %s)' % slots0))
except Exception as e:
    import traceback
    unreal.log_error('[reimport spruce] FAILED %r %s' % (e, traceback.format_exc()))
