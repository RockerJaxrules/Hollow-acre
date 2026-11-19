"""The husk's face brought to its body's tone (run 58: the head a dark glossy blue against the pale body, a mannequin's
head): its base colour lifted and warmed toward the body's pallor, its sheen dulled. Changed in place once (marked
'face match'); run after husk_skin_detail.py. FACE_GAIN and FACE_ROUGH can be re-run to retune (it updates the
constants it made).
Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

mel = unreal.MaterialEditingLibrary
MP = unreal.MaterialProperty
eal = unreal.EditorAssetLibrary
FACE_GAIN = unreal.LinearColor(1.9, 1.8, 1.45, 1.0)
FACE_ROUGH = 1.35


def log(*a):
    unreal.log('[husk face] ' + ' '.join(str(x) for x in a))


m = unreal.load_asset('/Game/HollowAcre/Creature/HuskGame/M_HuskFaceSkin')
base = mel.get_material_property_input_node(m, MP.MP_BASE_COLOR)
rough = mel.get_material_property_input_node(m, MP.MP_ROUGHNESS)
if base is not None and base.get_editor_property('desc') == 'face match':
    for e in mel.get_inputs_for_material_expression(m, base):
        if isinstance(e, unreal.MaterialExpressionConstant3Vector):
            e.set_editor_property('constant', FACE_GAIN)
    if rough is not None and rough.get_editor_property('desc') == 'face match':
        rough.set_editor_property('const_b', FACE_ROUGH)
    log('retuned')
else:
    bo = mel.get_material_property_input_node_output_name(m, MP.MP_BASE_COLOR)
    g = mel.create_material_expression(m, unreal.MaterialExpressionConstant3Vector, -450, 950)
    g.set_editor_property('constant', FACE_GAIN)
    mb = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -300, 850)
    mb.set_editor_property('desc', 'face match')
    ok = mel.connect_material_expressions(base, bo, mb, 'A') and mel.connect_material_expressions(g, '', mb, 'B')
    ok = ok and mel.connect_material_property(mb, '', MP.MP_BASE_COLOR)
    if rough is not None:
        ro = mel.get_material_property_input_node_output_name(m, MP.MP_ROUGHNESS)
        mr = mel.create_material_expression(m, unreal.MaterialExpressionMultiply, -300, 1150)
        mr.set_editor_property('desc', 'face match')
        mr.set_editor_property('const_b', FACE_ROUGH)
        ok = ok and mel.connect_material_expressions(rough, ro, mr, 'A') and mel.connect_material_property(mr, '', MP.MP_ROUGHNESS)
    log('matched' if ok else 'LINKS FAILED')
mel.recompile_material(m)
eal.save_loaded_asset(m)
