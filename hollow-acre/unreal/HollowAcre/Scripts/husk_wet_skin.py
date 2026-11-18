"""The husk's skin made wet (judge round 7: "waxy, evenly lit skin ... it should be wet and slightly see-through"): its two skin
materials (M_HuskSkin on the body, M_HuskFaceSkin on the face, made by import_husk.py) turned to the clear-coat shading
model, a thin wet film over the drained, frostbitten skin: the film glossy (clear coat 0.65, its roughness 0.14) and the
skin under it a little rougher, so the beam draws a wet highlight along every bone and tendon it is stretched over.
Changed in place (import_husk.py rebuilds everything); re-run after import_husk.py.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

DEST = '/Game/HollowAcre/Creature/HuskGame'
eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary
MP = unreal.MaterialProperty


def log(*a):
    unreal.log('[husk wet] ' + ' '.join(str(x) for x in a))


for name in ('M_HuskSkin', 'M_HuskFaceSkin'):
    m = unreal.load_asset(DEST + '/' + name)
    if not m:
        log('no', name)
        continue
    m.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_CLEAR_COAT)
    cc = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -300, 900)
    cc.set_editor_property('r', 0.65)
    ccr = mel.create_material_expression(m, unreal.MaterialExpressionConstant, -300, 1000)
    ccr.set_editor_property('r', 0.14)
    ok = mel.connect_material_property(cc, '', MP.MP_CUSTOM_DATA0) and mel.connect_material_property(ccr, '', MP.MP_CUSTOM_DATA1)
    mel.recompile_material(m)
    eal.save_loaded_asset(m, only_if_is_dirty=False)
    log(name, 'clear coat', 'linked' if ok else 'LINK FAILED')
