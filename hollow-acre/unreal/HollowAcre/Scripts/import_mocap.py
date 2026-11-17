"""Real motion onto the creature, in Unreal (the owner: animate with Unreal's tools; free motion, no capture of our own).

1. Imports the converted CMU clips (tools/blender/cmu_to_fbx.py: a stick body on a skeleton with the UE mannequin's bone
   names, every clip a take) to /Game/HollowAcre/Creature/Mocap/CMU.
2. Makes an IK Rig for that skeleton and one for the creature (Husk), each from Unreal's own automatic characterisation
   (the bone names tell it which chains are which).
3. Makes an IK Retargeter from the CMU rig to the creature's, chains mapped automatically, the creature's retarget pose
   aligned to the CMU's.
4. Retargets every clip onto the creature: /Game/HollowAcre/Creature/Mocap/Husk/<clip>.

Run: UnrealEditor-Cmd <uproject> -ExecutePythonScript=<this> -unattended -nosplash -nosound
     (the FBX path: env HA_MOCAP_FBX, default D:/HollowAcreTools/mocap/CMU_Clips.fbx)"""
import os

import unreal

FBX = os.environ.get('HA_MOCAP_FBX', 'D:/HollowAcreTools/mocap/CMU_Clips.fbx')
# (which source: CMU by default; HA_MOCAP_NAME=Kimodo for the motions from NVIDIA's Kimodo, tools/blender/kimodo_to_fbx.py)
SRC_NAME = os.environ.get('HA_MOCAP_NAME', 'CMU')
SRC_DIR = '/Game/HollowAcre/Creature/Mocap/' + SRC_NAME
OUT_DIR = '/Game/HollowAcre/Creature/Mocap/Husk' if SRC_NAME == 'CMU' else '/Game/HollowAcre/Creature/Mocap/%s_Husk' % SRC_NAME
HUSK = '/Game/HollowAcre/Creature/HuskGame/Husk'
eal = unreal.EditorAssetLibrary
tools = unreal.AssetToolsHelpers.get_asset_tools()


def log(msg):
    unreal.log('[mocap] ' + msg)


def methods(obj, needle=''):
    return [m for m in dir(obj) if not m.startswith('_') and needle in m.lower()]


# 1. the clips (HA_MOCAP_FRESH=1: everything made again from nothing; a re-import keeps the old skeleton's rest pose)
if os.environ.get('HA_MOCAP_FRESH'):
    for d in (OUT_DIR, SRC_DIR):
        if eal.does_directory_exist(d):
            eal.delete_directory(d)
            log('cleared ' + d)
if os.environ.get('HA_MOCAP_REIMPORT') or not eal.does_directory_exist(SRC_DIR) or not eal.list_assets(SRC_DIR):
    ui = unreal.FbxImportUI()
    ui.set_editor_property('import_mesh', True)
    ui.set_editor_property('import_as_skeletal', True)
    ui.set_editor_property('import_animations', True)
    ui.set_editor_property('create_physics_asset', False)
    ui.set_editor_property('import_materials', False)
    ui.set_editor_property('import_textures', False)
    ui.set_editor_property('mesh_type_to_import', unreal.FBXImportType.FBXIT_SKELETAL_MESH)
    ui.anim_sequence_import_data.set_editor_property('import_bone_tracks', True)
    ui.anim_sequence_import_data.set_editor_property('remove_redundant_keys', False)
    task = unreal.AssetImportTask()
    task.set_editor_property('filename', FBX)
    task.set_editor_property('destination_path', SRC_DIR)
    task.set_editor_property('destination_name', SRC_NAME)
    task.set_editor_property('automated', True)
    task.set_editor_property('save', True)
    task.set_editor_property('replace_existing', True)
    task.set_editor_property('options', ui)
    tools.import_asset_tasks([task])
    log('imported %d assets' % len(task.get_editor_property('imported_object_paths')))
assets = eal.list_assets(SRC_DIR, recursive=False)
mesh_path = next((a for a in assets if unreal.EditorAssetLibrary.find_asset_data(a).asset_class_path.asset_name == 'SkeletalMesh'), None)
anims = [a for a in assets if unreal.EditorAssetLibrary.find_asset_data(a).asset_class_path.asset_name == 'AnimSequence']
log(SRC_NAME + ' mesh %s, %d clips' % (mesh_path, len(anims)))
src_mesh = unreal.load_asset(mesh_path)
dst_mesh = unreal.load_asset(HUSK)


# 2. the IK rigs
def make_rig(name, mesh):
    path = SRC_DIR + '/' + name
    rig = unreal.load_asset(path) if eal.does_asset_exist(path) else tools.create_asset(name, SRC_DIR, unreal.IKRigDefinition, unreal.IKRigDefinitionFactory())
    c = unreal.IKRigController.get_controller(rig)
    c.set_skeletal_mesh(mesh)
    done = False
    for m in ('apply_auto_generated_retarget_definition', 'apply_auto_fbik'):
        if hasattr(c, m):
            try:
                getattr(c, m)()
                done = True
                log('%s: %s' % (name, m))
            except Exception as e:
                log('%s: %s failed: %s' % (name, m, e))
    chains = []
    for m in ('get_retarget_chains',):
        if hasattr(c, m):
            try:
                chains = [ch.get_editor_property('chain_name') if hasattr(ch, 'get_editor_property') else str(ch) for ch in getattr(c, m)()]
            except Exception as e:
                log('%s: chains: %s' % (name, e))
    log('%s: auto %s; retarget root %s; chains %s' % (name, done, c.get_retarget_root() if hasattr(c, 'get_retarget_root') else '?', chains))
    if not done:
        log('IKRigController has: %s' % methods(c))
    eal.save_loaded_asset(rig)
    return rig


src_rig = make_rig('IKR_' + SRC_NAME, src_mesh)
dst_rig = make_rig('IKR_Husk', dst_mesh)

# 3. the retargeter
rt_path = SRC_DIR + '/RTG_%s_to_Husk' % SRC_NAME
rtg = unreal.load_asset(rt_path) if eal.does_asset_exist(rt_path) else tools.create_asset('RTG_%s_to_Husk' % SRC_NAME, SRC_DIR, unreal.IKRetargeter, unreal.IKRetargetFactory())
rc = unreal.IKRetargeterController.get_controller(rtg)
log('IKRetargeterController has: %s' % methods(rc))
rc.set_ik_rig(unreal.RetargetSourceOrTarget.SOURCE, src_rig)
rc.set_ik_rig(unreal.RetargetSourceOrTarget.TARGET, dst_rig)
for m, args in (('set_preview_mesh', (unreal.RetargetSourceOrTarget.SOURCE, src_mesh)),
                ('set_preview_mesh', (unreal.RetargetSourceOrTarget.TARGET, dst_mesh))):
    if hasattr(rc, m):
        try:
            getattr(rc, m)(*args)
        except Exception as e:
            log('%s: %s' % (m, e))
if hasattr(rc, 'add_default_ops'):
    try:
        rc.add_default_ops()
        log('default ops added')
    except Exception as e:
        log('add_default_ops: %s' % e)
for m in ('auto_map_chains',):
    if hasattr(rc, m):
        try:
            rc.auto_map_chains(unreal.AutoMapChainType.FUZZY, True)
            log('chains auto-mapped')
        except Exception as e:
            log('auto_map_chains: %s' % e)
if hasattr(rc, 'auto_align_all_bones'):
    try:
        rc.auto_align_all_bones(unreal.RetargetSourceOrTarget.TARGET)
        log('the creature\'s retarget pose aligned to the source\'s')
    except Exception as e:
        log('auto_align_all_bones: %s' % e)
eal.save_loaded_asset(rtg)

# 4. every clip onto the creature
if not eal.does_directory_exist(OUT_DIR):
    eal.make_directory(OUT_DIR)
datas = [unreal.EditorAssetLibrary.find_asset_data(a) for a in anims]
log('duplicate_and_retarget: %s' % (unreal.IKRetargetBatchOperation.duplicate_and_retarget.__doc__ or '').split('\n')[0])
try:
    out = unreal.IKRetargetBatchOperation.duplicate_and_retarget(datas, src_mesh, dst_mesh, rtg, '', '', '', '_Husk', OUT_DIR, False, False, True)
except TypeError:
    out = unreal.IKRetargetBatchOperation.duplicate_and_retarget(assets_to_retarget=datas, source_mesh=src_mesh, target_mesh=dst_mesh,
                                                                 ik_retarget_asset=rtg, suffix='_Husk', target_path=OUT_DIR)
moved = 0
for d in out:
    p = str(d.package_name)
    if not p.startswith(OUT_DIR):
        new = OUT_DIR + '/' + p.split('/')[-1]
        if eal.does_asset_exist(new):
            eal.delete_asset(new)
        if eal.rename_asset(p, new):
            moved += 1
eal.save_directory(OUT_DIR)
eal.save_directory(SRC_DIR)
log('retargeted %d clips onto the creature (%d moved into %s)' % (len(out), moved, OUT_DIR))
