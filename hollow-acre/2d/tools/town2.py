"""Marrow Hollow, settled by people over a hundred years (#153): the pieces that make a town look lived-in rather than laid out.
  landmarks: tavern(+_n) the Lamplighter, watertower(+_n) seen from all over town, fountain in the hidden garden
  height:    tsteps_wood (wooden stairs up a retaining wall), deck (the tavern's raised patio)
  borders:   stonewall, stonewall_b (broken, stones fallen out)
  stories:   tarp (on a leaking roof), vines (up a chimney), wheel (broken, leaning), bucket, choppingblock (axe in it),
             applespill, cellardoor, mud_a/mud_b (where grass gave up)
Same depth rules as regions.py: lit tops, darker fronts, hue-shifted ramps, contact shadows, outlines."""
import json, math
src = open('tools/regions.py').read()
exec(src[:src.index('# ======================================================================== Route 9 West')])
TIMBER = ramp('#6a4a32', spread=.6); PLAST = ramp('#d8c8a0', spread=.45); TARPB = ramp('#3a6aa8', spread=.6); IVY = ramp('#3a6a2a', spread=.8)
MUD = ramp('#5a4030', spread=.6); TANK = ramp('#8a9098', spread=.55); REDP = ramp('#a83a2a', spread=.6); MOSSY = ramp('#7a8a6a', spread=.5)
def shingles(c, x0, x1, y0, y1, inset, R, seed=0):
    c.poly([(x0, y1), (x1, y1), (x1 - inset, y0), (x0 + inset, y0)], lambda x, y: (R[3] if ((y - y0) // 4 + x // 8) % 2 else R[2]) if (y - y0) % 4 != 3 else R[1])
    c.rect(x0 + inset, y0, x1 - inset, y0, R[5]); c.rect(x0, y1, x1, y1 + 1, R[0])
    for y in range(y0, y1):
        t = (y - y0) / max(1, y1 - y0); b = x1 - inset * (1 - t)
        for x in range(int(b - inset * .5 * (1 - t) - 2), int(b) + 1):
            q = c.get(x, y)
            if q[3]: c.p(x, y, (q[0] * .72, q[1] * .72, q[2] * .82))
def win(c, x, y, w, h, lit):
    c.rect(x - 1, y - 1, x + w, y + h, PLAST[5])
    c.rect(x, y, x + w - 1, y + h - 1, (lambda xx, yy: (250, 206, 128) if (xx + yy) % 6 else (255, 232, 170)) if lit else (lambda xx, yy: (56, 66, 84) if (xx * 2 + yy) % 11 else (110, 128, 150)))
    c.rect(x + w // 2, y, x + w // 2, y + h - 1, PLAST[3]); c.rect(x - 2, y + h, x + w + 1, y + h + 1, TIMBER[4])

# ======================================================================== the Lamplighter: two storeys of timber and plaster, a deep porch, a hanging lamp
def tavern(night):
    W, Hh = 352, 236; c = C(W, Hh); gy = Hh - 4; x0, x1 = 14, W - 15
    c.shadow(W / 2, gy, W / 2 - 6, 7, 130)
    shingles(c, x0 - 6, x1 + 6, 56, 104, 52, ramp('#5a3a2a', spread=.55), 3)
    for cx in (70, W - 80): c.rect(cx - 8, 30, cx + 8, 70, lambda x, y: BRICK[3] if (y // 4 + (x // 8)) % 2 else BRICK[2]); c.rect(cx - 10, 28, cx + 10, 31, CONC[4])
    # upper storey: plaster between dark timbers
    c.rect(x0, 105, x1, 160, lambda x, y: PLAST[3] if H(x // 3, y // 3, 4) > .1 else PLAST[2]); c.darken(x0, 105, x1, 111, .7)
    for x in range(x0, x1 + 1, 36): c.rect(x, 105, x + 3, 160, TIMBER[2])
    for x in range(x0, x1 - 30, 36): c.line(x + 3, 158, x + 33, 108, TIMBER[2], 2)
    c.rect(x0, 105, x1, 107, TIMBER[3]); c.rect(x0, 158, x1, 161, TIMBER[3])
    for i, wx in enumerate((40, 112, 220, 292)): win(c, wx, 120, 16, 24, night and i in (0, 2, 3))
    # ground storey: dark boards, big windows, double doors under the porch roof
    c.rect(x0, 162, x1, gy - 8, lambda x, y: (TIMBER[3] if (x // 7) % 2 else TIMBER[2]) if H(x // 7, y // 30, 7) > .08 else TIMBER[1])
    c.poly([(x0 - 8, 168), (x1 + 8, 168), (x1 + 2, 160), (x0 - 2, 160)], lambda x, y: ramp('#5a3a2a')[4] if y < 164 else ramp('#5a3a2a')[2])   # the porch roof
    c.darken(x0, 169, x1, gy - 9, .74)
    for i, wx in enumerate((34, 92, 238, 296)): win(c, wx, 180, 26, 26, night or i in (1, 2))
    dc = (240, 196, 110) if night else None
    c.rect(W / 2 - 16, 176, W / 2 + 15, gy - 9, lambda x, y: dc if dc and abs(x - W / 2) > 1 else (TIMBER[1] if x == W / 2 else ramp('#7a2a1e')[3])); c.rect(W / 2 - 16, 176, W / 2 + 15, 177, TIMBER[4])
    for px in range(x0 - 4, x1 + 6, 46): c.rect(px, 168, px + 3, gy - 7, lambda x, y: TIMBER[4] if x == px else TIMBER[2])
    c.rect(x0 - 6, gy - 8, x1 + 6, gy - 5, lambda x, y: TIMBER[4] if y == gy - 8 else TIMBER[2])
    # the hanging sign and the lamp that gives the place its name
    c.rect(W / 2 + 34, 150, W / 2 + 36, 166, IRON[3]); c.rect(W / 2 + 22, 150, W / 2 + 48, 151, IRON[3])
    c.rect(W / 2 + 20, 152, W / 2 + 50, 164, TIMBER[4]); c.text(W / 2 + 22, 155, 'LAMP', GOLD[5])
    c.rect(W / 2 - 50, 150, W / 2 - 49, 158, IRON[3]); c.rect(W / 2 - 54, 158, W / 2 - 45, 168, lambda x, y: (255, 210, 120) if night or (x + y) % 3 else (230, 180, 90)); c.rect(W / 2 - 55, 157, W / 2 - 44, 158, IRON[2])
    c.text(x0 + 6, 109, 'THE LAMPLIGHTER', (50, 34, 24))
    c.outline(); return c
for n in (False, True): save('tavern' + ('_n' if n else ''), tavern(n), 176, 232, foot=(-5, -3.4, 5, 0), bw=10, chim=[-106, -204])

# ======================================================================== the water tower: you can see it from anywhere in town
def watertower(night):
    W, Hh = 150, 470; c = C(W, Hh); gy = Hh - 4; cx = W / 2
    c.shadow(cx, gy, 56, 8, 130)
    for lx, ly in ((cx - 46, gy), (cx + 46, gy), (cx - 22, gy - 10), (cx + 22, gy - 10)):   # four legs, braced
        c.line(lx, ly, cx + (lx - cx) * .55, 150, IRON[3] if lx < cx else IRON[2], 3)
    for y in range(190, gy - 20, 70):
        k = (y - 150) / (gy - 150); a = cx - 26 - 20 * k; b = cx + 26 + 20 * k
        c.line(a, y, b, y + 52, IRON[2]); c.line(b, y, a, y + 52, IRON[2]); c.rect(a, y, b, y + 1, IRON[3])
    c.rect(cx + 30, 150, cx + 31, gy - 30, IRON[4])   # the ladder
    for y in range(152, gy - 30, 6): c.rect(cx + 28, y, cx + 33, y, IRON[4])
    # the tank: a riveted drum with a conical cap and a catwalk
    c.ellipse(cx, 150, 46, 9, lambda x, y, d: IRON[2]); c.rect(cx - 50, 140, cx + 50, 143, IRON[4])
    c.rect(cx - 44, 70, cx + 44, 146, lambda x, y: TANK[5] if x < cx - 30 else TANK[4] if x < cx + 10 else TANK[3] if x < cx + 32 else TANK[2])
    for y in range(78, 146, 12):
        for x in range(int(cx - 42), int(cx + 44), 6): c.p(x, y, TANK[1])
    c.poly([(cx - 48, 72), (cx + 48, 72), (cx, 30)], lambda x, y: REDP[4] if x < cx - 6 else REDP[3] if x < cx + 18 else REDP[2])
    c.rect(cx - 1, 20, cx, 30, IRON[4])
    c.rect(cx - 40, 96, cx + 40, 116, TANK[2]); c.text(cx - tw('MARROW') / 2, 98, 'MARROW', (240, 236, 226)); c.text(cx - tw('HOLLOW') / 2, 106, 'HOLLOW', (240, 236, 226))
    for k in range(22): c.p(cx - 40 + H(k, 1) * 80, 118 + H(k, 2) * 26, ramp('#8a5a3a')[2])   # rust weeping from the rivets
    if night:
        c.ellipse(cx, 18, 5, 5, lambda x, y, d: (255, 60, 40) if d < .5 else (200, 30, 20)); c.ellipse(cx, 18, 2, 2, (255, 200, 180))
    else: c.ellipse(cx, 18, 4, 4, (140, 40, 30))
    c.outline(); return c
for n in (False, True): save('watertower' + ('_n' if n else ''), watertower(n), 75, 466, foot=(-1.6, -1.2, 1.6, 0))

# ======================================================================== wooden stairs up the retaining wall; the tavern's raised patio
def tsteps_wood():
    W, Hh = 84, 54; c = C(W, Hh); gy = 44; x0, x1 = 8, W - 9
    for x in range(0, W):
        for y in range(gy + 1, gy + 8): c.p(x, y, (12, 12, 18), int(110 * (1 - (y - gy - 1) / 7) ** 1.4))
    for sx in (x0 - 2, x1 - 1): c.line(sx, 2, sx + (0 if sx < W / 2 else 0), gy, TIMBER[2], 3)   # stringers
    for i in range(5):
        ty = 4 + i * 8; c.rect(x0 + 1, ty, x1 - 2, ty + 2, lambda x, y: TIMBER[5] if y == ty else TIMBER[4])
        c.rect(x0 + 1, ty + 3, x1 - 2, ty + 7, (40, 30, 26)); c.rect(x0 + 1, ty + 3, x1 - 2, ty + 3, TIMBER[1])
        for k in range(3): c.p(x0 + 6 + H(i, k) * (x1 - x0 - 12), ty + 1, TIMBER[2])
    for px in (x0 - 4, x1 + 1):   # a handrail each side
        c.rect(px, 0, px + 2, gy - 2, lambda x, y: TIMBER[4] if x == px else TIMBER[2])
    c.outline(); return c
save('tsteps_wood', tsteps_wood(), 42, 44, foot=(0, 0, 0, 0))
def deck():
    W, Hh = 212, 96; c = C(W, Hh); gy = 90
    c.shadow(W / 2, gy, W / 2 - 4, 5, 120)
    c.rect(4, 8, W - 5, 74, lambda x, y: TIMBER[4] if (y - 8) % 7 else TIMBER[2])   # the boards, seen from above
    for y in range(8, 74, 7):
        for x in range(4 + (y * 13) % 31, W - 5, 31): c.p(x, y + 3, TIMBER[1])
    c.rect(4, 75, W - 5, gy - 2, lambda x, y: TIMBER[2] if (x // 10) % 2 else TIMBER[1])   # its front face: it stands a step up
    c.rect(W / 2 - 22, 72, W / 2 + 22, gy - 1, lambda x, y: TIMBER[4] if (y - 72) % 6 < 2 else TIMBER[2])   # the steps
    for px in list(range(6, int(W / 2 - 24), 22)) + list(range(int(W / 2 + 26), W - 6, 22)): c.rect(px, 56, px + 2, 76, TIMBER[3])
    c.rect(4, 56, W / 2 - 24, 58, TIMBER[4]); c.rect(W / 2 + 24, 56, W - 5, 58, TIMBER[4])
    c.outline(); return c
save('deck', deck(), 106, 88, foot=(0, 0, 0, 0))

# ======================================================================== property borders: an old dry-stone wall, and the same wall falling down
def stonewall(broken):
    W, Hh = 70, 38; c = C(W, Hh); gy = 32; c.shadow(W / 2, gy, 34, 3, 110)
    for row in range(4):
        y0 = gy - 6 - row * 6; off = (row * 7) % 11
        for k in range(-1, 8):
            x0 = 2 + off + k * 11 - 5; x1 = x0 + 9 + int(H(k, row, 3) * 3)
            if broken and row >= 1 and 26 < x0 < 50 and row + H(k, row, 5) * 2 > 1.6: continue
            if x1 < 2 or x0 > W - 3: continue
            R = STONE if H(k, row, 4) > .3 else MOSSY
            c.rect(max(2, x0), y0, min(W - 3, x1), y0 + 4, lambda x, y, R=R, y0=y0: R[5] if y == y0 else R[3] if x % 9 else R[2])
            c.rect(max(2, x0), y0 + 5, min(W - 3, x1), y0 + 5, R[1])
    if broken:
        for k in range(5): x = 28 + H(k, 9) * 22; y = gy - 1 - H(k, 8) * 3; c.ellipse(x, y, 4, 2.6, lambda xx, yy, d: STONE[4] if d < .4 else STONE[2])
    for k in range(6): c.p(4 + H(k, 6) * (W - 8), gy - 25 + H(k, 7) * 3, MOSS[4])
    c.outline(); return c
save('stonewall', stonewall(False), 0, 32, foot=(0, -.3, 2.1, 0)); save('stonewall_b', stonewall(True), 0, 32, foot=(0, -.3, 2.1, 0))

# ======================================================================== the small stories
def tarp():
    W, Hh = 76, 44; c = C(W, Hh)
    c.poly([(6, 10), (70, 4), (72, 34), (4, 40)], lambda x, y: TARPB[4] if (x + y * 2) % 23 > 3 else TARPB[2])
    for k in range(5): c.line(8 + k * 14, 8 + k, 10 + k * 14, 38 - k, TARPB[2])   # creases
    for x, y in ((8, 10), (68, 6), (70, 32), (8, 36), (38, 22)): c.rect(x - 3, y - 2, x + 3, y + 2, BRICK[3]); c.rect(x - 3, y - 2, x + 3, y - 2, BRICK[5])   # bricks holding it down
    c.line(2, 6, 74, 2, (200, 190, 160)); c.outline(); return c
save('tarp', tarp(), 38, 162)   # drawn up on the roof: its foot is the house's front step
def vines():
    W, Hh = 46, 100; c = C(W, Hh)
    for s in range(5):
        x = 8 + s * 8 + H(s, 1) * 4
        for y in range(Hh - 2, int(10 + H(s, 2) * 40), -1):
            x += math.sin(y * .2 + s) * .6; c.p(x, y, IVY[2])
            if (y + s * 3) % 5 == 0: c.ellipse(x + (2 if y % 2 else -2), y, 2.4, 1.8, lambda xx, yy, d: IVY[5] if d < .3 else IVY[3])
    return c
save('vines', vines(), 23, 98)
def wheel():
    W, Hh = 46, 52; c = C(W, Hh); gy = 48; c.shadow(W / 2 + 4, gy, 16, 3)
    cx, cy, r = W / 2 - 2, 26, 19
    for a in range(0, 360, 4):
        if 200 < a < 240: continue   # a missing piece of the rim
        for rr in (r, r - 1, r - 2): c.p(cx + math.cos(math.radians(a)) * rr, cy + math.sin(math.radians(a)) * rr * .96, TIMBER[4] if a < 180 else TIMBER[2])
    for a in range(0, 360, 45):
        if a == 225: continue
        c.line(cx, cy, cx + math.cos(math.radians(a)) * (r - 2), cy + math.sin(math.radians(a)) * (r - 2), TIMBER[3])
    c.ellipse(cx, cy, 4, 4, IRON[3]); c.outline(); return c
save('wheel', wheel(), 23, 48, foot=(-.4, -.2, .4, 0))
def bucket():
    c = C(22, 24); gy = 21; c.shadow(11, gy, 8, 2)
    c.poly([(4, 8), (18, 8), (16, gy - 1), (6, gy - 1)], lambda x, y: WOOD[4] if x < 8 else WOOD[3] if x < 14 else WOOD[2])
    c.rect(4, 11, 18, 11, IRON[3]); c.rect(5, 17, 17, 17, IRON[3]); c.ellipse(11, 8, 7, 2.2, lambda x, y, d: WATER[4] if d < .6 else WOOD[5]); c.line(4, 8, 11, 2, IRON[4]); c.line(11, 2, 18, 8, IRON[4])
    c.outline(); return c
save('bucket', bucket(), 11, 21, foot=(-.2, -.15, .2, 0))
def choppingblock():
    c = C(40, 40); gy = 36; c.shadow(20, gy, 15, 3)
    c.rect(8, 22, 30, gy - 1, lambda x, y: WOOD[4] if x < 12 else WOOD[3] if x < 26 else WOOD[2]); c.ellipse(19, 22, 11, 3.5, lambda x, y, d: (196, 160, 110) if d > .5 else (176, 140, 92))
    for k in range(3): c.ellipse(19, 22, 3 + k * 3, 1 + k, lambda x, y, d: None if d < .9 else (150, 116, 80))
    c.line(19, 22, 30, 6, WOOD[4], 2); c.poly([(15, 18), (23, 16), (24, 24), (16, 24)], IRON[4]); c.rect(15, 18, 23, 18, IRON[5])   # the axe, sunk in
    for k in range(5): c.rect(2 + k * 2, gy - 3 + (k % 2), 6 + k * 2, gy - 2 + (k % 2), (190, 150, 100))
    c.outline(); return c
save('choppingblock', choppingblock(), 20, 36, foot=(-.4, -.3, .4, 0))
def applespill():
    W, Hh = 58, 34; c = C(W, Hh); gy = 30; c.shadow(W / 2, gy, 26, 3)
    c.poly([(4, 10), (26, 6), (30, 24), (8, 28)], lambda x, y: WOOD[4] if (x // 4) % 2 else WOOD[3])   # the crate on its side
    c.poly([(26, 6), (30, 24), (32, 22), (28, 6)], WOOD[2])
    for k in range(9):
        x = 26 + k * 3.4 + H(k, 1) * 3; y = gy - 3 - H(k, 2) * 6; R = ramp('#c8302a') if k % 4 else ramp('#d8a020')
        c.ellipse(x, y, 2.6, 2.4, lambda xx, yy, d, R=R, x=x: R[5] if d < .25 and xx < x else R[3])
    c.ellipse(46, gy - 2, 2.6, 2.4, ramp('#5a3a20')[3])   # one gone bad
    c.outline(); return c
save('applespill', applespill(), 29, 30, foot=(-.6, -.3, .6, 0))
def cellardoor():
    W, Hh = 56, 40; c = C(W, Hh); gy = 36; c.shadow(W / 2, gy, 26, 3, 120)
    c.rect(4, 24, W - 5, gy - 1, STONE[2]); c.rect(4, 24, W - 5, 24, STONE[4])
    for side in (0, 1):
        x0 = 6 + side * 23; c.poly([(x0, 26), (x0 + 21, 26), (x0 + 21 - side * 2, 6), (x0 + side * 2, 8)], lambda x, y: (WOOD[4] if side == 0 else WOOD[3]) if (x - x0) % 5 else WOOD[1])
    c.rect(27, 8, 28, 26, WOOD[0]); c.rect(22, 14, 33, 15, IRON[4]); c.rect(26, 13, 29, 17, IRON[3])   # a bar and a padlock
    c.outline(); return c
save('cellardoor', cellardoor(), 28, 36, foot=(-.8, -.6, .8, 0))
def fountain():
    W, Hh = 104, 96; c = C(W, Hh); gy = 90; cx = W / 2; c.shadow(cx, gy - 6, 48, 10, 130)
    c.ellipse(cx, gy - 18, 46, 16, lambda x, y, d: STONE[5] if d > .82 and y < gy - 18 else STONE[3] if d > .82 else WATER[4] if (x + y) % 9 else WATER[5])
    c.rect(cx - 46, gy - 18, cx + 46, gy - 8, lambda x, y: STONE[3] if (x // 8 + (y // 5)) % 2 else STONE[2]); c.ellipse(cx, gy - 8, 46, 6, lambda x, y, d: STONE[2] if y > gy - 8 else None)
    c.rect(cx - 5, 28, cx + 5, gy - 22, lambda x, y: STONE[4] if x < cx else STONE[2]); c.ellipse(cx, 30, 14, 5, lambda x, y, d: STONE[5] if d > .6 else WATER[4])
    for k in range(10): c.p(cx - 12 + k * 2.6, 34 + abs(k - 4.5) * 2.4, WATER[5])   # water falling from the upper bowl
    for k in range(16): c.p(cx - 40 + H(k, 1) * 80, gy - 22 + H(k, 2) * 8, MOSS[3])
    c.ellipse(cx + 18, gy - 20, 3, 1.4, (200, 170, 60))   # a coin
    c.outline(); return c
save('fountain', fountain(), 52, 86, foot=(-1.5, -.9, 1.5, 0))
def mud(seed):
    W, Hh = 110, 56; c = C(W, Hh)
    for y in range(Hh):
        for x in range(W):
            d = ((x - W / 2) / (W / 2 - 2)) ** 2 + ((y - Hh / 2) / (Hh / 2 - 2)) ** 2 + (H(x // 6, y // 5, seed) - .5) * .5
            if d < 1:
                col = MUD[2] if H(x // 3, y // 3, seed + 1) > .35 else MUD[1]
                if d < .35 and H(x // 9, y // 6, seed + 2) > .62: col = WATER[3] if (x + y) % 7 else WATER[5]   # standing water
                c.p(x, y, col, 235 if d < .8 else 160)
    for k in range(10):   # boot prints in the mud
        x = 14 + k * 9; y = Hh / 2 + math.sin(k) * 6; c.ellipse(x, y, 2, 1.2, MUD[0])
    return c
save('mud_a', mud(3), 55, 28); save('mud_b', mud(8), 55, 28)

d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w'))
print(len(SPR), 'sprites:', ' '.join(SPR))
