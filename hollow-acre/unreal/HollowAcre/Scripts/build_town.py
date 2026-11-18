"""The abandoned mining town at the foot of the crash chute (Part 2 starts there), added to L_EndingDrive on its own:
its surfaces (Quixel Megascans, ASSETS_EPIC.md; their maps pulled out of the zips at 2K into Saved/Megascans), its
materials (snow settled on what faces up), its buildings and the ground they stand on (tools/make_town.py), each placed
from town.json, colliding on their own triangles; and where the director leaves the car after the fall.

Re-runnable: the town's actors are tagged 'Town' and replaced each run; the rest of the level is left alone.
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import io
import json
import os

import unreal

PROJ = unreal.Paths.project_dir()
SRC = unreal.Paths.convert_relative_path_to_full(PROJ + 'Scripts/build_drive.py')
code = io.open(SRC, encoding='utf-8').read()
ns = {'__name__': 'build_drive_part', '__file__': SRC}
exec(compile(code[:code.index('\ntry:\n    main()')], SRC, 'exec'), ns)
eal, mel, tools, actors, levels, log = ns['eal'], ns['mel'], ns['tools'], ns['actors'], ns['levels'], ns['log']
MAP = ns['MAP']
TEX = '/Game/HollowAcre/Megascans'
MATS = '/Game/HollowAcre/Town/Materials'
MESH = '/Game/HollowAcre/Town'
MS = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Megascans')
TOWN_MOON_LUX = 1.2                     # (the drive's moon is 1.6)
SURF = {  # material slot -> (Megascans folder, UV scale for a 2 m UV unit, tint, has metalness)
    'paintwood': ('flaky_painted_wooden_planks', 2.0, (1.0, 1.0, 1.0), False),     # (a 1 x 1 m scan)
    'barewood': ('weathered_wooden_planks', 1.0, (0.92, 0.9, 0.88), False),
    'cladding': ('wooden_cladding', 1.0, (0.9, 0.88, 0.85), False),
    'shingles': ('wooden_roof_shingles', 1.0, (0.85, 0.84, 0.83), False),
    'tin': ('rusty_corrugated_metal', 1.0, (1.0, 1.0, 1.0), True),
    'rustmetal': ('rusty_metal_sheet', 1.0, (1.0, 1.0, 1.0), False),
    'snow': ('fresh_snow', 1.0, (1.0, 1.0, 1.0), False),
}


def texture(folder, kind):
    stem = 'T_%s_%s' % (''.join(w.title() for w in folder.split('_')), kind)
    dest = '%s/%s' % (TEX, ''.join(w.title() for w in folder.split('_')))
    path = os.path.join(MS, folder, stem + '.png')
    if not os.path.exists(path):
        return None
    if not eal.does_asset_exist('%s/%s' % (dest, stem)):
        task = unreal.AssetImportTask()
        task.set_editor_property('filename', path)
        task.set_editor_property('destination_path', dest)
        task.set_editor_property('destination_name', stem)
        task.set_editor_property('replace_existing', True)
        task.set_editor_property('automated', True)
        task.set_editor_property('save', True)
        tools.import_asset_tasks([task])
        tex = unreal.load_asset('%s/%s' % (dest, stem))
        if kind == 'Normal':
            tex.set_editor_property('srgb', False)
            tex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
        elif kind != 'BaseColor':
            tex.set_editor_property('srgb', False)
            tex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_GRAYSCALE)
        eal.save_loaded_asset(tex)
    return unreal.load_asset('%s/%s' % (dest, stem))


def surface_mat(slot, folder, scale, tint, metal, snowy):
    """A Megascans surface in real size; with snow settled on what faces up (the scan's own snow over it, where its
    normal points up and a little noise says so)."""
    name = 'M_Town_%s' % slot.title()
    path = '%s/%s' % (MATS, name)
    if eal.does_asset_exist(path):
        m = unreal.load_asset(path)
        mel.delete_all_material_expressions(m)
    else:
        m = tools.create_asset(name, MATS, unreal.Material, unreal.MaterialFactoryNew())
    uv = mel.create_material_expression(m, unreal.MaterialExpressionTextureCoordinate, -1600, 0)
    uv.set_editor_property('u_tiling', scale)
    uv.set_editor_property('v_tiling', scale)

    def samp(tex, x, y, normal=False, gray=False):
        e = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, x, y)
        e.set_editor_property('texture', tex)
        if normal:
            e.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
        elif gray:
            e.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_GRAYSCALE)
        mel.connect_material_expressions(uv, '', e, 'UVs')
        return e
    bc, nm = samp(texture(folder, 'BaseColor'), -1300, -300), samp(texture(folder, 'Normal'), -1300, 0, normal=True)
    rg, ao = samp(texture(folder, 'Roughness'), -1300, 300, gray=True), samp(texture(folder, 'AO'), -1300, 600, gray=True)
    tn = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -1300, -500)
    tn.set_editor_property('constant', unreal.LinearColor(tint[0], tint[1], tint[2], 1))
    col = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -1000, -350)
    mel.connect_material_expressions(bc, 'RGB', col, 'A')
    mel.connect_material_expressions(tn, '', col, 'B')
    out_col, out_n, out_r = col, nm, rg
    if snowy:
        sb, sn = samp(texture('fresh_snow', 'BaseColor'), -1300, 900), samp(texture('fresh_snow', 'Normal'), -1300, 1200, normal=True)
        wn = mel.create_material_expression(m, unreal.MaterialExpressionVertexNormalWS, -1300, 1500)
        # (how much it faces up, one number: a dot with straight up; a component mask set from here passed all three
        # channels through, every wall coloured by the way it faced)
        upv = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -1300, 1650)
        upv.set_editor_property('constant', unreal.LinearColor(0, 0, 1, 1))
        mk = mel.create_material_expression(m, unreal.MaterialExpressionDotProduct, -1150, 1500)
        if not (mel.connect_material_expressions(wn, '', mk, 'A') and mel.connect_material_expressions(upv, '', mk, 'B')):
            raise RuntimeError('%s: could not link the up-facing mask' % name)
        # (snow lies where it faces up, broken up a little by the wood's own roughness)
        sub = mel.create_material_expression(m, unreal.MaterialExpressionSubtract, -1000, 1500)
        sub.set_editor_property('const_b', 0.55)
        mel.connect_material_expressions(mk, '', sub, 'A')
        mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -850, 1500)
        mul.set_editor_property('const_b', 4.0)
        mel.connect_material_expressions(sub, '', mul, 'A')
        # (held to 0..1 by a Min and a Max: a Saturate node linked from here compiled as unlinked, the material failing
        # and the default drawn in its place)
        lo1 = mel.create_material_expression(m, unreal.MaterialExpressionMin, -760, 1500)
        lo1.set_editor_property('const_b', 1.0)
        sat = mel.create_material_expression(m, unreal.MaterialExpressionMax, -640, 1500)
        sat.set_editor_property('const_b', 0.0)
        if not (mel.connect_material_expressions(mul, '', lo1, 'A') and mel.connect_material_expressions(lo1, '', sat, 'A')):
            raise RuntimeError('%s: could not link the snow mask' % name)
        out_col = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -500, -300)
        mel.connect_material_expressions(col, '', out_col, 'A')
        mel.connect_material_expressions(sb, 'RGB', out_col, 'B')
        mel.connect_material_expressions(sat, '', out_col, 'Alpha')
        out_n = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -500, 0)
        mel.connect_material_expressions(nm, 'RGB', out_n, 'A')
        mel.connect_material_expressions(sn, 'RGB', out_n, 'B')
        mel.connect_material_expressions(sat, '', out_n, 'Alpha')
        out_r = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -500, 300)
        mel.connect_material_expressions(rg, 'R', out_r, 'A')
        out_r.set_editor_property('const_b', 0.75)
        mel.connect_material_expressions(sat, '', out_r, 'Alpha')
        mel.connect_material_property(out_col, '', unreal.MaterialProperty.MP_BASE_COLOR)
        mel.connect_material_property(out_n, '', unreal.MaterialProperty.MP_NORMAL)
        mel.connect_material_property(out_r, '', unreal.MaterialProperty.MP_ROUGHNESS)
    else:
        mel.connect_material_property(col, '', unreal.MaterialProperty.MP_BASE_COLOR)
        mel.connect_material_property(nm, 'RGB', unreal.MaterialProperty.MP_NORMAL)
        mel.connect_material_property(rg, 'R', unreal.MaterialProperty.MP_ROUGHNESS)
    mel.connect_material_property(ao, 'R', unreal.MaterialProperty.MP_AMBIENT_OCCLUSION)
    if metal:
        mt = samp(texture(folder, 'Metalness'), -1300, 1800, gray=True)
        mel.connect_material_property(mt, 'R', unreal.MaterialProperty.MP_METALLIC)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def simple_mat(name, color, rough, opacity=None, spec=0.5):
    path = '%s/%s' % (MATS, name)
    if eal.does_asset_exist(path):
        m = unreal.load_asset(path)
        mel.delete_all_material_expressions(m)
    else:
        m = tools.create_asset(name, MATS, unreal.Material, unreal.MaterialFactoryNew())
    if opacity is not None:
        m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
        m.set_editor_property('translucency_lighting_mode', unreal.TranslucencyLightingMode.TLM_SURFACE)
        m.set_editor_property('two_sided', True)
    c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, -200)
    c.set_editor_property('constant', unreal.LinearColor(color[0], color[1], color[2], 1))
    mel.connect_material_property(c, '', unreal.MaterialProperty.MP_BASE_COLOR)
    for val, prop in ((rough, unreal.MaterialProperty.MP_ROUGHNESS), (spec, unreal.MaterialProperty.MP_SPECULAR)) + \
            (((opacity, unreal.MaterialProperty.MP_OPACITY),) if opacity is not None else ()):
        k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, 0)
        k.set_editor_property('r', val)
        mel.connect_material_property(k, '', prop)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


try:
    if not levels.load_level(MAP):
        raise RuntimeError('could not load ' + MAP)
    data = json.load(open(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/town.json')))
    mats = {slot: surface_mat(slot, f, sc, tn, mt, snowy=slot not in ('snow',)) for slot, (f, sc, tn, mt) in SURF.items()}
    mats['glass'] = simple_mat('M_Town_Glass', (0.05, 0.06, 0.06), 0.12, opacity=0.5, spec=1.0)
    mats['shards'] = simple_mat('M_Town_Shards', (0.07, 0.08, 0.08), 0.08, opacity=0.6, spec=1.0)
    mats['dark'] = simple_mat('M_Town_Dark', (0.004, 0.004, 0.004), 1.0, spec=0.0)
    mats['ice'] = simple_mat('M_Town_Ice', (0.62, 0.7, 0.78), 0.06, opacity=0.75, spec=1.0)     # (icicles: clear, glinting)
    mats['ground'] = unreal.load_asset(ns['MATS'] + '/M_MountainFar')
    # the old town, if any
    for a in actors.get_all_level_actors():
        if a.actor_has_tag('Town'):
            actors.destroy_actor(a)
    meshes = {}
    for name in sorted({b['name'] for b in data['buildings']} | {'Ground'}):
        mesh = ns['import_obj']('Town_' + name, MESH)
        nn = mesh.get_editor_property('nanite_settings')
        nn.set_editor_property('enabled', False)             # (glass in it: translucent can't draw through Nanite)
        mesh.set_editor_property('nanite_settings', nn)
        bs = mesh.get_editor_property('body_setup')
        if bs:
            bs.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
            bs.set_editor_property('double_sided_geometry', True)
            mesh.set_editor_property('body_setup', bs)
        eal.save_loaded_asset(mesh)
        meshes[name] = mesh

    def place(name, at, yaw):
        a = actors.spawn_actor_from_class(unreal.StaticMeshActor, unreal.Vector(at[0], at[1], at[2]), unreal.Rotator(0, 0, yaw))
        a.set_actor_label('Town %s' % name)
        a.tags = [unreal.Name('Town')]
        comp = a.static_mesh_component
        comp.set_static_mesh(meshes[name])
        for i, sm in enumerate(meshes[name].static_materials):
            slot = str(sm.get_editor_property('material_slot_name')).lower()
            key = next((k for k in mats if slot.startswith(k)), None)
            if key and mats[key]:
                comp.set_material(i, mats[key])
        return a
    place('Ground', (0, 0, 0), 0.0)
    for b in data['buildings']:
        place(b['name'], b['at'], b['yaw'])
    # the town's own moonlight: the valley floor lies in the mountains' shadow from the moon (everything past the one
    # headlight black). A second, cold moon lights only what is on lighting channel 1 (the town, its ground, the
    # walker), so the mountains can't shadow it; low, raking in from behind the car and to its right, the facades on
    # the left of the street lit, long shadows across it, the right-hand side in shade
    yaw_u = data['rest_yaw']
    town_lc = unreal.LightingChannels(channel0=True, channel1=True, channel2=False)
    for a in actors.get_all_level_actors():
        if a.actor_has_tag('Town') and isinstance(a, unreal.StaticMeshActor):
            a.static_mesh_component.set_editor_property('lighting_channels', town_lc)
    tm = actors.spawn_actor_from_class(unreal.DirectionalLight, unreal.Vector(0, 0, 1000),
                                       unreal.Rotator(roll=0, pitch=-24, yaw=yaw_u - 57))      # (the way it shines)
    tm.set_actor_label('Town moon')
    tm.tags = [unreal.Name('Town')]
    lc = tm.light_component
    lc.set_intensity(TOWN_MOON_LUX)
    lc.set_light_color(unreal.LinearColor(0.62, 0.72, 1.0, 1))
    lc.set_editor_property('atmosphere_sun_light', False)       # (not a second sun in the sky)
    lc.set_editor_property('volumetric_scattering_intensity', 0.0)
    lc.set_editor_property('lighting_channels', unreal.LightingChannels(channel0=False, channel1=True, channel2=False))
    lc.set_editor_property('cast_shadows', True)
    # where the director leaves the car after the fall: on its roof at the head of the street, facing down it
    director = next((a for a in actors.get_all_level_actors() if a.get_class().get_name() == 'EndingDirector'), None)
    if director:
        r = data['rest']
        director.set_editor_property('town_rest_at', unreal.Vector(r[0], r[1], r[2]))
        director.set_editor_property('town_rest_yaw', data['rest_yaw'])
    levels.save_current_level()
    log('[build_town] %d buildings placed; the car left at %s facing %.0f' % (len(data['buildings']), data['rest'], data['rest_yaw']))
except Exception as e:
    import traceback
    unreal.log_error('[build_town] FAILED: %r\n%s' % (e, traceback.format_exc()))
finally:
    unreal.SystemLibrary.quit_editor()
