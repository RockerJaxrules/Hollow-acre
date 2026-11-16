"""The take the husk's face poses are recorded from: Husk_Anim_root_FaceBake, the sighting take with the MetaHuman face
rig's expression curves stepped through three poses (each held a second): at rest (0.5 s), the jaw open (1.5 s), and
the scream (2.5 s). A game run with -huskfacebake plays it under a MetaHuman face run by its own rig (RigLogic) and
writes the face's joints at each to Saved/Generated/Husk/face_poses.json; tools/husk_face_poses.py turns that into
Source/HollowAcre/HuskFacePoses.inl, which the game's husk blends its face by.
Run after Scripts/import_husk.py: UnrealEditor <uproject> -ExecutePythonScript=<this file> -unattended."""
import unreal

DEST = '/Game/HollowAcre/Creature/HuskGame'
eal = unreal.EditorAssetLibrary
# the poses (control -> value; CTRL_expressions_<name>, L and R both for the paired ones)
POSES = [
    {},                                                                    # 0..1 s: at rest
    {'jawOpen': 1.0},                                                      # 1..2 s: the jaw open
    {'jawOpen': 1.0, 'mouthStretch': 0.6, 'mouthLowerLipDepress': 0.5,     # 2..3 s: the scream
     'mouthUpperLipRaise': 0.35, 'mouthCornerPull': 0.3},
]
UNPAIRED = ('jawOpen',)


def log(*a):
    unreal.log('[huskfb] ' + ' '.join(str(x) for x in a))


try:
    src = DEST + '/Husk_Anim_root_Sighting'
    dst = DEST + '/Husk_Anim_root_FaceBake'
    if eal.does_asset_exist(dst):
        eal.delete_asset(dst)
    seq = eal.duplicate_asset(src, dst)
    names = sorted({k for p in POSES for k in p})
    AL = unreal.AnimationLibrary
    for k in names:
        times, values = [], []
        for i, p in enumerate(POSES):
            times += [i + 0.0, i + 0.98]
            values += [p.get(k, 0.0)] * 2
        for nm in ([k] if k in UNPAIRED else [k + 'L', k + 'R']):
            curve = 'CTRL_expressions_' + nm
            AL.add_curve(seq, curve, unreal.RawCurveTrackTypes.RCT_FLOAT, False)
            AL.add_float_curve_keys(seq, curve, times, values)
    eal.save_loaded_asset(seq)
    log('wrote', dst, 'with', len(names), 'controls over', len(POSES), 'poses')
except Exception as e:
    unreal.log_error('[huskfb] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
