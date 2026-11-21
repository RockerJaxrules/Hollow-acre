"""Rebuilds only M_HotIron (Scripts/make_play_materials.py's recipe), in place."""
import io
import unreal
src = unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_dir() + 'Scripts/make_play_materials.py')
c = io.open(src, encoding='utf-8').read()
ns = {'__name__': 'play_mats_part', '__file__': src}
exec(compile(c[:c.index('\ndef run():')], src, 'exec'), ns)
ns['hot_iron']()
