"""Build the base of Part 2's creature, the frozen husk, as a MetaHuman (Content/HollowAcre/Creature/Husk): a starved,
very tall, long-limbed man (the body measurements pushed to their limits: no fat, no muscle, the longest arms, legs and
neck the body model allows), bald. The game then makes him the husk (frostbitten skin, milky eyes, teeth, claws,
stretched further). Cloud auto-rig (joints only) and texture sources need the owner's MetaHuman sign-in (saved).

Run: UnrealEditor <uproject> -ExecutePythonScript=<this file> -unattended (headless works once the sign-in is saved).
"""
import unreal


def log(*a):
    unreal.log('[husk] ' + ' '.join(str(x) for x in a))


eal = unreal.EditorAssetLibrary
sub = unreal.get_editor_subsystem(unreal.MetaHumanCharacterEditorSubsystem)
ROOT = '/Game/HollowAcre/Creature/Husk'
DST = ROOT + '/MHC_Husk'
PRESET = '/MetaHumanCharacter/Optional/Presets/Walter'

# measurement targets (cm, or the model's own units for fat / muscularity / masculine-feminine); clamped to each
# constraint's range by the model
TARGETS = {
    'Height': 222.0, 'Inseam': 106.0, 'Upper Arm Length': 52.0, 'Lower Arm Length': 34.0, 'Neck Length': 15.0,
    'Fat': -2.7, 'Muscularity': -2.3, 'Masculine/Feminine': -1.4,
    'Waist': 58.0, 'Chest': 80.0, 'Hip': 80.0, 'High Hip': 70.0, 'Thigh': 41.0, 'Knee': 30.0, 'Calf': 27.5,
    'Bicep': 21.0, 'Forearm': 16.0, 'Elbow': 19.0, 'Wrist': 13.0, 'Hand Circumference': 15.0,
    'Neck': 32.0, 'Neck Base': 34.0, 'Across Shoulder': 44.0,
}

try:
    if eal.does_asset_exist(DST):
        eal.delete_asset(DST)
    if eal.does_asset_exist(ROOT + '/MHC_HuskProbe'):
        eal.delete_asset(ROOT + '/MHC_HuskProbe')
    if eal.does_asset_exist('/Game/HollowAcre/Creature/MHC_HuskProbe'):
        eal.delete_asset('/Game/HollowAcre/Creature/MHC_HuskProbe')
    ch = eal.duplicate_asset(PRESET, DST)
    log('from', PRESET, 'edit', sub.try_add_object_to_edit(ch))
    cons = sub.get_body_constraints(ch, False)
    new = []                      # (the array hands out copies: build a fresh list of edited constraints)
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
    got = {str(c.get_editor_property('name')): round(c.get_editor_property('target_measurement'), 1)
           for c in sub.get_body_constraints(ch, False)}
    log('body now', {k: got.get(k) for k in TARGETS})
    rp = unreal.MetaHumanCharacterAutoRiggingRequestParams()
    for k, v in (('rig_type', unreal.MetaHumanRigType.JOINTS_ONLY), ('report_progress', False), ('blocking', True)):
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
    eal.save_loaded_asset(ch)
    ok = sub.can_build_meta_human(ch, True)
    log('can_build', ok)
    if ok:
        bp = unreal.MetaHumanCharacterEditorBuildParameters()
        bp.set_editor_property('absolute_build_path', ROOT + '/Built')
        bp.set_editor_property('name_override', 'Husk')
        sub.build_meta_human(ch, bp)
        eal.save_directory(ROOT, only_if_is_dirty=True, recursive=True)
        built = [a.split('.')[0] for a in eal.list_assets(ROOT + '/Built', recursive=True, include_folder=False)]
        log('built', len(built), 'assets:', [b for b in built if 'SKM' in b or 'BP_' in b or 'Skeleton' in b][:30])
except Exception as e:
    unreal.log_error('[husk] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
