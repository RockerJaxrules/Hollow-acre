"""The husk's skin made wet (judge round 7: "waxy, evenly lit skin ... it should be wet and slightly see-through"): its two skin
materials (M_HuskSkin on the body, M_HuskFaceSkin on the face, made by import_husk.py) given a wet film's gloss: the
roughness feeding the skin scaled to about 60% (its frost and blood keep their differences) and its specular raised, so
the beam draws a wet highlight along every bone and tendon it is stretched over. (This project renders with Substrate:
the legacy clear-coat pins aren't there to use.) Changed in place, once (it marks the material so a second run does
nothing); re-run after import_husk.py.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Creature/HuskGame'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
MP = unreal.MaterialProperty
WET = 0.6


def log(*a):
    unreal.log('[husk wet] ' + ' '.join(str(x) for x in a))


for name in ('M_HuskSkin', 'M_HuskFaceSkin'):
    m = unreal.load_asset(DEST + '/' + name)
    if not m:
        log('no', name)
        continue
    rough = mel.get_material_property_input_node(m, MP.MP_ROUGHNESS)
    if rough is None:
        log(name, 'nothing feeds its roughness')
        continue
    if rough.get_editor_property('desc') == 'wet film':
        log(name, 'already wet')
        continue
    mul = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -150, 450)
    mul.set_editor_property('const_b', WET)
    mul.set_editor_property('desc', 'wet film')
    ok = mel.connect_material_expressions(rough, '', mul, 'A') and mel.connect_material_property(mul, '', MP.MP_ROUGHNESS)
    spec = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -150, 650)
    spec.set_editor_property('r', 0.62)
    ok = mel.connect_material_property(spec, '', MP.MP_SPECULAR) and ok
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    log(name, 'roughness x%.2f, specular 0.62' % WET, 'linked' if ok else 'LINK FAILED')
