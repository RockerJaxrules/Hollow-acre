"""Build Kessler, the foreman who wrote to the player (Part 2, Act I's end), as a MetaHuman (Content/HollowAcre/Kessler):
a hard, short-spoken man near sixty who has worked the mountain all his life. From the Orlando preset (its face made his own
later), given an older weathered skin (the face texture index of the oldest male preset), a short full beard going grey,
receding hair (under a wool cap in the game), a heavy working build. Full rig (joints and blend shapes: his face is seen
close, captions only, ready for lip sync later). Cloud auto-rig and texture sources need the owner's MetaHuman sign-in
(saved).

Run: UnrealEditor <uproject> -ExecutePythonScript=<this file> -unattended (headless works once the sign-in is saved)."""
import unreal


def log(*a):
    unreal.log('[kessler] ' + ' '.join(str(x) for x in a))


eal = unreal.EditorAssetLibrary
sub = unreal.get_editor_subsystem(unreal.MetaHumanCharacterEditorSubsystem)
ROOT = '/Game/HollowAcre/Kessler'
DST = ROOT + '/MHC_Kessler'
PRESET = '/MetaHumanCharacter/Optional/Presets/Orlando'
AGED_FACE_TEXTURE = 121              # (Walter's: the oldest male skin among the presets, age spots and lines)
GROOMS = {                           # (wardrobe slot -> item)
    'Beard': '/MetaHumanCharacter/Optional/Grooms/Bindings/Beards/WI_Beard_S_Full',
    'Hair': '/MetaHumanCharacter/Optional/Grooms/Bindings/Hair/WI_Hair_S_RecedeMessy',
}
# a heavy working build at 178 cm: broad, thick through the chest and arms, some weight on him
TARGETS = {'Height': 178.0, 'Fat': 0.6, 'Muscularity': 0.7, 'Masculine/Feminine': -1.0, 'Across Shoulder': 48.0, 'Chest': 108.0,
           'Waist': 98.0, 'Neck': 42.0, 'Bicep': 33.0, 'Forearm': 29.0}

try:
    if eal.does_asset_exist(DST):
        eal.delete_asset(DST)
    ch = eal.duplicate_asset(PRESET, DST)
    log('from', PRESET, 'edit', sub.try_add_object_to_edit(ch))
    # his skin: older and weathered
    ss = ch.get_editor_property('skin_settings')
    sk = ss.get_editor_property('skin')
    log('skin was: face texture', sk.get_editor_property('face_texture_index'), 'u,v', sk.get_editor_property('u'), sk.get_editor_property('v'))
    sk.set_editor_property('face_texture_index', AGED_FACE_TEXTURE)
    sk.set_editor_property('roughness', 1.08)
    ss.set_editor_property('skin', sk)
    sub.commit_skin_settings(ch, ss)
    # his build
    cons = sub.get_body_constraints(ch, False)
    new = []
    for c in cons:
        c = c.copy()
        n = str(c.get_editor_property('name'))
        if n in TARGETS:
            lo, hi = c.get_editor_property('min_measurement'), c.get_editor_property('max_measurement')
            c.set_editor_property('target_measurement', max(lo, min(hi, TARGETS[n])))
            c.set_editor_property('is_active', True)
        else:
            c.set_editor_property('is_active', False)
        new.append(c)
    sub.set_body_constraints(ch, new)
    sub.commit_body_state(ch)
    got = {str(c.get_editor_property('name')): round(c.get_editor_property('target_measurement'), 1) for c in sub.get_body_constraints(ch, False)}
    log('body now', {k: got.get(k) for k in TARGETS})
    # his beard and hair, from the wardrobe
    # (added to his palette and then selected in its slot: added alone, the preset's own stubble and swept-up hair were
    # what got built)
    col = ch.get_editor_property('internal_collection')
    inst = col.get_editor_property('default_instance')
    log('slots', [str(n) for n in col.get_slot_names()])
    for slot, path in GROOMS.items():
        item = unreal.load_asset(path)
        if not item:
            log('no wardrobe item', path)
            continue
        try:
            key = col.try_add_item_from_wardrobe_item(unreal.Name(slot), item)
            ok = inst.set_single_slot_selection(unreal.Name(slot), key)
            log('groom', slot, path.split('/')[-1], 'selected' if ok else 'NOT SELECTED')
        except Exception as e:
            log('groom', slot, 'failed:', e)
    for sel in inst.get_slot_selection_data() if hasattr(inst, 'get_slot_selection_data') else []:
        try:
            log('selection', sel.get_editor_property('selection'))
        except Exception:
            log('selection', sel)
    eal.save_loaded_asset(ch)
    rp = unreal.MetaHumanCharacterAutoRiggingRequestParams()
    for k, v in (('rig_type', unreal.MetaHumanRigType.JOINTS_AND_BLEND_SHAPES), ('report_progress', False), ('blocking', True)):
        try:
            rp.set_editor_property(k, v)
        except Exception as e:
            log('rig param', k, e)
    log('auto-rigging...')
    sub.request_auto_rigging(ch, rp)
    tp = unreal.MetaHumanCharacterTextureRequestParams()
    tp.set_editor_property('report_progress', False)
    tp.set_editor_property('blocking', True)
    log('texture sources...')
    sub.request_texture_sources(ch, tp)
    log('high res textures', ch.get_editor_property('has_high_resolution_textures'))
    eal.save_loaded_asset(ch)
    ok = sub.can_build_meta_human(ch, True)
    log('can_build', ok)
    if ok:
        bp = unreal.MetaHumanCharacterEditorBuildParameters()
        bp.set_editor_property('absolute_build_path', ROOT + '/Built')
        bp.set_editor_property('name_override', 'Kessler')
        sub.build_meta_human(ch, bp)
        eal.save_directory(ROOT, only_if_is_dirty=True, recursive=True)
        built = [a.split('.')[0] for a in eal.list_assets(ROOT + '/Built', recursive=True, include_folder=False)]
        log('built', len(built), 'assets:', [b for b in built if b.split('/')[-1].startswith(('SKM', 'BP_', 'Groom', 'GA_', 'SK_'))][:40])
except Exception as e:
    unreal.log_error('[kessler] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
