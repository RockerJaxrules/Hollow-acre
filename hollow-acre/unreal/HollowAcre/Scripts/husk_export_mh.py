"""Export the husk's MetaHuman body and face (Content/HollowAcre/Creature/Husk/Built) to FBX for Blender
(Saved/Generated/Husk/), and log what they are made of: bones (the jaw, teeth, lips, fingers, toes), material slots,
the textures built with them. Read-only on the project's assets."""
import json
import os

import unreal

eal = unreal.EditorAssetLibrary
BUILT = '/Game/HollowAcre/Creature/Husk/Built/Husk'
OUT = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_saved_dir() + 'Generated/Husk')


def log(*a):
    unreal.log('[huskx] ' + ' '.join(str(x) for x in a))


try:
    os.makedirs(OUT, exist_ok=True)
    info = {}
    for key, path in (('body', BUILT + '/Body/SKM_MHC_Husk_BodyMesh'), ('face', BUILT + '/Face/SKM_MHC_Husk_FaceMesh')):
        m = unreal.load_asset(path)
        sk = m.get_editor_property('skeleton')
        names = [str(sk.get_bone_name(i)) for i in range(sk.get_num_bones())] if hasattr(sk, 'get_num_bones') else []
        if not names:
            ref = m.get_editor_property('ref_skeleton') if hasattr(m, 'ref_skeleton') else None
        slots = [str(s.get_editor_property('material_slot_name')) for s in m.get_editor_property('materials')]
        mats = [s.get_editor_property('material_interface').get_path_name() if s.get_editor_property('material_interface') else None
                for s in m.get_editor_property('materials')]
        b = m.get_bounds()
        info[key] = {'path': path, 'skeleton': sk.get_path_name(), 'bones': names, 'slots': slots, 'materials': mats,
                     'bounds': [b.origin.x, b.origin.y, b.origin.z, b.box_extent.x, b.box_extent.y, b.box_extent.z]}
        log(key, 'bones', len(names), 'slots', slots)
        task = unreal.AssetExportTask()
        task.set_editor_property('object', m)
        task.set_editor_property('filename', os.path.join(OUT, key + '.fbx'))
        task.set_editor_property('automated', True)
        task.set_editor_property('replace_identical', True)
        task.set_editor_property('prompt', False)
        opt = unreal.FbxExportOption()
        opt.set_editor_property('export_morph_targets', False)
        opt.set_editor_property('ascii', False)
        task.set_editor_property('options', opt)
        ok = unreal.Exporter.run_asset_export_task(task)
        log(key, 'exported', ok)
    tex = [a.split('.')[0] for a in eal.list_assets(BUILT, recursive=True, include_folder=False)
           if isinstance(unreal.load_asset(a.split('.')[0]), unreal.Texture)]
    info['textures'] = tex
    log('textures', len(tex), tex[:40])
    json.dump(info, open(os.path.join(OUT, 'husk_mh.json'), 'w'), indent=1)
    face = info['face']['bones']
    log('face bones with Jaw/Teeth/Tongue', [n for n in face if any(k in n for k in ('Jaw', 'Teeth', 'Tongue'))][:30])
    log('face lip bones', len([n for n in face if 'Lip' in n]), [n for n in face if 'Lip' in n][:20])
    log('body hand/foot bones', [n for n in info['body']['bones'] if any(k in n for k in ('thumb', 'index_0', 'pinky_03', 'ball', 'toe'))][:40])
except Exception as e:
    unreal.log_error('[huskx] FAILED %r' % (e,))
finally:
    unreal.SystemLibrary.quit_editor()
