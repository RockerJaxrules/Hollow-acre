"""Import the frozen husk (tools/blender/husk_body.py: Saved/Generated/Husk/HuskBody.fbx) into
/Game/HollowAcre/Creature/HuskGame: its stretched body with the claws and frozen hair, its skeleton and takes, and its
materials:
  M_HuskSkin      the MetaHuman body's own skin detail (colour, normal), drained grey-blue, blackened by frostbite and
                  whitened by rime where the vertex colours say (red, green)
  M_HuskFaceSkin  the same for the face (the MetaHuman face mesh is the husk's face)
  M_HuskHair      frozen matted hair cards (T_HuskHair), M_HuskClaw black horn, M_HuskEye milky and wet,
  M_HuskFang      old yellowed teeth, M_HuskMouth the dark wet inside, M_HuskHide (for the face's own teeth and lashes)
Run on its own: UnrealEditor <uproject> -ExecutePythonScript=<this file> -unattended."""
import json

import unreal

DEST = '/Game/HollowAcre/Creature/HuskGame'
MH = '/Game/HollowAcre/Creature/Husk/Built/Husk'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()
MP = unreal.MaterialProperty


def log(*a):
    unreal.log('[huski] ' + ' '.join(str(x) for x in a))


def new_mat(name, skeletal=True, two_sided=False, blend=None):
    path = f'{DEST}/{name}'
    if eal.does_asset_exist(path):
        eal.delete_asset(path)
    m = tools.create_asset(name, DEST, unreal.Material, unreal.MaterialFactoryNew())
    m.set_editor_property('used_with_skeletal_mesh', skeletal)
    m.set_editor_property('used_with_static_lighting', False)
    m.set_editor_property('two_sided', two_sided)
    if blend:
        m.set_editor_property('blend_mode', blend)
    return m


def const(m, v, x, y):
    if isinstance(v, (tuple, list)):
        c = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, x, y)
        c.set_editor_property('constant', unreal.LinearColor(*v, 1))
    else:
        c = mel.create_material_expression(m, unreal.MaterialExpressionConstant, x, y)
        c.set_editor_property('r', v)
    return c


def tex(m, path, x, y, kind='color'):
    t = mel.create_material_expression(m, unreal.MaterialExpressionTextureSample, x, y)
    asset = unreal.load_asset(path)
    t.set_editor_property('texture', asset)
    vt = getattr(asset, 'virtual_texture_streaming', False) if asset else False
    try:
        vt = asset.get_editor_property('virtual_texture_streaming')
    except Exception:
        pass
    st = unreal.MaterialSamplerType
    if kind == 'normal':
        t.set_editor_property('sampler_type', st.SAMPLERTYPE_VIRTUAL_NORMAL if vt else st.SAMPLERTYPE_NORMAL)
    elif kind == 'linear':
        t.set_editor_property('sampler_type', st.SAMPLERTYPE_VIRTUAL_LINEAR_COLOR if vt else st.SAMPLERTYPE_LINEAR_COLOR)
    else:
        t.set_editor_property('sampler_type', st.SAMPLERTYPE_VIRTUAL_COLOR if vt else st.SAMPLERTYPE_COLOR)
    return t


def link(a, ao, b, bi):
    mel.connect_material_expressions(a, ao, b, bi)


def lerp(m, a, ao, b, bo, alpha, alo, x, y):
    l = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, x, y)
    link(a, ao, l, 'A')
    link(b, bo, l, 'B')
    link(alpha, alo, l, 'Alpha')
    return l


BLOOD_THIN = (0.05, 0.011, 0.009)          # thin, dried brown-red smears (linear)
BLOOD_THICK = (0.02, 0.005, 0.004)         # thick, frozen near-black maroon


def blood_over(m, base, bo, amount, ao, x, y):
    """Lerp base toward old frozen blood by amount (thin where low, thick where high)."""
    col = lerp(m, const(m, BLOOD_THIN, x - 200, y + 120), '', const(m, BLOOD_THICK, x - 200, y + 200), '', amount, ao, x - 100, y + 120)
    k = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, x - 100, y + 260)
    link(amount, ao, k, 'A')
    link(const(m, 1.6, x - 250, y + 300), '', k, 'B')
    sat = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, x - 20, y + 260)
    link(k, '', sat, '')
    return lerp(m, base, bo, col, '', sat, '', x, y), sat


FRESH = (0.15, 0.007, 0.005)               # fresh wet blood running over the old (linear)
RUNS_HLSL = r"""
// fresh blood running down over its old blood (the owner: blood is a liquid; on it, never static): the body is cut into
// thin lanes running down it (in the world, so they run with gravity however it is turned); in some lanes a run crawls
// down at its own pace, longer behind its tip; only where its blood is (M)
float2 h = float2(dot(WP.xy, float2(0.71, 0.71)), dot(WP.xy, float2(-0.71, 0.71)));
float c = h.x / 1.15;
float cell = floor(c);
float r = frac(sin(cell * 12.9898) * 43758.5453);
float r2 = frac(sin(cell * 78.233 + 1.7) * 12345.678);
float w = abs(frac(c) - 0.5) * 2.0;
float lane = saturate(1.0 - w / (0.2 + 0.3 * r2));
float z = WP.z * 0.045 + T * (0.1 + 0.2 * r) + r * 9.0;
float head = frac(z);
float run = smoothstep(0.0, 0.8, head) * (1.0 - smoothstep(0.93, 1.0, head));
float on = step(0.18, r);
return saturate(lane * run * on * M * 2.6);
"""


def fresh_runs(m, last, lo, rough, mask, x, y):
    """Fresh, wet blood running down over the old where its blood is: returns the colour and roughness with it."""
    wp = mel.create_material_expression(m, unreal.MaterialExpressionWorldPosition, x - 700, y + 750)
    tm = mel.create_material_expression(m, unreal.MaterialExpressionTime, x - 700, y + 830)
    cu = mel.create_material_expression(m, unreal.MaterialExpressionCustom, x - 450, y + 760)
    cu.set_editor_property('code', RUNS_HLSL)
    cu.set_editor_property('output_type', unreal.CustomMaterialOutputType.CMOT_FLOAT1)
    ins = []
    for n_ in ('WP', 'T', 'M'):
        ci = unreal.CustomInput()
        ci.set_editor_property('input_name', n_)
        ins.append(ci)
    cu.set_editor_property('inputs', ins)
    link(wp, '', cu, 'WP')
    link(tm, '', cu, 'T')
    link(mask, '', cu, 'M')
    col = lerp(m, last, lo, const(m, FRESH, x - 250, y + 680), '', cu, '', x - 100, y + 620)
    r2 = lerp(m, rough, '', const(m, 0.05, x - 250, y + 900), '', cu, '', x - 100, y + 880)
    return col, r2


def skin_material(name, bc, nrm, frost=True, gain=1.0, bite_mask=None):
    """MetaHuman skin detail drained to the husk's grey-blue, frostbite black and rime white by vertex colour
    (gain evens out the face's skin, a little lighter than the body's). bite_mask (a texture in the mesh's UVs, red):
    frostbite by texture instead, bruised purple where it is about half, dead black at full."""
    m = new_mat(name)
    c = tex(m, bc, -1400, 0)
    d = mel.create_material_expression(m, unreal.MaterialExpressionDesaturation, -1150, 0)
    link(c, 'RGB', d, '')
    frac = const(m, 0.8, -1350, 120)
    link(frac, '', d, 'Fraction')
    tint = const(m, (0.62 * gain, 0.68 * gain, 0.8 * gain), -1150, 150)
    mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -950, 0)
    link(d, '', mul, 'A')
    link(tint, '', mul, 'B')
    last, lo = mul, ''
    rough = const(m, 0.5, -500, 450)
    if frost:
        vc = mel.create_material_expression(m, unreal.MaterialExpressionVertexColor, -950, 300)
        bite = lerp(m, last, lo, const(m, (0.018, 0.012, 0.018), -950, 220), '', vc, 'R', -750, 0)
        rime = lerp(m, bite, '', const(m, (0.72, 0.77, 0.83), -750, 220), '', vc, 'G', -550, 0)
        bl, bk = blood_over(m, rime, '', vc, 'B', -400, 0)
        last, lo = bl, ''
        rough = lerp(m, const(m, 0.48, -750, 450), '', const(m, 0.8, -750, 520), '', vc, 'G', -550, 450)
        rough = lerp(m, rough, '', const(m, 0.3, -450, 560), '', bk, '', -300, 450)
        last, rough = fresh_runs(m, last, lo, rough, bk, -200, 0)
        lo = ''
    if bite_mask:
        k = tex(m, bite_mask, -1400, 300, 'linear')
        two = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -1150, 300)
        link(k, 'R', two, 'A')
        link(const(m, 2.0, -1300, 420), '', two, 'B')
        half = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, -1000, 300)
        link(two, '', half, '')
        sub = mel.create_material_expression(m, unreal.MaterialExpressionSubtract, -1000, 380)
        link(two, '', sub, 'A')
        link(const(m, 1.0, -1150, 460), '', sub, 'B')
        full = mel.create_material_expression(m, unreal.MaterialExpressionSaturate, -850, 380)
        link(sub, '', full, '')
        bruise = lerp(m, last, lo, const(m, (0.035, 0.026, 0.034), -850, 220), '', half, '', -700, 0)
        dead = lerp(m, bruise, '', const(m, (0.012, 0.008, 0.01), -700, 220), '', full, '', -550, 0)
        bl, bk = blood_over(m, dead, '', k, 'G', -400, 0)
        last, lo = bl, ''
        rough = lerp(m, rough, '', const(m, 0.75, -750, 520), '', k, 'R', -550, 450)
        rough = lerp(m, rough, '', const(m, 0.3, -450, 560), '', bk, '', -300, 450)
        last, rough = fresh_runs(m, last, lo, rough, bk, -200, 0)
        lo = ''
    mel.connect_material_property(last, lo, MP.MP_BASE_COLOR)
    n = tex(m, nrm, -800, 650, 'normal')
    mel.connect_material_property(n, 'RGB', MP.MP_NORMAL)
    mel.connect_material_property(rough, '', MP.MP_ROUGHNESS)
    mel.connect_material_property(const(m, 0.45, -500, 600), '', MP.MP_SPECULAR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def flat_material(name, color, rough, spec=0.5, skeletal=True):
    m = new_mat(name, skeletal)
    mel.connect_material_property(const(m, color, -400, 0), '', MP.MP_BASE_COLOR)
    mel.connect_material_property(const(m, rough, -400, 200), '', MP.MP_ROUGHNESS)
    mel.connect_material_property(const(m, spec, -400, 300), '', MP.MP_SPECULAR)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    return m


def import_tex(name, normal=False, linear=False):
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir() + 'SourceArt/%s.png' % name))
    task.set_editor_property('destination_path', DEST)
    task.set_editor_property('destination_name', name)
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    tools.import_asset_tasks([task])
    t = unreal.load_asset(f'{DEST}/{name}')
    if normal:
        t.set_editor_property('compression_settings', unreal.TextureCompressionSettings.TC_NORMALMAP)
        t.set_editor_property('srgb', False)
        t.set_editor_property('lod_group', unreal.TextureGroup.TEXTUREGROUP_CHARACTER_NORMAL_MAP)
        eal.save_loaded_asset(t)
        return t
    if linear:
        t.set_editor_property('srgb', False)
        eal.save_loaded_asset(t)
        return t
    try:
        t.set_editor_property('do_scale_mips_for_alpha_coverage', True)
        t.set_editor_property('alpha_coverage_thresholds', unreal.Vector4(0, 0, 0, 0.33))
        eal.save_loaded_asset(t)
    except Exception as e:
        log('alpha coverage', e)
    return t


def teeth_material():
    """MI_HuskTeeth: the MetaHuman's own teeth (gums, teeth, tongue, its mouth occlusion), yellowed under plaque, the
    gums and tongue dead grey-purple."""
    parent = unreal.load_asset(MH + '/Face/Materials/MI_Teeth_Baked')
    mi = tools.create_asset('MI_HuskTeeth', DEST, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
    mel.set_material_instance_parent(mi, parent)
    for n, v in (('Plaque Amount', 1.0), ('Plaque Basecolor Value', 0.8), ('Teeth Basecolor Value', 0.55),
                 ('Teeth Roughness', 0.32), ('Gums Basecolor Value', 0.42), ('Tongue Basecolor Value', 0.32),
                 ('Mouth Occlusion Amount', 2.0)):
        mel.set_material_instance_scalar_parameter_value(mi, n, v)
    for n, c in (('Teeth Basecolor Multiply', (0.92, 0.8, 0.58)), ('Plaque Basecolor Multiply', (0.5, 0.38, 0.17)),
                 ('Gums Basecolor Multiply', (0.5, 0.36, 0.45)), ('Gum Line Basecolor Multiply', (0.45, 0.3, 0.25)),
                 ('Tongue Basecolor Multiply', (0.42, 0.33, 0.4))):
        mel.set_material_instance_vector_parameter_value(mi, n, unreal.LinearColor(*c, 1.0))
    mel.update_material_instance(mi)
    eal.save_loaded_asset(mi)
    return mi


def run():
    unreal.SystemLibrary.execute_console_command(None, 'Interchange.FeatureFlags.Import.FBX 0')
    if eal.does_directory_exist(DEST):
        eal.delete_directory(DEST)
    eal.make_directory(DEST)
    ui = unreal.FbxImportUI()
    ui.set_editor_property('import_mesh', True)
    ui.set_editor_property('import_as_skeletal', True)
    ui.set_editor_property('mesh_type_to_import', unreal.FBXImportType.FBXIT_SKELETAL_MESH)
    ui.set_editor_property('import_animations', True)
    ui.set_editor_property('import_materials', False)
    ui.set_editor_property('import_textures', False)
    ui.set_editor_property('create_physics_asset', True)     # its collision bodies (the game keeps them out of the snow)
    sk = ui.get_editor_property('skeletal_mesh_import_data')
    sk.set_editor_property('import_morph_targets', False)
    sk.set_editor_property('normal_import_method', unreal.FBXNormalImportMethod.FBXNIM_IMPORT_NORMALS)
    sk.set_editor_property('import_uniform_scale', 1.0)      # husk_body.py writes centimetres, every bone at scale 1
    sk.set_editor_property('vertex_color_import_option', unreal.VertexColorImportOption.REPLACE)
    an = ui.get_editor_property('anim_sequence_import_data')
    an.set_editor_property('animation_length', unreal.FBXAnimationLengthImportType.FBXALIT_EXPORTED_TIME)
    an.set_editor_property('use_default_sample_rate', False)
    an.set_editor_property('import_uniform_scale', 1.0)
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/Husk/HuskBody.fbx'))
    task.set_editor_property('destination_path', DEST)
    task.set_editor_property('destination_name', 'Husk')
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    task.set_editor_property('options', ui)
    tools.import_asset_tasks([task])
    assets = [unreal.load_asset(p.split('.')[0]) for p in eal.list_assets(DEST, recursive=False)]
    mesh = next((a for a in assets if isinstance(a, unreal.SkeletalMesh)), None)
    anims = [a for a in assets if isinstance(a, unreal.AnimSequence)]
    if not mesh:
        raise RuntimeError('the husk did not import as a skeletal mesh')
    for row in ('Upper', 'Lower'):            # the fang rows (tools/blender/husk_fangs.py), static, in the face's own space
        sui = unreal.FbxImportUI()
        sui.set_editor_property('import_mesh', True)
        sui.set_editor_property('import_as_skeletal', False)
        sui.set_editor_property('mesh_type_to_import', unreal.FBXImportType.FBXIT_STATIC_MESH)
        sui.set_editor_property('import_materials', False)
        sui.set_editor_property('import_textures', False)
        smd = sui.get_editor_property('static_mesh_import_data')
        smd.set_editor_property('import_uniform_scale', 100.0)
        smd.set_editor_property('combine_meshes', True)
        smd.set_editor_property('auto_generate_collision', False)
        ft = unreal.AssetImportTask()
        ft.set_editor_property('filename', unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/Husk/Fangs%s.fbx' % row))
        ft.set_editor_property('destination_path', DEST)
        ft.set_editor_property('destination_name', 'SM_Fangs' + row)
        ft.set_editor_property('replace_existing', True)
        ft.set_editor_property('automated', True)
        ft.set_editor_property('save', True)
        ft.set_editor_property('options', sui)
        tools.import_asset_tasks([ft])
        fm = unreal.load_asset(f'{DEST}/SM_Fangs{row}')
        if fm:
            fb = fm.get_bounds()
            log('fangs', row, 'bounds', round(fb.origin.x, 1), round(fb.origin.y, 1), round(fb.origin.z, 1), '|', round(fb.box_extent.x, 1), round(fb.box_extent.y, 1), round(fb.box_extent.z, 1))
    hair = import_tex('T_HuskHair')
    import_tex('T_HuskBodyC')                 # the body's skin with the MetaHuman's briefs painted out (tools/husk_skin.py)
    import_tex('T_HuskBodyN', normal=True)    # and its normal map with their folds and seams laid flat
    import_tex('T_HuskFaceFrost', linear=True)   # where the face is frostbitten (tools/blender/husk_face_frost.py)
    mats = {
        'mi_body': skin_material('M_HuskSkin', DEST + '/T_HuskBodyC', DEST + '/T_HuskBodyN'),
        'hair': None, 'claw': None,
    }
    # the claws: black horn, crusted with old blood where it ran down them
    cm = new_mat('M_HuskClaw')
    cvc = mel.create_material_expression(cm, unreal.MaterialExpressionVertexColor, -800, 200)
    cb, ck = blood_over(cm, const(cm, (0.012, 0.011, 0.012), -800, 0), '', cvc, 'B', -400, 0)
    mel.connect_material_property(cb, '', MP.MP_BASE_COLOR)
    mel.connect_material_property(lerp(cm, const(cm, 0.28, -500, 400), '', const(cm, 0.34, -500, 470), '', ck, '', -300, 400), '', MP.MP_ROUGHNESS)
    mel.connect_material_property(const(cm, 0.6, -300, 550), '', MP.MP_SPECULAR)
    mel.recompile_material(cm)
    eal.save_loaded_asset(cm)
    mats['claw'] = cm
    hm = new_mat('M_HuskHair', two_sided=True, blend=unreal.BlendMode.BLEND_MASKED)
    hm.set_editor_property('opacity_mask_clip_value', 0.33)
    t = mel.create_material_expression(hm, unreal.MaterialExpressionTextureSample, -700, 0)
    t.set_editor_property('texture', hair)
    hvc = mel.create_material_expression(hm, unreal.MaterialExpressionVertexColor, -700, 300)
    hb, hk = blood_over(hm, t, 'RGB', hvc, 'B', -300, 0)          # the fur matted with it
    mel.connect_material_property(hb, '', MP.MP_BASE_COLOR)
    mel.connect_material_property(t, 'A', MP.MP_OPACITY_MASK)
    mel.connect_material_property(lerp(hm, const(hm, 0.42, -400, 420), '', const(hm, 0.33, -400, 490), '', hk, '', -200, 420), '', MP.MP_ROUGHNESS)
    mel.connect_material_property(const(hm, 0.55, -300, 400), '', MP.MP_SPECULAR)
    mel.recompile_material(hm)
    eal.save_loaded_asset(hm)
    mats['hair'] = hm
    slots = mesh.get_editor_property('materials')
    for s in slots:
        nm = str(s.get_editor_property('material_slot_name')).lower()
        key = next((k for k in mats if nm.startswith(k)), None)
        if key:
            s.set_editor_property('material_interface', mats[key])
        log('slot', nm, '->', key)
    mesh.set_editor_property('materials', slots)
    eal.save_loaded_asset(mesh)
    # the face's materials (set on the face at run time by the game)
    skin_material('M_HuskFaceSkin', MH + '/Face/Baked/T_Head_BC_VT', MH + '/Face/Baked/T_Head_N_VT', frost=False, gain=0.88,
                  bite_mask=DEST + '/T_HuskFaceFrost')
    teeth_material()
    flat_material('M_HuskEye', (0.5, 0.53, 0.55), 0.06, 1.0)
    flat_material('M_HuskFang', (0.52, 0.46, 0.33), 0.38, 0.5, skeletal=False)
    flat_material('M_HuskMouth', (0.06, 0.012, 0.016), 0.25, 0.6)
    hide = new_mat('M_HuskHide', blend=unreal.BlendMode.BLEND_MASKED)
    mel.connect_material_property(const(hide, 0.0, -300, 0), '', MP.MP_OPACITY_MASK)
    mel.recompile_material(hide)
    eal.save_loaded_asset(hide)
    eal.save_directory(DEST, only_if_is_dirty=False, recursive=True)
    b = mesh.get_bounds()
    log(json.dumps({'mesh': mesh.get_path_name(), 'anims': [a.get_path_name() for a in anims],
                    'bounds': [b.origin.x, b.origin.y, b.origin.z, b.box_extent.x, b.box_extent.y, b.box_extent.z],
                    'lengths': [a.get_play_length() for a in anims]}))


if __name__ == '__main__':
    try:
        run()
    except Exception as e:
        unreal.log_error('[huski] FAILED %r' % (e,))
        raise
    finally:
        unreal.SystemLibrary.quit_editor()
