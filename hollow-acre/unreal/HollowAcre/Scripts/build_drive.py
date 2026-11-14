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
EYE = unreal.Vector(0, 0, 118)          # driver's eye in a sedan; the car sits on the road at the origin facing +X
EXPOSURE_BIAS = 0.0                     # manual exposure, EV offset
MOON_LUX = 0.4
HEADLIGHT_CD = 6000
FOG_DENSITY = 0.035
SEED = 7
HEADLIGHT_FOG_GLOW = 0.8                # volumetric scattering of the headlight beams
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
def make_mat(name, color, rough, metal=0.0, emissive=None, spec=0.5):
    path = f'{MATS}/{name}'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset(name, MATS, unreal.Material, unreal.MaterialFactoryNew())
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


# ---------- shapes ----------
MESH = {n: unreal.load_asset(f'/Engine/BasicShapes/{n}.{n}') for n in ('Cube', 'Cylinder', 'Cone', 'Plane', 'Sphere')}


def shape(kind, loc, scale, mat, rot=None, label=None, shadows=True):
    a = actors.spawn_actor_from_class(unreal.StaticMeshActor, loc, rot or unreal.Rotator(0, 0, 0))
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
            if not isinstance(a, (unreal.WorldSettings, unreal.Brush)):
                actors.destroy_actor(a)
    elif not levels.new_level(MAP):
        raise RuntimeError('could not create ' + MAP)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    if world.get_path_name().split('.')[0] != MAP:
        raise RuntimeError('editing the wrong level: ' + world.get_path_name())

    snow = make_mat('M_Snow', (0.78, 0.82, 0.88), 0.75)
    road = make_mat('M_RoadSnow', (0.30, 0.31, 0.33), 0.85)
    bark = make_mat('M_Bark', (0.035, 0.028, 0.022), 0.9)
    pine = make_mat('M_Pine', (0.018, 0.032, 0.026), 0.85)
    rock = make_mat('M_Rock', (0.10, 0.10, 0.11), 0.9)
    plastic = make_mat('M_DashPlastic', (0.025, 0.025, 0.027), 0.55)
    rubber = make_mat('M_WheelRubber', (0.02, 0.02, 0.02), 0.45)
    paint = make_mat('M_CarPaintRed', (0.30, 0.035, 0.035), 0.35, spec=0.6)      # the Part 1 car's red
    primer = make_mat('M_HoodPrimer', (0.24, 0.245, 0.235), 0.85, spec=0.3)    # replacement hood, grey primer
    gauge = make_mat('M_GaugeGlow', (0.0, 0.0, 0.0), 0.4, emissive=(0.02, 0.05, 0.06))

    # Ground, road, banks
    shape('Plane', V(0, 0, 0), V(4000, 4000, 1), snow, label='Ground')
    shape('Plane', V(80000, 0, 1), V(2000, 7.5, 1), road, label='Road')
    for side in (-1, 1):
        for i in range(60):
            x = -2000 + i * 3000 + random.uniform(-300, 300)
            shape('Sphere', V(x, side * (520 + random.uniform(0, 120)), -60), V(random.uniform(30, 45), random.uniform(3, 5), random.uniform(1.6, 2.6)),
                  snow, unreal.Rotator(0, 0, random.uniform(-6, 6)))

    # Pine forest on both sides of the road
    for i in range(320):
        side = random.choice((-1, 1))
        x = random.uniform(-3000, 160000)
        y = side * random.uniform(900, 9000)
        h = random.uniform(9, 18)  # metres
        shape('Cylinder', V(x, y, h * 25), V(0.35, 0.35, h * 0.5), bark)
        for t in range(3):
            w = (h * 0.32) * (1 - t * 0.25)
            shape('Cone', V(x, y, h * 100 * (0.35 + t * 0.22)), V(w, w, h * 0.42), pine)

    # Mountains far ahead
    for i in range(9):
        x = random.uniform(250000, 420000)
        y = random.uniform(-260000, 260000)
        s = random.uniform(1600, 3200)
        shape('Cone', V(x, y, s * 50), V(s * 1.4, s * 1.2, s), rock, shadows=False)
        shape('Cone', V(x, y, s * 50 + s * 38), V(s * 0.6, s * 0.52, s * 0.42), snow, shadows=False)

    # The car (blockout): primer hood and fenders, dash, raked windshield pillars, roof, door tops, red mirrors
    global CAB
    CAB = []
    shape('Cube', V(160, 0, 84), V(1.7, 1.66, 0.08), primer, unreal.Rotator(-7, 0, 0), 'Hood (primer)')
    for side in (-1, 1):
        shape('Cube', V(160, side * 86, 80), V(1.7, 0.12, 0.1), primer, unreal.Rotator(-7, 0, 0), 'Front fender (primer)')
        shape('Cube', V(62, side * 102, 96), V(0.06, 0.2, 0.13), paint, label='Mirror (red)')
    shape('Cube', V(68, 0, 81), V(0.55, 1.6, 0.28), plastic, label='Dashboard')
    shape('Cube', V(62, -2, 93), V(0.02, 0.22, 0.07), gauge, label='Gauges', shadows=False)
    for side in (-1, 1):
        shape('Cube', V(44, side * 74, 118), V(0.06, 0.08, 0.80), plastic, unreal.Rotator(56, 0, 0), 'A pillar')
        shape('Cube', V(-10, side * 82, 92), V(1.4, 0.05, 0.2), plastic, label='Door top')
    shape('Cube', V(-40, 0, 144), V(1.15, 1.5, 0.05), plastic, label='Roof')

    # Steering wheel: rim of 36 short cylinders in the tilted wheel plane, 3 spokes, hub and column
    centre = EYE + V(44, -2, -30)
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
    moon = actors.spawn_actor_from_class(unreal.DirectionalLight, V(0, 0, 1000), unreal.Rotator(0, -32, 150))
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
    sc.set_intensity(0.6)

    fog = actors.spawn_actor_from_class(unreal.ExponentialHeightFog, V(0, 0, 0))
    fog.set_actor_label('Blizzard fog')
    fc = fog.component
    fc.set_editor_property('fog_density', FOG_DENSITY)
    fc.set_editor_property('fog_height_falloff', 0.08)
    fc.set_editor_property('fog_inscattering_luminance', unreal.LinearColor(0.012, 0.016, 0.024, 1))
    fc.set_editor_property('enable_volumetric_fog', True)
    fc.set_editor_property('volumetric_fog_albedo', unreal.Color(235, 242, 255, 255))
    fc.set_editor_property('volumetric_fog_extinction_scale', 1.0)
    fc.set_editor_property('volumetric_fog_distance', 9000.0)

    for side in (-1, 1):
        hl = actors.spawn_actor_from_class(unreal.SpotLight, V(240, side * 66, 68), unreal.Rotator(-3, 0, side * -2))
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

    dash = actors.spawn_actor_from_class(unreal.PointLight, V(58, -2, 95))
    dash.set_actor_label('Gauge glow')
    dc = dash.point_light_component
    dc.set_editor_property('intensity_units', unreal.LightUnits.CANDELAS)
    dc.set_intensity(0.15)
    dc.set_light_color(unreal.LinearColor(0.45, 0.85, 1.0, 1))
    dc.set_editor_property('attenuation_radius', 90.0)
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
    cam = actors.spawn_actor_from_class(unreal.CameraActor, EYE, unreal.Rotator(0, -5, 0))
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
    flake = make_mat('M_Snowflake', (0.92, 0.94, 0.97), 1.0, emissive=(0.010, 0.012, 0.016))
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

    gm_path = f'{BPS}/BP_EndingDriveGameMode'
    if not eal.does_asset_exist(gm_path):
        f = unreal.BlueprintFactory()
        f.set_editor_property('parent_class', unreal.GameModeBase)
        tools.create_asset('BP_EndingDriveGameMode', BPS, unreal.Blueprint, f)
    gm_bp = unreal.load_asset(gm_path)
    gm_cls = unreal.EditorAssetLibrary.load_blueprint_class(gm_path)
    cdo = unreal.get_default_object(gm_cls)
    cdo.set_editor_property('default_pawn_class', unreal.SpectatorPawn)
    cdo.set_editor_property('hud_class', unreal.HUD)
    unreal.BlueprintEditorLibrary.compile_blueprint(gm_bp)
    eal.save_loaded_asset(gm_bp)

    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    world.get_world_settings().set_editor_property('default_game_mode', gm_cls)

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
