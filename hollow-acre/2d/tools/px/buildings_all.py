"""Every building in the valley, redrawn through the building kit (tools/px/buildkit.py) and the pixel pipeline.
Each keeps its old footprint (so doors and collisions still line up) but gets its own character: material, roof, trim,
porch, shutters, awnings, signs, chimneys, wear and the odd wrong detail. Writes spr/lpc/obj/<name>.png and <name>_n.png
and merges the metadata into spr/lpc/objects.json. Run from hollow-acre/2d."""
import json, sys
sys.path.insert(0, 'tools/px')
from buildkit import build

SPECS = {
 # ---- Marrow Hollow homes
 'house_a':  dict(w=6, d=3.3, wall='white', roof='gable', roof_mat='slate', trim='green', shutter_col='green', door_col='red', shutters=True, boxes=True,
                  porch={'rail': True}, chimneys=[{'x': .2}], moss=.8, wear=.4, lamp=True, seed=101),
 'house_a2': dict(w=6, d=3.3, wall='sage', roof='hip', roof_mat='shingle_brown', trim='cream', door_col='yellow', boxes=True, chimneys=[{'x': .78}], moss=.5, wear=.5, seed=102),
 'house_b':  dict(w=6, d=3.3, wall='brick_red', roof='gable', roof_mat='slate', trim='white', door_col='black', chimneys=[{'x': .12}, {'x': .88}], porch={}, moss=.6, wear=.3, seed=103),
 'house_b2': dict(w=6, d=3.3, wall='plaster', roof='gable', roof_mat='thatch', trim='brown', door_col='oak', boxes=True, chimneys=[{'x': .7, 'mat': 'stone_grey'}], wear=.6, ivy='left', seed=104),
 'house_c':  dict(w=5, d=3.3, wall='mustard', roof='frontgable', roof_mat='shingle_red', trim='white', door_col='blue', boxes=True, wear=.5, seed=105),
 'house_c2': dict(w=5, d=3.3, wall='teal', roof='frontgable', roof_mat='slate', trim='cream', door_col='red', porch={'rail': True}, wear=.4, seed=106),
 'house_d':  dict(w=7, d=3.3, storeys=2, wall='grey', roof='gable', roof_mat='shingle_grey', trim='white', door_col='green', porch={'full': True, 'rail': True},
                  chimneys=[{'x': .8}], shutters=True, shutter_col='black', moss=.6, wear=.4, watcher=3, seed=107),
 'house_d2': dict(w=7, d=3.3, storeys=2, wall='stone_honey', roof='hip', roof_mat='slate', trim='cream', door_col='teal', chimneys=[{'x': .2, 'mat': 'stone_honey'}],
                  boxes=True, ivy='right', moss=.9, wear=.5, seed=108),
 # ---- the shops and public buildings round the green
 'store':      dict(w=10, d=3.3, wall='brick_red', roof='hip', roof_mat='shingle_brown', trim='cream', door_col='green', door={'kind': 'glass', 'w': 20, 'h': 34},
                    awning=('#a83a32', '#e8dcc0'), sign="COYLE'S GENERAL STORE", chimneys=[{'x': .85}], wear=.3, lamp=True, seed=111,
                    windows=[{'x': 1.3, 'w': 22, 'h': 22}, {'x': 3.0, 'w': 22, 'h': 22}, {'x': 7.0, 'w': 22, 'h': 22}, {'x': 8.7, 'w': 22, 'h': 22}]),
 'postoffice': dict(w=6, d=3.3, wall='brick_yellow', roof='flat', roof_mat='slate', trim='blue', door_col='blue', door={'kind': 'glass'}, sign='POST OFFICE',
                    windows=[{'x': 1.2, 'w': 18, 'h': 22}, {'x': 4.8, 'w': 18, 'h': 22}], wear=.3, lamp=True, seed=112),
 'townhall':   dict(w=10, d=3.6, storeys=2, wall='stone_grey', roof='hip', roof_mat='slate', trim='white', door_col='oak', door={'kind': 'double', 'w': 22, 'h': 38},
                    sign='TOWN HALL', chimneys=[{'x': .15, 'mat': 'stone_grey'}, {'x': .85, 'mat': 'stone_grey'}], moss=.7, wear=.4, seed=113),
 'tavern':     dict(w=10, d=3.4, storeys=2, wall='plaster', roof='gable', roof_mat='shingle_brown', trim='brown', door_col='oak', door={'kind': 'double', 'w': 20, 'h': 36},
                    sign='THE LAMPLIGHTER', chimneys=[{'x': .12, 'mat': 'stone_grey'}, {'x': .9, 'mat': 'brick_red'}], boxes=True, lamp=True, moss=.8, wear=.6, seed=114),
 'church':     dict(w=10, d=4.2, wall='white', roof='gable', roof_mat='slate', trim='white', door_col='oak', door={'dx': 0, 'w': 1, 'h': 1}, wall_h=94,
                    tower={'w': 38, 'above': 36, 'spire': 74}, moss=.7, wear=.5, seed=115,
                    windows=[{'x': 1.3, 'w': 14, 'h': 34, 'curtain': False}, {'x': 3.0, 'w': 14, 'h': 34, 'curtain': False}, {'x': 7.0, 'w': 14, 'h': 34, 'curtain': False}, {'x': 8.7, 'w': 14, 'h': 34, 'curtain': False}]),
 'schoolhouse':dict(w=8, d=3.3, wall='oxblood', roof='gable', roof_mat='shingle_grey', trim='white', door_col='green', sign='SCHOOL', steeple={'x': .5, 'w': 16, 'tower': 26, 'spire': 30, 'h': 74},
                    windows=[{'x': 1.3, 'w': 16, 'h': 24}, {'x': 2.8, 'w': 16, 'h': 24}, {'x': 5.2, 'w': 16, 'h': 24}, {'x': 6.7, 'w': 16, 'h': 24}], wear=.5, seed=116),
 # ---- Smith's Row and the trades
 'shop_bait':  dict(w=5, d=3.3, wall='grey', roof='gable', roof_mat='tin_rust', trim='blue', door_col='blue', sign='BAIT & TACKLE', wear=.9, moss=.4, seed=121,
                    windows=[{'x': 1.1}, {'x': 3.9, 'boarded': False}]),
 'shop_carp':  dict(w=6, d=3.3, wall='log', roof='gable', roof_mat='shingle_brown', trim='brown', door_col='oak', door={'kind': 'double', 'w': 22, 'h': 36}, sign='HARTLEY CARPENTRY',
                    chimneys=[{'x': .85, 'mat': 'stone_honey'}], wear=.6, seed=122),
 'shop_feed':  dict(w=6, d=3.3, wall='green', roof='gambrel', roof_mat='tin_green', trim='white', door_col='red', door={'kind': 'barn', 'w': 26, 'h': 38}, sign="BELL'S FEED",
                    wear=.6, seed=123, windows=[{'x': 1.0, 'curtain': False}, {'x': 5.0, 'curtain': False}]),
 'shop_forge': dict(w=6, d=3.3, wall='stone_grey', roof='gable', roof_mat='slate', trim='black', door_col='black', door={'kind': 'double', 'w': 24, 'h': 38}, sign="BRANNOCK'S FORGE",
                    chimneys=[{'x': .2, 'mat': 'stone_grey', 'h': 24}], wear=.8, moss=.5, seed=124, windows=[{'x': 4.9, 'curtain': False}]),
 'garage':     dict(w=8, d=3.3, wall='brick_brown', roof='flat', roof_mat='tin_rust', trim='red', door_col='grey' if False else 'black', door={'kind': 'double', 'w': 40, 'h': 40}, sign="PRUITT'S GARAGE",
                    windows=[{'x': 1.1, 'w': 16, 'h': 20, 'curtain': False}, {'x': 6.9, 'w': 16, 'h': 20, 'curtain': False, 'broken': True}], wear=.9, seed=125),
 # ---- Wickham: older, stone and thatch, by the river
 'inn':        dict(w=10, d=3.3, storeys=2, wall='plaster', roof='gable', roof_mat='thatch', trim='brown', door_col='green', door={'kind': 'double', 'w': 20, 'h': 36}, sign='THE LANTERN INN',
                    chimneys=[{'x': .1, 'mat': 'stone_honey'}, {'x': .9, 'mat': 'stone_honey'}], boxes=True, lamp=True, wear=.5, seed=131),
 'wk_house_a': dict(w=6, d=3.3, wall='stone_honey', roof='gable', roof_mat='thatch', trim='green', door_col='green', boxes=True, chimneys=[{'x': .85, 'mat': 'stone_honey'}], moss=1, wear=.6, seed=132),
 'wk_house_b': dict(w=6, d=3.3, wall='plaster', roof='gable', roof_mat='tile_red', trim='brown', door_col='oak', chimneys=[{'x': .2, 'mat': 'stone_grey'}], ivy='right', wear=.5, seed=133),
 'wk_house_c': dict(w=5, d=3.3, wall='stone_grey', roof='frontgable', roof_mat='slate', trim='black', door_col='red', wear=.7, moss=1, seed=134),
 'wk_house_d': dict(w=7, d=3.3, storeys=2, wall='rose', roof='hip', roof_mat='slate', trim='white', door_col='blue', shutters=True, shutter_col='blue', boxes=True, chimneys=[{'x': .75}], wear=.4, seed=135),
 'wk_chapel':  dict(w=10, d=4.2, wall='stone_grey', roof='gable', roof_mat='slate', trim='white', door_col='oak', door={'dx': 0, 'w': 1, 'h': 1}, wall_h=94,
                    tower={'w': 34, 'above': 30, 'spire': 60}, moss=1.4, wear=.7, seed=136,
                    windows=[{'x': 1.4, 'w': 12, 'h': 30, 'curtain': False}, {'x': 3.0, 'w': 12, 'h': 30, 'curtain': False}, {'x': 7.0, 'w': 12, 'h': 30, 'curtain': False}, {'x': 8.6, 'w': 12, 'h': 30, 'curtain': False}]),
 # ---- the farm: your house as it is when you arrive, patched, mended, then bigger
 'cabin_s0': dict(w=4.6, d=2.8, wall='grey', roof='gable', roof_mat='shingle_grey', trim='black', door_col='oak', wear=1.0, moss=2.0, gutter=False, seed=141,
                  windows=[{'x': .9, 'boarded': True, 'curtain': False}, {'x': 3.7, 'broken': True, 'curtain': False}], scratches=True),
 'cabin_s1': dict(w=4.6, d=2.8, wall='grey', roof='gable', roof_mat='shingle_grey', trim='white', door_col='oak', wear=.8, moss=1.4, seed=142,
                  windows=[{'x': .9}, {'x': 3.7, 'boarded': True, 'curtain': False}]),
 'cabin':    dict(w=6, d=3.3, wall='white', roof='gable', roof_mat='shingle_brown', trim='green', door_col='red', porch={'rail': True}, chimneys=[{'x': .18, 'mat': 'stone_grey'}],
                  boxes=True, shutters=True, shutter_col='green', wear=.4, moss=.6, seed=143),
 'cabin_t1': dict(w=6, d=3.3, wall='white', roof='gable', roof_mat='shingle_brown', trim='green', door_col='red', porch={'rail': True}, chimneys=[{'x': .18, 'mat': 'stone_grey'}],
                  boxes=True, shutters=True, shutter_col='green', wear=.3, moss=.4, lamp=True, seed=144),
 'cabin_t2': dict(w=8, d=3.3, wall='white', roof='gable', roof_mat='shingle_brown', trim='green', door_col='red', porch={'full': True, 'rail': True},
                  chimneys=[{'x': .14, 'mat': 'stone_grey'}, {'x': .86}], boxes=True, shutters=True, shutter_col='green', wear=.2, lamp=True, seed=145, dormers=[2.0, 6.0]),
 'cabin_t3': dict(w=8, d=3.3, storeys=2, wall='white', roof='gable', roof_mat='slate', trim='green', door_col='red', porch={'full': True, 'rail': True},
                  chimneys=[{'x': .14, 'mat': 'stone_grey'}, {'x': .86}], boxes=True, shutters=True, shutter_col='green', wear=.15, lamp=True, seed=146),
 'barn':     dict(w=6.8, d=3.4, wall='oxblood', roof='frontgambrel', roof_mat='tin_rust', trim='white', door_col='red', door={'kind': 'barn', 'w': 30, 'h': 40}, wall_h=56, wear=.7, seed=151,
                  windows=[{'x': 1.0, 'curtain': False}, {'x': 5.8, 'curtain': False, 'broken': True}]),
 'coop':     dict(w=3, d=3.3, wall='cream', roof='frontgable', roof_mat='tin_red', trim='white', door_col='oak', door={'w': 12, 'h': 22}, wall_h=46, wear=.6, gutter=False, seed=152, windows=[]),
 'shed':     dict(w=2.1, d=1.1, wall='grey', roof='gable', roof_mat='shingle_grey', trim='black', door_col='oak', door={'w': 14, 'h': 26}, wall_h=36, gutter=False, wear=.8, seed=153, windows=[]),
 'shed_b':   dict(w=2.1, d=1.1, wall='green', roof='gable', roof_mat='tin_green', trim='white', door_col='oak', door={'w': 14, 'h': 26}, wall_h=36, gutter=False, wear=.6, seed=154, windows=[]),
 # ---- out along the roads
 'rg_logcabin': dict(w=5, d=2.6, wall='log', roof='gable', roof_mat='shingle_brown', trim='brown', door_col='oak', chimneys=[{'x': .82, 'mat': 'stone_grey'}], moss=1.5, wear=.9, seed=161,
                     windows=[{'x': 1.0}, {'x': 4.0, 'boarded': True, 'curtain': False}]),
 'rg_chapel':   dict(w=9.8, d=3.4, wall='white', roof='gable', roof_mat='shingle_grey', trim='white', door_col='black', door={'dx': 0, 'w': 1, 'h': 1}, wall_h=86, tower={'w': 30, 'above': 24, 'spire': 50},
                     wear=1.0, moss=2.0, seed=162, windows=[{'x': 1.5, 'w': 12, 'h': 30, 'boarded': True, 'curtain': False}, {'x': 8.3, 'w': 12, 'h': 30, 'broken': True, 'curtain': False}]),
}

if __name__ == '__main__':
    only = set(sys.argv[1:])
    d = json.load(open('spr/lpc/objects.json')); n = 0
    for name, spec in SPECS.items():
        if only and name not in only: continue
        day, night, meta = build(spec)
        day.save(f'spr/lpc/obj/{name}.png'); night.save(f'spr/lpc/obj/{name}_n.png')
        for nm in (name, name + '_n'):
            old = d.get(nm, {}); m = dict(old); m.update({k: v for k, v in meta.items()}); m['src'] = f'spr/lpc/obj/{nm}.png'
            if 'foot' in old: m['foot'] = old['foot']           # keep the footprint the world was built around
            d[nm] = m
        n += 1
    json.dump(d, open('spr/lpc/objects.json', 'w')); print('rebuilt', n, 'buildings')
