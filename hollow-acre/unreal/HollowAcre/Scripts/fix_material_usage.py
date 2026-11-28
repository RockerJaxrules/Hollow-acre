"""Materials the game drew as the default grey (the log: "missing usage flag Nanite! Default Material will be used in
game"): in a run of the game (no cook) a material can't be compiled for a new usage, so every one made by script and put
on a Nanite mesh or an instanced mesh needs the flag set and saved here. Judge rounds 8-9 saw the result: the stove "a pale
grey plastic barrel" was its iron drawn as the default material; the flashlight and props the same.

Also the small props of Part 2's opening and play (/Game/HollowAcre/Wake: the flashlight, the stove, its flames, the
matches, the armful, Kessler's lantern and carbine) are made non-Nanite: they gain nothing from it at their size, and an
additive material (the flames) can't be drawn on a Nanite mesh at all. Re-runnable.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound"""
import unreal

eal = unreal.EditorAssetLibrary
mel = unreal.MaterialEditingLibrary

FLAGS = {
    '/Game/HollowAcre/Car/Keys/M_KeyPart': ('used_with_nanite', 'used_with_instanced_static_meshes'),
    '/Game/HollowAcre/Materials/Play/M_FireGlow': ('used_with_nanite',),
    '/Game/HollowAcre/Materials/Play/M_HotIron': ('used_with_nanite',),
    '/Game/HollowAcre/Town/Materials/M_Town_Drywood': ('used_with_nanite',),
    '/Game/HollowAcre/Town/Materials/M_Town_Dryrust': ('used_with_nanite',),
    '/Game/HollowAcre/Materials/Blood/M_BloodDrop': ('used_with_instanced_static_meshes',),
}


def log(*a):
    unreal.log('[usage] ' + ' '.join(str(x) for x in a))


for path, flags in FLAGS.items():
    m = unreal.load_asset(path)
    if not m:
        log('no', path)
        continue
    changed = []
    for f in flags:
        try:
            if not m.get_editor_property(f):
                m.set_editor_property(f, True)
                changed.append(f)
        except Exception as e:
            log(path, f, 'failed:', e)
    if changed:
        mel.recompile_material(m)
        eal.save_loaded_asset(m, only_if_is_dirty=False)
    log(path.split('/')[-1], 'set' if changed else 'already', changed)

for a in eal.list_assets('/Game/HollowAcre/Wake', recursive=False, include_folder=False):
    obj = unreal.load_asset(a.split('.')[0])
    if not isinstance(obj, unreal.StaticMesh):
        continue
    ns = obj.get_editor_property('nanite_settings')
    if ns.get_editor_property('enabled'):
        ns.set_editor_property('enabled', False)
        obj.set_editor_property('nanite_settings', ns)
        eal.save_loaded_asset(obj, only_if_is_dirty=False)
        log(obj.get_name(), 'Nanite off')
