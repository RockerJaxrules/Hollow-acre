"""A small stage for judging the creature: L_HuskPreview. The husk four times over (front, left side, back, right side)
on snow, lit by a headlight-like spotlight from in front, dim blue moonlight and the night sky, with a camera and the
ShotDirector, for: -game /Game/HollowAcre/Maps/L_HuskPreview -shot=<png> -shotdelay=3 -shotquit.
Optional env HUSK_CAM=face for a close camera on the front one's face."""
import os

import unreal

eal = unreal.EditorAssetLibrary
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
levels = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
MAP = '/Game/HollowAcre/Maps/L_HuskPreview'


def log(*a):
    unreal.log('[huskprev] ' + ' '.join(str(x) for x in a))


def current_map():
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    return world.get_path_name().split('.')[0] if world else ''


try:
    # open the preview map (made fresh the first time) and clear it; never touch whatever map the editor opened with
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

    def R(pitch, yaw, roll):            # (unreal.Rotator's own argument order is roll, pitch, yaw)
        return unreal.Rotator(pitch=pitch, yaw=yaw, roll=roll)
    floor = actors.spawn_actor_from_class(unreal.StaticMeshActor, V(0, 0, 0))
    floor.static_mesh_component.set_static_mesh(unreal.load_asset('/Engine/BasicShapes/Plane'))
    floor.set_actor_scale3d(V(60, 60, 1))
    snow = unreal.load_asset('/Game/HollowAcre/Materials/Blockout/M_MountainTerrain')
    if snow:
        floor.static_mesh_component.set_material(0, snow)
    # the husk four times: screaming at the camera, standing hunched, mid-gallop and skidding (from the side)
    cls = unreal.load_class(None, '/Script/HollowAcre.Husk')
    TA = 28 / 60.0
    TB, TC = TA + 0.63, TA + 0.63 + 0.75
    for i, (take, t, jaw, face_yaw) in enumerate((('Sighting', TC + 0.9, 40.0, 0.0), ('Sighting', TC + 0.05, 6.0, 0.0),
                                                   ('Gallop', 0.12, 24.0, 90.0), ('Sighting', TA + 0.35, 10.0, 90.0))):
        a = actors.spawn_actor_from_class(cls, V(0, (i - 1.5) * 330, 0))
        a.set_editor_property('preview_take', take)
        a.set_editor_property('preview_time', t)
        a.set_editor_property('preview_jaw', jaw)
        a.set_editor_property('preview_face_yaw', face_yaw)
        a.set_actor_scale3d(V(1.3, 1.3, 1.3))
        a.set_actor_label('Husk %s %.2f' % (take, t))
    sun = actors.spawn_actor_from_class(unreal.DirectionalLight, V(0, 0, 800), R(-35, 40, 0))
    sun.light_component.set_intensity(0.6)
    sun.light_component.set_light_color(unreal.LinearColor(0.55, 0.65, 1.0, 1))
    sky = actors.spawn_actor_from_class(unreal.SkyLight, V(0, 0, 500))
    sky.light_component.set_intensity(0.35)
    sky.light_component.set_editor_property('source_type', unreal.SkyLightSourceType.SLS_SPECIFIED_CUBEMAP)
    spot = actors.spawn_actor_from_class(unreal.SpotLight, V(1100, 0, 100), R(3, 180, 0))
    spot.light_component.set_intensity(3000.0)
    spot.light_component.set_editor_property('outer_cone_angle', 40.0)
    spot.light_component.set_editor_property('attenuation_radius', 3000.0)
    spot.light_component.set_light_color(unreal.LinearColor(1.0, 0.95, 0.85, 1))
    # a fixed exposure (the black sky otherwise makes the camera brighten everything to white)
    ppv = actors.spawn_actor_from_class(unreal.PostProcessVolume, V(0, 0, 0))
    ppv.set_editor_property('unbound', True)
    pps = ppv.get_editor_property('settings')
    for k, v in (('override_auto_exposure_method', True), ('auto_exposure_method', unreal.AutoExposureMethod.AEM_MANUAL),
                 ('override_auto_exposure_apply_physical_camera_exposure', True), ('auto_exposure_apply_physical_camera_exposure', False),
                 ('override_auto_exposure_bias', True), ('auto_exposure_bias', float(os.environ.get('HUSK_EV', '-2.5')))):
        pps.set_editor_property(k, v)
    ppv.set_editor_property('settings', pps)
    fog = actors.spawn_actor_from_class(unreal.ExponentialHeightFog, V(0, 0, 0))
    fog.component.set_editor_property('fog_density', 0.01)
    face = os.environ.get('HUSK_CAM') == 'face'
    cam_loc, cam_rot, fov = (V(190, -495, 268), R(-4, 180, 0), 24.0) if face else (V(1150, 0, 170), R(-3, 180, 0), 50.0)
    if os.environ.get('HUSK_CAMPOS'):        # any other view: x,y,z,pitch,yaw,fov
        x, y, z, pitch, yaw, fov = (float(v) for v in os.environ['HUSK_CAMPOS'].split(','))
        cam_loc, cam_rot = V(x, y, z), R(pitch, yaw, 0)
    cam = actors.spawn_actor_from_class(unreal.CameraActor, cam_loc, cam_rot)
    cam.camera_component.set_editor_property('field_of_view', fov)
    cam.set_editor_property('auto_activate_for_player', unreal.AutoReceiveInput.PLAYER0)
    actors.spawn_actor_from_class(unreal.load_class(None, '/Script/HollowAcre.ShotDirector'), V(0, 0, 0))
    # the player's own (default) pawn starts where the camera is, looking the same way: its view is the shot
    actors.spawn_actor_from_class(unreal.PlayerStart, cam_loc, cam_rot)
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    world.get_world_settings().set_editor_property('default_game_mode', unreal.GameModeBase.static_class())
    if current_map() != MAP:
        raise RuntimeError('the open map changed to %s: nothing saved' % current_map())
    levels.save_current_level()
    log('saved', MAP, 'face camera' if face else 'lineup camera')
except Exception as e:
    unreal.log_error('[huskprev] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
