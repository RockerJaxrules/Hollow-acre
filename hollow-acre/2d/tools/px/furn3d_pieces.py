"""The piece library for furn3d.py: each piece is built in model space, front toward the viewer (+z), x right, y up,
1 unit = 1 px. rot=False for pieces on a wall or that look the same from every side."""
from blockprops import box, cyl, ball, ring, rod
import blockprops as BP

PIECES = {}
ELEV = {'in_chess': 45, 'in_table': 45, 'in_rockS': 40}    # a piece seen from higher up than the usual 30 degrees (flat tops: tables, boards)
SCALE = {}   # a piece drawn bigger or smaller than its model, to sit at the size of the sprite it replaces
def piece(name, rot=True, size=(100, 110)):
    def deco(fn): PIECES[name] = (fn, rot, size); return fn
    return deco

# ---- the crafting benches and the furnace (batch 1: owner, "benches and furnaces redone, rotatable")
piece('bench_farm')(BP.bench_farm)
piece('bench_furn')(BP.bench_furn)
piece('bench_weapon')(BP.bench_weapon)
piece('bench_armor')(BP.bench_armor)
piece('furnace', size=(100, 120))(BP.furnace)

# ---- batch 2: the furniture you place in the cabin (turns, except pieces that look the same from every side)
BP.RAMPS.update({
    'brass':  ['#3a2410', '#6a4818', '#9a7024', '#c49a3a', '#e8c868'],
    'glass':  ['#1c2a30', '#2e4650', '#4a6e76', '#7aa0a2', '#c8e0d8'],
    'paper':  ['#5a4d3b', '#8a7a5e', '#b8a682', '#d6c8a4', '#ece2c6'],
    'ivory':  ['#4a443a', '#7a7262', '#aaa28c', '#d0c8b0', '#ece6d2'],
    'pumpkin': ['#4a1a0c', '#7e3412', '#b25418', '#d8782a', '#f09c44'],
    'redbk':  ['#2e1214', '#4d1c1d', '#6e2a25', '#913b31', '#b25645'],
    'bluebk': ['#191b26', '#262a38', '#363d50', '#4a5369', '#626d86'],
    'greenbk': ['#14201a', '#203a28', '#2e5434', '#466e42', '#6a8a52'],
    'ink':    ['#0e0c10', '#1a161c', '#262028', '#342c34', '#443a40'],
})
BP.MATDEF.update({'glow': {'ramp': 'fire', 'emit': 3, 'ambient': 1}})


def legs4(w, d, h, m, t=3, inset=1):
    return [box(x, 0, z, x + t, h, z + t, m) for x in (-w + inset, w - inset - t) for z in (-d + inset, d - inset - t)]


@piece('in_shelf_jars', size=(80, 110))
def shelf_jars():
    P = [box(-24, 0, -7, -21, 50, 1, 'dkwood'), box(21, 0, -7, 24, 50, 1, 'dkwood'), box(-24, 0, -7, 24, 50, -5, 'dkwood', pattern=['planks', 6, 'x'])]
    for y in (1, 17, 33): P.append(box(-23.4, y, -5, 23.4, y + 2, 6.4, 'wood'))                           # shelves standing proud of the set-back sides
    P.append(box(-24.6, 49, -7.6, 24.6, 51.4, 6.8, 'wood', pattern=['grain', 1.4, 'x']))                       # a top over the full depth
    for i, (x, y, m, r, h) in enumerate([(-16, 19, 'glass', 3, 8), (-9, 19, 'clay', 3.5, 7), (-2, 19, 'glass', 3, 9), (6, 19, 'pumpkin', 3.5, 6), (14, 19, 'glass', 3, 8),
                                         (-15, 35, 'clay', 4, 9), (-6, 35, 'glass', 3, 7), (3, 35, 'greenbk', 3, 8), (12, 35, 'clay', 3.5, 7),
                                         (-14, 3, 'cloth', 5, 10), (2, 3, 'clay', 5, 9), (14, 3, 'cloth', 4, 8)]):
        P += [cyl(x, y, 0, r, h, m), cyl(x, y + h, 0, r * .6, 1.5, 'wood' if m == 'glass' else 'cloth')]
    end_frame(P, 24, 4, 50, m='wood')                                                            # framed ends for the side views
    P = [dict(q, min=[q['min'][0], q['min'][1], q['min'][2] - 3], max=[q['max'][0], q['max'][1], q['max'][2] - 3]) if q.get('mat') == 'wood' and q['type'] == 'box' and abs(abs(q['min'][0]) - 24.4) < 1.2 else q for q in P]
    P += [cyl(-20.6, 35, 3.4, 1.6, 6, 'glass'), cyl(20.6, 19, 3.4, 1.8, 6, 'clay'), cyl(20.4, 35, 3.6, 1.4, 5, 'pumpkin'), cyl(-20.4, 3, 3.6, 2.2, 8, 'cloth')]   # jars near the open ends
    P += [box(-21, 3, -5.6, 21, 47, -5.2, 'wood', pattern=['planks', 7, 'x'])]                     # seams on the back
    return P


@piece('in_clock', size=(50, 130))
def grandfather_clock():
    return [box(-9, 0, -6, 9, 6, -4 + 10, 'dkwood'), box(-7, 6, -5, 7, 48, 4, 'wood', pattern=['planks', 7, 'y']),
            box(-5, 14, 4, 5, 40, 5, 'glass'), rod([0, 40, 4.6], [0, 22, 4.6], .5, .5, 'brass'), cyl(0, 21, 4.6, 2.4, 1, 'brass', axis='z'),
            box(-9, 48, -6, 9, 66, 6, 'dkwood'), cyl(0, 57, 6, 6.5, 1, 'ivory', axis='z'), cyl(0, 57, 7, 1, 1, 'ink', axis='z'),
            rod([0, 57, 7.5], [0, 61, 7.5], .4, .4, 'ink'), rod([0, 57, 7.5], [3, 57, 7.5], .4, .4, 'ink'),
            box(-10, 66, -7, 10, 69, 7, 'wood'), ball(0, 71, 0, 0, 'wood', rr=[5, 3, 4]), ball(0, 75, 0, 1.4, 'oldbrass'),   # finial
            box(-9.6, 51, -3, -9, 63, 3, 'glass'), box(9, 51, -3, 9.6, 63, 3, 'glass'),                                     # side lights in the hood
            box(-6, 10, -5.6, 6, 44, -5, 'dkwood'), box(-4.6, 12, -6, 4.6, 42, -5.4, 'wood'),                               # a framed back panel
            box(-7.6, 10, -4, -7, 44, 3, 'dkwood'), box(7, 10, -4, 7.6, 44, 3, 'dkwood')]                                  # and sides


# ---- batch 1, redrawn (judge: the trade object must be the biggest, highest-contrast shape, lit rim on metal; vary repeats;
#      every cue drawn so it survives the turn). These replace the blockprops versions registered above.
BP.RAMPS.update({'pine': ['#4a3018', '#7a5228', '#a87a40', '#c89a58', '#dcb878'],
                 'blgrey': ['#1c2028', '#2c3440', '#425060', '#5c6c7c', '#7c8c98'],
                 'brick':  ['#2a1416', '#4a2020', '#6e3028', '#8e4430', '#a85a3c'],
                 'hot':    ['#5a2a14', '#8a3a18', '#b8541e', '#e07a2a', '#f8a848']})

def table2(w, d, h, top, m, leg):
    P = [box(-w, h, -d, w, h + top, d, m, pattern=['planks', 7, 'z'])]
    for x in (-w + 1, w - 5):
        for z in (-d + 1, d - 5): P.append(box(x, 0, z, x + 4, h, z + 4, leg))
    P.append(box(-w + 2, 5, -d + 2, w - 2, 7, d - 2, leg, pattern=['planks', 9, 'x']))
    return P


@piece('bench_farm')
def bench_farm2():
    P = table2(26, 10, 24, 4, 'blgrey', 'blgrey') + [box(-25, 18, 9.5, 25, 23.6, 10.5, 'blgrey', pattern=['planks', 6, 'x']), box(-25, 18.6, 10.4, 25, 19.4, 10.8, 'tin')]
    P += [box(-26, 28, -10, 26, 54, -7, 'blgrey', pattern=['planks', 7, 'y']), box(-26, 44, -10, 26, 46, -2, 'wood'),   # back panel, a bare-wood shelf
          box(-22, 28, -4, -3, 31, 7, 'wood')]                                                       # the seed tray
    for i in range(5):
        for k in range(2): P.append(ball(-20 + i * 3.8, 32, -1.5 + k * 5, 1.5 + .3 * ((i + k) % 2), 'leaf'))
    for x, r, h in ((-17, 3.6, 5), (-3, 3, 4), (11, 4, 6)): P += [cyl(x, 46, -6, r, h, 'clay'), ball(x, 47 + h, -6, r * .9, 'leaf', lumps=.5)]
    P += [cyl(15, 28, 3, 4, 6, 'clay'), ball(15, 37, 3, 4.5, 'leaf', lumps=.6, lumpfreq=1.2),
          cyl(2, 28, 4, 4.6, 8, 'tin'), cyl(2, 36, 4, 3.6, .8, 'tin'), rod([6, 30, 4], [13, 37, 5], 1.1, .7, 'tin'), cyl(13, 37, 5, 1.6, 1.2, 'tin'),
          ring(2, 38, 4, 3.2, .8, 'tin'),                                                                                   # a big watering can
          box(-23, 34, -9, -17, 41, -8, 'paper'), box(-15, 35, -9, -10, 41, -8, 'redbk'),                                # seed packets pinned up
          ball(-13, 12, 0, 0, 'cloth', rr=[7, 5, 5.5]), box(-17, 15, 4, -9, 18, 6, 'paper'),                              # the bone meal sack, labelled
          cyl(10, 7, 0, 3.5, 2, 'brass'), cyl(10, 9, 0, 1, 3, 'brass')]                                                    # a sprinkler head
    return P


@piece('bench_furn')
def bench_furn2():
    P = table2(27, 10, 22, 5, 'wood', 'dkwood')
    P += [box(-27, 27, -10, 27, 50, -7, 'dkwood', pattern=['planks', 9, 'y']),
          box(-22, 27, -3, 18, 30, 6, 'pine', pattern=['planks', 40, 'x']), box(18, 27, -3, 18.6, 30, 6, 'straw'),   # a fresh pine plank on the top...
          box(-1, 30, -1, 1, 41, 6, 'steel'), box(-2, 40, -1, 3, 45, 6, 'dkwood'), box(0, 41, 0, 2, 43, 5, 'pine'),     # ...a saw standing in its cut, handle up
          ball(-12, 30.5, 7, 1.8, 'straw'), ball(-8, 30.5, 8, 1.4, 'straw'), ball(6, 30.5, 7.5, 1.6, 'straw'), ball(10, 27.3, 8, 1.4, 'straw'), ball(-20, 1, 12, 0, 'straw', rr=[4, .8, 2.5]),   # shavings
          box(-22, 33, -7, 2, 39, -6, 'steel'), box(-25, 32, -7, -21, 40, -5, 'wood'),               # a big saw on the wall, toothed
          box(8, 31, -7, 10, 46, -6, 'steel'), box(8, 44, -7, 18, 46, -6, 'steel'),                   # a square
          box(-27, 16, 8, -19, 27, 13, 'iron'), cyl(-23, 20, 13, 1.2, 4, 'iron', axis='z'),             # the vice
          box(20, 36, -7, 21, 46, -6, 'steel'), box(23, 37, -7, 24, 46, -6, 'steel'), box(19, 44, -7, 25, 47, -6, 'wood'),
          box(-24, 7, -6, 24, 10, 4, 'wood', pattern=['planks', 4, 'y'])]
    for x in range(-21, 2, 3): P.append(box(x, 32, -7, x + 1, 33, -5.6, 'steel'))                   # the big saw's teeth
    return P


@piece('bench_weapon')
def bench_weapon2():
    P = table2(27, 10, 22, 5, 'dkwood', 'dkwood')
    P += [box(-2, 27, -10, 1, 58, -6, 'dkwood'), box(24, 27, -10, 27, 58, -6, 'dkwood'), box(-2, 55, -10, 27, 58, -6, 'dkwood'),   # the rack
          box(-2, 40, -10, 27, 42, -7, 'dkwood')]
    x = 5   # a long sword on the rack: lit blade, brass guard, wrapped grip, pommel
    P += [box(x + .2, 24, -6, x + 3.2, 52, -4.8, 'tin'), box(x + .6, 24, -5, x + 1.6, 52, -4.2, 'ivory'), rod([x + 1.7, 24.2, -5.4], [x + 1.7, 19, -5.4], 1.5, .2, 'tin'), box(x - 3.4, 52, -6.5, x + 6.8, 54.4, -4.5, 'steelbl'),
          box(x, 54.4, -6, x + 3.4, 58, -5, 'castiron'), ball(x + 1.7, 59, -5.5, 1.5, 'steelbl')]
    x = 12   # a second, shorter sword
    P += [box(x + .2, 28, -6, x + 3, 52, -4.8, 'tin'), box(x + .6, 28, -5, x + 1.5, 52, -4.2, 'ivory'), rod([x + 1.6, 28.2, -5.4], [x + 1.6, 23.4, -5.4], 1.4, .2, 'tin'), box(x - 2.8, 52, -6.5, x + 6, 54.2, -4.5, 'steelbl'),
          box(x, 54, -6, x + 3, 57, -5, 'castiron'), ball(x + 1.5, 58, -5.5, 1.3, 'steelbl')]
    P += [box(19, 30, -6, 21, 56, -5, 'dkwood'), box(21, 47, -6.4, 25.6, 55, -4.6, 'tin'), box(25, 46, -6.6, 26.4, 56, -4.4, 'ivory')]   # and an axe
    # the grindstone as a wheel you can read: a lit iron tyre round the stone, the hub and axle standing proud, a crank, a low trough
    P += [box(-26, 27, -5, -6, 30, 6, 'dkwood'), box(-25, 29.6, -4, -7, 30.2, 5, 'bluebk'),
          cyl(-16, 42, -4, 10, 5.6, 'burlap', axis='z'), ring(-16, 42, 1.4, 10, 1.1, 'iron'), ring(-16, 42, -4, 10, 1.1, 'iron'),
          cyl(-16, 42, 1.4, 3, 2, 'iron', axis='z'), cyl(-16, 42, -8, 1.3, 11.6, 'iron', axis='z'),
          box(-28, 27, -2, -26, 44, 0, 'dkwood'), box(-6, 27, -2, -4, 44, 0, 'dkwood'),
          rod([-16, 42, 2.4], [-10, 37, 3.4], 1, 1, 'iron'), rod([-10, 37, 3.4], [-10, 37, 9], 1.3, 1.3, 'wood'),
          box(6, 27, 2, 18, 29, 6, 'iron'), box(9, 29, 3, 15, 31, 5, 'iron'),
          box(-20, 7, -4, -8, 10, 4, 'iron'), box(-5, 7, -3, 4, 9.5, 3, 'steel'), box(7, 7, -4, 16, 11, 4, 'iron')]   # bars of different sizes
    return P


@piece('bench_armor')
def bench_armor2():
    P = table2(22, 10, 22, 5, 'wood', 'dkwood')
    P = [dict(p, min=[p['min'][0] + 10] + p['min'][1:], max=[p['max'][0] + 10] + p['max'][1:]) for p in P]
    # a steel breastplate on a T-cross stand (judge: the dress form read as a gourd): neck opening, shoulder plates, a lit ridge
    P += [box(-28, 0, -6, -16, 2, 6, 'dkwood'), box(-23, 2, -1, -21, 30, 1, 'dkwood'), box(-31, 44, -1, -13, 46, 1, 'dkwood'),
          ball(-22, 37, 1, 0, 'steel', rr=[8, 9, 5]), box(-22.6, 29, 5.5, -21.4, 45, 6.4, 'ivory'),
          ball(-29.5, 44, 0, 0, 'steel', rr=[3.5, 2.5, 4]), ball(-14.5, 44, 0, 0, 'steel', rr=[3.5, 2.5, 4]),
          cyl(-22, 45, 0, 2.6, 2, 'ink'), box(-27, 27, 4, -17, 29, 6, 'leather')]                    # the neck opening, a belt
    P += [ball(19, 34, -1, 7.6, 'tin'), cyl(19, 27, -1, 7.8, 7, 'tin'), box(13, 31, 5.4, 25, 33, 7.4, 'ink'), box(18.4, 26, 6.2, 19.6, 31, 7.6, 'ink'),   # a big helmet, visor slit
          box(18.4, 38, -9, 19.6, 41.6, 6, 'redbk'),                                                                                                        # its crest
          cyl(12, 13, 11, 11, 2, 'redbk', axis='z'), ring(12, 13, 13, 10.6, 1, 'tin'), cyl(12, 13, 13, 3, 1.6, 'tin', axis='z'),                           # a round shield leaning on the front
          cyl(2, 29, 2, 3, 20, 'leather', axis='x'), box(5, 27, -6, 15, 28, -2, 'leather'),
          box(-10, 7, -4, 30, 11, 4, 'leather')]
    return P


@piece('furnace', size=(100, 120))
def furnace2():
    P = [box(-16, 0, -12, 16, 30, 12, 'stone', pattern=['bricks', 5]),
         box(-18, 28, -14, 18, 32, 14, 'stone', pattern=['bricks', 7]),
         cyl(0, 32, -3, 7, 30, 'stone', pattern=['bricks', 5]), cyl(0, 61, -3, 8, 3, 'iron'),
         box(-11, 1, 11, 11, 20, 12.5, 'brick'),                                                       # warm brick round the mouth
         box(-8, 2, 12, 8, 16, 13, 'soot'), box(-7, 3, 12.5, 7, 13, 13.5, 'fire'),
         box(-10, 16, 12, 10, 19, 13.5, 'iron'), box(-12, 20, 12, 12, 27, 12.5, 'soot'),               # the lintel, soot above it
         box(17, 2, -6, 23, 8, 6, 'leather'), box(19, 8, -5, 21, 14, 5, 'wood'),                        # bellows at the side
         ball(-22, 3, 8, 0, 'ink', rr=[5, 3, 4]), ball(-20, 5, 9, 2, 'iron'), ball(-24, 4, 6, 1.6, 'clay')]   # a pile of coal and ore
    return P


# ---- batch 3: the room furniture seen most (beds, chairs, counters, shelves, stoves, pews, cupboards). Sizes follow the
#      sprites they replace; wall-hung and floor pieces stay flat.
BP.RAMPS.update({'stain': ['#1e0e0e', '#2e1414', '#3e1a18', '#4c221c', '#5a2a20'],
                 'redpt': ['#2a1012', '#4a1a1a', '#6e2622', '#94382c', '#b44e38'],
                 'tin':   ['#24282c', '#3c4248', '#5a6268', '#848c90', '#b4bab8'],
                 'ochre': ['#3a2a10', '#5e4416', '#86621e', '#a8822c', '#c8a444'],
                 'oldgold': ['#2e2410', '#4e3c18', '#6e5622', '#8a6e2e', '#a4883c'],
                 'greenbkD': ['#0e1810', '#182c1e', '#24402a', '#365a36', '#4e7044'],
                 'oldgoldD': ['#221a0a', '#3a2c12', '#56421a', '#6e5624', '#86702e'],
                 'redbkD':   ['#200c0e', '#3a1416', '#56201e', '#722c26', '#8e3e34'],
                 'bluebkD':  ['#12141c', '#1c2030', '#282e42', '#384058', '#4c5670']})


def _bed(quilt, frame='wood', stain=False, rumple=False):
    """a bed: head and foot boards, a mattress, pillows, a quilt that drapes over both sides with a turned-down fold
    at the head end (judges: bigger, muted patches; a fold and a drape; a stain is an irregular blot one step darker)"""
    P = []
    if frame == 'iron':
        P += [cyl(x, 0, z, 1.4, 17 if z > 0 else 32, 'iron') for x in (-24, 24) for z in (-48, 48)]
        P += [ball(x, 33, -48, 1.8, 'oldbrass') for x in (-24, 24)] + [ball(x, 18, 48, 1.6, 'oldbrass') for x in (-24, 24)]
        P += [box(-24, 29, -49, 24, 31, -47, 'iron'), box(-24, 14, 47, 24, 16, 49, 'iron')]
        P += [box(x - .6, 14, -48.6, x + .6, 29, -47.4, 'iron') for x in range(-18, 20, 6)]
        P += [box(-24, 8, -48, 24, 10, 48, 'iron')]
    else:
        P += [box(-26, 0, -50, 26, 32, -44, 'dkwood', pattern=['planks', 9, 'x']), box(-27, 32, -51, 27, 35, -43, 'wood'),
              ball(-26, 36.4, -47, 2, 'wood'), ball(26, 36.4, -47, 2, 'wood'),
              box(-26, 0, 44, 26, 15, 50, 'dkwood', pattern=['planks', 9, 'x']), box(-27, 15, 43, 27, 17, 51, 'wood'),
              box(-26, 6, -44, -22, 12, 44, 'wood'), box(22, 6, -44, 26, 12, 44, 'wood')]
    P += [box(-23, 12, -44, 23, 18, 44, 'paper')]                                                            # the mattress
    P += [ball(-10, 19.6, -38, 0, 'paper', rr=[9, 3.2, 5]), ball(10, 19.6, -38, 0, 'paper', rr=[9, 3.2, 5])]   # pillows
    zq0, zq1 = -27, 44
    if isinstance(quilt, list):   # patchwork: four big patches across, five down, the same patches on the drape
        cols = 4; rows = 5; pw = 48 / cols; pd = (zq1 - zq0) / rows
        for i in range(cols):
            for j in range(rows):
                m = quilt[(i + 2 * j + (j // 2)) % len(quilt)]
                P.append(box(-24 + i * pw, 18, zq0 + j * pd, -24 + (i + 1) * pw, 19 + (.25 if (i + j) % 2 else 0), zq0 + (j + 1) * pd, m))
        for j in range(rows):
            for sx in (-1, 1):
                m = quilt[((0 if sx < 0 else cols - 1) + 2 * j + (j // 2)) % len(quilt)]
                P.append(box(24 * sx - (.9 if sx > 0 else 0), 7, zq0 + j * pd, 24 * sx + (.9 if sx < 0 else 0), 19, zq0 + (j + 1) * pd, m))
        fold = quilt[0]
    else:
        P += [box(-24.9, 7, zq0, 24.9, 19.2, zq1, quilt)]
        if rumple: P += [box(-24.95, 7, z, 24.95, 19.3, z + 2.2, rumple) for z in (-12, -8, 32, 36)]
        fold = quilt
    P += [box(-24.9, 18, zq0 - 6, 24.9, 20.6, zq0 + .5, fold), box(-24.6, 20.6, zq0 - 5, 24.6, 21.2, zq0 - 1, 'paper')]   # the turned-down fold, sheet showing
    fm = fold if not fold.endswith('D') else fold[:-1]
    P += [box(-24.9, 12, 43.6, 24.9, 19.4, 45, fm), box(-24.9, 11, 44.6, 24.9, 12.4, 45.6, fm)]                                                           # the quilt over the foot board
    if stain:   # an irregular blot, one step darker than the blanket
        sm = (fold + 'D') if (fold + 'D') in BP.RAMPS else 'plum'
        P += [ball(4, 19.4, 10, 0, sm, rr=[5, .5, 3.4]), ball(8, 19.4, 13, 0, sm, rr=[3.4, .5, 4]), ball(1, 19.4, 15, 0, sm, rr=[2, .5, 2.4])]
    return P

piece('in_bed', size=(90, 110))(lambda: _bed(['redbkD', 'greenbkD', 'oldgoldD', 'plum', 'leather']))
piece('in_bed_b', size=(90, 110))(lambda: _bed(['bluebk', 'blgrey', 'plum', 'bluebk', 'greenbk']))
piece('in_bed_c', size=(90, 110))(lambda: _bed('greenbk', rumple='leather', stain=True))
piece('in_bed_d', size=(90, 110))(lambda: _bed('oldgold', frame='iron', rumple='plum', stain=True))


@piece('in_chair', size=(50, 70))
def ladder_chair():
    P = [box(x - 1.3, 0, z, x + 1.3, 15, z + 2.6, 'dkwood') for x in (-8, 8) for z in (-8, 5.4)]
    P += [box(-9.5, 15, -8.5, 9.5, 17.5, 8.5, 'wood', pattern=['planks', 4, 'x']),
          box(-9.5, 15, -9, -6.5, 38, -6.5, 'dkwood'), box(6.5, 15, -9, 9.5, 38, -6.5, 'dkwood'),
          ball(-8, 39, -7.7, 1.6, 'wood'), ball(8, 39, -7.7, 1.6, 'wood'),
          box(-7, 6, -7, 7, 7.5, -5.6, 'dkwood'), box(-7, 6, 5, 7, 7.5, 6.4, 'dkwood')]
    P += [box(-7, y, -8.6, 7, y + 2.5, -7, 'wood') for y in (22, 28, 34)]                      # the ladder slats
    return P








@piece('in_shelf_cans', size=(90, 110))
def shelf_cans():
    P = [box(-31, 0, -8, -28, 80, 7, 'dkwood'), box(28, 0, -8, 31, 80, 7, 'dkwood'), box(-31, 0, -8, 31, 80, -6, 'dkwood', pattern=['planks', 8, 'x']),
         box(-32, 79, -9, 32, 82, 8, 'wood')]
    labels = ['redbk', 'greenbk', 'pumpkin', 'bluebk', 'paper', 'redpt']
    for k, y in enumerate((1, 20, 39, 58)):
        P.append(box(-29, y, -6, 29, y + 2, 7, 'wood'))
        if k == 0:   # sacks and a crate on the bottom shelf
            P += [ball(-18, y + 8, 1, 0, 'cloth', rr=[8, 6, 5]), ball(-2, y + 7, 1, 0, 'cloth', rr=[7, 5, 5]), box(9, y + 2, -4, 26, y + 14, 6, 'wood', pattern=['planks', 4, 'y'])]
            continue
        x = -26; i = k
        while x < 25:
            m = labels[(i * 7 + k * 3) % len(labels)]; i += 1
            if (i + k) % 9 == 4: x += 5; continue                                          # a gap where something sold out
            P += [cyl(x, y + 2, 2, 2.3, 7, 'tin'), cyl(x, y + 3.5, 2, 2.45, 4, m)]
            if (i + k) % 3 == 0: P += [cyl(x, y + 9, 2, 2.3, 7, 'tin'), cyl(x, y + 10.5, 2, 2.45, 4, m)]   # stacked two high
            x += 5.3
    return P




@piece('in_wardrobe', size=(80, 130))
def wardrobe():
    return [box(-26, 0, -11, 26, 4, 11, 'dkwood'), box(-25, 4, -10, 25, 88, 10, 'wood'),
            box(-28, 88, -12, 28, 92, 12, 'dkwood'), box(-27, 92, -11, 27, 94, 11, 'wood'),
            box(-24, 7, 10, -1, 85, 11, 'wood'), box(1, 7, 10, 24, 85, 11, 'wood'),
            box(-.6, 7, 10, .6, 85, 11.2, 'dkwood'),
            box(-21, 12, 11, -4, 44, 11.6, 'dkwood'), box(4, 12, 11, 21, 44, 11.6, 'dkwood'),       # panels
            box(-21, 50, 11, -4, 80, 11.6, 'dkwood'), box(4, 50, 11, 21, 80, 11.6, 'dkwood'),
            box(-19, 14, 11.4, -6, 42, 12, 'wood'), box(6, 14, 11.4, 19, 42, 12, 'wood'),
            box(-19, 52, 11.4, -6, 78, 12, 'wood'), box(6, 52, 11.4, 19, 78, 12, 'wood'),
            box(-3.6, 44, 11, -2, 50, 12.4, 'brass'), box(2, 44, 11, 3.6, 50, 12.4, 'brass'),
            box(24, 60, -4, 25.5, 82, 2, 'cloth')]                                                  # a sleeve caught in the door


@piece('in_cabinet', size=(70, 120))
def cupboard():
    P = [box(-21, 0, -9, 21, 3, 9, 'dkwood'), box(-20, 3, -8, 20, 84, 8, 'wood'), box(-23, 84, -10, 23, 88, 10, 'dkwood')]
    for y0, y1 in ((6, 40), (44, 81)):
        for x0 in (-18, 1):
            P += [box(x0, y0, 8, x0 + 17, y1, 9, 'dkwood'), box(x0 + 2, y0 + 2, 8.5, x0 + 15, y1 - 2, 9.5, 'wood')]
        P += [box(-2.4, (y0 + y1) / 2 - 3, 9, -1, (y0 + y1) / 2 + 3, 10.2, 'brass'), box(1, (y0 + y1) / 2 - 3, 9, 2.4, (y0 + y1) / 2 + 3, 10.2, 'brass')]
    P += [cyl(-12, 88, -2, 3, 6, 'clay'), cyl(10, 88, 0, 2.5, 8, 'glass')]
    return P





















# ---- batch 4: outdoor props. Round things (barrel, bucket, drum, lamp post, pumpkin, tyres) look the same from every side.
BP.RAMPS.update({'straw':  ['#3e3014', '#6a5420', '#94782e', '#b89a44', '#d4b862'],
                 'burlap': ['#3c3228', '#62523e', '#8a765a', '#ac987a', '#c8b898'],
                 'greenpt': ['#18241e', '#26382c', '#3a523c', '#56704e', '#78905e'],
                 'moss':   ['#1a2416', '#283a1e', '#3a5228', '#506a32', '#6a8440']})


def _staves(r, h, m, y=0, hoops=(.18, .82), bulge=1.0, hm='iron'):
    """A barrel: stacked bands so the middle bulges, staves as vertical planks, iron hoops."""
    P = []; n = 8
    for k in range(n):
        t = (k + .5) / n; rr = r * (1 - .1 * (2 * t - 1) ** 2 * bulge)
        P.append(cyl(0, y + h * k / n, 0, rr, h / n + .02, m, pattern=['planks', 4, 'x']))
    P += [ring(0, y + h * f, 0, r * (1 - .1 * (2 * f - 1) ** 2 * bulge) + .3, .75, hm, axis='y') for f in hoops]
    return P




















@piece('sacks', size=(56, 50))
def sacks():
    P = []
    for x, z, s, rot in ((-7, -2, 1, 0), (8, 1, .9, 1)):
        P += [ball(x, 9 * s, z, 0, 'burlap', rr=[9 * s, 10 * s, 7 * s], lumps=.2), ball(x, 19 * s, z, 0, 'burlap', rr=[4 * s, 3 * s, 3.4 * s]),
              ring(x, 17 * s, z, 3.2 * s, .7, 'rope', axis='y'), ball(x - 2 * s, 23 * s, z + 1, 0, 'burlap', rr=[2.6, 1.4, 2])]
    P += [ball(1, 4, 9, 0, 'burlap', rr=[9, 5, 6], lumps=.2), box(-3, 6, 14, 4, 9, 14.6, 'paper')]       # one lying in front, tagged
    return P








@piece('anvil', size=(56, 46))
def anvil():
    return [box(-8, 0, -6, 8, 4, 6, 'iron'), box(-5, 4, -4, 5, 9, 4, 'iron'), box(-10, 9, -5, 8, 14, 5, 'iron'),
            rod([8, 11.5, 0], [17, 12.5, 0], 3.6, .8, 'iron'), box(-13, 11, -3, -10, 14, 3, 'iron'),        # horn and heel
            box(-10, 14, -5, 8, 14.8, 5, 'steel'), box(-7, 14.8, -1, -5, 15.4, 1, 'ink'),                    # a polished face with a hardy hole
            rod([-4, 15.4, 3], [6, 16, 6], .9, .9, 'dkwood'), box(-6, 15, 1.6, -2, 18, 4.4, 'iron')]          # a hammer resting on it










@piece('wheel', size=(60, 70))
def wagon_wheel():
    P = [ring(0, 22, 0, 19, 1.8, 'dkwood', axis='z'), ring(0, 22, 0, 20.6, .5, 'iron', axis='z'), cyl(0, 22, -3, 3.4, 6, 'dkwood', axis='z')]
    import math
    for k in range(10):
        a = k * math.pi / 5; P.append(rod([3 * math.cos(a), 22 + 3 * math.sin(a), 0], [18 * math.cos(a), 22 + 18 * math.sin(a), 0], .9, .8, 'wood'))
    P += [ball(0, 1, 0, 0, 'moss', rr=[8, 1.6, 4])]
    return P












def _gas_pump(lit=False):
    g, d = ('glow', 'glow') if lit else ('ivory', 'glass')
    return [box(-11, 0, -8, 11, 3, 8, 'stone'), box(-9, 3, -6, 9, 50, 6, 'redpt'), box(-9.6, 46, -6.6, 9.6, 50, 6.6, 'ivory'),
            cyl(0, 50, 0, 7, 3, 'ivory'), ball(0, 58, 0, 0, g, rr=[7, 6, 4]), cyl(0, 58, 3.6, 4.4, 1, 'redpt', axis='z'),
            box(-6, 30, 6, 6, 42, 6.8, d), box(-4, 33, 6.6, 4, 35, 7, 'ink'), box(-4, 37, 6.6, 1, 39, 7, 'ink'),
            box(9, 22, -2, 12, 32, 2, 'iron'), rod([12, 30, 0], [15, 16, 3], .9, .9, 'ink'), rod([15, 16, 3], [13, 6, 5], .9, .9, 'ink'),
            box(-6, 10, 6, 6, 20, 6.8, 'ivory'), box(-4, 13, 6.6, 4, 17, 7, 'redpt')]

piece('gas_pump', size=(50, 110))(lambda: _gas_pump())
piece('gas_pump_n', rot=False, size=(50, 110))(lambda: _gas_pump(True))   # night: the globe and the readout lit







# ---- batch 2, round 2 (judges: rockers and lights must read at 1x, no candy brass, no stripes of equal books, a real checker,
#      piano keys in twos and threes, lids lighter than sides; turn check: frame every end panel)
BP.RAMPS.update({'oldbrass': ['#2e1e10', '#54381a', '#7a5626', '#9a7434', '#b89650'],
                 'ocean':    ['#16222e', '#20384c', '#2c5068', '#44708a', '#6e9aac'],
                 'gourd':    ['#2e140c', '#52240e', '#7a3814', '#9c5420', '#b8743a'],
                 'plum':     ['#1c1216', '#2e1c20', '#42282a', '#5a3834', '#744a40']})


def end_frame(P, w, d, h, m='dkwood', inset=1.2):
    """stiles and rails on both end panels, so a side view shows a framed panel and not a blank slab"""
    for sx in (-1, 1):
        x0 = sx * w - (0 if sx > 0 else .8); x1 = x0 + .8
        P += [box(x0, 0, -d, x1, h, -d + inset * 2, m), box(x0, 0, d - inset * 2, x1, h, d, m),
              box(x0, h - 2.4, -d, x1, h, d, m), box(x0, 0, -d, x1, 2.4, d, m)]
    return P










@piece('in_desk', size=(90, 90))
def writing_desk():
    P = legs4(26, 9, 22, 'dkwood') + [box(-27, 22, -10, 27, 26, 10, 'wood', pattern=['planks', 3.5, 'x']),
         box(8, 4, -9, 25, 22, 8, 'wood'), box(9, 15, 8, 24, 16, 9, 'dkwood'), box(9, 9, 8, 24, 10, 9, 'dkwood'),        # a drawer pedestal
         box(15, 18, 8, 18, 19.6, 10, 'oldbrass'), box(15, 12, 8, 18, 13.6, 10, 'oldbrass'),
         box(-27, 26, -10, 27, 30, -7, 'dkwood'), box(-27, 30, -10, 27, 31.4, -6, 'wood'),                              # a low gallery, not a hutch
         box(-18, 26, -2, -2, 27, 8, 'paper'), box(-15, 27, 0, -6, 28, 6, 'ivory'),
         cyl(3, 26, 2, 1.8, 2.6, 'ink'), rod([3.5, 28.4, 2], [9, 36, -2], .5, 1.3, 'ivory'),                             # inkwell and a proper quill
         cyl(18, 26, -3, 3, 2, 'oldbrass'), cyl(18, 28, -3, 2, 6, 'glass'), box(17, 30, -4, 19, 32, -2, 'glow')]
    return end_frame(P, 27, 9.5, 22)






@piece('in_piano', size=(100, 110))
def upright_piano():
    P = [box(-30, 0, -10, 30, 50, 4, 'dkwood'), box(-31, 50, -11, 31, 53, 5, 'wood'),
         box(-27, 30, 4, -2, 46, 4.8, 'plum'), box(2, 30, 4, 27, 46, 4.8, 'plum'),                                   # inset panels
         box(-28, 22, 4, 28, 26, 13, 'dkwood'), box(-27, 26, 5, 27, 27, 12, 'ivory'),
         box(-28, 6, 4, -24, 22, 9, 'dkwood'), box(24, 6, 4, 28, 22, 9, 'dkwood'), box(-24, 3, 2, 24, 18, 4.6, 'plum')]
    for g, x0 in enumerate(range(-26, 26, 7)):                                                    # black keys in twos and threes
        for k in range(2 if g % 2 == 0 else 3): P.append(box(x0 + k * 2, 27, 5, x0 + k * 2 + 1.1, 27.8, 8.6, 'ink'))
    P += [box(-8, 31, 3.4, 8, 42, 5.4, 'oldbrass'), box(-6, 33, 5.4, 6, 41, 6, 'paper'),
          cyl(-24, 53, -4, 2, 1, 'oldbrass'), cyl(-24, 54, -4, 1, 6, 'ivory'), ball(-24, 61.4, -4, 0, 'glow', rr=[.8, 1.5, .8]),
          cyl(22, 53, -4, 2, 1, 'oldbrass'), cyl(22, 54, -4, 1, 4, 'ivory'), ball(22, 59.4, -4, 0, 'glow', rr=[.8, 1.5, .8]),
          box(-8, 0, 8, 8, 12, 15, 'dkwood'), box(-9, 12, 7, 9, 14, 16, 'redbk')]
    P += [box(x, 4, -10.8, x + 3, 48, -10, 'wood') for x in (-26, -1.5, 23)] + [box(-24, 10, -10.6, 24, 44, -10.2, 'plum')]   # bracing and soundboard at the back
    return end_frame(P, 30, 10, 50, m='wood')


@piece('in_globe', rot=False, size=(50, 80))
def globe():
    return [cyl(0, 0, 0, 8, 2, 'dkwood'), rod([0, 2, 0], [0, 17, 0], 1.8, 1.4, 'dkwood'), cyl(0, 16, 0, 3.4, 1.4, 'oldbrass'),
            ring(0, 30, -.2, 12, 1.4, 'oldbrass'), ring(0, 30, 0, 12, 1, 'oldbrass', axis='x'),
            ball(0, 30, 0, 10, 'ocean'), ball(-3.5, 33.5, 5.5, 0, 'greenbk', rr=[4.6, 4, 3]), ball(4.5, 26.6, 5.8, 0, 'greenbk', rr=[3.4, 3.6, 2.6]),
            ball(5.6, 35, -1, 0, 'paper', rr=[2.6, 1.6, 2.2]), cyl(0, 41.4, 0, 1.4, 1.6, 'oldbrass')]


@piece('in_candles', rot=False, size=(50, 80))
def candelabra():
    P = [cyl(0, 0, 0, 6, 2, 'oldbrass'), cyl(0, 2, 0, 1.6, 22, 'oldbrass'), ball(0, 12, 0, 2.4, 'oldbrass')]
    for x, h in ((-12, 7), (-6, 9), (0, 11), (6, 9), (12, 7)):
        P += [rod([0, 22, 0], [x, 25, 0], .9, .9, 'oldbrass'), cyl(x, 25, 0, 1.9, 1, 'oldbrass'), cyl(x, 26, 0, 1.2, h, 'ivory'),
              ball(x, 27.8 + h, 0, 0, 'glow', rr=[1, 1.8, 1])]
    P += [ball(-12, 30, 1.2, 0, 'ivory', rr=[.6, 2, .5])]                                         # a drip of wax
    return P






@piece('jack_b', size=(56, 56))
def jack_o_lantern():
    import math
    P = [ball(6 * math.cos(a * math.pi / 4), 10, 5.4 * math.sin(a * math.pi / 4), 0, 'gourd', rr=[7.2, 9, 7]) for a in range(8)]
    P += [ball(0, 11, 0, 0, 'gourd', rr=[8.4, 9.4, 8]), rod([0, 19, 0], [1.6, 23, -1], 1.6, 1.1, 'greenbk')]
    P += [box(-8, 12, 10.4, -3, 16.6, 13, 'glow'), box(3, 12, 10.4, 8, 16.6, 13, 'glow'), box(-1.2, 9, 11.4, 1.2, 11.4, 13, 'glow'),   # eyes, nose
          box(-8, 4, 10.4, 8, 7.6, 13, 'glow'), box(-5, 6.6, 12.6, -3, 7.8, 13.2, 'gourd'), box(2, 3.8, 12.6, 4, 5, 13.2, 'gourd')]   # a grin with teeth
    return P



# ---- batch 2, round 3 (round 2 lost these to the old art: rockers hidden from the front, a flame too small to glow, books gone
#      to mud, a top crate that read as a radio, a checker read as a tablecloth, a cradle read as a framed picture)
BP.RAMPS.update({'clearglass': ['#2a2a28', '#4a4a44', '#74746a', '#a6a496', '#d6d2c0'],
                 'spineR': ['#3a1614', '#5e2420', '#82342a', '#a64a36', '#c0664a'],
                 'spineG': ['#1a2a1c', '#2a4430', '#3c5e40', '#567a52', '#78985e'],
                 'spineB': ['#1e2434', '#2e3a52', '#425272', '#5c6e8e', '#8494aa']})


@piece('in_rockS', size=(80, 110))
def rocking_chair():
    P = []
    for x in (-11.8, 11.8):   # tall runners, pale pine, tips curling up well in front of the feet and behind the back
        pts = [(-20, 8), (-15, 3), (-8, .8), (0, 0), (10, .8), (20, 3.6), (27, 10)]
        for (z0, y0), (z1, y1) in zip(pts, pts[1:]): P.append(rod([x, y0 + 2.2, z0], [x, y1 + 2.2, z1], 2.2, 2.2, 'pine'))
    P += [box(x - 1.4, 3, z, x + 1.4, 16, z + 2.8, 'dkwood') for x in (-11, 11) for z in (-8, 5.4)]
    P += [box(-12, 16, -9, 12, 18.6, 10, 'dkwood', pattern=['planks', 4, 'x']),
          box(-12, 16, -10, -9, 46, -7, 'dkwood'), box(9, 16, -10, 12, 46, -7, 'dkwood'),
          box(-12, 42, -10.4, 12, 46, -6.6, 'wood'), ball(-10.5, 47.4, -8.5, 1.9, 'wood'), ball(10.5, 47.4, -8.5, 1.9, 'wood')]
    P += [box(x, 18.6, -9.4, x + 1.8, 42, -8.2, 'wood') for x in (-7.5, -3.5, .5, 4.5)]
    P += [box(-13, 27, -8, -10, 29, 10, 'wood'), box(10, 27, -8, 13, 29, 10, 'wood'),
          box(-12.4, 18.6, 8, -10.6, 27, 9.6, 'dkwood'), box(10.6, 18.6, 8, 12.4, 27, 9.6, 'dkwood'),
          box(-9, 18.6, -7, 9, 20.4, 7, 'plum'), box(-9, 20.4, -1, 9, 21, .4, 'redbk')]                     # a dull cushion with one fold
    return P


@piece('in_oillamp', rot=False, size=(50, 90))
def oil_lamp():
    P = [cyl(0, 0, 0, 5, 2, 'dkwood'), cyl(0, 2, 0, 1.4, 20, 'dkwood'), cyl(0, 22, 0, 9, 2.4, 'wood')]
    P += [cyl(0, 24.4, 0, 4.4, 1.6, 'oldbrass'), ball(0, 29, 0, 0, 'oldbrass', rr=[5, 3.6, 5]), cyl(0, 32, 0, 3.2, 1.4, 'oldbrass'),   # a brass font
          cyl(0, 33.4, 0, 2.6, 1.2, 'oldbrass'), ball(0, 37.6, 0, 0, 'glow', rr=[1.8, 3.4, 1.8]),                                      # a pale-cored flame...
          *[rod([2.6 * c, 34.4, 2.6 * z], [2.2 * c, 42, 2.2 * z], .35, .35, 'clearglass') for c, z in ((1, 0), (-1, 0), (0, 1), (0, -1), (.7, .7), (-.7, .7))],
          ring(0, 42, 0, 2.2, .4, 'clearglass', axis='y'),                                                                             # ...inside a thin glass chimney
          cyl(0, 40.4, 0, 2.2, 1, 'oldbrass'), box(5, 25, -1, 8, 26.6, 1, 'oldbrass')]
    return P


@piece('in_shelf_books', size=(80, 120))
def bookcase():
    P = [box(-24, 0, -7, -21, 62, 1, 'dkwood'), box(21, 0, -7, 24, 62, 1, 'dkwood'), box(-24, 0, -7, 24, 62, -5, 'dkwood', pattern=['planks', 8, 'x']),
         box(-25, 61, -8, 25, 64, 7, 'wood', pattern=['grain', 1.4, 'x'])]
    P += [box(-23, y, -7.6, 23, y + 2.4, -7, 'wood') for y in (2, 17, 32, 47)] + [box(x, 3, -7.4, x + 1, 60, -7, 'dkwood') for x in (-13, -2, 9)]   # the back: rails at each shelf, uneven boards
    end_frame(P, 24, 4, 61, m='wood')
    P = [dict(q, min=[q['min'][0], q['min'][1], q['min'][2] - 3], max=[q['max'][0], q['max'][1], q['max'][2] - 3]) if q.get('mat') == 'wood' and q['type'] == 'box' and abs(abs(q['min'][0]) - 24.4) < 1.2 else q for q in P]
    for y in (1, 16, 31, 46): P.append(box(-23.4, y, -5, 23.4, y + 2, 6.6, 'wood'))
    import random
    rnd = random.Random(5)
    for row, y in enumerate((3, 18, 33, 48)):
        x = -21
        if row == 0:   # big folios lying flat on the bottom shelf, a box beside them
            P += [box(-21, 3, -3, -6, 5.4, 5, 'spineR'), box(-20, 5.4, -2.4, -7, 7.6, 4.4, 'spineB'), box(-19, 7.6, -2, -9, 9.4, 4, 'leather'),
                  box(-4, 3, -3, 8, 11, 5, 'pine', pattern=['planks', 3, 'y']), box(10, 3, -2, 20, 14, 5, 'spineG')]
            continue
        while x < 19:
            r = rnd.random()
            if r < .1: x += 3; continue
            if r < .2 and x < 15:
                P.append(rod([x + .8, y, 1], [x + 4, y + 10, 1], 1.1, 1.1, rnd.choice(('spineR', 'spineG', 'paper')))); x += 5; continue
            if r < .26:
                P.append(rnd.choice((cyl(x + 2, y, 1, 2, 6, 'clearglass'), cyl(x + 2, y, 1, 1.2, 4, 'ivory')))); x += 5; continue
            w = rnd.choice((2, 2, 3, 3, 4)); h = rnd.choice((7, 9, 10, 11, 12, 13)); m = rnd.choice(('spineR', 'spineB', 'spineG', 'leather', 'paper', 'oldgold'))
            P.append(box(x, y, -3 + rnd.choice((0, .6, 1.2)), x + w, y + h, 5.4, m)); x += w
        P += [box(-23.2, y, -1, -21.4, y + 9, 5.6, 'spineR'), box(21.4, y, -1, 23.2, y + 10, 5.6, 'spineG')]   # spines at the open ends
    return P


@piece('in_crates', size=(80, 90))
def crates():
    def crate(x0, y0, z0, x1, y1, z1):
        Q = [box(x0, y0, z0, x1, y1, z1, 'wood', pattern=['planks', 4.5, 'y'])]
        for zf in (z1, z0 - .6):   # frame and a diagonal brace on the front and back
            Q += [box(x0 - .4, y0, zf, x1 + .4, y0 + 2, zf + .6, 'dkwood'), box(x0 - .4, y1 - 2, zf, x1 + .4, y1, zf + .6, 'dkwood'),
                  box(x0 - .4, y0, zf, x0 + 1.8, y1, zf + .6, 'dkwood'), box(x1 - 1.8, y0, zf, x1 + .4, y1, zf + .6, 'dkwood')]
        Q += [rod([x0 + 2.6, y0 + 2.6, z1 + .5], [x1 - 2.6, y1 - 2.6, z1 + .5], 1.3, 1.3, 'dkwood')] + [ball(xx, yy, z1 + 1.1, .5, 'tin') for xx, yy in ((x0 + 1, y0 + 1), (x1 - 1, y0 + 1), (x0 + 1, y1 - 1), (x1 - 1, y1 - 1))]
        Q.append(box(x0, y1, z0, x1, y1 + .6, z1, 'pine', pattern=['planks', 4, 'x']))
        return Q
    P = crate(-20, 0, -9, 2, 18, 8) + crate(-16, 18.6, -7, 0, 30, 5) + crate(5, 0, -6, 21, 13, 8)
    P += [ball(13, 14.4, 1, 0, 'burlap', rr=[7.6, 2.2, 6.4]), ball(10, 16, -1, 0, 'burlap', rr=[3, 1.2, 2.4]), rod([7, 14.4, 7.6], [10, 13.6, 8.6], .5, .5, 'rope')]
    return P


@piece('in_table', size=(90, 80))
def dining_table():
    P = legs4(26, 12, 22, 'dkwood') + [box(-28, 22, -13, 28, 26, 13, 'wood', pattern=['planks', 4, 'x'])]
    P += [box(-30, 26, -4, 30, 26.6, 4, 'plum'), box(29.6, 23, -4, 30.4, 26.6, 4, 'plum')]                               # a dull runner, one flap
    for x, z in ((-19, 8), (17, 9), (-17, -8), (19, -7)):
        P += [cyl(x, 26, z, 3.6, .7, 'paper'), ring(x, 26.7, z, 3.4, .4, 'plum', axis='y'), ball(x + .6, 27.4, z, 0, 'pumpkin' if x < 0 else 'greenbk', rr=[1.4, .8, 1])]
    P += [cyl(0, 26.6, 0, 2.6, 4, 'oldbrass'), cyl(0, 30.6, 0, 1.2, 6, 'ivory'), ball(0, 38, 0, 0, 'glow', rr=[1.3, 2.4, 1.3]),
          ball(-8, 29.6, 1, 3, 'gourd'), ball(8, 29.4, -1, 2.6, 'pumpkin')]
    return P


@piece('in_chess', size=(80, 80))
def chess_table():
    P = [cyl(0, 0, 0, 8, 2, 'dkwood'), cyl(0, 2, 0, 2.4, 18, 'dkwood'), box(-16, 20, -14, 16, 23, 14, 'wood')]
    n = 6; q = 4.4; x0 = -n * q / 2
    for i in range(n):
        for j in range(n): P.append(box(x0 + i * q, 23, x0 + j * q, x0 + (i + 1) * q, 23.5, x0 + (j + 1) * q, 'paper' if (i + j) % 2 else 'plum'))
    for (i, j, m, h) in ((0, 0, 'ivory', 4), (1, 0, 'ivory', 3), (3, 1, 'ivory', 5), (4, 4, 'ink', 4), (5, 5, 'ink', 5), (2, 5, 'ink', 3), (1, 2, 'ivory', 3)):
        x = x0 + (i + .5) * q; z = x0 + (j + .5) * q
        P += [cyl(x, 23.5, z, 1.2, h, m), ball(x, 24.3 + h, z, 1.1, m)]
    return P


@piece('in_keg', size=(70, 70))
def cider_keg():
    P = [box(-9, 0, -12, -5, 7, 12, 'dkwood'), box(5, 0, -12, 9, 7, 12, 'dkwood'),
         box(-9.5, 5, -13, -4.5, 7, 13, 'wood'), box(4.5, 5, -13, 9.5, 7, 13, 'wood')]
    for k in range(10):
        t = (k + .5) / 10; r = 11.6 - 1.8 * (2 * t - 1) ** 2
        P.append(cyl(-13 + 26 * k / 10, 17, 0, r, 26 / 10 + .02, 'pine', axis='x', pattern=['planks', 3.4, 'z']))
    P += [ring(x, 17, 0, 11.6 - 1.8 * (2 * ((x + 13) / 26) - 1) ** 2 + .35, .8, 'castiron', axis='x') for x in (-10, -4, 4, 10)]
    P += [cyl(13, 17, 0, 10.2, .7, 'straw', axis='x'), cyl(-13.7, 17, 0, 10.2, .7, 'straw', axis='x'),
          ring(13.7, 17, 0, 10.2, .8, 'castiron', axis='x'), ring(-13.7, 17, 0, 10.2, .8, 'castiron', axis='x'),
          box(13.6, 12, -7, 14, 12.8, 7, 'pine'), box(13.6, 21.2, -7, 14, 22, 7, 'pine'),
          cyl(13.5, 10, 0, 1.5, 3.6, 'oldbrass', axis='x'), box(16.4, 7.6, -1, 17.8, 10, 1, 'oldbrass'),
          box(-3, 28.4, -1.4, 3, 29.2, 1.4, 'dkwood'), box(-2, 18, 11.2, 4, 21, 11.8, 'paper')]
    return P


@piece('in_cradle', size=(80, 90))
def cradle():
    import math
    P = []
    for z in (-12, 12):   # rockers across the head and foot: the near one is seen in profile from the front
        pts = [(-14, 4), (-8, 1.2), (0, 0), (8, 1.2), (14, 4)]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]): P.append(rod([x0, y0 + 1.8, z], [x1, y1 + 1.8, z], 1.8, 1.8, 'wood'))
    P += [box(-10, 3, -13, 10, 6, 13, 'dkwood'), box(-8, 13, -11, 8, 15, 11, 'ivory')]
    for sx in (-1, 1):   # spindle sides instead of a striped box
        P += [box(sx * 10 - .7, 6, z - .7, sx * 10 + .7, 18, z + .7, 'wood') for z in range(-11, 13, 4)]
        P += [box(sx * 10 - .4, 6, -12, sx * 10 + .4, 18, 12, 'plum')]
    P += [
          box(-11, 18, -13, -8, 20, 13, 'wood'), box(8, 18, -13, 11, 20, 13, 'wood'),                                       # rails
          box(-10, 3, 12.4, 10, 22, 13.4, 'dkwood'), box(-11, 22, 12, 11, 24, 14, 'wood')]                                   # the foot board
    P += [box(-10, 3 + k * 3.2, 13.2, 10, 4 + k * 3.2, 13.6, 'wood') for k in range(1, 6)]
    P += [ball(0, 19, -10, 0, 'dkwood', rr=[11, 12.6, 7.6]), ball(0, 19.4, -5.4, 0, 'redbk', rr=[8.4, 9.6, 4.4]),          # a hood over the head end,
          ball(0, 19.4, -3.6, 0, 'plum', rr=[6.4, 7.4, 2.4])]                                                                  # open toward you, lined, dark inside
    P += [box(-10, 0, -14, 10, 20, -12, 'dkwood'),
          ball(0, 16.6, -5, 0, 'ivory', rr=[4.4, 2.2, 3.4]), box(-8, 15.6, -2, 8, 18.6, 11, 'redbk'), box(-8, 18.4, -2, 8, 19, .2, 'ivory')]
    return P



# ---- batch 3, round 2 (judges: a bell is a dome on a base; a period till with keys; tone the cream worktop down; no striped
#      stacks; cast iron darker; a pew back is solid; straight stool legs; pointed leaves; drum lids lighter with a rim and bung)
BP.RAMPS.update({'castiron': ['#101216', '#1c2026', '#2a3036', '#3c444a', '#566068'],
                 'worktop':  ['#3a3226', '#5a4e3c', '#7c6e56', '#9a8c70', '#b4a688'],
                 'steelbl':  ['#1e2630', '#303c4a', '#465666', '#627484', '#8494a2'],
                 'manila':   ['#4a3e26', '#746238', '#9c864e', '#bca468', '#d4c088']})


@piece('in_rocker', size=(60, 90))
def cane_rocker():
    P = []
    for x in (-9.6, 9.6):
        pts = [(-16, 7), (-11, 2.4), (-4, .4), (4, .4), (11, 2.4), (20, 8)]
        for (z0, y0), (z1, y1) in zip(pts, pts[1:]): P.append(rod([x, y0 + 1.8, z0], [x, y1 + 1.8, z1], 1.8, 1.8, 'pine'))
    P += [box(x - 1.2, 2.6, z, x + 1.2, 15, z + 2.4, 'dkwood') for x in (-9, 9) for z in (-7, 5)]
    P += [box(-10, 15, -8, 10, 17.5, 8.5, 'dkwood'), box(-8.5, 17.5, -6.5, 8.5, 19, 7.5, 'bluebk'),
          box(-10, 15, -9, -7.5, 44, -6.5, 'dkwood'), box(7.5, 15, -9, 10, 44, -6.5, 'dkwood'),
          box(-10, 41, -9.5, 10, 45, -6, 'dkwood'), box(-10, 19, -9.5, 10, 21, -6, 'dkwood'),
          box(-7.5, 21, -8.4, 7.5, 41, -7.6, 'straw', pattern=['bars', 3, 'x', 1.4])]               # a cane back, fewer bigger canes
    return P


@piece('in_counter', size=(120, 80))
def shop_counter():
    P = [box(-48, 0, -9, 48, 28, 9, 'wood'), box(-49, 28, -10, 49, 32, 11, 'wood', pattern=['grain', 1.5, 'x']),
         box(-48, 0, 9, 48, 3, 10, 'dkwood')]
    for x in range(-45, 45, 15):
        P += [box(x, 5, 9, x + 13, 25, 10, 'dkwood'), box(x + 2, 7, 9.5, x + 11, 23, 10.5, 'wood')]
    P += [box(13, 32, -6, 31, 37, 5, 'oldbrass'), box(14, 37, -6, 30, 47, -1, 'oldbrass'), box(17, 42, -1.2, 27, 45.6, -.6, 'ink'),   # a period till
          box(18, 43, -.8, 21, 45, -.4, 'paper'), box(23, 43, -.8, 26, 45, -.4, 'paper')]
    P += [box(15 + i * 3, 37, 1 + j * 2, 17 + i * 3, 38.6, 2.4 + j * 2, 'ivory') for i in range(5) for j in range(2)]          # its keys
    P += [cyl(-32, 32, 2, 5.6, 1.6, 'castiron'), ball(-32, 33.6, 2, 0, 'brass', rr=[4.8, 4.6, 4.8]), cyl(-32, 38, 2, .6, 1.6, 'castiron'), ball(-32, 40, 2, 1.2, 'castiron'),
          ball(-34.4, 35.4, 4.2, 0, 'ivory', rr=[1.1, .9, .6]),   # the bell: a dome on a base
          box(-16, 32, -2, -2, 33, 6, 'paper'), box(-14, 33, -1, -4, 33.6, 4, 'manila'),
          cyl(-42, 32, -4, 3, 7, 'clearglass'), cyl(-42, 39, -4, 2, 1.5, 'wood')]
    P += [ball(-42 + dx, 33.5 + dy, -4 + dz, 1.1, m) for dx, dy, dz, m in ((-1, 0, 1, 'redbk'), (1, 1, 0, 'pumpkin'), (0, 3, -1, 'greenbk'), (1, 4, 1, 'redbk'))]
    return end_frame(P, 48, 9.5, 28)


@piece('in_kcounter', size=(100, 80))
def kitchen_counter():
    P = [box(-36, 0, -10, 36, 28, 9, 'wood'), box(-37, 28, -11, 37, 31, 10, 'worktop'), box(-37, 27, 9.4, 37, 28, 10.4, 'dkwood'),
         box(-36, 0, 9, 36, 2, 10, 'dkwood')]
    for x in (-34, -1):
        P += [box(x, 4, 9, x + 32, 26, 10, 'dkwood'), box(x + 2, 6, 9.5, x + 30, 24, 10.5, 'wood'), cyl(x + 26, 15, 10.5, 1, 1, 'oldbrass', axis='z')]
    P += [box(6, 29.4, -7, 28, 31.2, 6, 'tin'), box(8, 30.6, -5, 26, 31.3, 4, 'castiron'), box(8, 31.2, -5, 26, 31.4, -4.2, 'steelbl'),   # the sink, set in, dark inside
          cyl(17, 31, -9, 1.2, 9, 'tin'), rod([17, 40, -9], [17, 39, -4], .9, .9, 'tin'),
          box(-30, 31, -6, -14, 32.5, 4, 'pine'), box(-26, 32.5, -3, -18, 33.5, 1, 'pumpkin'),
          box(-12, 31, 0, -4, 31.6, 1.2, 'steel'), box(-13, 31, -.2, -11, 32, 1.4, 'dkwood'),
          cyl(-6, 31, -6, 2.6, 5, 'ivory'), cyl(-1, 31, -5, 2.2, 4, 'redpt')]
    return end_frame(P, 36, 9.5, 28)


@piece('in_shelf_tools', size=(90, 100))
def shelf_tools():
    P = [box(-31, 0, -8, -28, 62, 7, 'wood'), box(28, 0, -8, 31, 62, 7, 'wood'), box(-31, 0, -8, 31, 62, -6, 'dkwood', pattern=['planks', 8, 'x']),
         box(-32, 61, -9, 32, 64, 8, 'pine')]
    end_frame(P, 31, 7.5, 62, m='dkwood')
    for y in (1, 21, 41): P.append(box(-29, y, -6, 29, y + 2, 7, 'pine'))
    P += [box(-26, 43, -4, -12, 52, 5, 'redpt'), box(-26, 52, -3, -12, 54, 4, 'redpt'), box(-21, 54, -1, -17, 55.5, 1, 'tin'),
          cyl(-6, 43, 1, 3, 8, 'tin'), cyl(1, 43, 1, 2.6, 6, 'greenpt'), ring(12, 49, 3, 5, 1.4, 'iron'), ring(22, 47, 3, 4, 1.2, 'iron'),
          box(-26, 23, -4, -12, 31, 5, 'pine', pattern=['planks', 4, 'y']), box(-9, 23, -3, 3, 29, 5, 'oldbrass'),             # a crate of parts, a brass box
          cyl(9, 23, 1, 3.4, 9, 'bluebk'), cyl(17, 23, 1, 3, 7, 'redpt'), rod([22, 23, 3], [26, 33, 3], .8, .8, 'dkwood'),       # tins, a mallet handle
          box(-26, 3, -4, -8, 13, 5, 'castiron'), box(-24, 13, -3, -10, 15, 4, 'castiron'),                                     # a vice body
          ring(4, 9, 3, 6, 1.8, 'ink'), ring(18, 9, 3, 6, 1.8, 'ink'), cyl(4, 9, 2, 3, 1, 'iron', axis='z'), cyl(18, 9, 2, 3, 1, 'iron', axis='z')]
    return P


@piece('in_stove', size=(70, 100))
def iron_stove():
    P = [box(x, 0, z, x + 3, 8, z + 3, 'castiron') for x in (-17, 14) for z in (-10, 7)]
    P += [box(-18, 8, -11, 18, 34, 11, 'castiron'), box(-19, 34, -12, 19, 37, 12, 'castiron'), box(-19, 36.4, -12, 19, 37, -11.4, 'steelbl'),
          box(-13, 13, 11, 5, 28, 12, 'ink'), box(-11, 15, 11.5, 3, 25, 12.5, 'glow'),
          box(-12, 14, 12, 4, 15, 13, 'castiron'), box(-12, 19, 12, 4, 20, 13, 'castiron'), box(-12, 24, 12, 4, 25, 13, 'castiron'),
          box(8, 13, 11, 16, 28, 12, 'castiron'), box(9, 20, 12, 10, 22, 13, 'oldbrass'),
          cyl(-8, 37, -2, 5, 1, 'ink'), cyl(8, 37, -2, 5, 1, 'ink'),
          cyl(8, 38, -2, 4, 6, 'tin'), rod([12, 42, -2], [16, 43, -2], .8, .8, 'tin'), ring(8, 44.4, -2, 2.4, .6, 'tin', axis='y'),
          cyl(-6, 37, -9, 3, 24, 'castiron'), cyl(-6, 59, -9, 3.6, 2, 'castiron')]
    P += [cyl(x, 30, 11.4, .7, .6, 'steelbl', axis='z') for x in (-15, -9, -3, 3, 9, 15)]            # rivets along the top rail
    return P


@piece('in_pew', size=(140, 70))
def pew():
    P = [box(-61, 0, -9, -56, 36, 9, 'pine'), box(56, 0, -9, 61, 36, 9, 'pine'),                      # tall lit end panels
         ball(-58.5, 36, 0, 0, 'pine', rr=[2.6, 3.4, 9]), ball(58.5, 36, 0, 0, 'pine', rr=[2.6, 3.4, 9]),
         box(-61.4, 6, -7, -60.6, 30, 7, 'dkwood'), box(60.6, 6, -7, 61.4, 30, 7, 'dkwood'),
         box(-61, 0, -10, -56, 2, 10, 'dkwood'), box(56, 0, -10, 61, 2, 10, 'dkwood'),
         box(-56, 12, -6, 56, 15, 7, 'wood', pattern=['planks', 14, 'x']),
         box(-56, 15, -8, 56, 33, -5, 'wood'), box(-57, 33, -9, 57, 35.4, -4, 'pine'),                    # a solid back with a lit top rail
         box(-56, 3, -6, 56, 5, 5, 'dkwood'), box(-56, 5, 4, 56, 12, 6.4, 'dkwood')]
    P += [box(x, 5.6, 6.4, x + 3, 10.6, 7.4, m) for x, m in ((-40, 'redbk'), (-33, 'spineB'), (16, 'redbk'), (40, 'spineG'))]   # hymnals in the rack below
    return P


@piece('in_schooldesk', size=(50, 60))
def school_desk():
    P = [box(x, 0, z, x + 2, 18, z + 2, 'castiron') for x in (-11, 9) for z in (-7, 5)]
    P += [box(-13, 18, -8, 13, 21, 8, 'wood', pattern=['grain', 1.4, 'x']), box(-12, 8, -7, 12, 10, 7, 'castiron'), cyl(10, 21, -5, 1.4, 2, 'ink'),
          box(-7.6, 22, -1.6, -3, 22.2, -1, 'paper'), box(-6, 22, .8, -1, 22.2, 1.4, 'paper'),
          box(-10, 21, -4.6, 2.6, 21.8, 4.6, 'pine'), box(-9, 21.8, -3.6, 1.6, 22, 3.6, 'castiron'),          # a slate in its wooden frame
          box(4, 21, -3, 10, 22, 3, 'paper'), rod([5, 22.2, 2], [10, 22.2, -2], .4, .4, 'pumpkin'),
          box(-11, 10, -6, 11, 15, 6, 'dkwood'), box(-8, 15, -1, 2, 18, 5, 'spineG')]
    return P


@piece('in_filecab', size=(50, 80))
def filing_cabinet():
    P = [box(-12, 0, -9, 12, 52, 9, 'steelbl'), box(-12.5, 52, -9.5, 12.5, 54, 9.5, 'steelbl')]
    for y in (3, 19, 35):   # recessed drawers: a lit top lip, a shaded gap, a label frame over a grey pull
        P += [box(-10, y, 8.4, 10, y + 14, 9, 'steelbl'), box(-10.4, y + 14, 9, 10.4, y + 15, 9.6, 'tin'), box(-10.4, y - .6, 8.8, 10.4, y + .2, 9.2, 'ink'),
              box(-3.4, y + 9, 9, 3.4, y + 12, 9.4, 'castiron'), box(-3, y + 9.4, 9.2, 3, y + 11.6, 9.6, 'manila'),
              box(-3, y + 5, 9, 3, y + 6.4, 10.2, 'tin'), box(-3.4, y + 3.8, 9, 3.4, y + 5, 9.8, 'castiron')]
    P += [box(-8, 54, -4, 6, 55, 5, 'manila'), box(-7, 55, -3, 7, 55.6, 4, 'paper')]
    return P


@piece('in_toolbox', size=(50, 70))
def tool_chest():
    P = [cyl(x, 2, z, 2, 1.6, 'ink', axis='x') for x in (-13.8, 12.2) for z in (-6, 6)]
    P += [box(-15, 3.6, -9, 15, 34, 9, 'redpt'), box(-15.5, 34, -9.5, 15.5, 36, 9.5, 'redpt'), box(-8, 36, -1, 8, 37.4, 1, 'castiron')]
    for y in (6, 12, 18, 24, 29):
        P += [box(-13, y, 9, 13, y + 4.5, 10, 'redpt'), box(-6, y + 1.8, 10, 6, y + 2.8, 10.8, 'tin')]
    P += [box(-12, 36, 3, 0, 37.4, 5, 'dkwood'), box(-2, 36, 1.6, 2, 39, 6.4, 'castiron'),                        # a hammer on the lid
          rod([4, 36.6, -5], [12, 36.6, -2], .8, .8, 'steelbl'), ring(12.6, 36.6, -1.8, 1.6, .6, 'steelbl', axis='y'),   # and a wrench
          box(15.4, 18, -3, 16.4, 26, 3, 'castiron')]                                                              # a side handle
    return P


@piece('in_stool', rot=False, size=(40, 60))
def stool():
    P = [box(x - 1, 0, z - 1, x + 1, 18, z + 1, 'dkwood') for x, z in ((-4.6, -4), (4.6, -4), (-4.6, 4), (4.6, 4))]   # four straight legs
    P += [cyl(0, 18, 0, 7.4, 2.4, 'wood'), ring(0, 20.4, 0, 6.6, .5, 'endgrain', axis='y'), box(-4.6, 7, 3.4, 4.6, 8.4, 4.6, 'dkwood'), box(-4.6, 9, -4.6, 4.6, 10.4, -3.4, 'dkwood')]
    return P


@piece('in_plant', rot=False, size=(50, 70))
def pot_plant():
    import math
    P = [cyl(0, 0, 0, 7, 11, 'clay'), cyl(0, 10, 0, 8, 2, 'clay'), cyl(0, 11.5, 0, 6.6, 1, 'soot')]
    for a in range(13):   # long pointed leaves fanning out of the pot, overlapping, tapering to a tip
        t = a * 2.4; L = 12 + (a % 3) * 3; up = 1.6 - (a % 4) * .3
        tip = [math.cos(t) * L * .55, 12 + L * up * .6 + 4, math.sin(t) * L * .45]
        mid = [tip[0] * .5, 12 + L * .7, tip[2] * .5]
        P += [rod([0, 12, 0], mid, 1.5, 1.3, 'leaf'), rod(mid, tip, 1.3, .2, 'leaf' if a % 3 else 'moss')]
    return P


def _drum(m):
    return [cyl(0, 0, 0, 10, 29, m), ring(0, 9, 0, 10.1, .8, m, axis='y'), ring(0, 20, 0, 10.1, .8, m, axis='y'),
            cyl(0, 29, 0, 9.6, .8, m), ring(0, 29.6, 0, 9.4, .7, 'tin', axis='y'), cyl(4, 29.6, -3, 1.6, .9, 'tin'), cyl(-4, 29.6, 3, 1, .7, 'tin'),   # a lit lid, rim and bungs
            rod([-3, 27, 9.7], [-4, 14, 9.9], .5, .9, 'stain'), rod([-4, 14, 9.9], [-3, 6, 9.9], .9, .4, 'stain')]                                   # a thin rust run

piece('in_drum', rot=False, size=(40, 60))(lambda: _drum('redpt'))
piece('in_drum_blue', rot=False, size=(40, 60))(lambda: _drum('steelbl'))


@piece('in_coffin', size=(60, 100))
def coffin_upright():
    P = []
    prof = [(0, 7), (12, 9), (40, 12.6), (44, 12.6), (62, 7.4)]                                          # sharp shoulders
    for (y0, w0), (y1, w1) in zip(prof, prof[1:]):
        n = max(2, int(y1 - y0))
        for k in range(n):
            ya = y0 + (y1 - y0) * k / n; wa = w0 + (w1 - w0) * (k + .5) / n
            P.append(box(-wa, ya, -6, wa, ya + (y1 - y0) / n + .01, 6, 'dkwood'))
    P += [box(-wa * .1 - 1.4, 22, 6, 1.4, 54, 6.8, 'oldbrass'), box(-7, 44, 6, 7, 47, 6.8, 'oldbrass'),
          box(-10, 30, 6, -8.6, 34, 7, 'castiron')]
    P += [box(x - .4, 1, 5.8, x + .4, 60, 6.3, 'wood') for x in (-6, 6)]                                  # the lid's raised edge
    return P



# ---- batch 4, round 2: outdoor props (judges: a lid or open rim lighter than the sides; tan end grain, not cream; no identical
#      stamps; weathered colour; a roof whose gable faces you; garments shaped like garments; separate pumpkins)
BP.RAMPS.update({'oak':     ['#2c2016', '#4a3624', '#6a4e34', '#8a6a48', '#a6865e'],
                 'endgrain': ['#3a2c1e', '#5e4a32', '#836a4a', '#a28a62', '#b8a07a'],
                 'weather': ['#2a2622', '#433c34', '#5e544a', '#7a6e60', '#958877'],
                 'rubber':  ['#121214', '#1e1e22', '#2c2c32', '#3e3e46', '#56565e'],
                 'oxide':   ['#24100e', '#421a16', '#62281e', '#7c3628', '#924632']})
BP.MATDEF.update({'endgrain': {'ramp': 'endgrain', 'ambient': .62}})   # cut ends face the camera, so they get little light: lift them


@piece('barrel', rot=False, size=(50, 60))
def barrel():
    return _staves(12, 26, 'oak', hoops=(.14, .36, .64, .86), hm='castiron') + [
        cyl(0, 26, 0, 10.9, .6, 'oak'), ring(0, 26.5, 0, 10.6, .6, 'endgrain', axis='y'), cyl(0, 26.6, 0, 9.6, .3, 'endgrain'),   # a lit lid with a rim
        box(-6, 26.9, -.4, 6, 27.2, .4, 'oak'), cyl(4, 26.9, -3, 1.5, .6, 'dkwood')]


@piece('drum', rot=False, size=(40, 50))
def outdoor_drum():
    return [cyl(0, 0, 0, 9, 26, 'oxide'), ring(0, 8, 0, 9.1, .7, 'oxide', axis='y'), ring(0, 18, 0, 9.1, .7, 'oxide', axis='y'),
            cyl(0, 26, 0, 8.7, .8, 'oxide'), ring(0, 26.6, 0, 8.5, .6, 'tin', axis='y'), cyl(3, 26.6, -3, 1.4, .9, 'tin'),
            ball(-3, 13, 8.6, 0, 'stain', rr=[1.6, 6, .6])]


@piece('bucket', rot=False, size=(36, 40))
def bucket():
    return [cyl(0, 0, 0, 5.6, 1, 'dkwood'), cyl(0, 1, 0, 6.2, 11, 'oak', pattern=['planks', 3, 'x']), ring(0, 3, 0, 6.4, .5, 'castiron', axis='y'), ring(0, 10, 0, 6.6, .5, 'castiron', axis='y'),
            ring(0, 12, 0, 6, .7, 'endgrain', axis='y'), cyl(0, 10.6, 0, 5.4, .6, 'ink'), cyl(0, 11, 0, 4, .4, 'ocean'),       # an open rim, dark inside, water low
            rod([-6.6, 11, 0], [-3, 11.6, 5.6], .4, .4, 'castiron'), rod([-3, 11.6, 5.6], [3, 11.6, 5.6], .4, .4, 'castiron'), rod([3, 11.6, 5.6], [6.6, 11, 0], .4, .4, 'castiron')]   # the handle laid down


@piece('birdbath', rot=False, size=(40, 50))
def bird_bath():
    return [cyl(0, 0, 0, 6, 2, 'weather'), cyl(0, 2, 0, 2.4, 16, 'weather'), cyl(0, 18, 0, 3.5, 2, 'weather'),
            cyl(0, 20, 0, 12, 2.5, 'weather'), ring(0, 22.6, 0, 11.4, .8, 'stone', axis='y'), cyl(0, 22, 0, 10, .5, 'ocean'),
            ball(4, 23, 2, 0, 'leaf', rr=[1.6, .4, 1.2]), ball(-5, 1, 5, 0, 'moss', rr=[4, 1.4, 2.4]), box(-2, 20, 11.6, -1.4, 22.4, 12.2, 'ink')]   # a chip


@piece('tyres', rot=False, size=(44, 50))
def tyre_stack():
    P = []
    for k in range(4):
        y = k * 6.2 + 3.2; dx = (k % 2) * .8 - .4
        P += [ring(dx, y, (k % 3) * .6 - .6, 8.6, 3.2, 'rubber', axis='y'), ring(dx, y + 2.4, (k % 3) * .6 - .6, 8.6, .9, 'weather', axis='y')]   # a lit shoulder
        P += [box(dx + 11.2, y - 2, -.6, dx + 11.9, y + 2, .6, 'ink'), box(dx - 2, y - 2, 11.2, dx - .8, y + 2, 11.9, 'ink')]                        # tread notches
    return P


@piece('trashcan', rot=False, size=(36, 50))
def trash_can():
    P = [cyl(0, 0, 0, 8, 22, 'greenpt'), cyl(0, 22, 0, 8.8, 2, 'greenpt'), ring(0, 24, 0, 8.4, .6, 'steelbl', axis='y'), cyl(0, 24, 0, 2.4, 1.6, 'steelbl')]
    P += [ring(0, y, 0, 8.2, .7, 'greenpt', axis='y') for y in (5, 11, 17)] + [ball(5, 13, 6, 0, 'greenpt', rr=[2.2, 2.6, .9])]   # ribs in its own paint, one dent                                       # ribs, cool lit
    P += [ball(-6, 25, 5, 0, 'paper', rr=[2.5, 1.2, 2])]
    return P


@piece('pumpkin', rot=False, size=(40, 36))
def pumpkin():
    import math
    return [ball(5.2 * math.cos(a * math.pi / 4), 7, 4.6 * math.sin(a * math.pi / 4), 0, 'gourd', rr=[6.2, 7.2, 6.2]) for a in range(8)] + [
            ball(0, 8, 0, 0, 'gourd', rr=[7, 7.4, 6.5]), rod([0, 13, 0], [1.5, 17, -1], 1.2, .9, 'greenbk'), ball(-6, 14, 2, 0, 'greenbk', rr=[3, .8, 2])]


@piece('lamp', rot=False, size=(36, 110))
def lamp_post():
    return [cyl(0, 0, 0, 4.4, 3, 'castiron'), cyl(0, 3, 0, 2.8, 4, 'castiron'), cyl(0, 7, 0, 1.9, 56, 'castiron'), box(-2, 7, 1.2, -1.2, 63, 2, 'steelbl'),
            ring(0, 62, 0, 2.4, .7, 'castiron', axis='y'), cyl(0, 63, 0, 3.8, 1.4, 'castiron'),
            box(-4.6, 64.4, -4.6, 4.6, 76, 4.6, 'glow'),
            *[box(sx * 4.6 - .9, 64.4, sz * 4.6 - .9, sx * 4.6 + .9, 76, sz * 4.6 + .9, 'castiron') for sx in (-1, 1) for sz in (-1, 1)],
            cyl(0, 76, 0, 6.4, 1.4, 'castiron'), ball(0, 78.5, 0, 0, 'castiron', rr=[4.6, 2.4, 4.6]), ball(0, 81.5, 0, 1.2, 'castiron')]


@piece('crate', size=(50, 50))
def crate():
    P = [box(-12, 0, -10, 12, 22, 10, 'oak', pattern=['planks', 5.5, 'y'])]
    for z, s in ((10, 1), (-10.6, -1)):
        P += [box(-12.6, 0, z, 12.6, 3, z + .6, 'dkwood'), box(-12.6, 19, z, 12.6, 22, z + .6, 'dkwood'),
              box(-12.6, 0, z, -9.6, 22, z + .6, 'dkwood'), box(9.6, 0, z, 12.6, 22, z + .6, 'dkwood')]
    P += [rod([-8.6, 4.6, 10.8], [8.6, 17.4, 10.8], 1.5, 1.5, 'dkwood'), box(-12, 22, -10, 12, 22.8, 10, 'endgrain', pattern=['planks', 6, 'x'])]
    return P


@piece('hay', size=(70, 60))
def hay_bale():
    P = [box(-20, 0, -12, 20, 21, -1, 'straw', pattern=['planks', 3, 'z']), box(-19, 0, 1, 19, 19, 12, 'straw', pattern=['planks', 3, 'z']),
         box(-20, 20, -12, 20, 22.4, -1, 'straw'), box(-19, 18, 1, 19, 20.4, 12, 'straw')]                          # lit tops
    P += [box(x - .8, -.1, -12.4, x + .8, 22.6, -.6, 'rope') for x in (-11, 11)] + [box(x - .8, -.1, .6, x + .8, 20.6, 12.4, 'rope') for x in (-10, 10)]
    import random
    rnd = random.Random(3)
    for k in range(14):   # ragged straw ends sticking out
        x = rnd.choice((-20.6, 20.6, -19.6, 19.6)); z = rnd.uniform(-11, 11); y = rnd.uniform(2, 18)
        P.append(rod([x * .98, y, z], [x * 1.06, y + rnd.uniform(-1.5, 1.5), z + rnd.uniform(-1.5, 1.5)], .4, .3, 'straw'))
    P += [ball(-14, 20.6, 6, 0, 'straw', rr=[3, .8, 2]), ball(16, 1, 13, 0, 'straw', rr=[4, 1, 2])]
    return P


@piece('signpost', size=(70, 80))
def signpost():
    P = [box(-2, 0, -2, 2, 44, 2, 'weather'), ball(0, 45, 0, 0, 'weather', rr=[2.2, 1.4, 2.2])]
    P += [box(-2, 34, 2, 19, 40, 3.6, 'oak', pattern=['planks', 30, 'x']), box(19, 34, 2, 21, 40, 3.6, 'oak'), box(21, 35.5, 2, 23, 38.5, 3.6, 'oak'),
          box(-2, 33.4, 2, 19, 34, 3.6, 'ink'),
          box(-17, 26, 2, 2, 31, 3.6, 'weather', pattern=['planks', 30, 'x']), box(-19, 27.2, 2, -17, 29.8, 3.6, 'weather'), box(-17, 25.4, 2, 2, 26, 3.6, 'ink'),
          box(-1, 39, -8, 1, 43, -2, 'oak'), box(-.6, 42.6, -8.4, .6, 43.4, -7.6, 'endgrain')]
    P += [box(x, 36.2, 3.6, x + 2, 37.6, 4, 'paper') for x in (4, 8, 12)] + [box(x, 27.6, 3.6, x + 1.6, 29, 4, 'paper') for x in (-13, -9)]
    P += [box(0, 36.4, 3.6, 1, 37.4, 4.2, 'castiron'), box(0, 28, 3.6, 1, 29, 4.2, 'castiron'), ball(0, 1, 0, 0, 'moss', rr=[4, 1.4, 3.5])]
    return P


@piece('mailbox', size=(40, 60))
def mailbox():
    return [box(-1.6, 0, -1.6, 1.6, 22, 1.6, 'oak'), box(-6, 22, -8, 6, 28, 8, 'tin'), cyl(0, 28, -8, 6, 16, 'tin', axis='z'),
            box(-6.4, 22, 8, 6.4, 31, 8.6, 'tin'), box(6, 25, -2, 7, 36, 0, 'redpt'), box(7, 33, -2, 10, 36, 0, 'redpt'),
            box(-4, 14, 1.6, 4, 19, 2.2, 'paper'), box(-3, 16, 2.1, 3, 17, 2.4, 'ink'), box(-3.6, 14.6, 2.1, -3, 18.4, 2.4, 'castiron')]   # a name plate


@piece('lumber', size=(70, 46))
def lumber():
    P = [box(-22, 0, z, 22, 2, z + 2, 'dkwood') for z in (-9, 6)]
    import random
    rnd = random.Random(9)
    for k, (y, n) in enumerate(((2, 5), (6, 5), (10, 4), (14, 3))):
        for i in range(n):
            L = 36 + rnd.uniform(-5, 6); x0 = -20 + rnd.uniform(-3, 3); z0 = -10 + i * 4.2 + k * 2
            m = rnd.choice(('oak', 'oak', 'weather'))
            P += [box(x0, y, z0, x0 + L, y + 3.6, z0 + 3.8, m, pattern=['grain', 1.6, 'x', 14]), box(x0 + 3, y + 3.6, z0 + 1.6, x0 + 3.8, y + 3.9, z0 + 2.2, 'castiron'),
                  box(x0 + L, y + .2, z0 + .2, x0 + L + .4, y + 3.4, z0 + 3.6, 'endgrain'), box(x0 - .4, y + .2, z0 + .2, x0, y + 3.4, z0 + 3.6, 'endgrain')]
    P += [box(-14, 17.6, -1, 18, 21, 2.8, 'oak')]   # one board laid askew on top
    return P


@piece('firewood', size=(60, 46))
def firewood():
    P = []
    import random
    rnd = random.Random(4)
    for row, (y, n) in enumerate(((4, 4), (11.4, 3), (18.8, 2))):
        for i in range(n):
            x = -(n - 1) * 4.3 + i * 8.6 + (.6 if (i + row) % 2 else -.4); r = rnd.choice((3.2, 3.8, 4.4))
            P += [cyl(x, y, -4, r, 8, 'dkwood', axis='z'), cyl(x, y, 4, r - .7, .4, 'endgrain', axis='z'), cyl(x, y, -4.4, r - .7, .4, 'endgrain', axis='z')]
    P += [cyl(-16, 3.4, -3, 3.2, 7, 'dkwood', axis='z'), cyl(-16, 3.4, 4, 2.5, .4, 'endgrain', axis='z'), ball(14, 1, 5, 0, 'endgrain', rr=[2.4, .8, 1.4])]
    return P


@piece('choppingblock', size=(56, 56))
def chopping_block():
    return [cyl(0, 0, 0, 10.6, 3, 'oak'), cyl(0, 0, 0, 10, 14, 'oak', pattern=['planks', 5, 'x']), cyl(0, 14, 0, 9.6, .6, 'endgrain'),
            ring(0, 14.5, 0, 6, .35, 'oak', axis='y'), ring(0, 14.5, 0, 3, .35, 'oak', axis='y'),
            box(-3, 14, -4, 4, 17, 1, 'steel'), box(-4, 13.6, -5, -2, 16, 2, 'steel'), rod([0, 16, -1], [10, 27, -6], .9, .8, 'dkwood'),
            cyl(14, 0, 6, 2.6, 10, 'oak', axis='z'), cyl(14, 0, 16, 2, .4, 'endgrain', axis='z'), ball(-6, .6, 12, 0, 'endgrain', rr=[2, .6, 1.4])]


@piece('planter', size=(60, 50))
def planter():
    P = [box(-20, 0, -8, 20, 12, 8, 'oak', pattern=['planks', 4, 'y']), box(-21, 12, -9, 21, 14, 9, 'dkwood'), box(-19, 11, -7, 19, 12.6, 7, 'soot')]
    for x, z, r in ((-13, -1, 4.4), (-3, 2, 3.6), (7, -2, 4.8), (15, 2, 3.4)):   # filled leaf clumps
        P += [ball(x, 15 + r * .5, z, 0, 'leaf', rr=[r, r * .75, r * .8], lumps=.35, lumpfreq=1.4), ball(x - 1, 16.6 + r * .7, z + 1, 0, 'moss', rr=[r * .5, r * .4, r * .4])]
    return P


@piece('board', size=(90, 100))
def notice_board():
    P = [box(-27, 0, -2, -24, 46, 1, 'dkwood'), box(24, 0, -2, 27, 46, 1, 'dkwood'),
         box(-26, 14, -1, 26, 44, 1, 'oak', pattern=['planks', 6, 'y']), box(-27, 44, -1.4, 27, 46, 1.4, 'dkwood'), box(-27, 12, -1.4, 27, 14, 1.4, 'dkwood'),
         box(-30, 46, -8, 30, 48, 6, 'dkwood', pattern=['planks', 5, 'x']), box(-29, 48, -6, 29, 52, 2, 'dkwood', pattern=['planks', 5, 'x']),
         box(-24, 13, 1, 24, 14, 6, 'oak')]
    for x, y, w, h, m in ((-22, 30, 10, 12, 'manila'), (-9, 33, 9, 9, 'paper'), (3, 28, 10, 13, 'endgrain'), (16, 31, 8, 10, 'manila'), (-18, 17, 12, 10, 'paper'), (-3, 16, 8, 11, 'redbk'), (8, 17, 12, 9, 'manila')):
        P += [box(x, y, 1, x + w, y + h, 1.5, m), box(x + w / 2 - .5, y + h - 2, 1.5, x + w / 2 + .5, y + h - 1, 2, 'redpt')]
        P += [box(x + 1.4, yy, 1.5, x + w - 1.6 - (yy % 3), yy + .5, 1.7, 'weather') for yy in range(int(y) + 2, int(y + h) - 3, 2)]   # lines of writing
    return P


@piece('well', size=(100, 120))
def well():
    P = [cyl(0, 0, 0, 20, 18, 'stone', pattern=['bricks', 5]), cyl(0, 18, 0, 21, 3, 'weather'), cyl(0, 20.5, 0, 16.5, .6, 'ink'),
         box(-24, 0, -2, -20, 50, 2, 'dkwood'), box(20, 0, -2, 24, 50, 2, 'dkwood'),
         cyl(-22, 40, 0, 2.4, 44, 'oak', axis='x'), box(22, 38, -1, 28, 41, 1, 'castiron'), box(27, 34, -1, 29, 41, 1, 'castiron'),
         ring(0, 40, 0, 2.6, .5, 'rope', axis='x'), box(-.4, 26, -.4, .4, 40, .4, 'rope'),
         cyl(0, 21, 0, 4, 6, 'oak'), ring(0, 26, 0, 4.2, .4, 'castiron', axis='y'),
         ball(-12, 1, 18, 0, 'moss', rr=[7, 2, 3]), ball(15, 10, 15, 0, 'moss', rr=[4, 3, 2])]
    for k in range(12):   # the roof turned so its gable faces you: ridge front to back, slopes left and right
        t = k / 12
        for sx in (-1, 1):
            x = sx * 28 * t
            P.append(box(x - 1.3, 50 + 11 * (1 - t), -16, x + 1.3, 52.4 + 11 * (1 - t), 16, 'oak', pattern=['planks', 5, 'z']))
    P += [box(-1.6, 61, -17, 1.6, 64, 17, 'dkwood')]
    P += [box(-26 * (1 - k / 10), 50 + k, 15, 26 * (1 - k / 10), 51 + k, 16, 'dkwood') for k in range(10)]           # the gable boards facing you
    P += [rod([-29, 49.6, 16.4], [0, 62, 16.4], .9, .9, 'endgrain'), rod([29, 49.6, 16.4], [0, 62, 16.4], .9, .9, 'endgrain')]   # barge boards
    return P


@piece('cart', size=(120, 80))
def hand_cart():
    P = [box(-30, 14, -14, 26, 17, 14, 'oak', pattern=['planks', 5, 'x']),
         box(-30, 17, -14, 26, 26, -12, 'oak', pattern=['planks', 5, 'y']), box(-30, 17, 12, 26, 26, 14, 'oak', pattern=['planks', 5, 'y']),
         box(-30, 17, -14, -28, 26, 14, 'oak'), box(24, 17, -14, 26, 26, 14, 'oak'),
         box(-30, 26, -14.6, 26, 27.4, -11.6, 'dkwood'), box(-30, 26, 11.6, 26, 27.4, 14.6, 'dkwood')]
    import math
    for x in (-20, 16):
        for z in (-15.6, 15.6):
            P += [ring(x, 11, z, 10, 1.3, 'dkwood'), ring(x, 11, z, 10.8, .5, 'castiron'), cyl(x, 11, z - 1.6, 2.2, 3.2, 'castiron', axis='z')]
            P += [rod([x + 2.4 * math.cos(a), 11 + 2.4 * math.sin(a), z], [x + 9 * math.cos(a), 11 + 9 * math.sin(a), z], .7, .6, 'oak') for a in [k * math.pi / 4 for k in range(8)]]
    P += [rod([26, 15, -6], [44, 9, -6], 1, 1, 'dkwood'), rod([26, 15, 6], [44, 9, 6], 1, 1, 'dkwood'), rod([44, 9, -7], [44, 9, 7], 1, 1, 'dkwood')]
    for i, (x, z) in enumerate(((-22, -5), (-9, -6), (4, -5), (17, -6), (-15, 5), (-1, 6), (12, 5))):   # separate pumpkins with stems, gaps between
        P += [ball(x, 25 + (i // 4) * 2.4, z, 0, 'gourd', rr=[5, 4.2, 4.6], lumps=.3, lumpfreq=1.8), rod([x, 29 + (i // 4) * 2.4, z], [x + .8, 31 + (i // 4) * 2.4, z - .4], .7, .5, 'greenbk')]
    return P


@piece('clothesline', size=(140, 100))
def clothesline():
    P = [box(-52, 0, -1.4, -49, 44, 1.4, 'weather'), box(49, 0, -1.4, 52, 44, 1.4, 'weather'),
         box(-54, 41, -.8, -47, 43, .8, 'weather'), box(47, 41, -.8, 54, 43, .8, 'weather')]
    pts = [(-50, 40), (-25, 37), (0, 36), (25, 37), (50, 40)]
    P += [rod([x0, y0, 0], [x1, y1, 0], .35, .35, 'rope') for (x0, y0), (x1, y1) in zip(pts, pts[1:])]
    def peg(x, y): return box(x - .5, y - .6, -.7, x + .5, y + 1, .7, 'oak')
    # a shirt: body and two sleeves
    x, y = -40, 37.6
    P += [box(x, y - 15, -.4, x + 12, y, .4, 'paper'), box(x - 4, y - 6, -.4, x, y, .4, 'paper'), box(x + 12, y - 6, -.4, x + 16, y, .4, 'paper'),
          box(x + 4, y - 2, -.5, x + 8, y, .5, 'weather'), peg(x + 1, y), peg(x + 11, y)]
    # trousers: two legs
    x, y = -18, 36.4
    P += [box(x, y - 5, -.4, x + 11, y, .4, 'spineB'), box(x, y - 18, -.4, x + 5, y - 5, .4, 'spineB'), box(x + 6, y - 18, -.4, x + 11, y - 5, .4, 'spineB'),
          peg(x + 1, y), peg(x + 10, y)]
    # a sheet with a fold, a dress
    x, y = 0, 36
    P += [box(x, y - 17, -.4, x + 16, y, .4, 'ivory'), box(x + 10, y - 17, -.6, x + 11, y, .6, 'paper'), peg(x + 1, y), peg(x + 15, y)]
    x, y = 22, 36.6
    P += [box(x + 2, y - 7, -.4, x + 9, y, .4, 'redbk'), ball(x + 5.5, y - 13, 0, 0, 'redbk', rr=[5.6, 6.6, .5]), peg(x + 3, y), peg(x + 8, y)]
    P += [box(-46, 0, 6, -36, 6, 14, 'oak', pattern=['planks', 3, 'y']), ball(-41, 7, 10, 0, 'paper', rr=[4, 2, 3])]
    return P


@piece('wk_rack', size=(90, 80))
def fish_rack():
    P = [rod([-30, 0, -6], [-30, 36, 0], 1.3, 1.2, 'weather'), rod([-30, 0, 6], [-30, 36, 0], 1.3, 1.2, 'weather'),
         rod([30, 0, -6], [30, 36, 0], 1.3, 1.2, 'weather'), rod([30, 0, 6], [30, 36, 0], 1.3, 1.2, 'weather'),
         cyl(-31, 35, 0, 1.4, 62, 'oak', axis='x')]
    import random
    rnd = random.Random(2)
    for i, x in enumerate(range(-24, 26, 7)):   # fish of different sizes, hung at different heights, some tilted
        L = rnd.uniform(5, 9); w = L * .3; y0 = 31 - rnd.uniform(0, 3); m = rnd.choice(('tin', 'steelbl', 'weather'))
        tilt = rnd.uniform(-1.5, 1.5)
        P += [box(x - .2, y0, -.2, x + .2, 35, .2, 'rope'), ball(x + tilt * .5, y0 - L, 0, 0, m, rr=[w, L, w * .6]),
              box(x + tilt - w * .9, y0 - 2 * L - .6, -.4, x + tilt + w * .9, y0 - 2 * L + 1, .4, m)]
    return P


@piece('gardenbed', size=(100, 70))
def garden_bed():
    P = [box(-38, 0, -20, 38, 6, -17, 'oak'), box(-38, 0, 17, 38, 6, 20, 'oak'), box(-38, 0, -20, -35, 6, 20, 'oak'), box(35, 0, -20, 38, 6, 20, 'oak'),
         box(-35, 0, -17, 35, 5, 17, 'soot')]
    import random
    rnd = random.Random(6)
    for r, z in enumerate((-11, -1, 9)):
        x = -30
        while x < 31:
            if rnd.random() < .15: x += 7; continue                      # a gap where something didn't come up
            s = rnd.uniform(.7, 1.3)
            P += [rod([x, 5, z], [x - 1, 5 + 5 * s, z + 1], .5, .3, 'leaf'), rod([x, 5, z], [x + 1.5, 5 + 4.5 * s, z - 1], .5, .3, 'leaf'),
                  ball(x, 5 + 4.6 * s, z, 0, 'leaf', rr=[2.2 * s, 1.2 * s, 1.8 * s])]
            if r == 1 and rnd.random() < .5: P.append(ball(x + .5, 5.6, z + 2.4, 0, 'pumpkin', rr=[1.2, 1, 1.2]))
            x += rnd.uniform(5.5, 8)
    return P


@piece('parkbench', size=(80, 60))
def park_bench():
    P = []
    for x in (-24, 24):
        P += [box(x - 1.4, 0, -7, x + 1.4, 12, -5, 'castiron'), box(x - 1.4, 0, 5, x + 1.4, 12, 7, 'castiron'), box(x - 1.4, 11, -7, x + 1.4, 13, 7, 'castiron'),
              box(x - 1.4, 13, -8, x + 1.4, 30, -6, 'castiron'), rod([x, 20, 7], [x, 16, 4], 1.1, 1.1, 'castiron'), box(x - 1.4, 13, 5, x + 1.4, 18, 6.4, 'castiron')]
    P += [box(-28, 13, z, 28, 14.6, z + 2.8, 'oak') for z in (-5, -1.2, 2.6)]
    P += [box(-28, y, -8.6, 28, y + 2.6, -7, 'oak') for y in (17, 22, 27)]                                   # three back slats with real gaps
    P += [ball(10, 14.6, 1, 0, 'gourd', rr=[2.4, 1.2, 1.6]), ball(-14, 15, 0, 0, 'leaf', rr=[2, .4, 1.4])]
    return P
