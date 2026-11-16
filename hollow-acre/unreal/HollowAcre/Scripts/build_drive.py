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
import shutil
CAM_DEBUG_YAW = float(os.environ.get('HA_CAM_YAW', '0'))      # debug views only; 0 in the game
CAM_DEBUG_PITCH = float(os.environ.get('HA_CAM_PITCH', '0'))
HEADLIGHT_FOG_GLOW = 0.8                # volumetric scattering of the headlight beams
WINDSHIELD_TINT = 0.05                  # clear glass opacity
WINDSHIELD_COVER = 0.93                 # how solid the tape and cracks are
TAPE_BOUNCE = 0.035                     # snow/headlight bounce on the tape (translucency gets no Lumen GI)
CRACK_GLINT = 0.035                     # light the broken glass catches
YC_CAR = 37.0                           # the car's centre line, right of the driver (left-hand drive)
SNOW_BOUNCE = 0.25                      # cd: headlight bounce off the snow, back into the cabin (hands just visible)
GAUGE_GLOW = 0.6                       # dial backlight strength (cool white, the cluster's only light)
WORK_LIGHT = float(os.environ.get('HA_WORKLIGHT', '0'))  # debug: light the cabin to judge the model
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
    """The windshield: new glass (the car is fixed by the ending) with the blizzard on it: snow crusted where the wipers
    don't reach, a faint haze; the crash cracks it ('Crash', 0-1: laminated glass, a spider web that stays in the
    frame). Unlit translucent (lit glass glowed in direct moonlight); the snow and the cracks catch a little light."""
    tex, glint = import_tex('T_Windshield'), import_tex('T_WindshieldGlint')
    ctex, cglint = import_tex('T_WindshieldCrash'), import_tex('T_WindshieldCrashGlint')
    name = 'M_Windshield'
    if eal.does_asset_exist(f'{MATS}/{name}'):
        eal.delete_asset(f'{MATS}/{name}')
    m = tools.create_asset(name, MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('two_sided', True)
    m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
    def sample(t, x, y):
        e = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, x, y)
        e.set_editor_property('texture', t)
        return e
    ts, gs, cs, cg = sample(tex, -1200, 0), sample(glint, -1200, 300), sample(ctex, -1200, 600), sample(cglint, -1200, 900)
    crash = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -1200, 1150)
    crash.set_editor_property('parameter_name', 'Crash')
    crash.set_editor_property('default_value', 0.0)
    ca = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -900, 650)     # the cracks, as far as cracked
    mel.connect_material_expressions(cs, 'A', ca, 'A')
    mel.connect_material_expressions(crash, '', ca, 'B')
    cover = mel.create_material_expression(m, unreal.MaterialExpressionMax, -700, 100)
    mel.connect_material_expressions(ts, 'A', cover, 'A')
    mel.connect_material_expressions(ca, '', cover, 'B')
    mel.connect_material_property(scaled_add(m, cover, '', WINDSHIELD_COVER, WINDSHIELD_TINT, -500, 100), '', unreal.MaterialProperty.MP_OPACITY)
    # light: the snow crust and the cracks catch the headlights' bounce, their edges a glint
    snow = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -900, 350)
    mel.connect_material_expressions(ts, 'RGB', snow, 'A')
    mel.connect_material_expressions(ts, 'A', snow, 'B')
    snow_l = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -700, 350)
    snow_l.set_editor_property('const_b', TAPE_BOUNCE)
    mel.connect_material_expressions(snow, '', snow_l, 'A')
    cgl = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -900, 950)
    mel.connect_material_expressions(cg, 'R', cgl, 'A')
    mel.connect_material_expressions(crash, '', cgl, 'B')
    glints = mel.create_material_expression(m, unreal.MaterialExpressionAdd, -700, 700)
    mel.connect_material_expressions(gs, 'R', glints, 'A')
    mel.connect_material_expressions(scaled_add(m, cgl, '', 1.6, 0.0, -900, 1050), '', glints, 'B')
    glow = mel.create_material_expression(m, unreal.MaterialExpressionAdd, -300, 450)
    mel.connect_material_expressions(scaled_add(m, glints, '', CRACK_GLINT, 0.0, -500, 700), '', glow, 'A')
    mel.connect_material_expressions(snow_l, '', glow, 'B')
    mel.connect_material_property(glow, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


# ---------- the mountain ----------
MTN = '/Game/HollowAcre/Mountain'


IMPORT_KEPT = set()


def import_obj(name, dest=None):
    """Import Saved/Generated/<name>.obj (from unreal/tools/make_mountain.py) as a static mesh. A mesh imported after
    its OBJ was last written is kept as it is (HA_REIMPORT=1 imports everything again)."""
    src = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + f'Generated/{name}.obj')
    asset = f'{dest or MTN}/{name}'
    upk = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_content_dir() + asset[len('/Game/'):] + '.uasset')
    if (os.environ.get('HA_REIMPORT') != '1' and eal.does_asset_exist(asset) and os.path.exists(upk)
            and os.path.getmtime(upk) > os.path.getmtime(src)):
        mesh = unreal.load_asset(asset)
        if isinstance(mesh, unreal.StaticMesh):
            IMPORT_KEPT.add(name)
            log('%s: unchanged since its import, kept' % name)
            return mesh
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', src)
    task.set_editor_property('destination_path', dest or MTN)
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


def world_aligned(m, tex, size_cm, normal, x, y):
    """Engine's WorldAlignedTexture / WorldAlignedNormal: the texture projected along X, Y and Z and blended by the
    surface's facing. Output 'XYZ Texture'."""
    to = mel.create_material_expression(m, unreal.MaterialExpressionTextureObject, x - 500, y)
    to.set_editor_property('texture', tex)
    if normal:
        to.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    fn = 'WorldAlignedNormal' if normal else 'WorldAlignedTexture'
    fc = mel.create_material_expression(m, unreal.MaterialExpressionMaterialFunctionCall, x - 200, y)
    fc.set_editor_property('material_function', unreal.load_asset(f'/Engine/Functions/Engine_MaterialFunctions01/Texturing/{fn}'))
    sz = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, x - 500, y + 120)
    sz.set_editor_property('constant', unreal.LinearColor(size_cm, size_cm, size_cm, 1))
    mel.connect_material_expressions(to, '', fc, 'TextureObject')
    mel.connect_material_expressions(sz, '', fc, 'TextureSize')
    return fc


def make_terrain_mat(name, tiling, bias=SNOW_SLOPE_BIAS):
    """Snow on the flats, rock where it is too steep for snow to hold (by the surface's slope)."""
    snow_c, snow_n = import_tex('T_Snow'), import_normal('T_SnowN')
    rock_c, rock_n = import_tex('T_Rock'), import_normal('T_RockN')
    m = new_material(name)
    sc = tex_sample(m, snow_c, tiling, -1200, -200)
    sn = tex_sample(m, snow_n, tiling, -1200, 0, normal=True)
    # rock: projected from world space along all three axes (the cliff's UVs run across the road, so a UV-mapped
    # texture stretches up the face); 3.5 m per tile
    rc = world_aligned(m, rock_c, 350.0, False, -1200, 200)
    rn = world_aligned(m, rock_n, 350.0, True, -1200, 400)
    up = mel.create_material_expression(m, unreal.MaterialExpressionVertexNormalWS, -1300, 600)
    z = mel.create_material_expression(m, unreal.MaterialExpressionComponentMask, -1100, 600)
    for ch, on in (('r', False), ('g', False), ('b', True), ('a', False)):
        z.set_editor_property(ch, on)
    mel.connect_material_expressions(up, '', z, '')
    sat = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, -700, 600)
    mel.connect_material_expressions(scaled_add(m, z, '', SNOW_SLOPE_SHARPNESS, bias, -950, 600), '', sat, '')
    mel.connect_material_property(lerp(m, rc, 'XYZ Texture', sc, 'RGB', sat, -400, -100), '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(lerp(m, rn, 'XYZ Texture', sn, 'RGB', sat, -400, 200), '', unreal.MaterialProperty.MP_NORMAL)
    mel.connect_material_property(scaled_add(m, sat, '', -0.25, 0.85, -400, 400), '', unreal.MaterialProperty.MP_ROUGHNESS)
    return finish(m)


def make_road_mat():
    m = new_material('M_RoadSnow')
    road = tex_sample(m, import_tex('T_RoadSnow'), 1.0, -400, 0)
    mel.connect_material_property(road, 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(road, 'A', unreal.MaterialProperty.MP_ROUGHNESS)   # icy ruts gloss, loose snow dull
    mel.connect_material_property(tex_sample(m, unreal.load_asset('/Game/HollowAcre/Textures/T_SnowN'), 1.5, -400, 250, normal=True), 'RGB',
                                  unreal.MaterialProperty.MP_NORMAL)
    return finish(m)


def make_spray_mat(name, col, nrm_name):
    """Spruce spray cards: the needle texture rendered from the modelled spray, cut out by its alpha."""
    tex = import_tex(col)
    try:   # keep the needles from thinning out in the distance as the mipmaps average the alpha away
        tex.set_editor_property('do_scale_mips_for_alpha_coverage', True)
        tex.set_editor_property('alpha_coverage_thresholds', unreal.Vector4(0, 0, 0, 0.4))
        eal.save_loaded_asset(tex)
    except Exception as e:
        log('alpha coverage not set on %s: %s' % (col, e))
    m = new_material(name, instanced=True)
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_MASKED)
    m.set_editor_property('opacity_mask_clip_value', 0.4)
    ts = tex_sample(m, tex, 1.0, -500, 0)
    mel.connect_material_property(ts, 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(ts, 'A', unreal.MaterialProperty.MP_OPACITY_MASK)
    mel.connect_material_property(tex_sample(m, import_normal(nrm_name), 1.0, -500, 300, normal=True), 'RGB',
                                  unreal.MaterialProperty.MP_NORMAL)
    for val, prop, y in ((0.8, unreal.MaterialProperty.MP_ROUGHNESS, 550), (0.35, unreal.MaterialProperty.MP_SPECULAR, 650)):
        k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -300, y)
        k.set_editor_property('r', val)
        mel.connect_material_property(k, '', prop)
    return finish(m)


def make_branch_snow_mat():
    """Snow lying on the branches: white, a little blue, the snow normal map for its grain."""
    m = new_material('M_SpruceSnow', instanced=True)
    c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, 0)
    c.set_editor_property('constant', unreal.LinearColor(0.78, 0.8, 0.85, 1))
    mel.connect_material_property(c, '', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(tex_sample(m, unreal.load_asset('/Game/HollowAcre/Textures/T_SnowN'), 2.0, -500, 250, normal=True), 'RGB',
                                  unreal.MaterialProperty.MP_NORMAL)
    k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -300, 450)
    k.set_editor_property('r', 0.7)
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
    terrain_mat = make_terrain_mat('M_MountainTerrain', 1.0, bias=-3.3)   # wet blizzard snow sticks to the cliff's ledges
    far_mat = make_terrain_mat('M_MountainFar', 1.0)
    road_mat = make_road_mat()
    for name, mat in (('Terrain_Road', terrain_mat), ('Terrain_Far', far_mat), ('Road', road_mat)):
        mesh = import_obj(name)
        if name != 'Terrain_Far' and name not in IMPORT_KEPT:
            # the ground the car lands on in Part 2's opening: collide with the real triangles (Nanite off, so the
            # collision and the picture are the same surface)
            ns = mesh.get_editor_property('nanite_settings')
            ns.set_editor_property('enabled', False)
            mesh.set_editor_property('nanite_settings', ns)
            bs_ = mesh.get_editor_property('body_setup')
            if bs_:
                bs_.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
            eal.save_loaded_asset(mesh)
        a = actors.spawn_actor_from_class(unreal.StaticMeshActor, V(0, 0, 0))
        a.set_actor_label(name.replace('_', ' '))
        a.static_mesh_component.set_static_mesh(mesh)
        for i in range(len(mesh.static_materials)):
            a.static_mesh_component.set_material(i, mat)
        if name == 'Terrain_Far':
            a.static_mesh_component.set_cast_shadow(False)
            # far scenery never collides: without its own collision Unreal wraps the whole range in one hull, and the
            # road sits inside it (the crash's car body was trapped there)
            a.static_mesh_component.set_collision_profile_name('NoCollision')

    # The forest: snow-laden spruces (unreal/tools/blender/spruce.py), one instanced actor per variant
    sp_meta = json.load(open(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/spruce.json')))
    sp_mats = {'bark': make_mat('M_SpruceBark', (0.075, 0.07, 0.066), 0.9, instanced=True),
               'needles_top': make_spray_mat('M_SpruceSprayTop', 'T_SpraySnowC', 'T_SpraySnowN'),
               'needles_under': make_spray_mat('M_SpruceSprayUnder', 'T_SprayC', 'T_SprayN'),
               'snow': make_branch_snow_mat()}
    for i, meta in enumerate(sp_meta):
        mesh = import_obj(meta['name'])
        if meta['name'] not in IMPORT_KEPT:
            sme = unreal.get_editor_subsystem(unreal.StaticMeshEditorSubsystem)
            bs = sme.get_lod_build_settings(mesh, 0)
            bs.set_editor_property('recompute_normals', False)   # the cards' normals are bent out of the crown on purpose
            bs.set_editor_property('recompute_tangents', True)
            sme.set_lod_build_settings(mesh, 0, bs)
            eal.save_loaded_asset(mesh)
        order = []
        for sm in mesh.static_materials:
            slot = str(sm.get_editor_property('material_slot_name')).lower()
            order.append(next((m for k, m in sp_mats.items() if slot.startswith(k)), sp_mats['bark']))
        for k, mat in enumerate(order):
            mesh.set_material(k, mat)      # for a spruce placed on its own (the one that stops the crashing car)
        eal.save_loaded_asset(mesh)
        rows = [t for t in data['trees'] if int(t[5]) == i]
        log('%s: %.1f m, %d triangles, %d trees' % (meta['name'], meta['height_cm'] / 100.0, meta['tris'], len(rows)))
        if rows:
            scatter('Spruces %.0f m' % (meta['height_cm'] / 100.0), mesh, order, rows, lambda r: T(r[0], r[1], r[2], r[3], r[4]))

    # The guardrail (unreal/tools/make_roadside.py): galvanised W-beam on I-beam posts with wooden blockouts, snow on
    # its top; smashed through in one place
    steel = make_mat('M_GuardrailSteel', (0.42, 0.43, 0.44), 0.42, metal=1.0, instanced=True)
    wood = make_mat('M_GuardrailBlock', (0.06, 0.045, 0.033), 0.85, instanced=True)
    rail_mats = {'steel': steel, 'wood': wood, 'snow': sp_mats['snow']}
    rail = import_obj('Guardrail')
    a = actors.spawn_actor_from_class(unreal.StaticMeshActor, V(0, 0, 0))
    a.set_actor_label('Guardrail')
    a.tags = [unreal.Name('Guardrail')]   # Part 2's opening: it gives way when the car is shoved through it
    a.static_mesh_component.set_static_mesh(rail)
    for i, sm in enumerate(rail.static_materials):
        a.static_mesh_component.set_material(i, rail_mats.get(str(sm.get_editor_property('material_slot_name')).lower().split('_')[0], steel))
    post = import_obj('GuardPost')
    post_order = [rail_mats.get(str(sm.get_editor_property('material_slot_name')).lower().split('_')[0], steel) for sm in post.static_materials]
    scatter('Guardrail posts', post, post_order, data['posts'], lambda r: T(r[0], r[1], r[2], r[3], 1.0))
    # the stretch the car is shoved through, and its posts: their own actors, torn away by the director at the blow
    brk = import_obj('GuardrailBreak')
    b = actors.spawn_actor_from_class(unreal.StaticMeshActor, V(0, 0, 0))
    b.set_actor_label('Guardrail (breaks)')
    b.tags = [unreal.Name('Guardrail'), unreal.Name('GuardrailBreak')]
    b.static_mesh_component.set_static_mesh(brk)
    for i, sm in enumerate(brk.static_materials):
        b.static_mesh_component.set_material(i, rail_mats.get(str(sm.get_editor_property('material_slot_name')).lower().split('_')[0], steel))
    if data.get('break_posts'):
        bp = scatter('Guardrail posts (break)', post, post_order, data['break_posts'], lambda r: T(r[0], r[1], r[2], r[3], 1.0))
        bp.tags = [unreal.Name('GuardrailBreak')]
    # the tracks of whatever went over at the smashed gap: two ruts from the road's edge out over the drop, angled
    # down the slope (a decal, so they lie on the snow wherever it falls away)
    gap = data.get('gap')
    if gap:
        tracks_mat = make_tracks_mat()
        import math
        t = math.radians(gap['yaw'])
        road = (math.cos(t), math.sin(t))
        valley = (-math.sin(t), math.cos(t))
        a35 = math.radians(35)
        dx, dy = math.cos(a35) * road[0] + math.sin(a35) * valley[0], math.cos(a35) * road[1] + math.sin(a35) * valley[1]
        at = gap['at']
        d = actors.spawn_actor_from_class(unreal.DecalActor, V(at[0] + dx * 100, at[1] + dy * 100, at[2] + 50),
                                          unreal.Rotator(pitch=-90.0, yaw=math.degrees(math.atan2(dy, dx)), roll=0.0))
        d.set_actor_label('Tyre tracks over the edge')
        d.decal.set_decal_material(tracks_mat)
        d.decal.set_editor_property('decal_size', V(300, 110, 380))
        log('tyre tracks at the gap: %.0f m along the road' % gap['s'])

    # snow poles: orange fibreglass stakes, 2 m, a reflective band near the top that catches the headlights
    pole = make_mat('M_SnowPole', (0.55, 0.13, 0.012), 0.45, instanced=True)
    tip = make_mat('M_SnowPoleReflector', (0.8, 0.8, 0.78), 0.2, emissive=(0.05, 0.05, 0.048), instanced=True)
    scatter('Snow poles', MESH['Cylinder'], [pole], data['poles'], lambda r: T(r[0], r[1], r[2] + 100, r[3], 0.032, 0.032, 2.0))
    scatter('Snow pole reflectors', MESH['Cylinder'], [tip], data['poles'], lambda r: T(r[0], r[1], r[2] + 178, r[3], 0.036, 0.036, 0.16))
    return data


# ---------- the car ----------
CAR = '/Game/HollowAcre/Car'


def detail_mat(name, color, rough, normal_tex, tiling=1.0, metal=0.0, clearcoat=False, emissive_tex=None, emissive=0.0,
               two_sided=False, base_tex=None):
    """A surface with a tiling detail normal map (grain, leather, fabric), optionally lit by a glow texture."""
    m = new_material(name, two_sided=two_sided)
    if clearcoat:
        m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_CLEAR_COAT)
    if base_tex:
        mel.connect_material_property(tex_sample(m, base_tex, 1.0, -500, -200), 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    else:
        k = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -500, -200)
        k.set_editor_property('constant', unreal.LinearColor(*color, 1))
        mel.connect_material_property(k, '', unreal.MaterialProperty.MP_BASE_COLOR)
    for val, prop, y in [(rough, unreal.MaterialProperty.MP_ROUGHNESS, 0), (metal, unreal.MaterialProperty.MP_METALLIC, 100)]:
        c = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -500, y)
        c.set_editor_property('r', val)
        mel.connect_material_property(c, '', prop)
    if normal_tex:
        mel.connect_material_property(tex_sample(m, normal_tex, tiling, -500, 250, normal=True), 'RGB', unreal.MaterialProperty.MP_NORMAL)
    if emissive_tex:
        ts = tex_sample(m, emissive_tex, 1.0, -800, 450)
        mel.connect_material_property(ts, 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
        glow = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -500, 450)
        mel.connect_material_expressions(ts, 'RGB', glow, 'A')
        mel.connect_material_expressions(ts, 'A', glow, 'B')
        g2 = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -300, 450)
        g2.set_editor_property('const_b', emissive)
        mel.connect_material_expressions(glow, '', g2, 'A')
        mel.connect_material_property(g2, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    if clearcoat:
        for val, prop, y in [(1.0, unreal.MaterialProperty.MP_CUSTOM_DATA0, 600), (0.05, unreal.MaterialProperty.MP_CUSTOM_DATA1, 700)]:
            c = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -500, y)
            c.set_editor_property('r', val)
            mel.connect_material_property(c, '', prop)
    return finish(m)


def make_tracks_mat():
    """M_TyreTracks: a decal of packed snow in two tread ruts (SourceArt/T_TyreTracks.png, its alpha the ruts)."""
    tex = import_tex('T_TyreTracks')
    path = f'{MATS}/M_TyreTracks'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_TyreTracks', MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('material_domain', unreal.MaterialDomain.MD_DEFERRED_DECAL)
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    ts = tex_sample(m, tex, 1.0, -400, 0)
    mel.connect_material_property(ts, 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    mel.connect_material_property(ts, 'A', unreal.MaterialProperty.MP_OPACITY)
    k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, 250)
    k.set_editor_property('r', 0.7)
    mel.connect_material_property(k, '', unreal.MaterialProperty.MP_ROUGHNESS)
    return finish(m)


def make_glove_mat():
    """M_DriverGloves: the driver's arms (the player, the farmer from Part 1) dressed for the mountain in winter: black
    leather driving gloves over the hands and up the wrist (SourceArt/T_HandMask.png, made by tools/blender/hand_mask.py),
    and above them the sleeves of the farmer's flannel shirt: T_Plaid (tools/make_plaid_tex.py) tinted ShirtColor, Part 1's
    default red (#b8402c) until the game passes the save's own."""
    mask = import_tex('T_HandMask')
    mask.set_editor_property('srgb', False)
    eal.save_loaded_asset(mask)
    path = f'{MATS}/M_DriverGloves'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_DriverGloves', MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_skeletal_mesh', True)
    k = tex_sample(m, mask, 1.0, -900, 0)
    k.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
    glove = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -700, 150)
    glove.set_editor_property('constant', unreal.LinearColor(0.028, 0.022, 0.018, 1))
    plaid = tex_sample(m, import_tex('T_Plaid'), 6.0, -1100, 250)
    shirt = mel.create_material_expression(m, unreal.MaterialExpressionVectorParameter, -1100, 450)
    shirt.set_editor_property('parameter_name', 'ShirtColor')
    shirt.set_editor_property('default_value', unreal.LinearColor(0.479, 0.051, 0.025, 1))    # #b8402c, linear
    sleeve = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -800, 250)
    mel.connect_material_expressions(plaid, 'R', sleeve, 'A')
    mel.connect_material_expressions(shirt, '', sleeve, 'B')
    mel.connect_material_property(lerp(m, sleeve, '', glove, '', k, -400, 150), '', unreal.MaterialProperty.MP_BASE_COLOR)
    r_g = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -700, 400)
    r_g.set_editor_property('r', 0.42)
    r_s = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -700, 470)
    r_s.set_editor_property('r', 0.9)
    mel.connect_material_property(lerp(m, r_s, '', r_g, '', k, -400, 400), '', unreal.MaterialProperty.MP_ROUGHNESS)
    leather = tex_sample(m, unreal.load_asset('/Game/HollowAcre/Textures/T_LeatherN'), 10.0, -700, 600, normal=True)
    fabric = tex_sample(m, unreal.load_asset('/Game/HollowAcre/Textures/T_FabricN'), 14.0, -700, 800, normal=True)
    mel.connect_material_property(lerp(m, fabric, 'RGB', leather, 'RGB', k, -400, 650), '', unreal.MaterialProperty.MP_NORMAL)
    return finish(m)


def make_letter_mat():
    """M_Letter: Kessler's letter on the passenger seat (SourceArt/T_Letter.png, tools/make_letter_tex.py)."""
    tex = import_tex('T_Letter')
    path = f'{MATS}/M_Letter'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_Letter', MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('two_sided', True)
    ts = tex_sample(m, tex, 1.0, -400, 0)
    mel.connect_material_property(ts, 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
    k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -400, 250)
    k.set_editor_property('r', 0.85)
    mel.connect_material_property(k, '', unreal.MaterialProperty.MP_ROUGHNESS)
    return finish(m)


def make_eyeshine_mat():
    """M_EyeShine: eyes in the dark catching the headlights (unlit, pale)."""
    path = f'{MATS}/M_EyeShine'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset('M_EyeShine', MATS, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
    e = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -400, 0)
    e.set_editor_property('constant', unreal.LinearColor(2.2, 2.6, 2.4, 1))
    mel.connect_material_property(e, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    return finish(m)


def make_side_glass_mat():
    """The side windows: faint clear glass; 'Gone' (0-1) breaks them out (tempered glass bursts into pebbles at once)."""
    m = new_material('M_Car_SideGlass')
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('two_sided', True)
    m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
    gone = mel.create_material_expression(m, unreal.MaterialExpressionScalarParameter, -500, 0)
    gone.set_editor_property('parameter_name', 'Gone')
    gone.set_editor_property('default_value', 0.0)
    mel.connect_material_property(scaled_add(m, gone, '', -0.06, 0.06, -300, 0), '', unreal.MaterialProperty.MP_OPACITY)
    return finish(m)


def make_outer_glass_mat():
    """Car glass seen from outside: dark, glossy, reflecting the lights; one-sided so it never dims the driver's view."""
    m = new_material('M_Car_OuterGlass')
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('two_sided', False)
    m.set_editor_property('translucency_lighting_mode', unreal.TranslucencyLightingMode.TLM_SURFACE)
    for val, prop in ((0.62, unreal.MaterialProperty.MP_OPACITY), (0.04, unreal.MaterialProperty.MP_ROUGHNESS),
                      (1.0, unreal.MaterialProperty.MP_SPECULAR)):
        k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -300, 0)
        k.set_editor_property('r', val)
        mel.connect_material_property(k, '', prop)
    c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -300, -150)
    c.set_editor_property('constant', unreal.LinearColor(0.008, 0.010, 0.013, 1))
    mel.connect_material_property(c, '', unreal.MaterialProperty.MP_BASE_COLOR)
    return finish(m)


def car_paint_mat(name, color=None, base_tex=None, normal_tex=None, normal_tiling=1.0, rough=0.3, coat=0.8):
    """Car paint: a base colour (with roughness in the texture's alpha: dull where it is dirty), a clear coat on top
    (glossy, thinner where the paint is dirty), and a fine orange-peel normal. Falls back to plain paint if the
    clear-coat setup isn't available."""
    m = new_material(name)
    try:
        m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_CLEAR_COAT)
        m.set_editor_property('use_material_attributes', True)
        mma = mel.create_material_expression(m, unreal.MaterialExpressionMakeMaterialAttributes, -150, 0)
        ok = []
        if base_tex:
            ts = tex_sample(m, base_tex, 1.0, -900, -250)
            ok.append(mel.connect_material_expressions(ts, 'RGB', mma, 'BaseColor'))
            ok.append(mel.connect_material_expressions(ts, 'A', mma, 'Roughness'))
            cc = scaled_add(m, ts, 'A', -1.3, 1.15, -650, 150)
            sat = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, -300, 150)
            mel.connect_material_expressions(cc, '', sat, '')
            ccm = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -250, 220)
            ccm.set_editor_property('const_b', coat)
            mel.connect_material_expressions(sat, '', ccm, 'A')
            ok.append(mel.connect_material_expressions(ccm, '', mma, 'ClearCoat'))
            ok.append(mel.connect_material_expressions(scaled_add(m, ts, 'A', 0.35, 0.04, -650, 320), '', mma, 'ClearCoatRoughness'))
        else:
            k = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -500, -250)
            k.set_editor_property('constant', unreal.LinearColor(*color, 1))
            ok.append(mel.connect_material_expressions(k, '', mma, 'BaseColor'))
            for val, pin, y in ((rough, 'Roughness', 0), (coat, 'ClearCoat', 150), (0.08, 'ClearCoatRoughness', 300)):
                c = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -500, y)
                c.set_editor_property('r', val)
                ok.append(mel.connect_material_expressions(c, '', mma, pin))
        if normal_tex:
            ok.append(mel.connect_material_expressions(tex_sample(m, normal_tex, normal_tiling, -900, 500, normal=True), 'RGB', mma, 'Normal'))
        ok.append(mel.connect_material_property(mma, '', unreal.MaterialProperty.MP_MATERIAL_ATTRIBUTES))
        if not all(ok):
            raise RuntimeError('a clear-coat pin did not connect: %s' % ok)
        log('%s: clear-coat car paint' % name)
        return finish(m)
    except Exception as e:   # plain paint as a fallback
        log('%s: clear coat unavailable (%s); plain paint' % (name, e))
        return detail_mat(name, color or (0, 0, 0), rough, normal_tex, normal_tiling, base_tex=base_tex)


def make_lamp_lens_mat():
    """Clear lamp glass over the reflector: mostly see-through, very glossy, catches the light on its flutes."""
    m = new_material('M_Car_LampLens')
    m.set_editor_property('blend_mode', unreal.BlendMode.BLEND_TRANSLUCENT)
    m.set_editor_property('two_sided', False)
    m.set_editor_property('translucency_lighting_mode', unreal.TranslucencyLightingMode.TLM_SURFACE)
    for val, prop in ((0.2, unreal.MaterialProperty.MP_OPACITY), (0.03, unreal.MaterialProperty.MP_ROUGHNESS),
                      (1.0, unreal.MaterialProperty.MP_SPECULAR)):
        k = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -300, 0)
        k.set_editor_property('r', val)
        mel.connect_material_property(k, '', prop)
    c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -300, -150)
    c.set_editor_property('constant', unreal.LinearColor(0.8, 0.82, 0.85, 1))
    mel.connect_material_property(c, '', unreal.MaterialProperty.MP_BASE_COLOR)
    return finish(m)


def build_car(windshield):
    """Import the generated car and glass, give every surface its material; returns the actors to attach to the car."""
    grain, leather, fabric = import_normal('T_GrainN'), import_normal('T_LeatherN'), import_normal('T_FabricN')
    paint_n = import_normal('T_PaintN')
    gauges_tex = import_tex('T_Gauges')
    mats = {
        'dash': detail_mat('M_Car_Dash', (0.022, 0.022, 0.024), 0.62, grain, 3.0),
        'hub': detail_mat('M_Car_Hub', (0.016, 0.016, 0.017), 0.8, None),   # matte padded vinyl (no grain: the pad's projection stretched it)
        'cluster': detail_mat('M_Car_ClusterFace', (0.01, 0.011, 0.013), 0.5, None),
        'gauges': detail_mat('M_Car_Gauges', (0.01, 0.01, 0.01), 0.35, None, emissive_tex=gauges_tex, emissive=GAUGE_GLOW),
        'needle': make_mat('M_Car_Needle', (0.5, 0.06, 0.05), 0.4, emissive=(0.35, 0.04, 0.03)),
        'vent': detail_mat('M_Car_Vent', (0.008, 0.008, 0.009), 0.7, None),
        'radio': detail_mat('M_Car_Radio', (0.012, 0.012, 0.014), 0.3, None),
        'knob': detail_mat('M_Car_Knob', (0.03, 0.03, 0.032), 0.45, grain, 2.0),
        'hazard': make_mat('M_Car_Hazard', (0.35, 0.03, 0.03), 0.4),
        'leather': detail_mat('M_Car_Leather', (0.036, 0.033, 0.031), 0.55, leather, 2.0),   # worn black wheel leather: real black leather still shows a sheen
        'trim': detail_mat('M_Car_PillarTrim', (0.045, 0.044, 0.042), 0.85, fabric, 1.5),
        'headliner': detail_mat('M_Car_Headliner', (0.09, 0.088, 0.083), 0.95, fabric, 1.5),
        'door': detail_mat('M_Car_Door', (0.026, 0.025, 0.025), 0.7, grain, 3.0),
        'chrome': make_mat('M_Car_Chrome', (0.62, 0.62, 0.64), 0.12, metal=1.0),
        'mirror': make_mat('M_Car_Mirror', (0.9, 0.9, 0.9), 0.03, metal=1.0),
        'paint': car_paint_mat('M_Car_PaintRed', color=(0.17, 0.016, 0.019), normal_tex=paint_n, normal_tiling=0.8, rough=0.3),   # the pixel car's #7a2428 red, faded
        'hoodpaint': car_paint_mat('M_Car_HoodPaint', base_tex=import_tex('T_HoodPaint'), normal_tex=import_normal('T_HoodPaintN'), coat=0.6),
        'blackplastic': detail_mat('M_Car_BlackPlastic', (0.012, 0.012, 0.013), 0.55, grain, 2.0),
        'primer': detail_mat('M_Car_DoorPrimer', (0.25, 0.255, 0.245), 0.88, grain, 0.5),   # the grey patch on the passenger door
        'primer2': detail_mat('M_Car_FenderPrimer', (0.21, 0.215, 0.205), 0.9, grain, 0.5),
        'cowl': detail_mat('M_Car_Cowl', (0.015, 0.015, 0.016), 0.6, grain, 1.0),
        'rubber': make_mat('M_Car_Rubber', (0.012, 0.012, 0.012), 0.75),
        'bodypaint': car_paint_mat('M_Car_BodyPaint', base_tex=import_tex('T_BodyPaint'), normal_tex=paint_n, normal_tiling=4.0),
        'bumper': detail_mat('M_Car_Bumper', (0.22, 0.225, 0.235), 0.5, grain, 5.0, metal=0.4),   # silver-grey textured plastic
        'headlamp': make_mat('M_Car_Headlamp', (0.85, 0.86, 0.88), 0.12, metal=1.0, emissive=(0.7, 0.72, 0.78)),   # lit reflector bowl
        'taillamp': make_mat('M_Car_Taillamp', (0.4, 0.02, 0.02), 0.2, emissive=(0.8, 0.02, 0.02)),
        'grille': make_mat('M_Car_Grille', (0.05, 0.05, 0.055), 0.5, metal=0.3),
        'tyre': detail_mat('M_Car_Tyre', (0.016, 0.016, 0.016), 0.9, grain, 6.0),
        'steelwheel': make_mat('M_Car_SteelWheel', (0.03, 0.03, 0.03), 0.5, metal=0.4),
        'wood': detail_mat('M_Car_Wood', (0, 0, 0), 0.35, None, base_tex=import_tex('T_Wood')),
        'clockface': detail_mat('M_Car_Clock', (0.01, 0.01, 0.01), 0.3, None, emissive_tex=import_tex('T_Clock'), emissive=GAUGE_GLOW * 0.6),
        'display': make_mat('M_Car_RadioDisplay', (0.01, 0.02, 0.025), 0.2, emissive=(0.02, 0.09, 0.11)),
        'switch': detail_mat('M_Car_Switch', (0.02, 0.02, 0.022), 0.4, grain, 3.0),
        'amberlens': make_mat('M_Car_AmberLens', (0.32, 0.1, 0.008), 0.22, spec=0.7),
        'gap': make_mat('M_Car_PanelGap', (0.004, 0.004, 0.004), 0.8),
        'lamplens': make_lamp_lens_mat(),
        'dashtop': detail_mat('M_Car_DashTop', (0.022, 0.022, 0.024), 0.78, leather, 3.0),   # padded vinyl, pebble grain
        'climatestrip': detail_mat('M_Car_ClimateStrip', (0, 0, 0), 0.45, None, emissive_tex=import_tex('T_ClimateStrip'), emissive=GAUGE_GLOW * 0.5),
        'climate_mark': make_mat('M_Car_ClimateMark', (0.6, 0.25, 0.05), 0.4, emissive=(0.25, 0.08, 0.015)),
        'climate': detail_mat('M_Car_Climate', (0, 0, 0), 0.45, None, emissive_tex=import_tex('T_Climate'), emissive=GAUGE_GLOW * 0.4),
        'radiofront': detail_mat('M_Car_RadioFront', (0, 0, 0), 0.35, None, emissive_tex=import_tex('T_Radio'), emissive=GAUGE_GLOW * 0.6),
        'warnstrip': detail_mat('M_Car_WarnStrip', (0, 0, 0), 0.35, None, emissive_tex=import_tex('T_WarnStrip'), emissive=GAUGE_GLOW * 0.5),
        'seat': detail_mat('M_Car_Seat', (0.034, 0.032, 0.03), 0.88, fabric, 2.0),
        'carpet': detail_mat('M_Car_Carpet', (0.018, 0.017, 0.016), 0.95, fabric, 4.0),
        'windshield': windshield,
        'sideglass': make_side_glass_mat(),
        'extglass': make_outer_glass_mat(),
    }
    out = []
    if eal.does_directory_exist(CAR):   # clear earlier imports (an older run split the car into many meshes)
        eal.delete_directory(CAR)
    # the cabin's collision field for the driver's arms (baked by tools/blender/cabin_sdf.py with the car), kept with the
    # project so a fresh checkout has it: DriverArms loads Data/CabinSDF.bin
    sdf = unreal.Paths.project_saved_dir() + 'Generated/CabinSDF.bin'
    if os.path.exists(sdf):
        os.makedirs(unreal.Paths.project_dir() + 'Data', exist_ok=True)
        shutil.copyfile(sdf, unreal.Paths.project_dir() + 'Data/CabinSDF.bin')
        log('cabin collision field copied')
    wheel_actor = None
    MOVING['wipers'] = []
    for name in ('Car', 'Car_Glass', 'Car_Wheel', 'Car_Wiper0', 'Car_Wiper1'):
        mesh = import_obj(name, CAR)
        # keep Blender's smooth (weighted) normals: Unreal's default recomputes them from the unwelded triangles,
        # which flat-shades every curve (rim, pad, panels) into visible facets
        sme = unreal.get_editor_subsystem(unreal.StaticMeshEditorSubsystem)
        bs = sme.get_lod_build_settings(mesh, 0)
        bs.set_editor_property('recompute_normals', False)
        bs.set_editor_property('recompute_tangents', True)
        bs.set_editor_property('use_high_precision_tangent_basis', True)   # smoother reflections on paint and glass
        bs.set_editor_property('use_full_precision_u_vs', True)            # crisp dial and switch graphics
        sme.set_lod_build_settings(mesh, 0, bs)
        eal.save_loaded_asset(mesh)
        if name == 'Car_Glass':  # translucent glass can't render through Nanite
            ns = mesh.get_editor_property('nanite_settings')
            ns.set_editor_property('enabled', False)
            mesh.set_editor_property('nanite_settings', ns)
            eal.save_loaded_asset(mesh)
        # the steering wheel is modelled about its own centre (car_interior.py), so it turns about it
        # moving parts are modelled about their own pivots (car_interior.py WHEEL_C, WIPER_PIVOTS)
        pivot = {'Car_Wheel': V(55, 0, 86), 'Car_Wiper0': V(103.5, YC_CAR - 18, 97.0), 'Car_Wiper1': V(103.5, YC_CAR + 34, 97.0)}
        a = actors.spawn_actor_from_class(unreal.StaticMeshActor, pivot.get(name, V(0, 0, 0)))
        a.set_actor_label(name.replace('_', ' '))
        if name == 'Car_Wheel':
            wheel_actor = a
        if name.startswith('Car_Wiper'):
            MOVING['wipers'].append(a)
        comp = a.static_mesh_component
        comp.set_static_mesh(mesh)
        missing = []
        for i, sm in enumerate(mesh.static_materials):
            slot = str(sm.get_editor_property('material_slot_name')).lower()
            key = next((k for k in sorted(mats, key=len, reverse=True) if slot.startswith(k)), None)
            if key:
                comp.set_material(i, mats[key])
            else:
                missing.append(slot)
        log('%s: %d slots%s' % (name, len(mesh.static_materials), ('; no material for %s' % missing) if missing else ''))
        if name == 'Car_Glass':
            comp.set_cast_shadow(False)
        out.append(a)
    # the driver's arms: the player's MetaHuman body (built in Content/HollowAcre/Driver), posed at 10 and 2 in C++
    body = unreal.load_asset('/Game/HollowAcre/Driver/Built/Driver/Body/SKM_MHC_Driver_BodyMesh')
    if body:
        arms = actors.spawn_actor_from_class(unreal.DriverArms, V(0, 0, 0))
        arms.set_actor_label('Driver Arms')
        arms.set_editor_property('body', body)
        if wheel_actor:
            arms.set_editor_property('wheel_actor', wheel_actor)   # the drive steers: the wheel and the hands turn
        out.append(arms)
        log('driver arms: MetaHuman body %s' % body.get_name())
    else:
        log('driver arms: no MetaHuman body built yet')
    if WORK_LIGHT:   # debug only: light the model to judge it
        if os.environ.get('HA_CAM_POS'):
            # outside views: a key light high and to one side (so curves and paint read), a soft fill from the camera
            cam = V(*[float(c) for c in os.environ['HA_CAM_POS'].split(',')])
            centre = V(30, YC_CAR, 70)
            d = cam - centre
            a = math.radians(55)
            key_at = centre + V((d.x * math.cos(a) - d.y * math.sin(a)) * 0.9, (d.x * math.sin(a) + d.y * math.cos(a)) * 0.9, 260)
            for at, k in ((key_at, 1.0), (cam + V(0, 0, 80), 0.22)):
                wl = actors.spawn_actor_from_class(unreal.PointLight, at)
                wl.point_light_component.set_intensity(WORK_LIGHT * k)
                wl.point_light_component.set_editor_property('attenuation_radius', 3000.0)
                out.append(wl)
        else:
            wl = actors.spawn_actor_from_class(unreal.PointLight, V(-20, 20, 130))
            wl.point_light_component.set_intensity(WORK_LIGHT)
            wl.point_light_component.set_editor_property('attenuation_radius', 600.0)
            out.append(wl)
    return out


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
MOVING = {}  # the car's moving parts, for the director (wipers)


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

    windshield = make_windshield_mat()

    # The mountain (unreal/tools/make_mountain.py): the climbing road, cliff, drop, peaks, pines, poles, guardrail
    mountain = build_mountain()

    # The car (unreal/tools/make_car.py): interior, steering wheel, hood and glass, our own model
    car_parts = build_car(windshield)

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
        hl = actors.spawn_actor_from_class(unreal.SpotLight, V(257, YC_CAR + side * 53, 66), unreal.Rotator(pitch=-3, yaw=side * 2))
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

    # the dials' spill: just in front of the dial faces, under the cluster hood (it used to sit by the wheel and
    # floodlit the rim and the hub); faint enough that only the thumbs and the rim's front catch it
    dash = actors.spawn_actor_from_class(unreal.PointLight, V(77, 0, 96))
    dash.set_actor_label('Gauge glow')
    dc = dash.point_light_component
    dc.set_editor_property('intensity_units', unreal.LightUnits.CANDELAS)
    dc.set_intensity(0.03)
    dc.set_light_color(unreal.LinearColor(0.45, 0.85, 1.0, 1))
    dc.set_editor_property('attenuation_radius', 45.0)
    dc.set_editor_property('source_radius', 10.0)
    dc.set_editor_property('volumetric_scattering_intensity', 0.0)
    car_parts.append(dash)
    # the headlit snow ahead throws a faint cool light back through the windshield: enough to make out the hands on
    # the wheel and the top of the dash, never enough to read the cabin
    bounce = actors.spawn_actor_from_class(unreal.RectLight, V(48, 12, 113), unreal.Rotator(pitch=-18, yaw=180))
    bounce.set_actor_label('Snow bounce')
    bc = bounce.rect_light_component
    bc.set_editor_property('intensity_units', unreal.LightUnits.CANDELAS)
    bc.set_intensity(SNOW_BOUNCE)
    bc.set_light_color(unreal.LinearColor(0.72, 0.8, 1.0, 1))
    bc.set_editor_property('source_width', 90.0)
    bc.set_editor_property('source_height', 25.0)
    bc.set_editor_property('barn_door_angle', 60.0)
    bc.set_editor_property('attenuation_radius', 160.0)
    bc.set_editor_property('volumetric_scattering_intensity', 0.0)
    car_parts.append(bounce)

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
    cam_at = V(*[float(c) for c in os.environ['HA_CAM_POS'].split(',')]) if os.environ.get('HA_CAM_POS') else EYE  # debug: outside views
    cam = actors.spawn_actor_from_class(unreal.CameraActor, cam_at, unreal.Rotator(pitch=-8 + CAM_DEBUG_PITCH, yaw=CAM_DEBUG_YAW))
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
    director.set_editor_property('wipers', MOVING.get('wipers', []))   # they sweep through the drive
    # the drive's sound (unreal/tools/make_ending_audio.py), timed to this scene from its first frame
    snd_src = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir() + 'SourceArt/Audio/Ending_Drive.wav')
    if os.path.exists(snd_src):
        task = unreal.AssetImportTask()
        task.set_editor_property('filename', snd_src)
        task.set_editor_property('destination_path', '/Game/HollowAcre/Audio')
        task.set_editor_property('destination_name', 'Ending_Drive')
        task.set_editor_property('replace_existing', True)
        task.set_editor_property('automated', True)
        task.set_editor_property('save', True)
        tools.import_asset_tasks([task])
        snd = unreal.load_asset('/Game/HollowAcre/Audio/Ending_Drive')
        if snd:
            director.set_editor_property('drive_sound', snd)
            log('drive sound: %.1f s' % snd.get_editor_property('duration'))
    path = [V(*p) for p in mountain['path']]
    director.set_editor_property('path', path)
    # Part 2's opening (-crash): the drive picks up about 330 m before the crash point (at 35 km/h for 31.35 s, braking
    # at 4 m/s2, creeping), so the car passes the old gap in the rail and is hit at the crash point;
    # the big spruce below stops it (the director stands it on the ground there, with a trunk the car's body hits)
    crash = mountain.get('crash')
    director.set_editor_property('granule_material', make_mat('M_GlassGranule', (0.1, 0.125, 0.118), 0.03, spec=1.0, instanced=True))
    director.set_editor_property('glove_material', make_glove_mat())
    director.set_editor_property('eye_shine_material', make_eyeshine_mat())
    director.set_editor_property('letter_material', make_letter_mat())
    if crash:
        # 31.35 s of the drive before the brakes (the letter, the gap, the eyes in the trees), then as before
        director.set_editor_property('start_distance', crash['start_cm'] - 13470.0 - 19444.0)
        if crash.get('stop_tree'):     # (the car used to be stopped by a spruce near the road; it now falls to the valley)
            st = crash['stop_tree']
            director.set_editor_property('stop_tree_at', V(st[0], st[1], st[2]))
            director.set_editor_property('stop_tree_mesh', unreal.load_asset(MTN + '/Spruce_Stop'))
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
