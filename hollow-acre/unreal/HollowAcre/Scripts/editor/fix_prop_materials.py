"""Gives every Megascans prop mesh under /Game/HollowAcre/Megascans/Props its own material instance (MI_<folder>) on
all its slots: the importer's first way of setting them never stored, leaving the default grid material."""
import unreal
eal = unreal.EditorAssetLibrary
ROOT = '/Game/HollowAcre/Megascans/Props'
n = 0
for p in eal.list_assets(ROOT, recursive=True):
    a = unreal.load_asset(p.split('.')[0])
    if not isinstance(a, unreal.StaticMesh):
        continue
    folder = p.split('.')[0].rsplit('/', 1)[0]
    mi = unreal.load_asset('%s/MI_%s' % (folder, folder.rsplit('/', 1)[1]))
    if not mi:
        unreal.log_warning('[propmats] no MI for %s' % p)
        continue
    for k in range(len(a.static_materials)):
        a.set_material(k, mi)
    eal.save_loaded_asset(a)
    n += 1
unreal.log('[propmats] %d meshes given their materials' % n)
