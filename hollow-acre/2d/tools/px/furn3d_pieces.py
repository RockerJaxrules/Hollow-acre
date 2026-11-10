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


@piece('in_rockS', size=(80, 100))
def rocking_chair():
    P = []
    for x in (-11, 11):   # curved rockers, longer than the chair, tips curling up front and back
        pts = [(-15, 5), (-11, 1.5), (-5, 0), (5, 0), (11, 1.5), (15, 5)]
        for (z0, y0), (z1, y1) in zip(pts, pts[1:]): P.append(rod([x, y0 + 1, z0], [x, y1 + 1, z1], 1.3, 1.3, 'dkwood'))
    P += [box(x - 1.5, 2, z, x + 1.5, 16, z + 3, 'wood') for x in (-11, 11) for z in (-8, 6)]          # legs
    P += [box(-12, 16, -9, 12, 19, 10, 'wood', pattern=['planks', 4, 'x']),                            # the seat
          box(-12, 16, -10, -9, 44, -7, 'wood'), box(9, 16, -10, 12, 44, -7, 'wood'),                  # back posts
          box(-12, 40, -10, 12, 45, -7, 'dkwood'), ball(-10.5, 46, -8.5, 1.8, 'wood'), ball(10.5, 46, -8.5, 1.8, 'wood')]   # crest rail, finials
    P += [box(x, 19, -9.5, x + 2, 40, -8, 'dkwood') for x in (-6, -2, 2, 6)]                          # spindles
    P += [box(-13, 26, -8, -10, 28.5, 9, 'wood'), box(10, 26, -8, 13, 28.5, 9, 'wood'),               # arms on their posts
          box(-12.5, 19, 7, -10.5, 26, 9, 'wood'), box(10.5, 19, 7, 12.5, 26, 9, 'wood'),
          box(-10, 19, -7, 10, 22, 8, 'redbk'), box(-9, 22, -8, 9, 36, -6, 'redbk')]                   # a worn cushion and back pad
    return P


@piece('in_oillamp', rot=False, size=(40, 70))
def oil_lamp():
    return [cyl(0, 0, 0, 5, 3, 'brass'), cyl(0, 3, 0, 2, 6, 'brass'), ball(0, 12, 0, 0, 'glass', rr=[5, 4, 5]),
            cyl(0, 15, 0, 3, 2, 'brass'), cyl(0, 17, 0, 2.6, 10, 'glass'), box(-1, 19, -1, 1, 23, 1, 'glow'),
            box(4, 4, -1, 7, 6, 1, 'brass')]


@piece('in_shelf_jars', size=(80, 110))
def shelf_jars():
    P = [box(-24, 0, -7, -21, 50, 6, 'dkwood'), box(21, 0, -7, 24, 50, 6, 'dkwood'), box(-24, 0, -7, 24, 50, -5, 'dkwood', pattern=['planks', 6, 'x'])]
    for y in (1, 17, 33, 49): P.append(box(-22, y, -5, 22, y + 2, 6, 'wood'))
    for i, (x, y, m, r, h) in enumerate([(-16, 19, 'glass', 3, 8), (-9, 19, 'clay', 3.5, 7), (-2, 19, 'glass', 3, 9), (6, 19, 'pumpkin', 3.5, 6), (14, 19, 'glass', 3, 8),
                                         (-15, 35, 'clay', 4, 9), (-6, 35, 'glass', 3, 7), (3, 35, 'greenbk', 3, 8), (12, 35, 'clay', 3.5, 7),
                                         (-14, 3, 'cloth', 5, 10), (2, 3, 'clay', 5, 9), (14, 3, 'cloth', 4, 8)]):
        P += [cyl(x, y, 0, r, h, m), cyl(x, y + h, 0, r * .6, 1.5, 'wood' if m == 'glass' else 'cloth')]
    return P


@piece('in_crates', size=(80, 90))
def crates():
    return [box(-18, 0, -8, 2, 18, 8, 'wood', pattern=['planks', 6, 'y']), box(4, 0, -6, 20, 14, 8, 'wood', pattern=['planks', 5, 'y']),
            box(-14, 18, -6, 0, 30, 6, 'dkwood', pattern=['planks', 4, 'y']),
            box(-19, 7, 8, 3, 9, 9, 'dkwood'), box(3, 5, 8, 21, 7, 9, 'dkwood'),                    # slats across the fronts
            ball(10, 15, 0, 3, 'pumpkin'), ball(15, 15, 2, 2.5, 'pumpkin'), box(-11, 30, -3, -4, 32, 3, 'cloth')]


@piece('in_shelf_books', size=(80, 120))
def bookcase():
    P = [box(-24, 0, -7, -21, 62, 6, 'dkwood'), box(21, 0, -7, 24, 62, 6, 'dkwood'), box(-24, 0, -7, 24, 62, -5, 'dkwood'),
         box(-25, 61, -8, 25, 64, 7, 'wood')]
    for y in (1, 16, 31, 46): P.append(box(-22, y, -5, 22, y + 2, 6, 'wood'))
    import random
    rnd = random.Random(7)
    for y in (3, 18, 33, 48):
        x = -21
        while x < 19:
            w = rnd.choice((2, 2, 3, 3, 4)); h = rnd.choice((9, 10, 11, 12)); m = rnd.choice(('redbk', 'bluebk', 'greenbk', 'leather', 'paper'))
            if rnd.random() < .12: x += 3; continue                                                # gaps where books are missing
            P.append(box(x, y, -3, x + w, y + h, 5, m)); x += w
    return P


@piece('in_desk', size=(90, 90))
def writing_desk():
    P = legs4(26, 9, 22, 'dkwood') + [box(-27, 22, -10, 27, 26, 10, 'wood', pattern=['planks', 6, 'x']),
         box(8, 12, -9, 25, 22, 8, 'wood'), box(9, 16, 8, 24, 17, 9, 'dkwood'), box(15, 18, 8, 18, 20, 10, 'brass'),   # a drawer with a pull
         box(-27, 26, -10, 27, 36, -7, 'dkwood'), box(-27, 36, -10, 27, 38, -5, 'wood'),            # the back gallery
         box(-18, 26, -2, -2, 27, 8, 'paper'), box(-15, 27, 0, -6, 28, 6, 'paper'),                  # papers, a letter on top
         cyl(4, 26, 2, 2, 3, 'ink'), rod([5, 29, 2], [9, 34, -1], .5, .3, 'paper'),                  # inkwell and quill
         cyl(18, 26, -3, 3, 2, 'brass'), cyl(18, 28, -3, 2, 6, 'glass'), box(17, 30, -4, 19, 32, -2, 'glow')]   # a small lamp
    return P


@piece('in_clock', size=(50, 130))
def grandfather_clock():
    return [box(-9, 0, -6, 9, 6, -4 + 10, 'dkwood'), box(-7, 6, -5, 7, 48, 4, 'wood', pattern=['planks', 7, 'y']),
            box(-5, 14, 4, 5, 40, 5, 'glass'), rod([0, 40, 4.6], [0, 22, 4.6], .5, .5, 'brass'), cyl(0, 21, 4.6, 2.4, 1, 'brass', axis='z'),
            box(-9, 48, -6, 9, 66, 6, 'dkwood'), cyl(0, 57, 6, 6.5, 1, 'ivory', axis='z'), cyl(0, 57, 7, 1, 1, 'ink', axis='z'),
            rod([0, 57, 7.5], [0, 61, 7.5], .4, .4, 'ink'), rod([0, 57, 7.5], [3, 57, 7.5], .4, .4, 'ink'),
            box(-10, 66, -7, 10, 69, 7, 'wood'), ball(0, 71, 0, 0, 'wood', rr=[5, 3, 4])]


@piece('in_table', size=(90, 80))
def dining_table():
    return legs4(26, 12, 22, 'dkwood') + [box(-28, 22, -13, 28, 26, 13, 'wood', pattern=['planks', 6, 'x']),
            box(-12, 26, -6, 12, 27, 6, 'redbk'),                                                    # a runner
            cyl(-16, 26, 3, 5, 1, 'ivory'), cyl(16, 26, -3, 5, 1, 'ivory'), cyl(0, 26, 0, 2.5, 6, 'clay'), ball(0, 33, 0, 3, 'pumpkin'),
            cyl(-8, 26, -6, 1.6, 4, 'ivory'), cyl(10, 26, 6, 1.6, 4, 'ivory')]


@piece('in_chess', size=(70, 80))
def chess_table():
    P = [cyl(0, 0, 0, 7, 2, 'dkwood'), cyl(0, 2, 0, 2, 18, 'dkwood'), box(-14, 20, -11, 14, 23, 11, 'wood')]
    for i in range(4):
        for j in range(4): P.append(box(-12 + i * 6, 23, -10 + j * 5, -6 + i * 6, 23.6, -5 + j * 5, 'ivory' if (i + j) % 2 else 'ink'))
    for (x, z, m) in ((-9, -7, 'ivory'), (-3, -7, 'ivory'), (3, 3, 'ink'), (9, 8, 'ink'), (-3, 3, 'ivory')):
        P += [cyl(x, 23.6, z, 1.2, 3, m), ball(x, 27.5, z, 1.1, m)]
    return P


@piece('in_piano', size=(100, 100))
def upright_piano():
    return [box(-30, 0, -10, 30, 48, 4, 'ink', pattern=['planks', 12, 'x']), box(-31, 48, -11, 31, 51, 5, 'dkwood'),
            box(-28, 22, 4, 28, 26, 13, 'ink'), box(-27, 26, 5, 27, 27, 12, 'ivory'),
            box(-28, 6, 4, -24, 22, 9, 'ink'), box(24, 6, 4, 28, 22, 9, 'ink'),                      # legs under the keyboard
            box(-14, 30, 3, 14, 44, 5, 'dkwood'), box(-12, 32, 5, -2, 42, 6, 'paper'), box(1, 33, 5, 11, 41, 6, 'paper'),   # music on the stand
            cyl(-24, 51, -4, 2, 1, 'brass'), cyl(-24, 52, -4, 1, 6, 'ivory'), box(-25, 58, -5, -23, 60, -3, 'glow'),
            box(-8, 0, 6, 8, 12, 14, 'dkwood'), box(-9, 12, 5, 9, 14, 15, 'redbk')]                 # the stool


@piece('in_globe', rot=False, size=(50, 80))
def globe():
    return [cyl(0, 0, 0, 7, 2, 'dkwood'), cyl(0, 2, 0, 1.6, 14, 'dkwood'), ring(0, 30, 0, 11, 1, 'brass'),
            ball(0, 30, 0, 10, 'bluebk'), ball(-3, 33, 4, 4.5, 'greenbk'), ball(4, 27, 5, 3.5, 'greenbk'), ball(5, 35, -2, 3, 'paper')]


@piece('in_candles', rot=False, size=(50, 80))
def candelabra():
    P = [cyl(0, 0, 0, 6, 2, 'brass'), cyl(0, 2, 0, 1.4, 22, 'brass'), box(-13, 23, -1, 13, 25, 1, 'brass')]
    for x, h in ((-12, 7), (-6, 9), (0, 11), (6, 9), (12, 7)):
        P += [cyl(x, 25, 0, 1.6, 1, 'brass'), cyl(x, 26, 0, 1.2, h, 'ivory'), box(x - .6, 26 + h, -.6, x + .6, 28.5 + h, .6, 'glow')]
    return P


@piece('in_keg', size=(70, 70))
def cider_keg():
    return [box(-12, 0, -9, -9, 8, 9, 'dkwood'), box(9, 0, -9, 12, 8, 9, 'dkwood'),                # the cradle
            cyl(0, 15, -10, 11, 21, 'wood', axis='z', pattern=['planks', 4, 'x']),
            ring(0, 15, -8, 11.2, 1, 'iron'), ring(0, 15, 9, 11.2, 1, 'iron'),
            cyl(0, 10, 11, 1.4, 4, 'brass', axis='z'), box(-1, 8, 13, 1, 10, 15, 'brass'), cyl(0, 2, 13, 2.5, 2, 'clay')]   # the tap and a cup


@piece('in_cradle', size=(80, 80))
def cradle():
    P = []
    for x in (-13, 13):   # rockers across the ends
        pts = [(-12, 4), (-8, 1), (0, 0), (8, 1), (12, 4)]
        for (z0, y0), (z1, y1) in zip(pts, pts[1:]): P.append(rod([x, y0 + 1, z0], [x, y1 + 1, z1], 1.2, 1.2, 'dkwood'))
    P += [box(-14, 3, -9, 14, 20, 9, 'wood', pattern=['planks', 4, 'y']), box(-12, 15, -7, 12, 17, 7, 'cloth'),   # the basket and its bedding
          box(-14, 20, -10, 14, 22, -7, 'dkwood'), box(-14, 20, 7, 14, 22, 10, 'dkwood'),                         # rails along the sides
          box(-14, 20, -9, -11, 34, 9, 'wood'), box(-14, 32, -9, -4, 35, 9, 'wood'), box(-14, 28, -9, -6, 32, 9, 'wood'),   # the hood over the head end
          ball(-6, 18, 0, 0, 'ivory', rr=[4, 2.5, 3.5]), box(-4, 17, -6, 11, 20, 6, 'paper'),                      # a small pillow and a quilt
          box(-2, 20, -6, 11, 21, 6, 'redbk')]
    return P


@piece('jack_b', size=(50, 50))
def jack_o_lantern():
    P = [ball(0, 9, 0, 0, 'pumpkin', rr=[11, 9, 10], lumps=.4, lumpfreq=1.6), cyl(0, 17, 0, 1.4, 4, 'greenbk')]
    P += [box(-6, 10, 8, -3, 13, 10, 'glow'), box(3, 10, 8, 6, 13, 10, 'glow'), box(-5, 4, 9, 5, 7, 10.5, 'glow')]   # eyes and a grin, lit inside
    return P

# ---- batch 1, redrawn (judge: the trade object must be the biggest, highest-contrast shape, lit rim on metal; vary repeats;
#      every cue drawn so it survives the turn). These replace the blockprops versions registered above.
BP.RAMPS.update({'blgrey': ['#1c2028', '#2c3440', '#425060', '#5c6c7c', '#7c8c98'],
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
    P = table2(26, 10, 24, 4, 'blgrey', 'blgrey')
    P += [box(-26, 28, -10, 26, 54, -7, 'blgrey', pattern=['planks', 7, 'y']), box(-26, 44, -10, 26, 46, -2, 'wood'),   # back panel, a bare-wood shelf
          box(-22, 28, -4, -3, 31, 7, 'wood')]                                                       # the seed tray
    for i in range(5):
        for k in range(2): P.append(ball(-20 + i * 3.8, 32, -1.5 + k * 5, 1.5 + .3 * ((i + k) % 2), 'leaf'))
    for x, r, h in ((-17, 3.6, 5), (-3, 3, 4), (11, 4, 6)): P += [cyl(x, 46, -6, r, h, 'clay'), ball(x, 47 + h, -6, r * .9, 'leaf', lumps=.5)]
    P += [cyl(15, 28, 3, 4, 6, 'clay'), ball(15, 37, 3, 4.5, 'leaf', lumps=.6, lumpfreq=1.2),
          cyl(4, 28, 3, 3, 5, 'steel'), rod([6, 31, 3], [11, 34, 3], .8, .6, 'steel'), ring(1, 33, 3, 2.5, .6, 'steel'),   # a watering can
          box(-23, 34, -9, -17, 41, -8, 'paper'), box(-15, 35, -9, -10, 41, -8, 'redbk'),                                # seed packets pinned up
          ball(-13, 12, 0, 0, 'cloth', rr=[7, 5, 5.5]), box(-17, 15, 4, -9, 18, 6, 'paper'),                              # the bone meal sack, labelled
          cyl(10, 7, 0, 3.5, 2, 'brass'), cyl(10, 9, 0, 1, 3, 'brass')]                                                    # a sprinkler head
    return P


@piece('bench_furn')
def bench_furn2():
    P = table2(27, 10, 22, 5, 'wood', 'dkwood')
    P += [box(-27, 27, -10, 27, 50, -7, 'dkwood', pattern=['planks', 9, 'y']),
          box(-20, 27, -3, 16, 29, 5, 'paper'),                                                      # a pale plank on the top...
          box(-2, 29, -2, 1, 38, 4, 'steel'), box(-3, 37, -2, 2, 41, 4, 'wood'),                      # ...a saw standing in its cut, handle up
          ball(-12, 29.5, 6, 1.6, 'paper'), ball(-8, 29.5, 7, 1.3, 'paper'), ball(6, 29.5, 6.5, 1.5, 'paper'), ball(10, 29.3, 4, 1.1, 'paper'),   # shavings
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
    for x in (6, 17):   # two swords on the rack: long blades with a lit rim, crossguards, wrapped grips, pommels
        P += [box(x, 27, -6, x + 3, 50, -5, 'steel'), box(x - 3, 50, -6.5, x + 6, 52, -4.5, 'brass'),
              box(x, 52, -6, x + 3, 56, -5, 'leather'), ball(x + 1.5, 57, -5.5, 1.5, 'brass')]
    P += [box(-25, 27, -6, -8, 31, 6, 'dkwood'),                                                    # the grindstone's trough
          cyl(-16, 39, -4, 9, 3, 'stone', axis='z'), cyl(-16, 39, -6, 1.5, 7, 'iron', axis='z'),      # the wheel on its axle
          box(-27, 27, -2, -25, 40, 0, 'dkwood'), box(-7, 27, -2, -5, 40, 0, 'dkwood'),               # its frame
          rod([-16, 39, 1], [-16, 44, 5], .8, .8, 'iron'), box(-17, 44, 4, -15, 47, 6, 'wood'),        # the crank
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
    P += [ball(20, 30, -2, 4.5, 'steel'), cyl(20, 27, -2, 4.8, 3, 'steel'), box(18, 29, 2.5, 22, 31, 3.6, 'ink'),   # a helmet with its visor slit
          cyl(31, 6, 7, 7, 2, 'wood', axis='z'), cyl(31, 6, 9, 2, 1, 'iron', axis='z'),                   # a shield leaning
          cyl(2, 29, 2, 3, 20, 'leather', axis='x'), box(5, 27, -6, 15, 28, -2, 'leather'),
          box(-10, 7, -4, 30, 11, 4, 'leather')]
    return P


@piece('furnace', size=(100, 120))
def furnace2():
    P = [box(-16, 0, -12, 16, 30, 12, 'stone', pattern=['bricks', 5]),
         box(-18, 28, -14, 18, 32, 14, 'stone'),
         cyl(0, 32, -3, 7, 30, 'stone', pattern=['bricks', 5]), cyl(0, 61, -3, 8, 3, 'iron'),
         box(-11, 1, 11, 11, 20, 12.5, 'brick'),                                                       # warm brick round the mouth
         box(-8, 2, 12, 8, 16, 13, 'soot'), box(-7, 3, 12.5, 7, 13, 13.5, 'fire'),
         box(-10, 16, 12, 10, 19, 13.5, 'iron'), box(-12, 20, 12, 12, 27, 12.5, 'soot'),               # the lintel, soot above it
         box(17, 2, -6, 23, 8, 6, 'leather'), box(19, 8, -5, 21, 14, 5, 'wood'),                        # bellows at the side
         ball(-22, 3, 8, 0, 'ink', rr=[5, 3, 4]), ball(-20, 5, 9, 2, 'iron'), ball(-24, 4, 6, 1.6, 'clay')]   # a pile of coal and ore
    return P
