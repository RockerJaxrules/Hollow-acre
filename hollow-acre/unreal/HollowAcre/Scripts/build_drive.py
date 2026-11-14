"""Builds L_EndingDrive: the night blizzard drive (first blockout).

Run inside the editor (headless is fine):
  UnrealEditor.exe HollowAcre.uproject -ExecutePythonScript="<path>/Scripts/build_drive.py" -unattended -nosplash -RenderOffscreen
Re-running rebuilds the level and materials from scratch. Tunables are at the top.
Everything here is our own blockout (engine basic shapes); MetaHuman arms and Megascans replace parts later.
The car is the player's car from Part 1 (2d/tools/px/cars.py sedan, car_beaten.py): a red sedan with a primer-grey
replacement hood and front fenders, rust, and a cracked windshield taped over.
"""
import math
import random
import unreal

MAP = '/Game/HollowAcre/Maps/L_EndingDrive'
MATS = '/Game/HollowAcre/Materials/Blockout'
BPS = '/Game/HollowAcre/Blueprints'

# Tunables (centimetres, degrees, Unreal light units)
# Note: unreal.Rotator's positional order is (roll, pitch, yaw); always pass pitch=/yaw=/roll= by name.
EYE = unreal.Vector(0, 0, 118)          # driver's eye in a sedan; the car sits on the road at the origin facing +X
EXPOSURE_BIAS = 0.0                     # manual exposure, EV offset
MOON_LUX = 1.6                          # brighter than a real moon so the cliff and peaks read
HEADLIGHT_CD = 4500
FOG_DENSITY = 0.022
FOG_FALLOFF = 0.35                       # thicker low down: the valley fills with fog, the peaks rise out of it
SNOW_SLOPE_SHARPNESS = 6.0              # terrain: snow where the surface faces up, rock on steep faces
SNOW_SLOPE_BIAS = -3.9                  # snow settles on ledges down to about 50 degrees
SEED = 7
import os
CAM_DEBUG_YAW = float(os.environ.get('HA_CAM_YAW', '0'))      # debug views only; 0 in the game
CAM_DEBUG_PITCH = float(os.environ.get('HA_CAM_PITCH', '0'))
HEADLIGHT_FOG_GLOW = 0.8                # volumetric scattering of the headlight beams
WINDSHIELD_TINT = 0.05                  # clear glass opacity
WINDSHIELD_COVER = 0.93                 # how solid the tape and cracks are
TAPE_BOUNCE = 0.035                     # snow/headlight bounce on the tape (translucency gets no Lumen GI)
CRACK_GLINT = 0.035                     # light the broken glass catches
SNOW_FLAKES = 16000
SNOW_SIZE_CM = (1.4, 3.2)
SNOW_BOX_CM = (1500, 900, 500)   # half-size of the snow box around the car
SNOW_AHEAD_CM = 1750                # box starts just past the windshield, never inside the cab

ell = unreal.EditorLevelLibrary
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
levels = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)


def log(msg):
    unreal.log('[build_drive] ' + msg)


# ---------- materials ----------
def make_mat(name, color, rough, metal=0.0, emissive=None, spec=0.5, instanced=False):
    path = f'{MATS}/{name}'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset(name, MATS, unreal.Material, unreal.MaterialFactoryNew())
    if instanced:  # without this flag the game silently swaps in the default material
        m.set_editor_property('used_with_instanced_static_meshes', True)
    m.set_editor_property('used_with_nanite', True)  # imported meshes are Nanite; same silent fallback otherwise
    c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, 0)
    c.set_editor_property('constant', unreal.LinearColor(*color, 1))
    mel.connect_material_property(c, '', unreal.MaterialProperty.MP_BASE_COLOR)
    for val, prop, y in [(rough, unreal.MaterialProperty.MP_ROUGHNESS, 200), (metal, unreal.MaterialProperty.MP_METALLIC, 300),
                         (spec, unreal.MaterialProperty.MP_SPECULAR, 400)]:
        k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, y)
        k.set_editor_property('r', val)
        mel.connect_material_property(k, '', prop)
    if emissive:
        e = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, 500)
        e.set_editor_property('constant', unreal.LinearColor(*emissive, 1))
        mel.connect_material_property(e, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def import_tex(name):
    """Import SourceArt/<name>.png (made by unreal/tools/make_windshield_tex.py) into /Game/HollowAcre/Textures."""
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir() + f'SourceArt/{name}.png'))
    task.set_editor_property('destination_path', '/Game/HollowAcre/Textures')
    task.set_editor_property('destination_name', name)
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    tools.import_asset_tasks([task])
    tex = unreal.load_asset(f'/Game/HollowAcre/Textures/{name}')
    if not tex:
        raise RuntimeError('texture import failed: ' + name)
    return tex


def scaled_add(m, src, out_name, mul, add, x, y):
    """src.out_name * mul + add, as material expressions."""
    e_mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, x, y)
    e_mul.set_editor_property('const_b', mul)
    mel.connect_material_expressions(src, out_name, e_mul, 'A')
    e_add = mel.create_material_expression(m, unreal.MaterialExpressionAdd, x + 200, y)
    e_add.set_editor_property('const_b', add)
    mel.connect_material_expressions(e_mul, '', e_add, 'A')
    return e_add


def make_windshield_mat():
    """Glass with the star crack and the strip of tape: translucent, two-sided, cracks catch a little light."""
    tex, glint = import_tex('T_Windshield'), import_tex('T_WindshieldGlint')
    name = 'M_Windshield'
    if eal.does_asset_exist(f'{MATS}/{name}'):
        eal.delete_asset(f'{MATS}/{name}')
    m = tools.create_asset(name, MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('two_sided', True)
    m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)  # lit glass glowed in direct moonlight
    ts = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, -900, 0)
    ts.set_editor_property('texture', tex)
    gs = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, -900, 400)
    gs.set_editor_property('texture', glint)
    mel.connect_material_property(scaled_add(m, ts, 'A', WINDSHIELD_COVER, WINDSHIELD_TINT, -600, 100), '', unreal.MaterialProperty.MP_OPACITY)
    tape = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -600, 550)
    mel.connect_material_expressions(ts, 'RGB', tape, 'A')
    mel.connect_material_expressions(ts, 'A', tape, 'B')
    bounce = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -400, 550)
    bounce.set_editor_property('const_b', TAPE_BOUNCE)
    mel.connect_material_expressions(tape, '', bounce, 'A')
    glow = mel.create_material_expression(m, unreal.MaterialExpressionAdd, -200, 450)
    mel.connect_material_expressions(scaled_add(m, gs, 'R', CRACK_GLINT, 0.0, -600, 400), '', glow, 'A')
    mel.connect_material_expressions(bounce, '', glow, 'B')
    mel.connect_material_property(glow, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


# ---------- the mountain ----------
MTN = '/Game/HollowAcre/Mountain'


def import_obj(name):
    """Import Saved/Generated/<name>.obj (from unreal/tools/make_mountain.py) as a static mesh."""
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + f'Generated/{name}.obj'))
    task.set_editor_property('destination_path', MTN)
    task.set_editor_property('destination_name', name)
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    tools.import_asset_tasks([task])
    meshes = [unreal.load_asset(p) for p in task.get_editor_property('imported_object_paths')]
    meshes = [m for m in meshes if isinstance(m, unreal.StaticMesh)]
    if not meshes:
        raise RuntimeError('mesh import failed: ' + name)
    log('%s: %d mesh(es), %d material slot(s)' % (name, len(meshes), len(meshes[0].static_materials)))
    return meshes[0]


def import_normal(name):
    tex = import_tex(name)
    tex.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
    tex.set_editor_property('srgb', False)
    eal.save_loaded_asset(tex)
    return tex


def tex_sample(m, tex, tiling, x, y, normal=False):
    tc = mel.create_material_expression(m, unreal.MaterialExpressionTextureCoordinate, x - 250, y)
    tc.set_editor_property('u_tiling', tiling)
    tc.set_editor_property('v_tiling', tiling)
    ts = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, x, y)
    ts.set_editor_property('texture', tex)
    if normal:
        ts.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    mel.connect_material_expressions(tc, '', ts, 'UVs')
    return ts


def lerp(m, a, a_out, b, b_out, alpha, x, y):
    e = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, x, y)
    mel.connect_material_expressions(a, a_out, e, 'A')
    mel.connect_material_expressions(b, b_out, e, 'B')
    mel.connect_material_expressions(alpha, '', e, 'Alpha')
    return e


def new_material(name, two_sided=False, instanced=False):
    if eal.does_asset_exist(f'{MATS}/{name}'):
        eal.delete_asset(f'{MATS}/{name}')
    m = tools.create_asset(name, MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('two_sided', two_sided)
    if instanced:
        m.set_editor_property('used_with_instanced_static_meshes', True)
    m.set_editor_property('used_with_nanite', True)
    return m


def finish(m):
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def make_terrain_mat(name, tiling):
    """Snow on the flats, rock where it is too steep for snow to hold (by the surface's slope)."""
    snow_c, snow_n = import_tex('T_Snow'), import_normal('T_SnowN')
    rock_c, rock_n = import_tex('T_Rock'), import_normal('T_RockN')
    m = new_material(name)
    sc = tex_sample(m, snow_c, tiling, -1200, -200)
    sn = tex_sample(m, snow_n, tiling, -1200, 0, normal=True)
    rc = tex_sample(m, rock_c, tiling * 0.5, -1200, 200)
    rn = tex_sample(m, rock_n, tiling * 0.5, -1200, 400, normal=True)
    up = mel.create_material_expression(m, unreal.MaterialExpressionVertexNormalWS, -1300, 600)
    z = mel.create_material_expression(m, unreal.MaterialExpressionComponentMask, -1100, 600)
    for ch, on in (('r', False), ('g', False), ('b', True), ('a', False)):
        z.set_editor_property(ch, on)
    mel.connect_material_expressions(up, '', z, '')
    sat = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, -700, 600)
    mel.connect_material_expressions(scaled_add(m, z, '', SNOW_SLOPE_SHARPNESS, SNOW_SLOPE_BIAS, -950, 600), '', sat, '')
    mel.connect_material_property(lerp(m, rc, 'RGB', sc, 'RGB', sat, -400, -100), '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(lerp(m, rn, 'RGB', sn, 'RGB', sat, -400, 200), '', unreal.MaterialProperty.MP_NORMAL)
    mel.connect_material_property(scaled_add(m, sat, '', -0.25, 0.85, -400, 400), '', unreal.MaterialProperty.MP_ROUGHNESS)
    return finish(m)


def make_road_mat():
    m = new_material('M_RoadSnow')
    mel.connect_material_property(tex_sample(m, import_tex('T_RoadSnow'), 1.0, -400, 0), 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(tex_sample(m, unreal.load_asset('/Game/HollowAcre/Textures/T_SnowN'), 1.5, -400, 250, normal=True), 'RGB',
                                  unreal.MaterialProperty.MP_NORMAL)
    k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -300, 450)
    k.set_editor_property('r', 0.55)
    mel.connect_material_property(k, '', unreal.MaterialProperty.MP_ROUGHNESS)
    return finish(m)


def scatter(label, mesh, mats, rows, xf):
    """One instanced actor: rows from mountain.json, xf(row) -> unreal.Transform."""
    a = actors.spawn_actor_from_class(unreal.load_class(None, '/Script/HollowAcre.Scatter'), V(0, 0, 0))
    a.set_actor_label(label)
    comp = a.get_editor_property('mesh')
    comp.set_static_mesh(mesh)
    for i, mat in enumerate(mats):
        comp.set_material(i, mat)
    a.set_editor_property('instances', [xf(r) for r in rows])
    a.rebuild()
    return a


def T(x, y, z, yaw, sx, sy=None, sz=None):
    return unreal.Transform(location=V(x, y, z), rotation=unreal.Rotator(yaw=yaw), scale=V(sx, sy if sy is not None else sx, sz if sz is not None else sx))


def build_mountain():
    import json
    data = json.load(open(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/mountain.json')))
    terrain_mat = make_terrain_mat('M_MountainTerrain', 1.0)
    far_mat = make_terrain_mat('M_MountainFar', 1.0)
    road_mat = make_road_mat()
    for name, mat in (('Terrain_Road', terrain_mat), ('Terrain_Far', far_mat), ('Road', road_mat)):
        mesh = import_obj(name)
        a = actors.spawn_actor_from_class(unreal.StaticMeshActor, V(0, 0, 0))
        a.set_actor_label(name.replace('_', ' '))
        a.static_mesh_component.set_static_mesh(mesh)
        for i in range(len(mesh.static_materials)):
            a.static_mesh_component.set_material(i, mat)
        if name == 'Terrain_Far':
            a.static_mesh_component.set_cast_shadow(False)

    pine = import_obj('Pine')
    bark = make_mat('M_PineBark', (0.035, 0.027, 0.02), 0.9, instanced=True)
    needles = new_material('M_PineNeedles', two_sided=True, instanced=True)
    k = mel.create_material_expression(needles, unreal.MaterialExpressionConstant3Vector, -300, 0)
    k.set_editor_property('constant', unreal.LinearColor(0.016, 0.03, 0.024, 1))
    mel.connect_material_property(k, '', unreal.MaterialProperty.MP_BASE_COLOR)
    finish(needles)
    pine_snow = new_material('M_PineSnow', two_sided=True, instanced=True)
    k = mel.create_material_expression(pine_snow, unreal.MaterialExpressionConstant3Vector, -300, 0)
    k.set_editor_property('constant', unreal.LinearColor(0.74, 0.77, 0.83, 1))
    mel.connect_material_property(k, '', unreal.MaterialProperty.MP_BASE_COLOR)
    finish(pine_snow)
    slots = {s.get_editor_property('material_slot_name'): i for i, s in enumerate(pine.static_materials)}
    log('pine slots: %s' % slots)
    order = [None] * len(pine.static_materials)
    for name, mat in (('bark', bark), ('needles', needles), ('snow', pine_snow)):
        for slot, i in slots.items():
            if str(slot).lower().startswith(name):
                order[i] = mat
    order = [o or needles for o in order]
    scatter('Pines', pine, order, data['trees'], lambda r: T(r[0], r[1], r[2], r[3], r[4]))

    metal = make_mat('M_Guardrail', (0.16, 0.165, 0.17), 0.6, metal=0.6, instanced=True)
    pole = make_mat('M_SnowPole', (0.02, 0.02, 0.02), 0.6, instanced=True)
    tip = make_mat('M_SnowPoleReflector', (0.55, 0.04, 0.035), 0.25, instanced=True)
    scatter('Snow poles', MESH['Cylinder'], [pole], data['poles'], lambda r: T(r[0], r[1], r[2] + 100, r[3], 0.04, 0.04, 2.0))
    scatter('Snow pole reflectors', MESH['Cube'], [tip], data['poles'], lambda r: T(r[0], r[1], r[2] + 185, r[3], 0.05, 0.05, 0.22))
    scatter('Guardrail posts', MESH['Cube'], [metal], data['posts'], lambda r: T(r[0], r[1], r[2] + 40, r[3], 0.1, 0.1, 0.8))
    scatter('Guardrail rails', MESH['Cube'], [metal], data['rails'], lambda r: T(r[0], r[1], r[2], r[3], r[4], 0.03, 0.3))
    return data


# ---------- shapes ----------
MESH = {n: unreal.load_asset(f'/Engine/BasicShapes/{n}.{n}') for n in ('Cube', 'Cylinder', 'Cone', 'Plane', 'Sphere')}


def shape(kind, loc, scale, mat, rot=None, label=None, shadows=True):
    a = actors.spawn_actor_from_class(unreal.StaticMeshActor, loc, rot or unreal.Rotator())
    comp = a.static_mesh_component
    comp.set_static_mesh(MESH[kind])
    comp.set_material(0, mat)
    comp.set_cast_shadow(shadows)
    a.set_actor_scale3d(scale)
    if label:
        a.set_actor_label(label)
    if CAB is not None:
        CAB.append(a)
    return a


CAB = None  # while a list, every new shape belongs to the car


def V(x, y, z):
    return unreal.Vector(x, y, z)


def main():
    random.seed(SEED)

    # Fresh level: reuse the existing map and clear it (deleting then re-creating it fails in one session)
    if eal.does_asset_exist(MAP):
        if not levels.load_level(MAP):
            raise RuntimeError('could not load ' + MAP)
        for a in actors.get_all_level_actors():
            # keep only the world settings and the level's builder brush (volumes are brushes too, so check the type)
            if not isinstance(a, unreal.WorldSettings) and type(a) is not unreal.Brush:
                actors.destroy_actor(a)
    elif not levels.new_level(MAP):
        raise RuntimeError('could not create ' + MAP)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    if world.get_path_name().split('.')[0] != MAP:
        raise RuntimeError('editing the wrong level: ' + world.get_path_name())

    plastic = make_mat('M_DashPlastic', (0.025, 0.025, 0.027), 0.55)
    rubber = make_mat('M_WheelRubber', (0.02, 0.02, 0.02), 0.45)
    paint = make_mat('M_CarPaintRed', (0.30, 0.035, 0.035), 0.35, spec=0.6)      # the Part 1 car's red
    primer = make_mat('M_HoodPrimer', (0.24, 0.245, 0.235), 0.85, spec=0.3)    # replacement hood, grey primer
    gauge = make_mat('M_GaugeGlow', (0.0, 0.0, 0.0), 0.4, emissive=(0.02, 0.05, 0.06))
    windshield = make_windshield_mat()

    # The mountain (unreal/tools/make_mountain.py): the climbing road, cliff, drop, peaks, pines, poles, guardrail
    mountain = build_mountain()

    # The car (blockout): primer hood and fenders, dash, raked windshield pillars, roof, door tops, red mirrors
    global CAB
    CAB = []
    shape('Cube', V(160, 0, 84), V(1.7, 1.66, 0.08), primer, unreal.Rotator(pitch=-7), 'Hood (primer)')
    for side in (-1, 1):
        shape('Cube', V(160, side * 86, 80), V(1.7, 0.12, 0.1), primer, unreal.Rotator(pitch=-7), 'Front fender (primer)')
        shape('Cube', V(62, side * 102, 96), V(0.06, 0.2, 0.13), paint, label='Mirror (red)')
    shape('Cube', V(78, 0, 81), V(0.55, 1.6, 0.28), plastic, label='Dashboard')
    shape('Cube', V(50, -2, 88), V(0.01, 0.22, 0.08), gauge, label='Gauges', shadows=False)
    for side in (-1, 1):
        shape('Cube', V(44, side * 74, 118), V(0.06, 0.08, 0.80), plastic, unreal.Rotator(pitch=56), 'A pillar')
        shape('Cube', V(-10, side * 82, 92), V(1.4, 0.05, 0.2), plastic, label='Door top')
    shape('Cube', V(-40, 0, 144), V(1.15, 1.5, 0.05), plastic, label='Roof')
    # Windshield between the A pillars: 79 cm along the slope from the dash (x 77, z 96) up to the roof (x 11, z 140)
    # the plane's own X runs across the car (texture width), its Y runs down the slope from roof to dash
    ws_rot = unreal.MathLibrary.make_rot_from_xy(V(0, 1, 0), V(0.822, 0, -0.569))
    shape('Plane', V(44, 0, 118), V(1.5, 0.79, 1), windshield, ws_rot, 'Windshield (cracked, taped)',
          shadows=False)

    # Steering wheel: rim of 36 short cylinders in the tilted wheel plane, 3 spokes, hub and column
    centre = EYE + V(40, -2, -30)
    tilt = math.radians(25)
    n = unreal.Vector(-math.cos(tilt), 0, math.sin(tilt))   # faces the driver
    u = unreal.Vector(0, 1, 0)
    v = unreal.Vector(math.sin(tilt), 0, math.cos(tilt))
    R, tube, seg = 19.0, 1.7, 36
    for k in range(seg):
        a0 = 2 * math.pi * k / seg
        a1 = a0 + 2 * math.pi / seg
        am = (a0 + a1) / 2
        p = centre + u * (R * math.cos(am)) + v * (R * math.sin(am))
        tan = u * (-math.sin(am)) + v * math.cos(am)
        rot = unreal.MathLibrary.make_rot_from_zx(tan, n)
        length = 2 * R * math.sin(math.pi / seg) * 1.08
        shape('Cylinder', p, V(tube * 2 / 100, tube * 2 / 100, length / 100), rubber, rot)
    shape('Cylinder', centre - n * 1.5, V(0.11, 0.11, 0.05), rubber, unreal.MathLibrary.make_rot_from_z(n), 'Hub')
    for ang in (0, 180, 270):
        a = math.radians(ang)
        d = u * math.cos(a) + v * math.sin(a)
        shape('Cube', centre + d * (R / 2) - n * 0.5, V(R / 100, 0.04, 0.015), plastic, unreal.MathLibrary.make_rot_from_xz(d, n))
    shape('Cylinder', centre + n * -14, V(0.07, 0.07, 0.28), plastic, unreal.MathLibrary.make_rot_from_z(n), 'Column')
    car_parts, CAB = CAB, None

    # ---------- light and atmosphere ----------
    moon = actors.spawn_actor_from_class(unreal.DirectionalLight, V(0, 0, 1000), unreal.Rotator(pitch=-30, yaw=-40))  # from behind on the right: lights the cliff and the peaks ahead (a moon in front backlit everything)
    moon.set_actor_label('Moon')
    mc = moon.light_component
    mc.set_intensity(MOON_LUX)
    mc.set_light_color(unreal.LinearColor(0.62, 0.72, 1.0, 1))
    mc.set_editor_property('atmosphere_sun_light', True)
    mc.set_editor_property('volumetric_scattering_intensity', 1.0)

    actors.spawn_actor_from_class(unreal.SkyAtmosphere, V(0, 0, 0)).set_actor_label('Sky')
    sky = actors.spawn_actor_from_class(unreal.SkyLight, V(0, 0, 500))
    sky.set_actor_label('Sky light')
    sc = sky.light_component
    sc.set_editor_property('real_time_capture', True)
    sc.set_intensity(1.2)

    fog = actors.spawn_actor_from_class(unreal.ExponentialHeightFog, V(0, 0, -1500))
    fog.set_actor_label('Blizzard fog')
    fc = fog.component
    fc.set_editor_property('fog_density', FOG_DENSITY)
    fc.set_editor_property('fog_height_falloff', FOG_FALLOFF)
    fc.set_editor_property('fog_inscattering_luminance', unreal.LinearColor(0.012, 0.016, 0.024, 1))
    fc.set_editor_property('enable_volumetric_fog', True)
    fc.set_editor_property('volumetric_fog_albedo', unreal.Color(235, 242, 255, 255))
    fc.set_editor_property('volumetric_fog_extinction_scale', 1.0)
    fc.set_editor_property('volumetric_fog_distance', 12000.0)

    for side in (-1, 1):
        hl = actors.spawn_actor_from_class(unreal.SpotLight, V(240, side * 66, 68), unreal.Rotator(pitch=-3, yaw=side * 2))
        hl.set_actor_label('Headlight')
        c = hl.spot_light_component
        c.set_editor_property('intensity_units', unreal.LightUnits.CANDELAS)
        c.set_intensity(HEADLIGHT_CD)
        c.set_light_color(unreal.LinearColor(0.92, 0.96, 1.0, 1))
        c.set_editor_property('outer_cone_angle', 28.0)
        c.set_editor_property('inner_cone_angle', 10.0)
        c.set_editor_property('attenuation_radius', 6000.0)
        c.set_editor_property('volumetric_scattering_intensity', HEADLIGHT_FOG_GLOW)
        car_parts.append(hl)

    dash = actors.spawn_actor_from_class(unreal.PointLight, V(45, -2, 90))
    dash.set_actor_label('Gauge glow')
    dc = dash.point_light_component
    dc.set_editor_property('intensity_units', unreal.LightUnits.CANDELAS)
    dc.set_intensity(0.15)
    dc.set_light_color(unreal.LinearColor(0.45, 0.85, 1.0, 1))
    dc.set_editor_property('attenuation_radius', 40.0)
    dc.set_editor_property('volumetric_scattering_intensity', 0.0)
    car_parts.append(dash)

    ppv = actors.spawn_actor_from_class(unreal.PostProcessVolume, V(0, 0, 0))
    ppv.set_actor_label('Night grade')
    ppv.set_editor_property('unbound', True)
    s = ppv.settings
    for k, val in [('auto_exposure_method', unreal.AutoExposureMethod.AEM_MANUAL), ('auto_exposure_bias', EXPOSURE_BIAS),
                   ('auto_exposure_apply_physical_camera_exposure', False), ('bloom_intensity', 0.35),
                   ('vignette_intensity', 0.55), ('film_grain_intensity', 0.25),
                   ('color_saturation', unreal.Vector4(0.85, 0.88, 1.0, 1.0))]:
        s.set_editor_property('override_' + k, True)
        s.set_editor_property(k, val)
    ppv.set_editor_property('settings', s)

    # ---------- game camera, game mode, screenshot director ----------
    cam = actors.spawn_actor_from_class(unreal.CameraActor, EYE, unreal.Rotator(pitch=-5 + CAM_DEBUG_PITCH, yaw=CAM_DEBUG_YAW))
    cam.set_actor_label('Driver eye')
    cam.camera_component.set_editor_property('field_of_view', 78.0)
    cam.camera_component.set_editor_property('constrain_aspect_ratio', False)
    cam.set_editor_property('auto_activate_for_player', unreal.AutoReceiveInput.PLAYER0)
    actors.spawn_actor_from_class(unreal.PlayerStart, EYE + V(-300, 0, 0))
    car_parts.append(cam)

    # One movable car root that the ending director drives up the road
    car = actors.spawn_actor_from_class(unreal.Actor, V(0, 0, 0))
    car.set_actor_label('Car')
    root = unreal.SceneComponent(car, 'CarRoot')
    car.set_editor_property('root_component', root)
    root.set_mobility(unreal.ComponentMobility.MOVABLE)
    for p in car_parts:
        p.root_component.set_mobility(unreal.ComponentMobility.MOVABLE)
        p.attach_to_actor(car, '', unreal.AttachmentRule.KEEP_WORLD, unreal.AttachmentRule.KEEP_WORLD,
                          unreal.AttachmentRule.KEEP_WORLD, False)
    flake = make_mat('M_Snowflake', (0.92, 0.94, 0.97), 1.0, emissive=(0.010, 0.012, 0.016), instanced=True)
    snow_actor = actors.spawn_actor_from_class(unreal.load_class(None, '/Script/HollowAcre.Snowfall'), V(0, 0, 0))
    snow_actor.set_actor_label('Snowfall')
    snow_actor.set_editor_property('follow', car)
    snow_actor.set_editor_property('flakes', SNOW_FLAKES)
    snow_actor.set_editor_property('size', unreal.Vector2D(*SNOW_SIZE_CM))
    snow_actor.set_editor_property('extent', unreal.Vector(*SNOW_BOX_CM))
    snow_actor.set_editor_property('ahead', SNOW_AHEAD_CM)
    ism = snow_actor.get_editor_property('mesh')
    ism.set_static_mesh(MESH['Sphere'])
    ism.set_material(0, flake)
    director = actors.spawn_actor_from_class(unreal.load_class(None, '/Script/HollowAcre.EndingDirector'), V(0, 0, 0))
    director.set_actor_label('Ending director')
    director.set_editor_property('car', car)
    path = [V(*p) for p in mountain['path']]
    director.set_editor_property('path', path)
    # put the car on the road at the start of the scene, facing along it (the director takes over in play)
    car.set_actor_location_and_rotation(path[0], unreal.MathLibrary.make_rot_from_x(path[3] - path[0]), False, True)

    # C++ game mode: spectator pawn (no body to move) and the HUD that draws "To be continued"
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    world.get_world_settings().set_editor_property('default_game_mode', unreal.load_class(None, '/Script/HollowAcre.EndingGameMode'))
    old_gm = f'{BPS}/BP_EndingDriveGameMode'  # the first blockout's Blueprint game mode, replaced by the C++ one
    if eal.does_asset_exist(old_gm):
        eal.delete_asset(old_gm)

    shot_cls = unreal.load_class(None, '/Script/HollowAcre.ShotDirector')
    actors.spawn_actor_from_class(shot_cls, V(0, 0, 0)).set_actor_label('Shot director')

    if not levels.save_current_level():
        raise RuntimeError('saving the level failed')
    log('saved %s with %d actors' % (MAP, len(actors.get_all_level_actors())))


try:
    main()
except Exception as e:  # keep the headless run from hanging on an error
    unreal.log_error('[build_drive] FAILED: %r' % (e,))
    raise
finally:
    unreal.SystemLibrary.quit_editor()
