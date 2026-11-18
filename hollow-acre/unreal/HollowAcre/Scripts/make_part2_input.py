"""Part 2's own inputs (Part2Character.cpp), beside the template's move, look, jump (IMC_Default, IMC_MouseLook) and sprint
(IMC_Horror): IA_Crouch (Left Ctrl, C, the gamepad's right stick press), IA_Flashlight (F, the gamepad's left shoulder)
and IA_Interact (E, the gamepad's bottom face button: look at a thing and use it, read on), in IMC_Part2.

Run (editor, headless): UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this file>"""
import unreal

DEST = '/Game/HollowAcre/Input'
eal = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def log(*a):
    unreal.log('[part2 input] ' + ' '.join(str(x) for x in a))


def fresh(name, cls, factory):
    """The asset, made if it isn't there yet (re-runnable: deleting and re-making in one session fails)."""
    path = '%s/%s' % (DEST, name)
    if eal.does_asset_exist(path):
        return unreal.load_asset(path)
    return tools.create_asset(name, DEST, cls, factory)


def key(name):
    k = unreal.Key()
    k.set_editor_property('key_name', name)
    return k


def run():
    crouch = fresh('IA_Crouch', unreal.InputAction, unreal.InputAction_Factory())
    crouch.set_editor_property('value_type', unreal.InputActionValueType.BOOLEAN)
    light = fresh('IA_Flashlight', unreal.InputAction, unreal.InputAction_Factory())
    light.set_editor_property('value_type', unreal.InputActionValueType.BOOLEAN)
    use = fresh('IA_Interact', unreal.InputAction, unreal.InputAction_Factory())
    use.set_editor_property('value_type', unreal.InputActionValueType.BOOLEAN)
    imc = fresh('IMC_Part2', unreal.InputMappingContext, unreal.InputMappingContext_Factory())
    have = {(str(m.get_editor_property('action').get_name()) if m.get_editor_property('action') else '', str(m.get_editor_property('key').get_editor_property('key_name')))
            for m in imc.get_editor_property('default_key_mappings').get_editor_property('mappings')}
    for a, keys in ((crouch, ('LeftControl', 'C', 'Gamepad_RightThumbstick')), (light, ('F', 'Gamepad_LeftShoulder')),
                    (use, ('E', 'Gamepad_FaceButton_Bottom'))):
        for k in keys:
            if (a.get_name(), k) not in have:
                imc.map_key(a, key(k))
    for a in (crouch, light, use, imc):
        eal.save_loaded_asset(a)
    log('made IA_Crouch, IA_Flashlight, IA_Interact, IMC_Part2 (%d mappings)' % len(imc.get_editor_property('default_key_mappings').get_editor_property('mappings')))


run()
