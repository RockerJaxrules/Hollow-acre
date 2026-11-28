"""Homes that are extensions of the people in them (#154): things on the walls, things left on every table, floors that change from
room to room, partitions that make L-shaped rooms, the mess of real lives, and the things behind the furniture.
  walls:     in_calendar, in_painting_a, in_painting_b (eyes scratched out), in_hangplant, in_coatpegs, in_drawings (of you)
  on tables: t_mug, t_plate, t_lamp(+_n), t_vase, t_books, t_candle     (anchored so their feet sit on a tabletop)
  flaws:     in_stain, in_rumple (an unmade bed's blanket), in_chair_down, in_bottles, in_papers
  floors:    in_floor_lino, in_floor_carpet, in_floor_boards
  structure: in_partition (an inside wall, 2 m), in_step (a raised floor's edge, 2 m), in_trapdoor, in_cabinet, in_wardrobe
Same depth rules: lit top faces, darker fronts, hue-shifted ramps, contact shadows, outlines."""
import json, math
src = open('tools/regions.py').read()
exec(src[:src.index('# ======================================================================== Route 9 West')])
OAK = ramp('#8a5a34', spread=.6); PAPER = ramp('#e8dcc0', spread=.35); CERAM = ramp('#d8d4c8', spread=.4); BLUEC = ramp('#3a5a8a', spread=.6)
FERN = ramp('#3e7a34', spread=.75); POT = ramp('#a85a3a', spread=.6); WOOL = ramp('#7a3a3a', spread=.6); WALLP = ramp('#8a7a5a', spread=.5)
TABLE_UP = 26   # pixels from a table's anchor up to the middle of its top

def flatpic(W, Hh, fn, frame=OAK):
    c = C(W, Hh); c.rect(1, 1, W - 2, Hh - 2, frame[3]); c.rect(1, 1, W - 2, 1, frame[5]); c.rect(1, Hh - 2, W - 2, Hh - 2, frame[1]); c.rect(3, 3, W - 4, Hh - 4, (40, 34, 30)); fn(c); c.outline((50, 36, 28)); return c
def calendar():
    c = C(26, 34); c.rect(2, 2, 23, 31, PAPER[4]); c.rect(2, 2, 23, 8, (170, 44, 34)); c.text(4, 3, 'OCT', (240, 230, 210))
    for i in range(28):
        x = 4 + (i % 7) * 3; y = 11 + (i // 7) * 4; c.p(x, y, (90, 80, 70)); c.p(x + 1, y + 1, (90, 80, 70))
        if i < 19: c.line(x - .5, y - .5, x + 1.5, y + 1.5, (180, 40, 30))   # days crossed off, one by one
    c.ellipse(16.5, 27, 2.6, 2.2, lambda x, y, d: (180, 40, 30) if d > .5 else None)   # one day circled
    c.p(12, 1, IRON[5]); c.outline((60, 50, 40)); return c
def painting(kind):
    def valley(c):
        c.rect(3, 3, 32, 12, (110, 140, 170)); c.poly([(3, 16), (12, 9), (20, 14), (32, 8), (32, 16)], (70, 90, 70)); c.rect(3, 16, 32, 22, (150, 120, 60))
        for k in range(6): c.rect(5 + k * 5, 18, 6 + k * 5, 21, (200, 160, 50))
        c.rect(26, 15, 27, 19, (30, 20, 20))   # a tall figure in the corn, very small
    def portrait(c):
        c.rect(3, 3, 26, 30, (60, 50, 60)); c.ellipse(14.5, 14, 6, 7.5, (200, 170, 140)); c.rect(7, 22, 22, 30, (40, 40, 60))
        for x in (12, 17): c.rect(x - 1, 12, x + 1, 13, (230, 226, 216)); c.line(x - 2, 11, x + 2, 15, (20, 16, 16))   # eyes scratched out
        c.rect(10, 4, 19, 7, (90, 60, 40))
    return flatpic(36, 26, valley) if kind == 'a' else flatpic(30, 34, portrait, ramp('#c8a040', spread=.7))
def hangplant():
    c = C(30, 40); c.line(15, 0, 15, 12, (150, 140, 120)); c.line(15, 0, 8, 12, (150, 140, 120)); c.line(15, 0, 22, 12, (150, 140, 120))
    c.ellipse(15, 15, 8, 4, lambda x, y, d: POT[4] if x < 14 else POT[2])
    for k in range(9):
        a = math.pi * (.05 + .9 * k / 8); L = 8 + H(k, 2) * 14
        for t in range(int(L)): c.p(15 - math.cos(a) * t * .9, 13 + t * .9 + math.sin(t * .4) * 1.2, FERN[4] if t % 3 else FERN[5])
    c.outline((40, 50, 30)); return c
def coatpegs():
    c = C(48, 44); c.rect(2, 4, 45, 7, OAK[4]); c.rect(2, 8, 45, 8, OAK[1])
    for x in (8, 22, 36): c.rect(x, 8, x + 1, 10, IRON[4])
    c.poly([(5, 10), (12, 10), (14, 36), (3, 36)], lambda x, y: WOOL[4] if x < 8 else WOOL[2]); c.rect(5, 10, 12, 12, WOOL[5])   # a long coat
    c.poly([(19, 10), (25, 10), (26, 26), (18, 26)], lambda x, y: BLUEC[4] if x < 22 else BLUEC[2])   # a child's coat, small
    c.ellipse(36.5, 13, 6, 3, lambda x, y, d: (60, 50, 44) if y < 13 else (40, 34, 30)); c.rect(33, 9, 40, 12, (70, 58, 50))   # a hat
    c.outline((40, 30, 24)); return c
def drawings():
    c = C(84, 54)
    for k in range(17):
        x = 2 + (k % 6) * 13 + H(k, 1) * 4; y = 2 + (k // 6) * 17 + H(k, 2) * 4; c.rect(x, y, x + 11, y + 14, PAPER[4] if k % 3 else PAPER[3])
        c.ellipse(x + 5.5, y + 5, 2.4, 2.6, (60, 50, 50)); c.rect(x + 4, y + 7, x + 7, y + 12, (170, 40, 30))   # you: your red shirt
        if k % 4 == 0: c.rect(x + 8, y + 2, x + 10, y + 12, (20, 16, 16))   # and something tall beside you
        c.p(x + 5, y, IRON[5])
    c.outline((50, 40, 34)); return c
# ---- on tables
def ontable(draw, W, Hh):
    c = C(W, Hh); draw(c, W, Hh); c.outline((40, 30, 26)); return c
def mug(c, W, Hh): c.rect(4, 4, 10, 11, lambda x, y: CERAM[5] if x < 6 else CERAM[3]); c.rect(4, 4, 10, 4, (60, 40, 30)); c.ellipse(11, 7.5, 2, 2.4, lambda x, y, d: CERAM[2] if d > .4 else None)
def plate(c, W, Hh): c.ellipse(W / 2, Hh - 4, 7, 2.6, lambda x, y, d: CERAM[5] if d > .6 else CERAM[4]); c.ellipse(W / 2, Hh - 5, 3.4, 1.6, (150, 90, 50)); c.rect(W / 2 + 4, Hh - 7, W / 2 + 5, Hh - 3, IRON[5])
def lampf(night):
    def f(c, W, Hh):
        c.ellipse(W / 2, Hh - 3, 5, 1.8, BRASS_[3]); c.rect(W / 2 - 1, Hh - 8, W / 2, Hh - 3, BRASS_[4])
        c.ellipse(W / 2, Hh - 12, 4, 5, lambda x, y, d: ((255, 220, 140) if night else (200, 210, 210)) if d < .7 else (230, 236, 236)); c.rect(W / 2 - 1, Hh - 13, W / 2, Hh - 11, (255, 180, 80) if night else (120, 90, 60))
    return f
BRASS_ = ramp('#c8a040', spread=.7)
def vase(c, W, Hh):
    c.poly([(W / 2 - 3, Hh - 3), (W / 2 + 3, Hh - 3), (W / 2 + 4, Hh - 9), (W / 2 + 2, Hh - 12), (W / 2 - 2, Hh - 12), (W / 2 - 4, Hh - 9)], lambda x, y: BLUEC[4] if x < W / 2 else BLUEC[2])
    for k in range(5): c.line(W / 2, Hh - 12, W / 2 - 5 + k * 2.5, 2 + (k % 2) * 2, (130, 100, 60)); c.p(W / 2 - 5 + k * 2.5, 2 + (k % 2) * 2, (170, 80, 60))   # flowers, dead
def books(c, W, Hh):
    for i, col in enumerate(('#7a2a2a', '#2a4a6a', '#5a6a2a')):
        R = ramp(col, spread=.6); y = Hh - 4 - i * 3; c.rect(3 + i, y - 2, W - 4 - i, y, lambda x, yy, R=R, y=y: R[5] if yy == y - 2 else R[3]); c.rect(W - 4 - i, y - 2, W - 4 - i, y, PAPER[4])
def candle(c, W, Hh):
    c.ellipse(W / 2, Hh - 3, 4, 1.4, BRASS_[3]); c.rect(W / 2 - 1, Hh - 11, W / 2 + 1, Hh - 4, PAPER[5]); c.rect(W / 2, Hh - 14, W / 2, Hh - 12, (255, 200, 80))
    for y in range(Hh - 10, Hh - 5): c.p(W / 2 + 2, y, PAPER[3])   # wax run down
# ---- flaws
def stain():
    c = C(60, 30)
    for y in range(30):
        for x in range(60):
            d = ((x - 30) / 27) ** 2 + ((y - 15) / 12) ** 2 + (H(x // 4, y // 3, 3) - .5) * .6
            if d < 1: c.p(x, y, (60, 30, 20), int(90 * (1 - d) + 30))
    return c
def rumple():
    c = C(56, 40)
    c.poly([(4, 10), (50, 6), (54, 30), (8, 36)], lambda x, y: WOOL[4] if (x + y * 2) % 13 > 4 else WOOL[2]); c.poly([(30, 4), (50, 6), (46, 16), (28, 12)], WOOL[5])
    for k in range(4): c.line(10 + k * 10, 12 + k, 14 + k * 10, 32 - k, WOOL[1])
    c.ellipse(16, 8, 9, 4, lambda x, y, d: PAPER[5] if d < .5 else PAPER[3])   # a pillow, thrown
    c.outline((40, 20, 20)); return c
def chair_down():
    c = C(36, 22); gy = 19; c.shadow(18, gy, 15, 2)
    c.rect(4, gy - 7, 26, gy - 4, lambda x, y: OAK[4] if y == gy - 7 else OAK[3]); c.rect(24, gy - 15, 27, gy - 2, OAK[2])
    for x in (6, 16): c.line(x, gy - 4, x + 7, gy - 1, OAK[2], 2)
    c.outline(); return c
def bottles():
    c = C(30, 22); gy = 19; c.shadow(15, gy, 12, 2)
    for i, (x, lie) in enumerate(((6, 0), (11, 0), (20, 1), (15, 0))):
        G = ramp(['#3a6a3a', '#6a4a2a', '#3a6a3a', '#8a8a6a'][i], spread=.6)
        if lie: c.rect(x, gy - 4, x + 9, gy - 1, lambda xx, y: G[4] if y == gy - 4 else G[2]); c.rect(x + 10, gy - 3, x + 12, gy - 2, G[3])
        else: c.rect(x, gy - 10, x + 3, gy - 1, lambda xx, y: G[5] if xx == x else G[3]); c.rect(x + 1, gy - 14, x + 2, gy - 10, G[3])
    c.outline(); return c
def papers():
    c = C(40, 22); gy = 19; c.shadow(20, gy, 17, 2)
    for k in range(6): y = gy - 2 - k * 1.6; x = 4 + H(k, 1) * 4; c.rect(x, y - 1, x + 26, y, PAPER[4] if k % 2 else PAPER[3]); c.p(x + 4, y - 1, (60, 60, 60)); c.rect(x + 8, y - 1, x + 18, y - 1, (120, 120, 120))
    c.outline(); return c
# ---- floors (decals)
def floor(kind):
    W, Hh = 112, 72; c = C(W, Hh)
    for y in range(Hh):
        for x in range(W):
            if kind == 'lino':
                col = (196, 188, 168) if ((x // 12) + (y // 12)) % 2 else (90, 104, 96)
                if H(x // 3, y // 3, 4) > .93: col = tuple(v * .85 for v in col)
            elif kind == 'carpet':
                t = ((x - W / 2) / (W / 2)) ** 2 + ((y - Hh / 2) / (Hh / 2)) ** 2; col = (120, 50, 46) if t < .55 else (150, 110, 60) if t < .65 else (110, 44, 40)
                if x < 3 or y < 3 or x > W - 4 or y > Hh - 4: col = (170, 140, 80)
                if H(x // 2, y // 2, 6) > .9: col = tuple(v * .86 for v in col)
            else:
                row = y // 9; col = OAK[2] if (y % 9) else OAK[0]
                if (x + row * 37) % 53 == 0: col = OAK[0]
                if H(x // 6, row, 8) > .7: col = OAK[1]
            c.p(x, y, col)
    return c
# ---- structure
def partition(door):
    W, Hh = 66, 92; c = C(W, Hh); gy = 88
    for x in range(W):
        for y in range(gy + 1, gy + 4): c.p(x, y, (10, 10, 14), 110)
    c.rect(0, 2, W - 1, 8, lambda x, y: OAK[5] if y == 2 else OAK[4])   # the top of the wall
    c.rect(0, 9, W - 1, gy, lambda x, y: (WALLP[3] if (x // 8) % 2 else WALLP[2]) if y < gy - 22 else OAK[2] if y < gy - 2 else OAK[1])
    c.rect(0, gy - 23, W - 1, gy - 22, OAK[4]); c.darken(0, 9, W - 1, 14, .7)
    if door: c.rect(20, 30, 45, gy, (24, 18, 16)); c.rect(18, 28, 47, 30, OAK[4]); c.rect(18, 30, 19, gy, OAK[4]); c.rect(46, 30, 47, gy, OAK[2])
    c.outline(); return c
def step():
    W, Hh = 66, 20; c = C(W, Hh)
    c.rect(0, 0, W - 1, 8, lambda x, y: OAK[4] if (x // 11) % 2 else OAK[3]); c.rect(0, 9, W - 1, 15, OAK[1]); c.rect(0, 9, W - 1, 9, OAK[5])
    for x in range(W):
        for y in range(16, 20): c.p(x, y, (10, 10, 14), 90)
    return c
def trapdoor():
    c = C(46, 34); c.rect(3, 3, 42, 30, lambda x, y: OAK[3] if (x - 3) % 8 else OAK[1]); c.rect(3, 3, 42, 4, OAK[4])
    c.rect(18, 14, 27, 16, IRON[4]); c.ellipse(22.5, 15, 3, 3, lambda x, y, d: IRON[3] if d > .4 else None)
    for k in range(5): c.p(8 + k * 7, 29, (90, 20, 16))   # something dark has dried in the seam
    c.outline((30, 22, 18)); return c
def cabinet():
    W, Hh = 46, 92; c = C(W, Hh); gy = 88; c.shadow(W / 2, gy, 20, 3)
    c.rect(4, 4, W - 5, gy - 1, lambda x, y: OAK[4] if x < 8 else OAK[3] if x < W - 9 else OAK[2]); c.rect(4, 4, W - 5, 6, OAK[5])
    for y0 in (10, 48): c.rect(8, y0, W - 9, y0 + 32, OAK[2]); c.rect(9, y0 + 1, W - 10, y0 + 31, OAK[3]); c.rect(W / 2 - 1, y0, W / 2, y0 + 32, OAK[1])
    for y0 in (26, 64): c.rect(W / 2 - 4, y0, W / 2 - 3, y0 + 3, BRASS_[4]); c.rect(W / 2 + 2, y0, W / 2 + 3, y0 + 3, BRASS_[4])
    c.outline(); return c
def wardrobe():
    W, Hh = 56, 100; c = C(W, Hh); gy = 96; c.shadow(W / 2, gy, 25, 3)
    c.rect(4, 8, W - 5, gy - 1, lambda x, y: WOOL[0] if False else (OAK[3] if x < W - 10 else OAK[2])); c.rect(2, 4, W - 3, 9, lambda x, y: OAK[5] if y == 4 else OAK[4])
    c.rect(8, 14, W / 2 - 2, gy - 10, OAK[2]); c.rect(W / 2 + 2, 14, W - 9, gy - 10, OAK[2]); c.rect(9, 15, W / 2 - 3, gy - 11, OAK[4]); c.rect(W / 2 + 3, 15, W - 10, gy - 11, OAK[3])
    for x in (W / 2 - 4, W / 2 + 3): c.rect(x, 50, x + 1, 56, BRASS_[4])
    c.darken(4, gy - 4, W - 5, gy - 1, .7); c.outline(); return c

for n, fn, foot in (('in_calendar', calendar, None), ('in_painting_a', lambda: painting('a'), None), ('in_painting_b', lambda: painting('b'), None), ('in_hangplant', hangplant, None),
                    ('in_coatpegs', coatpegs, None), ('in_drawings', drawings, None)):
    c = fn(); save(n, c, c.W / 2, c.H - 2)
for n, fn, W, Hh in (('t_mug', mug, 16, 14), ('t_plate', plate, 20, 12), ('t_lamp', lampf(False), 16, 22), ('t_lamp_n', lampf(True), 16, 22), ('t_vase', vase, 16, 22), ('t_books', books, 22, 14), ('t_candle', candle, 12, 18)):
    c = ontable(fn, W, Hh); save(n, c, W / 2, Hh - 2 + TABLE_UP)
for n, fn, foot in (('in_rumple', rumple, None), ('in_chair_down', chair_down, (-.5, -.2, .5, 0)), ('in_bottles', bottles, (-.4, -.2, .4, 0)), ('in_papers', papers, (0, 0, 0, 0))):
    c = fn(); save(n, c, c.W / 2, c.H - 3, foot=foot or (0, 0, 0, 0))
c = stain(); save('in_stain', c, 30, 15)
for k in ('lino', 'carpet', 'boards'): c = floor(k); save('in_floor_' + k, c, 56, 36)
c = partition(False); save('in_partition', c, 0, 88, foot=(0, -.4, 2.06, 0)); c = partition(True); save('in_partition_door', c, 0, 88, foot=(0, -.4, 2.06, 0))
c = step(); save('in_step', c, 0, 15); c = trapdoor(); save('in_trapdoor', c, 23, 17)
c = cabinet(); save('in_cabinet', c, 23, 88, foot=(-.6, -.4, .6, 0)); c = wardrobe(); save('in_wardrobe', c, 28, 96, foot=(-.75, -.45, .75, 0))
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w'))
print(len(SPR), 'sprites:', ' '.join(SPR))
