"""The piece library for furn3d.py: each piece is built in model space, front toward the viewer (+z), x right, y up,
1 unit = 1 px. rot=False for pieces on a wall or that look the same from every side."""
from blockprops import box, cyl, ball, ring, rod
import blockprops as BP

PIECES = {}
def piece(name, rot=True, size=(100, 110)):
    def deco(fn): PIECES[name] = (fn, rot, size); return fn
    return deco

# ---- the crafting benches and the furnace (batch 1: owner, "benches and furnaces redone, rotatable")
piece('bench_farm')(BP.bench_farm)
piece('bench_furn')(BP.bench_furn)
piece('bench_weapon')(BP.bench_weapon)
piece('bench_armor')(BP.bench_armor)
piece('furnace', size=(100, 120))(BP.furnace)
