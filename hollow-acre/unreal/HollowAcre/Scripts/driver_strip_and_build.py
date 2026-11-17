"""The driver's MetaHuman without its outfit. MetaHuman cuts away the skin its clothes cover, so the body built in the
default T-shirt and shorts had no torso and no tops to the arms: the game's own clothes layer (M_DriverClothes, drawn over
the same mesh) then had the same hole, and in the wake a look down at the buckle saw into an empty sleeve. Built again
into Content/HollowAcre/Driver/Built (the rig and textures are already done by build_driver_metahuman.py)."""
import unreal


def log(*a):
    unreal.log('[driver strip] ' + ' '.join(str(x) for x in a))


eal = unreal.EditorAssetLibrary
sub = unreal.get_editor_subsystem(unreal.MetaHumanCharacterEditorSubsystem)
ROOT = '/Game/HollowAcre/Driver'
STRIP = ('Outfits', 'Top Garment', 'Bottom Garment')

try:
    ch = unreal.load_asset(ROOT + '/MHC_Driver')
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
        bp.set_editor_property('name_override', 'Driver')
        sub.build_meta_human(ch, bp)
        eal.save_directory(ROOT, only_if_is_dirty=True, recursive=True)
        built = [a.split('.')[0].split('/')[-1] for a in eal.list_assets(ROOT + '/Built', recursive=True, include_folder=False)]
        log('built', len(built), [b for b in built if b.startswith(('SKM', 'BP_', 'Groom', 'OA_', 'GA_', 'SK_'))][:40])
except Exception as e:
    unreal.log_error('[driver strip] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
