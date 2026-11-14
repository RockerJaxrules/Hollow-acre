"""Item icons for the brewery (#234): what comes off the kettle and the press (wort, mash and must in a wooden bucket),
what comes out of a keg to go to the still (wash, in a stoneware crock) and the finished drinks (ale and pumpkin ale in
brown bottles, wine and old wine in green glass, white dog in a canning jar, whiskey in a squat flask, vodka in clear
glass, and Hollow gin with a glowcap floating in it). 32x32, the crop icons' kit: lit from the top left, a darker
outline of each colour, one highlight mass, no speckle.

    python3 brew_icons.py out_dir            -> icon32_<item>.png
    python3 brew_icons.py --install spr/lpc/obj spr/lpc/objects.json
"""
import sys, os, json, math
from PIL import Image
from crops import Canvas, HEX, outline, specks
from crops_more import ball

R = lambda *h: [HEX(c) for c in h]
OAKB = R('#2a1a0e', '#45301a', '#654626', '#86603a', '#a47c4e', '#c09a66')
HOOP = R('#1c1e24', '#30333c', '#4a4e5a', '#6e7380', '#9aa0ac')
CROCK = R('#3a3228', '#5e5444', '#857a66', '#ab9f88', '#cdc3ac', '#e6dfcc')
CORK = R('#5a3a1c', '#8a6034', '#b48a52')
BROWNG = R('#1e0e06', '#3a1c0a', '#5a2e12', '#7a4418', '#9c5e26', '#c88a4a')
GREENG = R('#0a1a12', '#14301e', '#1e462a', '#2e6038', '#4a8452', '#8ab88c')
CLEAR = R('#4a5a68', '#6e8292', '#98aebc', '#c4d6e0', '#e6f0f4', '#ffffff')
LABEL = R('#8a7a5e', '#b8a682', '#d6c8a2', '#ece2c4')
GOLD = R('#5a3a0a', '#8a5a14', '#b47c22', '#d8a03a', '#f0c868')
RED = R('#3a0a0e', '#5e1218', '#8a1e24', '#b4323a', '#d85a5a')


def bucket(liquid, foam=None, bits=None):
    """a coopered wooden bucket seen a little from above: staves lit on the left, two iron hoops, a rope handle, and what's
    in it showing in the oval of the rim"""
    cv = Canvas(32, 32); cx, top, bot = 16, 11, 29
    for y in range(top, bot):
        t = (y - top) / (bot - top); w = 10.5 - t * 2.2
        for x in range(int(-w), int(w) + 1):
            u = x / w; k = 4 if u < -.55 else 3 if u < -.1 else 2 if u < .45 else 1
            if (x + 20) % 4 == 0: k = max(0, k - 1)
            cv.put(cx + x, y, OAKB[k])
    for hy in (top + 4, bot - 4):
        w = 10.5 - (hy - top) / (bot - top) * 2.2
        for x in range(int(-w), int(w) + 1):
            u = x / w; cv.put(cx + x, hy, HOOP[3 if u < -.3 else 2 if u < .4 else 1])
    for x in range(-10, 11):
        for y in range(-4, 5):
            d = x * x / 110 + y * y / 16
            if d > 1: continue
            if d > .72: cv.put(cx + x, top + y, OAKB[5] if y < 0 else OAKB[3])
            else: cv.put(cx + x, top + y, liquid[1] if (x < 0 and y < 1) else liquid[0])       # a flat surface, two tones, no heap
    if foam:
        for (x, y) in ((-6, -2), (-5, -2), (-3, -3), (1, -3), (2, -3), (6, -2)): cv.put(cx + x, top + y, foam[0] if x > 0 else foam[1])   # a little foam hugging the back rim, uneven
    for x in range(-6, -2): cv.put(cx + x, top, liquid[2])                                 # one sheen line, top left
    if bits:
        for (dx, dy, c) in bits: cv.put(cx + dx, top + dy, c)
    prev = None
    for k in range(25):                                                                 # the rope handle: one continuous line
        a = math.pi * (k / 24); x, y = round(cx - 9 + k * .75), round(top - 2 - math.sin(a) * 7)
        cv.put(x, y, CORK[2] if k < 13 else CORK[1])
    return outline(cv.image())


def crock(band, dip=None):
    """a stoneware crock with a cork: salt-glazed grey-buff, lit left, a coloured band round its belly, a little ear handle"""
    cv = Canvas(32, 32); cx = 15
    ball(cv, cx, 19, 9.5, 10, CROCK)
    for y in range(4, 10):
        w = 3 if y > 6 else 2.6
        for x in range(int(-w), int(w) + 1): cv.put(cx + x, y, CROCK[4] if x < 0 else CROCK[2])
    for y in range(1, 5):
        for x in range(-2, 3): cv.put(cx + x, y, CORK[2] if x < 0 else CORK[1])
    for x in range(-9, 10):
        for j in range(2):
            if (round(cx + x), 19 + j) in cv.px: cv.put(cx + x, 19 + j, band[3 - j] if x < 2 else band[1])
    for (dx, dy) in ((10, 9), (11, 10), (11, 11), (11, 12), (10, 13)): cv.put(cx + dx, dy, CROCK[2])
    for (dx, dy) in ((-4, 13), (-5, 14), (-4, 15)): cv.put(cx + dx, dy, CROCK[5])
    if dip:
        for (x, y), c in list(cv.px.items()):
            if y < 17 and c in CROCK: cv.put(x, y, dip[min(len(dip) - 1, CROCK.index(c))])
        for x in range(-9, 10):
            if (cx + x, 17) in cv.px and x in (-6, -1, 5): cv.put(cx + x, 17, dip[2])                    # a few runs of glaze
    return outline(cv.image())


def bottle(glass, liquid, fill, body, neck, label=None, cap=None, shape='tall', extra=None):
    """a bottle stood upright: the glass lit at the left edge (one bright streak), the liquid showing through below its
    level, a paper label, and a cork, crown cap or wax on top"""
    cv = Canvas(32, 32); cx = 16
    bw, btop, bbot = body; nw, ntop = neck
    for y in range(btop, bbot):
        sh = 1 if shape == 'squat' else 0
        w = bw - (1 if y in (btop, bbot - 1) else 0) - (sh if y < btop + 2 else 0)
        for x in range(-w, w + 1):
            u = x / max(1, w); inliq = y >= btop + (bbot - btop) * (1 - fill)
            src = liquid if (inliq and liquid) else glass
            k = 4 if u < -.65 else 3 if u < -.2 else 2 if u < .5 else 1
            if src is glass and inliq is False and liquid: k = max(1, k)
            cv.put(cx + x, y, src[k])
    for y in range(ntop, btop):                                                       # shoulder and neck
        t = (y - ntop) / max(1, btop - ntop)
        w = nw if t < .55 else nw + (bw - nw) * ((t - .55) / .45) ** 1.6
        for x in range(int(-w), int(w) + 1):
            u = x / max(1, w); cv.put(cx + x, y, glass[4 if u < -.4 else 3 if u < .3 else 1])
    for y in range(ntop + 2, bbot - 2): cv.put(cx - bw + 1, y, glass[5]) if y > btop or y < ntop + 6 else None   # the bright streak
    if label:
        ly0, ly1, lc = label
        for y in range(ly0, ly1):
            for x in range(-bw + 1, bw):
                u = x / bw; cv.put(cx + x, y, lc[3 if u < -.4 else 2 if u < .5 else 1])
        if extra: extra(cv, cx, ly0, ly1)
    if cap == 'cork':
        for y in range(ntop - 3, ntop):
            for x in range(-nw + 1, nw): cv.put(cx + x, y, CORK[2] if x < 0 else CORK[1])
    elif cap == 'crown':
        for x in range(-nw - 1, nw + 2): cv.put(cx + x, ntop - 1, GOLD[3] if x < 0 else GOLD[1])
        for x in range(-nw, nw + 1): cv.put(cx + x, ntop - 2, GOLD[4] if x < 0 else GOLD[2])
    elif cap == 'wax':
        for y in range(ntop - 3, ntop + 3):
            for x in range(-nw - 1, nw + 2): cv.put(cx + x, y, RED[3] if x < 0 else RED[2])
        for (dx, dy) in ((-nw - 1, 3), (-nw - 1, 4), (nw + 1, 3), (1, 3)): cv.put(cx + dx, ntop + dy, RED[2])
    elif cap == 'lid':
        for y in range(ntop - 2, ntop + 1):
            for x in range(-nw - 1, nw + 2): cv.put(cx + x, y, HOOP[4] if y == ntop - 2 else HOOP[3] if x < 0 else HOOP[1])
    return cv


def label_text(col):
    def f(cv, cx, y0, y1):
        for x in range(-3, 4): cv.put(cx + x, y0 + 1, col)
        for x in range(-2, 3): cv.put(cx + x, y0 + 3, col) if y1 - y0 > 4 else None
    return f


def icons():
    I = {}
    I['wort_ale'] = bucket(R('#4a2208', '#6e3810', '#c8904a'), foam=R('#f8f0d8', '#e0d0a8'))
    I['wort_pump'] = bucket(R('#b04a10', '#d8661a', '#f8a850'), foam=R('#f8ecd0', '#e8c890'), bits=[(2, 0, HEX('#f08a2a')), (3, 0, HEX('#f8a850')), (2, 1, HEX('#b85a14')), (3, 1, HEX('#d06a1c')), (4, 0, HEX('#d06a1c'))])
    I['mash_corn'] = bucket(R('#a07a28', '#c89e3c', '#f0d070'), bits=[(-4, -1, HEX('#f4dc84')), (0, 1, HEX('#f4dc84')), (4, -2, HEX('#f4dc84')), (-1, -2, HEX('#8a6420')), (3, 1, HEX('#8a6420'))])
    I['mash_potato'] = bucket(R('#9a8e70', '#c4b892', '#f0e8cc'), bits=[(-4, 0, HEX('#f2ecd4')), (-3, -1, HEX('#f2ecd4')), (2, -1, HEX('#f2ecd4')), (3, 0, HEX('#f2ecd4')), (0, 1, HEX('#a89a74'))])
    I['must_grape'] = bucket(R('#2a0e30', '#4a1a52', '#8e5aa4'), bits=[(-5, -1, HEX('#8e5aa4')), (-4, -1, HEX('#5a2e6a')), (3, 0, HEX('#8e5aa4')), (4, 0, HEX('#5a2e6a')), (0, -2, HEX('#7aa040'))])
    I['wash_corn'] = crock(R('#5a4010', '#8a6418', '#b48a28', '#dab048'))
    I['wash_potato'] = crock(R('#4a3a28', '#6e5a40', '#94805e', '#b8a47e'), dip=R('#24140a', '#3e2412', '#5a361c', '#764a28', '#92603a', '#ac7a4e'))
    ale = bottle(BROWNG, None, 0, (5, 13, 30), (2, 5), label=(17, 24, LABEL), cap='crown', extra=label_text(HEX('#7a2a12')))
    I['ale'] = outline(ale.image())
    pale = bottle(BROWNG, None, 0, (5, 13, 30), (2, 5), label=(17, 24, R('#7a3a10', '#b85a1c', '#e07a2c', '#f4a052')), cap='crown', extra=label_text(HEX('#4a1a06')))
    I['pumpkin_ale'] = outline(pale.image())
    wine = bottle(GREENG, R('#1a0408', '#3a0a14', '#5a1220', '#7a1e2c', '#8e2a38', '#a84050'), .55, (5, 14, 30), (2, 3), label=(19, 26, LABEL), cap='cork', extra=label_text(HEX('#6a1420')))
    I['wine'] = outline(wine.image())
    old = bottle(GREENG, R('#1a0408', '#3a0a14', '#5a1220', '#7a1e2c', '#8e2a38', '#a84050'), .55, (5, 14, 30), (2, 3), label=(19, 26, R('#6a5e48', '#8e826a', '#ab9f84', '#c2b69a')), cap='wax')
    for (x, y) in ((12, 14), (13, 15), (19, 16), (20, 15), (14, 27), (18, 28)):                  # dust on the shoulder and a scuff on the label
        old.put(x, y, HEX('#8a9488'))
    I['old_wine'] = outline(old.image())
    jar = bottle(R('#2e3a44', '#46566a', '#7a92a8', '#a8bccc', '#d4e2ec', '#ffffff'), R('#2e3430', '#3a423c', '#4e5850', '#6a766a', '#a8b4a0', '#e8f0e0'), .72, (7, 10, 30), (6, 9), cap='lid', shape='squat')
    for y in range(11, 15):
        for x in range(-6, 7): jar.put(16 + x, y, HEX('#1e2228') if x > -5 else HEX('#3a4450'))      # empty glass: the dark behind it
    for x in range(-6, 7): jar.put(16 + x, 15, HEX('#f0f4e8'))                                      # the liquid line, full width
    for y in range(16, 29):
        for x in range(-6, 7):
            c = jar.px.get((16 + x, y))
            if c and x > -5: jar.put(16 + x, y, HEX('#5a6052') if x > 2 else HEX('#6e7462'))          # the spirit, a step paler, faintly warm
    for y in range(11, 28):
        if y not in (15,): jar.put(10, y, HEX('#ffffff') if y < 14 or 18 < y < 23 else HEX('#8a96a0'))
        jar.put(12, y, HEX('#2a3038')) if y < 15 else None
    for y in (15, 25):
        for x in range(-5, 6): jar.put(16 + x, y, CLEAR[2] if x > -3 else CLEAR[4])                # two moulded ribs, faint
    I['white_dog'] = outline(jar.image())
    wh = bottle(CLEAR, R('#4a2006', '#7a3a0e', '#a85a18', '#cc7a26', '#e09a40', '#f4c070'), .8, (7, 15, 30), (2, 7), label=(19, 25, R('#0e0c0c', '#1e1a18', '#2a2420', '#3a322c')), cap='cork', shape='squat', extra=label_text(HEX('#d8a03a')))
    I['whiskey'] = outline(wh.image())
    GLS = R('#1e2830', '#2e3a44', '#46566a', '#8aa0b4', '#c4d4e0', '#f4f8fc')
    vo = bottle(GLS, R('#283440', '#34424e', '#4a5a6a', '#7a92a8', '#b0c4d4', '#e8f0f8'), .8, (5, 12, 30), (1, 3), label=(19, 24, R('#5a1414', '#8a2020', '#b43030', '#d84848')), cap=None)
    for y in range(1, 3):
        for x in range(-2, 3): vo.put(16 + x, y, HEX('#b43030') if x < 1 else HEX('#7a1a1a'))
    for x in range(-4, 5): vo.put(16 + x, 18, HEX('#c4d4e0'))                                     # the spirit's line
    for y in range(13, 28): vo.put(13, y, HEX('#f4f8fc')) if y < 17 or y > 24 else None
    I['vodka'] = outline(vo.image())
    gin = bottle(R('#0a1e1a', '#123a30', '#1e5646', '#2e7460', '#56a08a', '#a6dcc8'), R('#1a4a3a', '#2a6a52', '#3e8a6a', '#5aa884', '#86c8a4', '#c0ecd4'), .75, (5, 13, 30), (2, 4), cap='cork')
    for dy in range(-2, 7):
        for dx in range(-4, 5):
            if dx * dx + (dy - 2) ** 2 * 1.4 <= 18: gin.put(16 + dx, 20 + dy, HEX('#7cc8a0'))
    for (dx, dy, c) in ((-1, 0, '#e8f4c0'), (0, 0, '#f8ffe0'), (1, 0, '#d0e8a0'), (-2, 1, '#c8e098'), (-1, 1, '#f0fcd0'), (0, 1, '#f8ffe0'), (1, 1, '#d8eca8'), (2, 1, '#a8c878'), (0, 2, '#b8d488'), (0, 3, '#98b868'), (0, 4, '#98b868')):
        gin.put(16 + dx, 20 + dy, HEX(c))                                                         # a glowcap, floating
    I['hollow_gin'] = outline(gin.image())
    return I


if __name__ == '__main__':
    if sys.argv[1] == '--install':
        obj, oj = sys.argv[2], sys.argv[3]; O = json.load(open(oj))
        for k, im in icons().items():
            im.save(os.path.join(obj, f'icon32_{k}.png'))
            O[f'icon32_{k}'] = {'src': f'spr/lpc/obj/icon32_{k}.png', 'fw': 32, 'fh': 32, 'ax': 16.0, 'ay': 32.0, 'foot': [0, 0, 0, 0], 'px': 'ase', 'chim': None}
        json.dump(O, open(oj, 'w')); print('installed', len(O)); sys.exit(0)
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k, im in icons().items():
        im.save(os.path.join(out, f'icon32_{k}.png'))
        sp = specks(im)
        if sp: print('  speck', k, sp[:5])
    print('ok')
