import bpy,sys
bpy.ops.import_scene.gltf(filepath=sys.argv[-1])
for img in bpy.data.images:
    px=list(img.pixels[:])
    n=len(px)//4;avg=[sum(px[i::4][::97])/len(px[i::4][::97]) for i in range(3)]
    print('IMG',img.name,img.size[:],['%.3f'%a for a in avg])
for o in bpy.data.objects:print('OBJ',o.type,o.name)
for a in bpy.data.actions:print('ACT',a.name,a.frame_range[:])
