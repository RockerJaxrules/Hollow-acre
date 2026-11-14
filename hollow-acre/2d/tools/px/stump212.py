"""(r16: every stump gets the willow's pass: uneven roots, one long, one a stub, each species its own arrangement)
Stumps for the trees whose blockout stumps failed the baseline (#198): pine and spruce read as clay pots, birch as paper cups,
willow was a copy of the generic stump, the dead trees had neat tan lids. Drawn by hand in flat tones lit from the top-left, each
cut from its own tree: pine/spruce low with a pale ringed top and a bead of resin, plated red-brown bark, three uneven roots; birch
white with black marks and a torn rim; willow wide with grey furrowed bark; the dead tree and the snag snapped off in splinters.
Frame sizes and anchors stay those of the sprites they replace.     python3 stump212.py -> out/stump212_<name>.png
"""
import math, json, random
from PIL import Image

OBJ = '/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/spr/lpc/objects.json'


def hexr(a):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in a]


TOP = hexr(['#5a4228', '#7e6040', '#a07c52', '#bc9a68', '#d4b482'])
RESIN = (214, 150, 52)
STYLE = {
    'pine': dict(bark=hexr(['#24140e', '#3a2218', '#523224', '#6a4230', '#80543e']), plates=True, bigplates=True, hgt=6, roots=3, uneven=True, angs=(.92, .08, .32), lens=(.4, .2, 1.05)),   # (stumps r2) broad red-brown plates, dark fissures
    'spruce': dict(bark=hexr(['#1c1a18', '#2e2a26', '#433d36', '#5a5248', '#71685c']), scales=True, hgt=6, roots=3, uneven=True, angs=(.9, .62, .1), lens=(.95, .35, .2)),   # (stumps r2) cooler grey-brown, small flaking scales
    'birch': dict(bark=hexr(['#4a4642', '#8a857e', '#b8b3aa', '#d8d4cc', '#ece9e2']), marks=True, torn=True, hgt=7, roots=3, uneven=True, angs=(.95, .55, .15), lens=(.3, 1.0, .45)),
    'willow': dict(bark=hexr(['#262624', '#3c3b38', '#55534e', '#6e6b65', '#88847d']), furrows=True, hgt=8, roots=4, uneven=True,
                   angs=(.95, .06, .71, .43), lens=(.5, .15, 1.1, .3)),   # (stumps r4: "a molar") one long root to the front-left, a stub on the right
    'dead': dict(bark=hexr(['#2a2a2c', '#46464a', '#626266', '#808084', '#a0a0a2']), furrows=True, peel=True, snapped=True, hgt=9, roots=3, uneven=True, angs=(.85, .4, .05), lens=(1.0, .3, .5)),   # (stumps r2) paler silver-grey, bark peeling
    'snag': dict(bark=hexr(['#141212', '#24201e', '#36302c', '#4a423c', '#5e544c']), furrows=True, spear=True, charred=True, hgt=7, roots=3, uneven=True, angs=(.9, .6, .2), lens=(.3, .9, .6)),   # (stumps r2) darker, charred
}
WHICH = {'pine_0': 'pine', 'pine_1': 'pine', 'pine_o0': 'pine', 'pine_o1': 'pine', 'spruce_0': 'spruce', 'spruce_1': 'spruce',
         'birch_green': 'birch', 'birch_gold': 'birch', 'willow': 'willow', 'deadtree': 'dead', 'snag': 'snag'}


def draw(name):
    O = json.load(open(OBJ))
    m = O['stump_of_' + name]; W, H, ax, ay = m['fw'], m['fh'], int(m['ax']), int(m['ay'])
    st = STYLE[WHICH[name]]; B = st['bark']; R = random.Random(len(name) * 7 + W)
    r = max(4, int(round(m['foot'][2] * 32 - 1)))
    ry = max(2, round(r * .55)); hgt = st['hgt'] + (r // 4)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = im.load()

    def P(x, y, c):
        if 0 <= x < W and 0 <= y < H:
            px[x, y] = c + (255,)

    cx, by = ax, ay
    # a soft shadow on the ground, down-right
    for y in range(H):
        for x in range(W):
            if ((x - cx - 2) / (r + 4)) ** 2 + ((y - by - 1) / (ry + 1.5)) ** 2 < 1:
                px[x, y] = (10, 8, 12, 90)
    # roots: uneven wedges spreading at the base, lit on top
    angs = [math.pi * a for a in st.get('angs', (.95, .1, .62, .35))][:st['roots']]
    rw = max(1.8, r * .5)
    for k, a in enumerate(angs):   # (stumps r1: "ragged spurs", "spider legs") short thick roots, lit on top, tapering smoothly
        L = r * (st.get('lens', (0.35, 0.75, 0.5, 0.95))[k % 4] if st.get('uneven') else (0.5 + R.random() * .25)) + 2.5
        ux, uy = math.cos(a), math.sin(a) * .55; ql = math.hypot(ux, uy); ux, uy = ux / ql, uy / ql; qx, qy = -uy, ux
        sx0, sy0 = cx + math.cos(a) * r * .75, by - 1 + math.sin(a) * ry * .75
        for ti in range(int(L * 2) + 1):
            tt = ti / 2; hw = rw * (1 - tt / L) ** .8 + (1.2 if st.get('uneven') else .4)   # blunt ends
            for si in range(-int(hw * 2), int(hw * 2) + 1):
                s = si / 2; X = sx0 + ux * tt + qx * s; Y = sy0 + uy * tt + qy * s - hw * .35
                top = (qy * s) < 0
                P(int(round(X)), int(round(Y)), B[4] if (top and abs(s) > hw * .5) else B[3] if top else B[2] if abs(s) < hw * .5 else B[1])
    # the trunk: a short cylinder, lit on the left, furrowed or plated or marked
    for y in range(by - hgt, by + 1):
        rr_ = r + max(0, y - (by - 3)) * .7                                           # the trunk flares out at its foot
        for x in range(cx - int(rr_) - 1, cx + int(rr_) + 2):
            dx = (x - cx) / rr_
            if abs(dx) > 1:
                continue
            yb = by + ry * math.sqrt(max(0, 1 - dx * dx)) * .9
            if y > yb:
                continue
            l = -dx
            k = 4 if l > .5 else 3 if l > 0 else 2 if l > -.55 else 1
            if st.get('furrows') and (x - cx) % 3 == 0 and abs(dx) < .9:
                k = max(0, k - 2)
            if st.get('plates') and not st.get('bigplates') and ((y + (x // 3) * 2) % 4 == 0):
                k = max(0, k - 2)
            if st.get('bigplates') and ((y + (x // 4) * 3) % 5 == 0 or (x - cx) % 4 == 0 and (y // 5 + x // 4) % 2):
                k = 0                                                                   # broad plates split by dark fissures
            if st.get('scales') and ((x * 2 + y * 3) % 5 == 0):
                k = min(4, k + 1)                                                       # small flaking scales catching the light
            if st.get('peel') and (x - cx) % 5 == 2 and y > by - hgt + 2:
                k = 4                                                                   # bark peeling away in pale strips
            if st.get('marks') and ((y * 5 + x * 3) % 11 == 0 or ((y * 5 + x * 3) % 11 == 1 and (x - cx) % 4 == 0)):
                k = 0
            P(x, y, B[k])
    ty = by - hgt
    if st.get('snapped') or st.get('spear'):
        # snapped off: splinters of different heights and leans in pale weathered wood, one tall (a snag: one tall jagged spear, its core rotted dark)
        spl = [(-r + 1, 5, -1), (-r // 2, 9 if st.get('spear') else 8, 0), (1, 3, 1), (r // 2, 5, 1), (r - 1, 2, 0)] if not st.get('spear') else [(-r // 3, 13, -1), (r // 3, 4, 1), (r - 2, 2, 1)]
        for (dx, hh, lean) in spl:
            for j in range(hh):
                w = max(1, round((1 - j / hh) * (3 if hh > 6 else 2)))
                x0 = cx + dx + int(lean * j / 3)
                for i in range(w):
                    P(x0 + i, ty - j, TOP[3] if i == 0 else TOP[1] if i < w - 1 else B[1])
        for x in range(cx - r, cx + r + 1):
            P(x, ty, TOP[2]); P(x, ty + 1, B[1])
        if st.get('spear'):
            for x in range(cx - r // 2, cx + r // 2 + 1):
                P(x, ty, (34, 24, 20)); P(x, ty + 1, (24, 16, 14))                 # the rotted dark core
        if st.get('charred'):
            for y in range(ty, by):
                for x in range(cx - r, cx + r + 1):
                    if (x * 3 + y * 7) % 6 == 0 and px[x, y][3]:
                        P(x, y, (18, 14, 14))                                      # char crazing on the bark
    else:
        # the sawn top: an ellipse a step lighter than the bark, rings, a dark heart off centre, a lit rim at the front-left
        for y in range(ty - ry, ty + ry + 1):
            for x in range(cx - r, cx + r + 1):
                q = ((x - cx) / r) ** 2 + ((y - ty) / ry) ** 2
                if q > 1:
                    continue
                ring = int(math.sqrt(q) * 4)
                k = 3 if ring % 2 == 0 else 2
                if q > .8:
                    k = 4 if (x < cx or y > ty) else 1
                P(x, y, TOP[k])
        P(cx + 1, ty, TOP[0]); P(cx + 2, ty, TOP[1])
        for i in range(1, r - 1):                                                     # one radial check crack
            P(cx + i, ty - i // 3, TOP[0])
        if st.get('plates'):
            for j, c in enumerate(((220, 170, 70), (190, 128, 40), (150, 92, 28))):
                P(cx - r + 2, ty + ry - 1 + j, c)                                     # an amber run of resin down the bark
        if st.get('torn'):                                                            # (stumps r2: "a candle wick") a short hinge lip of torn wood at the back rim
            for i in range(-r // 2, r // 2):
                P(cx + i, ty - ry, B[3]); P(cx + i, ty - ry - 1, B[4] if i < 0 else B[2])
    # outline
    src = im.copy(); s = src.load()
    for y in range(H):
        for x in range(W):
            if s[x, y][3] > 200:
                continue
            for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and s[X, Y][3] > 200:
                    rr, gg, bb, _ = s[X, Y]
                    px[x, y] = (max(10, int(rr * .32)), max(8, int(gg * .28)), max(12, int(bb * .32)), 255)
                    break
    return im


if __name__ == '__main__':
    for n in WHICH:
        draw(n).save(f'out/stump212_{n}.png')
    print('ok', len(WHICH))
