import bpy,sys
src,dst=sys.argv[-2],sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
bpy.ops.export_scene.gltf(filepath=dst,export_format='GLTF_EMBEDDED',export_image_format='JPEG',export_animations=True,export_animation_mode='ACTIONS',export_skins=True)
