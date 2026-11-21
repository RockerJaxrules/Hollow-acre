"""A small stage for judging Kessler (the MetaHuman, Content/HollowAcre/Kessler/Built): L_KesslerPreview. Him twice (facing
the camera, and turned three-quarters), on snow at night: his lantern's warm light from low at his side, the cold moon,
the night sky; a camera and the ShotDirector, for: -game /Game/HollowAcre/Maps/L_KesslerPreview -shot=<png> -shotdelay=4
-shotquit. Env KESSLER_CAM=face for a close camera on the front one's face (as the player sees him, the lantern raised).
Built the way husk_preview_level.py builds the creature's."""
import os

import unreal

eal = unreal.EditorAssetLibrary
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
levels = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
MAP = '/Game/HollowAcre/Maps/L_KesslerPreview'
BP = '/Game/HollowAcre/Kessler/Built/Kessler/BP_Kessler'


def log(*a):
    unreal.log('[kesslerprev] ' + ' '.join(str(x) for x in a))


def current_map():
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    return world.get_path_name().split('.')[0] if world else ''


try:
    if eal.does_asset_exist(MAP):
        if not levels.load_level(MAP):
            raise RuntimeError('could not open ' + MAP)
        for a in actors.get_all_level_actors():
            actors.destroy_actor(a)
    elif not levels.new_level(MAP):
        raise RuntimeError('could not make ' + MAP)
    if current_map() != MAP:
        raise RuntimeError('the open map is %s, not %s: nothing saved' % (current_map(), MAP))
    V = unreal.Vector

    def R(pitch, yaw, roll):
        return unreal.Rotator(pitch=pitch, yaw=yaw, roll=roll)
    floor = actors.spawn_actor_from_class(unreal.StaticMeshActor, V(0, 0, 0))
    floor.static_mesh_component.set_static_mesh(unreal.load_asset('/Engine/BasicShapes/Plane'))
    floor.set_actor_scale3d(V(60, 60, 1))
    snow = unreal.load_asset('/Game/HollowAcre/Materials/Blockout/M_MountainTerrain')
    if snow:
        floor.static_mesh_component.set_material(0, snow)
    bp = unreal.load_class(None, BP + '.BP_Kessler_C')
    if not bp:
        raise RuntimeError('no ' + BP)
    # (KESSLER_ACTOR=1: the game's own Kessler actor (Source/HollowAcre/Kessler.cpp: his body playing a take, his lantern
    # and carbine); else the bare MetaHuman blueprint)
    kact = os.environ.get('KESSLER_ACTOR') and unreal.load_class(None, '/Script/HollowAcre.Kessler')
    for i, yaw in enumerate((90.0, 135.0)):           # (a MetaHuman faces its +Y: yaw 90 turns it to the camera at -X)
        if kact:
            a = actors.spawn_actor_from_class(kact, V(0, (i - 0.5) * 140, 0), R(0, yaw + 90.0, 0))
            if os.environ.get('KESSLER_ANIM'):
                a.set_editor_property('clip', os.environ['KESSLER_ANIM'])
            a.set_actor_label('Kessler %d' % i)
            continue
        a = actors.spawn_actor_from_class(bp, V(0, (i - 0.5) * 140, 0), R(0, yaw, 0))
        a.set_actor_label('Kessler %d' % i)
        # (KESSLER_ANIM=<clip in /Game/HollowAcre/Kessler/Mocap>: his body plays it, looping; the face, grooms and
        # clothes follow the body as the MetaHuman blueprint sets them)
        clip = os.environ.get('KESSLER_ANIM')
        if clip:
            anim = unreal.load_asset('/Game/HollowAcre/Kessler/Mocap/' + clip)
            for c in a.get_components_by_class(unreal.SkeletalMeshComponent):
                if c.get_name() == 'Body' and anim:
                    c.set_editor_property('animation_mode', unreal.AnimationMode.ANIMATION_SINGLE_NODE)
                    data = c.get_editor_property('animation_data')
                    data.set_editor_property('anim_to_play', anim)
                    data.set_editor_property('saved_looping', True)
                    data.set_editor_property('saved_playing', True)
                    c.set_editor_property('animation_data', data)
                    log('body plays', clip)
        # his lantern's light: warm, low at his left side
        side = actors.spawn_actor_from_class(unreal.PointLight, V(-10 + 30, (i - 0.5) * 140 - 35, 95))
        side.light_component.set_intensity(120.0)
        side.light_component.set_editor_property('intensity_units', unreal.LightUnits.CANDELAS)
        side.light_component.set_editor_property('attenuation_radius', 900.0)
        side.light_component.set_editor_property('use_temperature', True)
        side.light_component.set_editor_property('temperature', 2000.0)
    moon = actors.spawn_actor_from_class(unreal.DirectionalLight, V(0, 0, 800), R(-30, 140, 0))
    moon.light_component.set_intensity(0.5)
    moon.light_component.set_light_color(unreal.LinearColor(0.55, 0.65, 1.0, 1))
    sky = actors.spawn_actor_from_class(unreal.SkyLight, V(0, 0, 500))
    sky.light_component.set_intensity(0.25)
    ppv = actors.spawn_actor_from_class(unreal.PostProcessVolume, V(0, 0, 0))
    ppv.set_editor_property('unbound', True)
    pps = ppv.get_editor_property('settings')
    for k, v in (('override_auto_exposure_method', True), ('auto_exposure_method', unreal.AutoExposureMethod.AEM_MANUAL),
                 ('override_auto_exposure_apply_physical_camera_exposure', True), ('auto_exposure_apply_physical_camera_exposure', False),
                 ('override_auto_exposure_bias', True), ('auto_exposure_bias', float(os.environ.get('KESSLER_EV', '-1.0')))):
        pps.set_editor_property(k, v)
    ppv.set_editor_property('settings', pps)
    face = os.environ.get('KESSLER_CAM') == 'face'
    cam_loc, cam_rot, fov = (V(-120, -70, 172), R(-3, 0, 0), 30.0) if face else (V(-420, 0, 120), R(-3, 0, 0), 40.0)
    if os.environ.get('KESSLER_CAM') == 'walk':      # (a man's eye height, far enough back for a walk toward it)
        cy = float(os.environ.get('KESSLER_CAMYAW', '0'))     # (round him: the camera swung about the stage's middle)
        import math
        d = float(os.environ.get('KESSLER_DIST', '1150'))
        cam_loc = V(-d * math.cos(math.radians(cy)), -d * math.sin(math.radians(cy)), 165)
        cam_rot, fov = R(float(os.environ.get('KESSLER_PITCH', '-4')), cy, 0), float(os.environ.get('KESSLER_FOV', '30'))
    if os.environ.get('KESSLER_FILL'):                 # (a plain white light from beside the camera: to judge the clothes)
        fill = actors.spawn_actor_from_class(unreal.PointLight, cam_loc + V(150, -150, 60))
        fill.light_component.set_editor_property('intensity_units', unreal.LightUnits.CANDELAS)
        fill.light_component.set_intensity(float(os.environ['KESSLER_FILL']))
        fill.light_component.set_editor_property('attenuation_radius', 4000.0)
    cam = actors.spawn_actor_from_class(unreal.CameraActor, cam_loc, cam_rot)
    cam.camera_component.set_editor_property('field_of_view', fov)
    cam.set_editor_property('auto_activate_for_player', unreal.AutoReceiveInput.PLAYER0)
    actors.spawn_actor_from_class(unreal.load_class(None, '/Script/HollowAcre.ShotDirector'), V(0, 0, 0))
    actors.spawn_actor_from_class(unreal.PlayerStart, cam_loc, cam_rot)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    world.get_world_settings().set_editor_property('default_game_mode', unreal.GameModeBase.static_class())
    if current_map() != MAP:
        raise RuntimeError('the open map changed to %s: nothing saved' % current_map())
    levels.save_current_level()
    log('saved', MAP, 'face camera' if face else 'lineup camera')
except Exception as e:
    unreal.log_error('[kesslerprev] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
