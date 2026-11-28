"""The husk's MetaHuman, stripped: no outfit (MetaHuman cuts away the skin its clothes cover, which left the body mesh
with no torso), no hair, eyebrows, beard, moustache, peach fuzz or eyelashes. Then built again into
Content/HollowAcre/Creature/Husk/Built (its rig and textures are already done by build_husk_metahuman.py)."""
import unreal


def log(*a):
    unreal.log('[husks] ' + ' '.join(str(x) for x in a))


eal = unreal.EditorAssetLibrary
sub = unreal.get_editor_subsystem(unreal.MetaHumanCharacterEditorSubsystem)
ROOT = '/Game/HollowAcre/Creature/Husk'
STRIP = ('Outfits', 'Top Garment', 'Bottom Garment', 'Hair', 'Eyebrows', 'Beard', 'Mustache', 'Peachfuzz', 'Eyelashes')

try:
    ch = unreal.load_asset(ROOT + '/MHC_Husk')
    log('edit', sub.try_add_object_to_edit(ch))
    col = ch.get_editor_property('internal_collection')
    inst = col.get_editor_property('default_instance')
    lib = unreal.MetaHumanCollectionBlueprintLibrary
    for slot in STRIP:
        try:
            ok = inst.set_single_slot_selection(slot, unreal.MetaHumanPaletteItemKey())
            log('cleared', slot, ok)
        except Exception as e:
            log('clear', slot, 'err', e)
    try:
        log('selections now', inst.get_slot_selection_data())
    except Exception as e:
        log('selection data err', e)
    ch.modify()
    eal.save_loaded_asset(ch)
    ok = sub.can_build_meta_human(ch, True)
    log('can_build', ok)
    if ok:
        if eal.does_directory_exist(ROOT + '/Built'):
            eal.delete_directory(ROOT + '/Built')
        bp = unreal.MetaHumanCharacterEditorBuildParameters()
        bp.set_editor_property('absolute_build_path', ROOT + '/Built')
        bp.set_editor_property('name_override', 'Husk')
        sub.build_meta_human(ch, bp)
        eal.save_directory(ROOT, only_if_is_dirty=True, recursive=True)
        built = [a.split('.')[0].split('/')[-1] for a in eal.list_assets(ROOT + '/Built', recursive=True, include_folder=False)]
        log('built', len(built), [b for b in built if b.startswith(('SKM', 'BP_', 'Groom', 'OA_', 'GA_', 'SK_'))][:40])
except Exception as e:
    unreal.log_error('[husks] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
