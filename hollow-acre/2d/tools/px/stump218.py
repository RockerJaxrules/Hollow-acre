"""#198 round 18: the ten stand-in stumps redrawn (r17: moving roots a pixel was invisible; "a sack", "a molar", "a rocket",
"embers"). Each is drawn on purpose, not from one parametric stamp:
  - a crisp sawn top: a pale lip along its front edge, the far rim in bark, one growth ring, a dark heart off centre, a check crack;
  - straight-sided trunks (no neck), bark built from a few tone clusters on the lit left and kept quiet on the shaded right;
  - roots as lit shapes of DIFFERENT lengths (one long, one a stub), each stump its own arrangement so pines never stamp;
  - pine: big plates split by fissures, one with a dull resin run, one with an old axe notch;  spruce: a taller bark wall,
    grey-brown with flaking scales;  birch: straight sides, short horizontal dashes, a ragged dark band at the foot, white
    kept under 85%;  dead tree: one tall weathered-grey splinter stepping down to a low ragged break, bark peeling;
  - snag: charred, a cool grey rim on the lit edges, two uneven cracks, one broad spear of ash-grey wood (no orange).
Frame sizes and anchors are those of the sprites they replace.     python3 stump218.py -> out/stump218_<name>.png
"""
import math, json
from PIL import Image

OBJ = '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/spr/lpc/objects.json'


def hexr(a):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in a]


TOP = hexr(['#4e3a24', '#76583a', '#9a784e', '#b89664', '#d0b07c', '#e2c896'])
WOOD = hexr(['#4a443c', '#706a5e', '#948e80', '#b6b0a0', '#d2ccbc'])       # weathered grey wood
ASH = hexr(['#2a2828', '#484442', '#6a6662', '#8c8884', '#aaa6a0'])
RIM = (0x7a, 0x6a, 0x5c)                                                  # a warm ash-grey lit edge (blue-grey read as slate)
SP = {
    'pine': dict(bark=hexr(['#22130d', '#3a2218', '#56321f', '#70442a', '#8a5a38', '#a6724a']), tex='plates', hgt=6),
    'spruce': dict(bark=hexr(['#1a1816', '#2c2824', '#423b34', '#585046', '#706658', '#8a7e6c']), tex='scales', hgt=8),
    'birch': dict(bark=hexr(['#2a2626', '#686460', '#96928c', '#b6b2aa', '#cac6be', '#d6d2ca']), tex='birch', hgt=8),
    'dead': dict(bark=hexr(['#24242a', '#3c3c42', '#56565c', '#727278', '#8e8e94', '#a8a8ac']), tex='peel', hgt=7, top='snapped', rootw=.4),
    'snag': dict(bark=hexr(['#140e0c', '#22170f', '#322218', '#443024', '#56402e', '#6a503a']), tex='char', hgt=10, top='spear', rootw=.4),   # warm brown-black char
}
# per stump: species, roots [(angle as a fraction of pi: 0 right, .5 front, 1 left), length factor], height change, extras
V = {
    'pine_0': ('pine', [(.78, 1.0), (.08, .2), (.42, .45)], 0, {}),
    'pine_1': ('pine', [(.96, .35), (.26, .95), (.62, .25)], 1, {'resin': 1}),
    'pine_o0': ('pine', [(.68, .7), (.14, .55), (.98, .15)], -1, {'notch': 1}),
    'pine_o1': ('pine', [(.88, .9), (.36, .3), (.04, .55)], 1, {}),
    'spruce_0': ('spruce', [(.8, 1.0), (.36, .5), (.05, .22)], 0, {}),
    'spruce_1': ('spruce', [(.95, .28), (.55, .95), (.12, .45)], 0, {}),
    'birch_green': ('birch', [(.74, 1.3), (.1, .45), (.4, .12)], 0, {}),
    'birch_gold': ('birch', [(.9, .5), (.3, 1.2), (.62, .12)], -1, {}),
    'deadtree': ('dead', [(.74, 1.9), (.4, .25)], 0, {}),                    # (r19) one long front-left root, a front stub, no matched pair
    'snag': ('snag', [(.8, 1.2), (.32, .3), (.06, .5)], 0, {'r': 5}),
}


def draw(name):
    O = json.load(open(OBJ))
    m = O['stump_of_' + name]; W, H, cx, by = m['fw'], m['fh'], int(m['ax']), int(m['ay'])
    sp, roots, dh, ex = V[name]; st = SP[sp]; B = st['bark']
    r = ex.get('r') or max(4, int(round(m['foot'][2] * 32 - 1))); ry = max(2, round(r * .5)); hgt = st['hgt'] + dh + r // 5
    ty = by - hgt
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = im.load()

    def P(x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < W and 0 <= y < H and c is not None: px[x, y] = c + (255,)

    for y in range(H):                                                       # the soft cast shadow, down-right
        for x in range(W):
            if ((x + .5 - cx - 2) / (r + 4)) ** 2 + ((y + .5 - by - 1) / (ry + 1.6)) ** 2 < 1: px[x, y] = (10, 8, 12, 90)
    # the trunk: straight sides, a 1 px flare in its last two rows only
    bot = {}
    for x in range(cx - r - 1, cx + r + 1):
        dx = (x + .5 - cx) / r
        for y in range(ty, by + ry + 1):
            rr = r + (1 if y >= by - 1 else 0)
            if abs(x + .5 - cx) > rr: continue
            ddx = (x + .5 - cx) / rr
            if y > by + ry * math.sqrt(max(0, 1 - ddx * ddx)) * .8: continue
            bot[x] = y
            l = -dx; k = 4 if l > .45 else 3 if l > 0 else 2 if l > -.5 else 1
            u, v = x - (cx - r), y - ty                                      # trunk-local
            t = st['tex']
            if t == 'plates':                                                # big plates on the lit side, split by dark fissures
                col = u // 3; off = (col * 2) % 4
                if dx < .35:
                    if u % 3 == 0 or (v + off) % 4 == 0: k = 1 if dx < -.2 else 0
                    elif (v + off) % 4 == 1 and u % 3 == 1: k = min(5, k + 1)   # each plate's lit top-left
                elif abs(dx - .7) < .12 and v % 5 != 2: k = 0                   # one fissure in the shade
            elif t == 'scales':
                if dx < .3 and (u * 3 + v * 5) % 7 == 0: k = min(5, k + 1)
                if (u * 5 + v * 3) % 11 == 0: k = max(0, k - 2)
            elif t == 'birch':
                k = 5 if l > .45 else 4 if l > 0 else 3 if l > -.5 else 2
                if y >= by: k = 2                                                # a darker foot, no notch
            elif t == 'peel':
                if abs(dx + .45) < .14 and 1 < v < hgt - 1: k = 5               # a strip of bark lifting away
                if abs(dx + .2) < .1 and 1 < v < hgt - 1: k = 0                  # its shadow
                if abs(dx - .3) < .14 and 2 < v < 6: P(x, y, WOOD[2]); continue  # where bark has fallen: bare grey wood
            elif t == 'char':
                k = max(1, k - 1)
                if dx < .2 and (u % 3 == 0 or (v + (u // 3) % 2 * 2) % 3 == 0): k = 0   # blocky alligator char, lit side
                elif dx < .2: k = min(5, k + 1)
                if dx < -.8 and y < by - 1: P(x, y, RIM); continue               # the lit edge
            P(x, y, B[k])
    if st['tex'] == 'birch':                                                 # short horizontal dashes, uneven
        for (ox, oy, n) in ((-r + 1, 2, 3), (1, 1, 2), (-2, 4, 4), (r - 3, 5, 2), (-r + 2, 6, 2), (0, 7, 3)):
            for i in range(n):
                if oy < hgt: P(cx + ox + i, ty + oy, B[0])
    if st['tex'] == 'char':                                                  # two uneven cracks with a lit left lip
        for (x0, pts) in ((cx - 1, (0, 1, 1, 2, 2, 3)), (cx + 2, (0, 0, 1, 1))):
            for j, dx_ in enumerate(pts):
                P(x0 + dx_, ty + 2 + j, B[0]); P(x0 + dx_ - 1, ty + 2 + j, B[4])
    # roots, each a lit wedge out of the foot, different lengths
    rw = max(2.0, r * st.get('rootw', .55))
    for (af, lf) in roots:
        a = math.pi * af; ux, uy = math.cos(a), math.sin(a) * .55; q = math.hypot(ux, uy); ux, uy = ux / q, uy / q
        qx, qy = -uy, ux
        if qy > 0: qx, qy = -qx, -qy                                         # q points up-screen: the lit top edge
        L = r * lf + 2.0
        sx0, sy0 = cx + math.cos(a) * r * .8, by - 1 + math.sin(a) * ry * .7
        for ti in range(int(L * 3) + 1):
            tt = ti / 3; hw = rw * (1 - tt / L) ** .7 + .5
            for si in range(-int(hw * 3), int(hw * 3) + 1):
                s = si / 3; X = sx0 + ux * tt + qx * s; Y = sy0 + uy * tt + qy * s - hw * .3
                f = s / hw
                c = B[4] if f > .55 else B[3] if f > 0 else B[2] if f > -.55 else B[1]
                if st['tex'] == 'birch': c = B[5] if f > .55 else B[4] if f > 0 else B[3] if f > -.55 else B[1]
                if st['tex'] == 'char' and f > .6: c = RIM
                P(X, Y, c)
    # the top
    if st.get('top') == 'snapped':                                           # one tall splinter stepping down to a low ragged break
        prof = [5, 10, 8, 5, 6, 4, 3, 4, 2, 2, 1, 2, 1, 1, 1]                      # one clearly tallest, the rest stepping down
        cols = list(range(cx - r, cx + r + 1)); hs = [prof[min(len(prof) - 1, int(i * len(prof) / len(cols)))] for i in range(len(cols))]
        for i, x in enumerate(cols):
            h = hs[i]; left_edge = i == 0 or hs[i - 1] < h; right_edge = i == len(cols) - 1 or hs[i + 1] < h
            for j in range(h + 1):
                k = 4 if j == h else 4 if left_edge else 1 if right_edge else 2
                P(x, ty - j, WOOD[k])
        for x in range(cx - r, cx + r + 1): P(x, ty + 1, B[1])
    elif st.get('top') == 'spear':                                           # one broad spear of ash-grey wood, two stubs
        SPEAR = {-4: 5, -3: 11, -2: 9, -1: 4, 2: 3, 3: 2}                      # a narrow jagged spear left of centre, two stubs
        for x in range(cx - r, cx + r + 1):
            dx = x - cx; h = SPEAR.get(dx, 1)
            for j in range(h + 1):
                k = 4 if j == h else 3 if dx <= -3 else 2 if dx <= 0 else 1
                P(x, ty - j, ASH[k])
        for j in range(2, 6): P(cx - 4, ty - j, RIM if j < 5 else ASH[4])     # the cool rim up the spear's lit side
        for x in range(cx - 1, cx + 2): P(x, ty + 1, (28, 20, 18))           # the rotten dark core
    else:                                                                    # a crisp sawn top
        hx = cx + 1
        for y in range(ty - ry - 1, ty + ry + 1):
            for x in range(cx - r - 1, cx + r + 1):
                q = ((x + .5 - cx) / r) ** 2 + ((y + .5 - ty) / ry) ** 2
                if q >= 1: continue
                if q > .66:
                    if y + .5 >= ty: c = TOP[5] if x < cx + r * .4 else TOP[4]   # the pale lip at the front
                    else: c = B[2] if x > cx - r * .3 else B[3]                   # the far rim, bark
                else:
                    c = TOP[3]
                    if abs(math.sqrt(q) - .55) < .12: c = TOP[2]                  # one growth ring
                    if (x + .5 - cx) + (y + .5 - ty) < -r * .5 and q < .45: c = TOP[4]
                P(x, y, c)
        P(hx, ty, TOP[0]); P(hx + 1, ty, TOP[1])                              # the heart, off centre
        for i in range(2, r - 1): P(hx + i, ty - (i // 3), TOP[1])             # a check crack
        if ex.get('notch'):
            for (x, y) in ((cx - r, ty - 1), (cx - r, ty), (cx - r + 1, ty)): px[x, y] = (0, 0, 0, 0)
            P(cx - r + 1, ty + 1, TOP[2]); P(cx - r, ty + 1, TOP[1])
        if ex.get('resin'):
            for j, c in enumerate(((0x8a, 0x5a, 0x22), (0x6e, 0x44, 0x18), (0x52, 0x32, 0x12))):
                P(cx - r + 2, ty + 1 + j, c)                                  # a dull resin run, not an ember
    src = im.copy(); s = src.load()                                          # the outline: a dark of what it touches
    for y in range(H):
        for x in range(W):
            if s[x, y][3] > 200: continue
            for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and s[X, Y][3] > 200:
                    rr, gg, bb, _ = s[X, Y]
                    px[x, y] = (max(10, int(rr * .3)), max(8, int(gg * .26)), max(12, int(bb * .3)), 255); break
    return im


if __name__ == '__main__':
    for n in V:
        draw(n).save(f'out/stump218_{n}.png')
    print('ok', len(V))
