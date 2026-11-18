"""The husk's skin made cold (blind judges, rounds 5 and 11: "beige plastic", "glossy cream latex", "the brightest thing
in the frame"): the miners are starved and frozen (PART2_STORY.md), so the skin is darker and colder than the baked
MetaHuman skin it came from: its base colour multiplied by a grey-blue frostbite tint, mottled (a slow noise over its
own UVs: blotches of a few centimetres, bluer and darker in places, as frozen skin goes), and its wet film eased a
little (roughness 0.6 -> 0.72 of the original) so the beam draws a sheen, not a porcelain glaze. Both skin materials
(M_HuskSkin on the body, M_HuskFaceSkin on the face). Changed in place once (marked 'cold skin'); re-run after
import_husk.py and husk_wet_skin.py.

Round 12 ("a tan wooden mannequin or clay dummy whenever it is lit"): darkening the bake's beige made it bronze under
the warm flashlight. Now the bake is drained of most of its colour first (a desaturation, 'pale skin') and the tint is
a pale grey-blue with bruise-grey blotches: a corpse's pallor, which the warm beam warms only to a dead grey. A run on
an already-cold material updates it to this (the tints and the desaturation), once.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Creature/HuskGame'
mel = unreal.MaterialEditingLibrary
MP = unreal.MaterialProperty
eal = unreal.EditorAssetLibrary
COLD_A = unreal.LinearColor(0.46, 0.5, 0.64, 1.0)      # (pallor: the drained bake, cooled and dulled, blue enough that
                                                        # the warm headlight and flashlight warm it only to grey; at
                                                        # 0.86-1.0 it washed out white in the headlight, at 0.6 cream)
COLD_B = unreal.LinearColor(0.25, 0.24, 0.35, 1.0)      # (the blotches: bruise-grey, a little violet)
WET = 0.95                                              # (the wet film's roughness factor: at 0.72 its sheen mirrored the
                                                        # lit snow and the legs read glassy white)
DRAIN = 0.72                                            # (how much of the bake's colour is drained away)


def inputs(m, e):
    try:
        return list(mel.get_inputs_for_material_expression(m, e))
    except Exception as ex:
        log('no input listing:', ex)
        return []


def pale(m, name, mul):
    """The cold multiply's base input drained of colour; its tints set to the pallor."""
    ins = inputs(m, mul)
    if len(ins) < 2 or ins[0] is None or ins[1] is None:
        log(name, 'cold multiply inputs not found', ins)
        return False
    base, tint = ins[0], ins[1]
    tins = inputs(m, tint)
    for e, col in zip(tins[:2], (COLD_A, COLD_B)):
        if e is not None and isinstance(e, unreal.MaterialExpressionConstant3Vector):
            e.set_editor_property('constant', col)
    if base.get_editor_property('desc') == 'pale skin':
        # (already drained: its tints (above) and how much is drained brought to this script's values)
        dins = inputs(m, base)
        if len(dins) > 1 and isinstance(dins[1], unreal.MaterialExpressionConstant):
            dins[1].set_editor_property('r', DRAIN)
        rough = mel.get_material_property_input_node(m, MP.MP_ROUGHNESS)
        if rough is not None and rough.get_editor_property('desc') == 'wet film':
            rough.set_editor_property('const_b', WET)
        log(name, 'pale: values updated')
        return True
    d = mel.create_material_expression(m, unreal.MaterialExpressionDesaturation, -440, -40)
    d.set_editor_property('desc', 'pale skin')
    fr = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -600, 40)
    fr.set_editor_property('r', DRAIN)
    ok = mel.connect_material_expressions(base, '', d, '') and mel.connect_material_expressions(fr, '', d, 'Fraction')         and mel.connect_material_expressions(d, '', mul, 'A')
    if not ok:
        log(name, 'pale links failed')
    return ok


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
        if pale(m, name, base):
            mel.recompile_material(m)
            eal.save_loaded_asset(m)
            log(name, 'pale')
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
        rough.set_editor_property('const_b', WET)
    if not ok:
        log(name, 'LINKS FAILED: not saved')
        continue
    pale(m, name, mul)
    mel.recompile_material(m)
    eal.save_loaded_asset(m)
    log(name, 'cold')
