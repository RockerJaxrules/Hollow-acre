"""The husk's skin made cold (blind judges, rounds 5 and 11: "beige plastic", "glossy cream latex", "the brightest thing
in the frame"): the miners are starved and frozen (PART2_STORY.md), so the skin is darker and colder than the baked
MetaHuman skin it came from: its base colour multiplied by a grey-blue frostbite tint, mottled (a slow noise over its
own UVs: blotches of a few centimetres, bluer and darker in places, as frozen skin goes), and its wet film eased a
little (roughness 0.6 -> 0.72 of the original) so the beam draws a sheen, not a porcelain glaze. Both skin materials
(M_HuskSkin on the body, M_HuskFaceSkin on the face). Changed in place once (marked 'cold skin'; a second run does
nothing); re-run after import_husk.py and husk_wet_skin.py.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Creature/HuskGame'
mel = unreal.MaterialEditingLibrary
MP = unreal.MaterialProperty
eal = unreal.EditorAssetLibrary
COLD_A = unreal.LinearColor(0.56, 0.6, 0.68, 1.0)      # (grey-blue, a little darker than the bake)
COLD_B = unreal.LinearColor(0.36, 0.37, 0.47, 1.0)      # (the blotches: bluer, darker)


def log(*a):
    unreal.log('[husk cold] ' + ' '.join(str(x) for x in a))


for name in ('M_HuskSkin', 'M_HuskFaceSkin'):
    m = unreal.load_asset(DEST + '/' + name)
    if not m:
        log('no', name)
        continue
    base = mel.get_material_property_input_node(m, MP.MP_BASE_COLOR)
    if base is None:
        log(name, 'nothing feeds its base colour')
        continue
    if base.get_editor_property('desc') == 'cold skin':
        log(name, 'already cold')
        continue
    uv = mel.create_material_expression(m, unreal.MaterialExpressionTextureCoordinate, -900, -300)
    uv.set_editor_property('u_tiling', 26.0)
    uv.set_editor_property('v_tiling', 26.0)
    app = mel.create_material_expression(m, unreal.MaterialExpressionAppendVector, -760, -300)
    zero = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -900, -220)
    noise = mel.create_material_expression(m, unreal.MaterialExpressionNoise, -620, -300)
    noise.set_editor_property('scale', 1.0)
    noise.set_editor_property('levels', 3)
    noise.set_editor_property('output_min', 0.0)
    noise.set_editor_property('output_max', 1.0)
    a = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -620, -150)
    a.set_editor_property('constant', COLD_A)
    b = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -620, -80)
    b.set_editor_property('constant', COLD_B)
    tint = mel.create_material_expression(m, unreal.MaterialExpressionLinearInterpolate, -440, -200)
    mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -280, -100)
    mul.set_editor_property('desc', 'cold skin')
    links = [(uv, '', app, 'A'), (zero, '', app, 'B'), (app, '', noise, ''), (a, '', tint, 'A'), (b, '', tint, 'B'),
             (noise, '', tint, 'Alpha'), (base, '', mul, 'A'), (tint, '', mul, 'B')]
    ok = True
    for (f, fo, t, ti) in links:
        r = mel.connect_material_expressions(f, fo, t, ti)
        if not r:
            log(name, 'link failed: %s.%s -> %s.%s' % (f.get_name(), fo, t.get_name(), ti))
        ok = ok and r
    if ok:
        ok = mel.connect_material_property(mul, '', MP.MP_BASE_COLOR)
        if not ok:
            log(name, 'base colour link failed')
    # (the wet film eased: the 'wet film' multiply's 0.6 to 0.72)
    rough = mel.get_material_property_input_node(m, MP.MP_ROUGHNESS)
    if rough is not None and rough.get_editor_property('desc') == 'wet film':
        rough.set_editor_property('const_b', 0.72)
    if not ok:
        log(name, 'LINKS FAILED: not saved')
        continue
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log(name, 'cold')
