"""#198 round 6: the judge's first fixes on every r5 winner under 6, and two redraws from the item's own words in the game.
  oilflask - 'Lamp oil flask: refills your lantern' (NOT a hip flask: two rounds were lost to a wrong brief): a glass bottle of
             amber oil, a cork and twine, a paper label with a small flame
  chaga    - 'a black clinker of fungus off a white birch; inside it is the orange of a coal': a broken lump, three crust plates,
             a broken face of orange flesh, a grey sliver of birch bark where it came off the tree
    python3 icons198c.py -> out/r6_<name>.png
"""
import math, sys, random, colorsys
from PIL import Image
sys.path.insert(0, '.')
from icons198 import Icon, RAMPS, hexr, sh

OBJ = '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/spr/lpc/obj/'


def load(path):
    I = Icon(); I.im = Image.open(path).convert('RGBA'); I.p = I.im.load(); return I


def recolor(I, m, rows=range(32)):
    for y in rows:
        for x in range(32):
            c = I.p[x, y]
            if c[3] and c[:3] in m:
                I.p[x, y] = m[c[:3]] + (c[3],)


def oilflask():
    I = Icon(); GL = hexr(['#1a2420', '#26342e', '#34463e', '#4a5e54', '#6a8076'])
    for y in range(32):                                                    # the round body of the bottle
        for x in range(32):
            nx, ny = (x + .5 - 16) / 9.5, (y + .5 - 21) / 8.5; d = nx * nx + ny * ny
            if d > 1:
                continue
            nz = math.sqrt(1 - d); l = sh(nx, ny, nz)
            if y >= 16:                                                    # oil to here: amber, glowing where light passes through (lower right)
                k = .35 + l * .45 + max(0, nx * .3 + ny * .25) * .5
                I.P(x, y, I.band('am', min(1, k)))
            else:
                I.P(x, y, GL[min(4, int(1 + l * 3.2))])                     # empty glass above the oil, dark and tinted
    for x in range(8, 25):
        if I.p[x, 16][3]:
            I.P(x, 16, RAMPS['am'][6])                                     # the oil's level, catching the light
    for y in range(6, 13):                                                 # the neck
        for x in range(13, 19):
            I.P(x, y, GL[3] if x < 15 else GL[2] if x < 17 else GL[1])
    for y in range(2, 7):                                                  # the cork
        for x in range(13, 19):
            I.P(x, y, I.band('wd', .85 - (x - 13) * .1 - (y == 2) * 0 + (y == 2) * .1))
    for x in (14, 16):
        I.P(x, 4, RAMPS['wd'][3])
    for x in range(12, 20):                                                # twine round the neck
        I.P(x, 11, RAMPS['bu'][5] if x % 2 else RAMPS['bu'][3])
    for (x, y) in ((10, 15), (10, 16), (10, 17), (11, 14)):
        I.P(x, y, (232, 240, 236))                                         # a hard glint on the glass
    for y in range(19, 25):                                                # a paper label, a small flame printed on it
        for x in range(12, 20):
            I.P(x, y, RAMPS['pp'][5] if x < 18 else RAMPS['pp'][3])
    for (x, y, c) in ((15, 20, 'og'), (16, 20, 'og'), (15, 21, 'og'), (16, 21, 'yl'), (15, 22, 'og'), (16, 22, 'og'), (16, 19, 'og')):
        I.P(x, y, RAMPS[c][5 if c == 'yl' else 3])
    return I.done()


def chaga():
    I = Icon(); R = random.Random(5)
    for y in range(20, 30):                                                # a sliver of birch bark it tore off with, greyed so it does not steal the eye
        for x in range(3, 18):
            if y - 20 > (x - 3) * .7 + 1 and y < 28 - (x - 3) * .3:
                I.P(x, y, RAMPS['wh'][2] if y < 24 else RAMPS['wh'][1])
    for (x, y) in ((6, 25), (7, 25), (11, 26), (12, 26)):
        I.P(x, y, RAMPS['ck'][1])
    lump = [(5, 14), (8, 8), (14, 5), (21, 6), (27, 11), (28, 18), (25, 25), (17, 27), (9, 24), (5, 19)]
    I.poly(lump, 'ck', .25)
    plates = [((10, 12), 6.5, 5), ((19, 10), 6, 4.5), ((13, 20), 6, 4.5)]
    for (cx, cy), rx, ry in plates:                                        # three big crust plates, each a lit dome
        I.blob(cx, cy, rx, ry, 'ck', amb=.12, k=.95, mod=lambda x, y, l, nx, ny: max(.08, l * .7))
    for (x0, y0, x1, y1) in ((15, 6, 14, 16), (7, 17, 20, 15)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1):
            x = x0 + (x1 - x0) * i / n + (i % 3 == 1); y = y0 + (y1 - y0) * i / n
            I.P(x, y, RAMPS['ck'][0])                                      # deep cracks between the plates
    face = [(21, 12), (27, 11), (28, 18), (25, 25), (19, 26), (18, 20)]
    I.poly(face, 'og', lambda x, y: .78 - (y - 11) * .03 - (x - 18) * .012)   # the broken face: orange flesh, the colour of a coal
    for x in range(19, 28, 2):
        for y in range(13, 26):
            if I.p[x, y][3] and I.p[x, y][0] > 120 and (y + x) % 3 == 0:
                I.P(x, y, RAMPS['og'][2])                                  # its fibres running down
    for (x0, y0, x1, y1) in ((21, 12, 18, 20), (18, 20, 19, 26)):
        n = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(n + 1):
            I.P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, RAMPS['ck'][0])
    return I.done(rim=True)


def soup():
    I = load('out/ic198_soup.png')
    m = {(0xab, 0x9b, 0x7e): (0x5e, 0x6c, 0x72), (0x99, 0x8a, 0x70): (0x50, 0x5e, 0x66), (0x88, 0x79, 0x62): (0x46, 0x52, 0x5c),
         (0x77, 0x68, 0x54): (0x3a, 0x46, 0x50), (0x67, 0x57, 0x47): (0x30, 0x3a, 0x44)}
    recolor(I, m, range(23, 30))                                           # a dark glazed bowl, so the soup stands out
    for y in range(0, 13):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and a < 255:
                I.p[x, y] = (238, 236, 230, min(215, int(a * 1.05))) if (r > 200) else (222, 220, 214, int(a * .8))   # pale steam, no dark lower edge
    return I.im


def corn():
    I = load('out/ic198_corn.png')
    for y in range(32):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and g > r and g > b + 10 and y > 16 and x < 14:
                I.p[x, y] = (154, 136, 82, a) if (x + y) % 3 else (120, 104, 60, a)   # the husk dried to straw
    return I.im


def fish_fried():
    I = Icon()
    for y in range(32):                                                    # a plate with a well, the fish set off centre on it
        for x in range(32):
            d = ((x + .5 - 16) / 14) ** 2 + ((y + .5 - 21) / 7.5) ** 2
            if d < 1:
                I.P(x, y, RAMPS['wh'][5] if d > .55 else RAMPS['wh'][3] if (y < 21) else RAMPS['wh'][4])
    I.blob(13, 19, 8.5, 3.6, 'am', mod=lambda x, y, l, nx, ny: .3 + l * .55)  # golden-brown batter
    I.poly([(20, 19), (26, 15), (25, 19), (26, 23)], 'am', .4)               # the tail
    for (x, y) in ((8, 18), (11, 17), (14, 18), (17, 17), (10, 20), (15, 20)):
        I.P(x, y, RAMPS['am'][2])                                          # crumb of the batter
    I.P(6, 18, RAMPS['ck'][1])
    for (x, y) in ((22, 24), (23, 24), (24, 23), (23, 23)):
        I.P(x, y, RAMPS['yl'][5])                                          # a wedge of lemon
    return I.done()


def cranberry():
    I = Icon(); CR = hexr(['#2a060c', '#480a14', '#6a1020', '#8c1a2a', '#aa2a36', '#c84a50', '#e88080'])
    berries = ((10, 21, 3.8), (16, 24, 3.2), (21, 20, 4.2), (14, 16, 3), (19, 13, 2.6), (25, 24, 2.4), (8, 15, 2.2))
    for (cx, cy, r) in berries:                                            # deep crimson, each its own size
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                nx, ny = (x + .5 - cx) / r, (y + .5 - cy) / r; d = nx * nx + ny * ny
                if d < 1:
                    l = .12 + .85 * sh(nx, ny, math.sqrt(1 - d)); I.P(x, y, CR[min(6, int(l * 6 + .5))])
        I.P(int(cx + r * .3), int(cy + r * .35), CR[0])                    # the dark blossom end
        I.P(int(cx - r * .4), int(cy - r * .45), (250, 200, 200))          # a small highlight
    I.poly([(20, 6), (27, 4), (24, 9)], 'ol', .6); I.poly([(20, 6), (24, 9), (21, 10)], 'ol', .3)   # one leaf
    return I.done()


def stone():
    I = Icon()
    I.poly([(4, 16), (8, 10), (18, 8), (27, 11), (28, 20), (20, 25), (8, 24)], 'st', .38)   # a slab, not a dome
    I.poly([(4, 16), (8, 10), (18, 8), (27, 11), (16, 15)], 'st', .78)                      # its lit top face
    I.poly([(4, 16), (16, 15), (8, 24)], 'st', .55)
    I.poly([(27, 11), (28, 15), (24, 13)], 'st', .2)                                        # a chipped corner
    for (x, y) in ((15, 16), (16, 18), (16, 19), (17, 21)):
        I.P(x, y, RAMPS['st'][0])                                                           # a crack
    for (x, y, k) in ((9, 11, 4), (10, 11, 5), (11, 10, 4), (8, 12, 3), (12, 10, 3)):
        I.P(x, y, RAMPS['ol'][k])                                                           # a patch of moss on top
    return I.done()


def weeds_1():
    I = load('/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/r5/old_weeds_1.png')
    # (r5: "fill the blades into a dome; separate bright tips read as a starburst") fill the gaps under the tips with mid straw
    W, H = I.im.size; src = I.im.copy(); s = src.load()
    for y in range(4, 17):
        for x in range(2, W - 2):
            if s[x, y][3] < 100 and s[x, y - 1][3] > 100 and s[x, y + 1][3] > 100:
                I.p[x, y] = (0x56, 0x52, 0x2f, 255)
            elif s[x, y][3] < 100 and s[x - 1, y][3] > 100 and s[x + 1, y][3] > 100 and y > 8:
                I.p[x, y] = (0x3b, 0x3a, 0x24, 255)
    return I.im


def mushroom():
    I = load(OBJ + 'icon32_mushroom.png')
    for y in range(32):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and g > r + 20 and b > r + 10:                                              # the cyan dulled ONE step only
                h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255); r2, g2, b2 = colorsys.hls_to_rgb(h, l * .97, s * .72)
                I.p[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255), a)
    capb = max(y for y in range(32) for x in range(32) if I.p[x, y][3] and I.p[x, y][1] > I.p[x, y][0] + 10)
    for x in range(32):
        if I.p[x, capb][3] and I.p[x, capb][1] > I.p[x, capb][0] + 10:
            I.p[x, capb] = (36, 46, 50, 255)                                                 # the gills: a dark band under the cap
    return I.im


def coat():
    I = load(OBJ + 'icon32_it_coat.png')
    for y in range(32):                                                                     # the body a step lighter
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and 40 < r < 140 and r > b:
                I.p[x, y] = (min(255, int(r * 1.18)), min(255, int(g * 1.16)), min(255, int(b * 1.12)), a)
    src = I.im.copy(); s = src.load()
    for y in range(32):                                                                     # a lit rim down the left shoulder and sleeve
        for x in range(1, 32):
            if s[x, y][3] and s[x, y][0] > 50 and not s[x - 1, y][3] or (s[x, y][3] and s[x - 1, y][:3] == (30, 20, 24) and s[x, y][0] > 50):
                if x < 16:
                    I.p[x, y] = (196, 150, 112, 255)
    return I.im


def bouquet():
    I = load(OBJ + 'icon32_it_bouquet.png')
    for y in range(32):
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and b > g + 15 and r > g:                                                   # the purple heads lifted two value steps
                I.p[x, y] = (min(255, r + 46), min(255, g + 36), min(255, b + 46), a)
    return I.im


def lumber():
    I = load(OBJ + 'icon32_lumber.png'); src = I.im.copy(); s = src.load()
    rows = sorted(set(y for y in range(32) for x in range(32) if s[x, y][3] and s[x, y][0] > 150 and s[x, y][1] > 120))
    ys = [y for y in range(32) if any(s[x, y][3] for x in range(32))]
    y0, y1 = min(ys), max(ys); third = y0 + (y1 - y0) // 2
    for y in range(third - 2, third + 3):                                                   # one board pulled shorter: its end cut back 5 px
        xs = [x for x in range(32) if s[x, y][3]]
        if xs:
            for x in range(max(xs) - 5, max(xs) + 1):
                I.p[x, y] = (0, 0, 0, 0)
    for y in range(y1 - 4, y1 + 1):                                                         # the bottom board darker, older wood
        for x in range(32):
            r, g, b, a = I.p[x, y]
            if a and r > 50:
                I.p[x, y] = (int(r * .78), int(g * .76), int(b * .76), a)
    return Icon.done(I)


def rosehip():
    I = load(OBJ + 'icon32_it_rosehip.png')
    m = {(0xe6, 0xa1, 0x79): (0xf2, 0x9a, 0x52), (0xd3, 0x7b, 0x5c): (0xe0, 0x5c, 0x26), (0xb8, 0x51, 0x3e): (0xbc, 0x38, 0x16),
         (0x95, 0x36, 0x31): (0x8c, 0x22, 0x10), (0x6d, 0x21, 0x27): (0x56, 0x14, 0x0c)}
    recolor(I, m)                                                                           # glossy orange-red, not coral
    return I.im


R6 = {'oilflask': oilflask, 'chaga': chaga, 'soup': soup, 'corn': corn, 'fish_fried': fish_fried, 'cranberry': cranberry, 'stone': stone,
      'weeds_1': weeds_1, 'mushroom': mushroom, 'coat': coat, 'bouquet': bouquet, 'lumber': lumber, 'rosehip': rosehip}

if __name__ == '__main__':
    for n in (sys.argv[1:] or R6):
        R6[n]().save(f'out/r6_{n}.png')
    print('ok', len(sys.argv[1:] or R6))
