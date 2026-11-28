"""Marrow Hollow rebuilt as a real town: the landmarks round the green and the street furniture that makes it feel lived in.
Drawn by code with the same depth rules as regions.py: lit top faces over darker fronts, hue-shifted ramps, contact shadows,
ambient occlusion under eaves, dark outlines.
  landmarks: townhall(+_n), postoffice(+_n), schoolhouse(+_n), bandstand, memorial
  street:    hydrant, parkbench, planter, trashcan, st_* street-name signs
  yards:     clothesline, shed, gardenbed, hedge, birdbath
Writes spr/lpc/obj/*.png and their objects.json entries."""
import json, math
src = open('tools/regions.py').read()
exec(src[:src.index('# ======================================================================== Route 9 West')])

SHING = ramp('#4a5468', spread=.55); GRN = ramp('#2f5a3a', spread=.6); NAVY = ramp('#2a3a5a', spread=.6); FLAGR = ramp('#b8322a', spread=.6)
CLAP_R = ramp('#9a3a2e', spread=.55); TRIM = ramp('#e8e2d4', spread=.3); GRANITE = ramp('#8a8a8c', spread=.5); BRONZE = ramp('#8a6a3a', spread=.8)
LEAF = ramp('#3a6a2e', spread=.7); HEDGE = ramp('#2e5a2a', spread=.75)

def hiproof(c, x0, x1, y0, y1, inset, R, moss=0, seed=0):
    """A hip roof seen from the front and a little above: the front slope is lit, the hips fall into shade."""
    c.poly([(x0, y1), (x1, y1), (x1 - inset, y0), (x0 + inset, y0)], lambda x, y: R[3] if ((y - y0) // 4 + (x // 9)) % 2 else R[2])
    for y in range(y0, y1 + 1):   # shingle courses: a darker line every 4px, staggered joints
        if (y - y0) % 4 == 3:
            for x in range(int(x0 + inset * (y1 - y) / (y1 - y0)), int(x1 - inset * (y1 - y) / (y1 - y0))): c.p(x, y, R[1])
    for y in range(y0, y1 + 1):   # hips: the two triangles at the ends turn away from the light
        t = (y - y0) / max(1, y1 - y0); a = x0 + inset * (1 - t); b = x1 - inset * (1 - t)
        for x in range(int(a), int(a + inset * .55 * (1 - t) + 2)): q = c.get(x, y); c.p(x, y, (q[0] * .86, q[1] * .86, q[2] * .92)) if q[3] else None
        for x in range(int(b - inset * .55 * (1 - t) - 2), int(b) + 1): q = c.get(x, y); c.p(x, y, (q[0] * .7, q[1] * .7, q[2] * .8)) if q[3] else None
    c.rect(x0 + inset, y0, x1 - inset, y0, R[5])     # ridge catches the light
    c.rect(x0, y1, x1, y1 + 1, R[0])                  # eave edge
    for k in range(moss):
        x = x0 + 8 + H(k, 5, seed) * (x1 - x0 - 16); y = y0 + 4 + H(k, 6, seed) * (y1 - y0 - 6); c.rect(x, y, x + 3, y, MOSS[3]); c.p(x + 1, y - 1, MOSS[4])

def window(c, x, y, w, h, night, lit=True, arch=False, shutter=None):
    glass = (lambda xx, yy: (252, 214, 140) if (xx + yy) % 7 else (255, 236, 180)) if night and lit else (lambda xx, yy: (58, 70, 88) if (xx * 2 + yy) % 11 else (120, 140, 160))
    c.rect(x - 1, y - 1, x + w, y + h, TRIM[4]); c.rect(x, y, x + w - 1, y + h - 1, glass)
    if arch: c.ellipse(x + w / 2 - .5, y, w / 2, 3.5, lambda xx, yy, d: TRIM[4] if d > .55 else glass(xx, yy) if yy < y else None)
    c.rect(x + w // 2 - 1, y, x + w // 2 - 1, y + h - 1, TRIM[3]); c.rect(x, y + h // 2, x + w - 1, y + h // 2, TRIM[3])
    c.rect(x - 2, y + h, x + w + 1, y + h + 1, TRIM[5]); c.rect(x - 2, y + h + 2, x + w + 1, y + h + 2, TRIM[1])   # sill and its shadow
    if shutter:
        for sx in (x - 5, x + w + 1): c.rect(sx, y - 1, sx + 3, y + h, lambda xx, yy: shutter[3] if yy % 3 else shutter[2])

def clap(R, seed=0):
    return lambda x, y: (R[3] if y % 5 else R[1]) if H(x // 7, y // 5, seed) > .06 else R[2]

def bricks(R):
    def f(x, y):
        row = y // 4; off = 4 if row % 2 else 0
        if y % 4 == 3 or (x + off) % 9 == 0: return (R[1][0] * .9 + 20, R[1][1] * .9 + 16, R[1][2] * .9 + 14)
        return R[3] if H((x + off) // 9, row, 3) > .25 else R[2] if H((x + off) // 9, row, 4) > .5 else R[4]
    return f

# ======================================================================== the town hall: brick, two storeys, a clock tower, a portico
def townhall(night):
    W, Hh = 352, 286; c = C(W, Hh); gy = Hh - 4; x0, x1 = 16, W - 17
    c.shadow(W / 2, gy, W / 2 - 6, 7, 130)
    hiproof(c, x0 - 4, x1 + 4, 92, 128, 46, SHING, moss=10, seed=2)
    for cx in (60, W - 60): c.rect(cx - 7, 72, cx + 7, 100, bricks(BRICK)); c.rect(cx - 9, 70, cx + 9, 73, CONC[4])   # chimneys
    # the walls: brick, a white string course between the floors, a stone plinth
    c.rect(x0, 129, x1, gy - 6, bricks(BRICK)); c.darken(x0, 129, x1, 136, .7)   # eave shadow
    c.rect(x0, 192, x1, 194, TRIM[4]); c.rect(x0, 195, x1, 195, TRIM[1]); c.rect(x0, gy - 12, x1, gy - 6, lambda x, y: STONE[4] if y == gy - 12 else STONE[3])
    c.rect(x0, 129, x0 + 2, gy - 6, TRIM[4]); c.rect(x1 - 2, 129, x1, gy - 6, TRIM[2])   # corner boards
    lit_up = {1, 6} if night else set(); lit_dn = {2, 5} if night else set()
    for i, wx in enumerate((36, 70, 104, 236, 270, 304)):
        window(c, wx - 8, 146, 16, 30, night, i in lit_up, arch=True); window(c, wx - 8, 206, 16, 34, night, i in lit_dn, arch=True)
    # the tower rises out of the roof: white clapboard, louvred belfry, the clock, a slate spire
    tx0, tx1 = W / 2 - 30, W / 2 + 30
    c.rect(tx0, 40, tx1, 128, lambda x, y: (TRIM[4] if y % 5 else TRIM[2]) if x < tx1 - 8 else (TRIM[2] if y % 5 else TRIM[1]))
    c.rect(tx0 - 3, 38, tx1 + 3, 41, TRIM[5]); c.rect(tx0 - 3, 82, tx1 + 3, 84, TRIM[5]); c.rect(tx0 - 3, 85, tx1 + 3, 85, TRIM[1])
    for k in range(3): bx = tx0 + 8 + k * 16; c.rect(bx, 48, bx + 10, 78, (40, 36, 40)); [c.rect(bx, y, bx + 10, y, TRIM[2]) for y in range(50, 78, 3)]
    c.poly([(tx0 - 4, 38), (tx1 + 4, 38), (W / 2, 2)], lambda x, y: SLATE[4] if x < W / 2 - 2 else SLATE[2] if x > W / 2 + 6 else SLATE[3])
    c.rect(W / 2 - 1, 0, W / 2, 6, GOLD[4])
    face = (255, 236, 170) if night else (240, 236, 222)
    c.ellipse(W / 2, 106, 15, 15, lambda x, y, d: TRIM[1] if d > .8 else face)
    c.line(W / 2, 106, W / 2 - 7, 101, (30, 26, 26), 2); c.line(W / 2, 106, W / 2 + 1, 94, (30, 26, 26), 1)   # stopped at eight minutes to twelve
    for a in range(0, 360, 30): c.p(W / 2 + math.cos(math.radians(a)) * 12, 106 + math.sin(math.radians(a)) * 12, (60, 50, 50))
    # the portico: a pediment on four white columns, steps up to double doors
    px0, px1 = W / 2 - 44, W / 2 + 44
    c.poly([(px0 - 4, 196), (px1 + 4, 196), (W / 2, 172)], lambda x, y: TRIM[5] if y < 180 else TRIM[4]); c.poly([(px0 + 6, 194), (px1 - 6, 194), (W / 2, 179)], lambda x, y: TRIM[3])
    c.rect(px0 - 4, 196, px1 + 4, 203, lambda x, y: TRIM[4] if y < 202 else TRIM[1]); c.text(W / 2 - tw('TOWN HALL') / 2, 197, 'TOWN HALL', (60, 50, 44))
    c.darken(px0, 204, px1, gy - 13, .74)
    dc = (240, 196, 110) if night else None
    c.rect(W / 2 - 13, 214, W / 2 + 12, gy - 13, lambda x, y: dc if dc and x != W / 2 else GRN[2] if x < W / 2 else GRN[1]); c.rect(W / 2 - 13, 214, W / 2 + 12, 215, TRIM[4])
    c.rect(W / 2 - 3, 236, W / 2 - 2, 238, GOLD[4]); c.rect(W / 2 + 1, 236, W / 2 + 2, 238, GOLD[4])
    # chains across the doors (the hall has been shut since the vote in 1952)
    for x in range(int(W / 2 - 12), int(W / 2 + 12), 2): c.p(x, 228 + abs(x - W / 2) * .12, (150, 150, 156))
    for cx in (px0 + 2, px0 + 24, px1 - 24, px1 - 2):
        c.rect(cx - 3, 204, cx + 3, gy - 13, lambda x, y: TRIM[5] if x < cx - 1 else TRIM[3] if x < cx + 2 else TRIM[1]); c.rect(cx - 5, 204, cx + 5, 206, TRIM[4]); c.rect(cx - 5, gy - 15, cx + 5, gy - 13, TRIM[3])
    for k in range(3): c.rect(px0 - 6 - k * 4, gy - 12 + k * 3, px1 + 6 + k * 4, gy - 10 + k * 3, lambda x, y: STONE[5] if y == gy - 12 + k * 3 else STONE[3])
    for k in range(30): x = x0 + 4 + H(k, 9) * (x1 - x0 - 8); y = 140 + H(k, 8) * 100; c.p(x, y, MOSS[3]) if H(k, 7) > .5 else None   # ivy specks
    c.outline(); return c
for n in (False, True): save('townhall' + ('_n' if n else ''), townhall(n), 176, 282, foot=(-5, -3.6, 5, 0), bw=10, chim=[-116, -212])

# ======================================================================== the post office (June's rooms are upstairs)
def postoffice(night):
    W, Hh = 212, 182; c = C(W, Hh); gy = Hh - 4; x0, x1 = 12, W - 13
    c.shadow(W / 2, gy, W / 2 - 6, 6, 130)
    # flat roof seen from above, a parapet with a stepped front
    c.rect(x0, 28, x1, 54, lambda x, y: TAR[3] if H(x // 2, y // 2, 5) > .2 else TAR[2]); c.rect(x0, 28, x1, 29, CONC[5])
    c.rect(x0 + 120, 34, x0 + 140, 46, CONC[3]); c.rect(x0 + 122, 36, x0 + 138, 40, (80, 82, 90))
    c.poly([(x0, 56), (x1, 56), (x1, 50), (W / 2 + 26, 50), (W / 2 + 26, 44), (W / 2 - 26, 44), (W / 2 - 26, 50), (x0, 50)], lambda x, y: CONC[5] if y in (44, 50) else CONC[4])
    c.rect(x0, 57, x1, gy - 6, bricks(ramp('#8a5a3a', spread=.55))); c.darken(x0, 57, x1, 61, .72)
    c.rect(x0, 62, x1, 72, NAVY[2]); c.rect(x0, 62, x1, 62, NAVY[4]); c.text(W / 2 - tw('POST OFFICE') / 2, 65, 'POST OFFICE', (236, 230, 214))
    for i, wx in enumerate((32, 72, 132, 172)): window(c, wx - 9, 82, 18, 22, night, lit=i in (1, 2), shutter=GRN)
    c.rect(x0, 112, x1, 113, TRIM[4])
    # the shopfront: two big windows with gold lettering, a door with a fanlight
    for wx in (26, 136):
        c.rect(wx, 122, wx + 48, 152, lambda x, y: (250, 210, 130) if night else (54, 66, 84) if (x + y) % 13 else (110, 130, 152)); c.rect(wx - 2, 120, wx + 50, 121, WOOD[4]); c.rect(wx - 2, 153, wx + 50, 156, WOOD[2])
    c.text(32, 126, 'MAIL', GOLD[5]); c.text(146, 126, 'PARCELS', GOLD[5])
    c.rect(W / 2 - 11, 118, W / 2 + 11, gy - 7, NAVY[3]); c.ellipse(W / 2, 118, 11, 6, lambda x, y, d: (240, 210, 140) if night else (90, 110, 130) if y < 118 else None)
    c.rect(W / 2 - 9, 124, W / 2 + 9, gy - 8, lambda x, y: NAVY[2] if x < W / 2 else NAVY[1]); c.rect(W / 2 + 5, 146, W / 2 + 6, 148, GOLD[4])
    c.rect(x0, gy - 7, x1, gy - 5, STONE[3])
    # the blue drop box and a flag on a pole
    c.rect(170, gy - 22, 184, gy - 7, lambda x, y: NAVY[4] if x < 174 else NAVY[3]); c.ellipse(177, gy - 22, 7, 3, lambda x, y, d: NAVY[5]); c.rect(173, gy - 18, 181, gy - 17, (20, 24, 34))
    c.rect(x1 - 1, 18, x1, 80, IRON[4]); c.rect(x1 + 1, 20, x1 + 13, 28, lambda x, y: FLAGR[4] if (y - 20) % 4 < 2 else TRIM[4]); c.rect(x1 + 1, 20, x1 + 5, 23, NAVY[3])
    c.outline(); return c
for n in (False, True): save('postoffice' + ('_n' if n else ''), postoffice(n), 106, 178, foot=(-3, -3.3, 3, 0), bw=6)

# ======================================================================== the schoolhouse: red clapboard, a bell in a cupola
def schoolhouse(night):
    W, Hh = 276, 236; c = C(W, Hh); gy = Hh - 4; x0, x1 = 12, W - 13
    c.shadow(W / 2, gy, W / 2 - 6, 7, 130)
    hiproof(c, x0 - 4, x1 + 4, 88, 128, 40, ramp('#5a4a40', spread=.55), moss=6, seed=4)
    # the cupola on the ridge with its bell
    cx = W / 2; c.rect(cx - 14, 52, cx + 14, 90, lambda x, y: TRIM[4] if x < cx + 8 else TRIM[2]); c.rect(cx - 9, 60, cx + 9, 80, (36, 30, 30))
    c.ellipse(cx, 70, 7, 8, lambda x, y, d: (GOLD[5] if x < cx - 1 else GOLD[3]) if y > 64 else None); c.rect(cx - 1, 78, cx + 1, 80, GOLD[2])
    c.poly([(cx - 18, 54), (cx + 18, 54), (cx, 30)], lambda x, y: SLATE[4] if x < cx else SLATE[2]); c.rect(cx, 22, cx, 30, IRON[4]); c.rect(cx - 3, 24, cx + 3, 24, IRON[4])
    c.rect(x0, 129, x1, gy - 6, clap(CLAP_R, 6)); c.darken(x0, 129, x1, 135, .7)
    c.rect(x0, 129, x0 + 3, gy - 6, TRIM[4]); c.rect(x1 - 3, 129, x1, gy - 6, TRIM[2])
    for i, wx in enumerate((34, 70, 206, 242)): window(c, wx - 9, 146, 18, 40, night, lit=i in (1, 2))
    # the front gable porch: white posts, the name and the year, double doors
    gx0, gx1 = cx - 40, cx + 40
    c.poly([(gx0 - 6, 160), (gx1 + 6, 160), (cx, 132)], lambda x, y: TRIM[4] if y < 146 else TRIM[3]); c.poly([(gx0 + 4, 158), (gx1 - 4, 158), (cx, 140)], CLAP_R[2])
    c.rect(gx0 - 6, 160, gx1 + 6, 168, lambda x, y: TRIM[4] if y < 167 else TRIM[1]); c.text(cx - tw('SCHOOL') / 2, 162, 'SCHOOL', (70, 40, 34)); c.text(cx - tw('1889') / 2, 150, '1889', TRIM[5])
    c.darken(gx0, 169, gx1, gy - 9, .76)
    dc = (240, 196, 110) if night else None
    c.rect(cx - 14, 180, cx + 13, gy - 9, lambda x, y: dc if dc else (GRN[3] if (x - cx) % 14 < 7 else GRN[2])); c.rect(cx - 14, 180, cx + 13, 181, TRIM[4]); c.rect(cx, 180, cx, gy - 9, GRN[0])
    for px in (gx0 + 2, gx1 - 2): c.rect(px - 2, 169, px + 2, gy - 9, lambda x, y: TRIM[5] if x < px else TRIM[2])
    for k in range(2): c.rect(cx - 22 - k * 4, gy - 8 + k * 2, cx + 22 + k * 4, gy - 7 + k * 2, WOOD[4] if k == 0 else WOOD[2])
    c.rect(x0, gy - 7, x1, gy - 6, STONE[2])
    # chalk on the wall by the door, at a child's height
    for k in range(9): c.rect(cx + 50 + k * 3, gy - 30, cx + 50 + k * 3, gy - 26, (230, 226, 214))
    c.line(cx + 49, gy - 28, cx + 77, gy - 28, (230, 226, 214))
    c.outline(); return c
for n in (False, True): save('schoolhouse' + ('_n' if n else ''), schoolhouse(n), 138, 232, foot=(-4, -3.3, 4, 0), bw=8)

# ======================================================================== the bandstand on the green
def bandstand():
    W, Hh = 156, 168; c = C(W, Hh); gy = Hh - 4; cx = W / 2
    c.shadow(cx, gy - 4, 70, 12, 140)
    # the octagonal deck: lattice skirt below, a lit floor edge, steps at the front
    c.poly([(10, gy - 26), (cx - 34, gy - 36), (cx + 34, gy - 36), (W - 10, gy - 26), (W - 10, gy - 12), (cx + 34, gy - 4), (cx - 34, gy - 4), (10, gy - 12)],
           lambda x, y: (TRIM[3] if (x + y) % 6 < 2 or (x - y) % 6 < 2 else (40, 36, 34)) if y > gy - 24 else TRIM[4])
    c.poly([(10, gy - 26), (cx - 34, gy - 36), (cx + 34, gy - 36), (W - 10, gy - 26), (cx + 34, gy - 18), (cx - 34, gy - 18)], lambda x, y: WOOD[4] if (x // 6) % 2 else WOOD[3])
    c.rect(cx - 12, gy - 18, cx + 12, gy - 4, lambda x, y: WOOD[4] if (y - gy) % 4 == 0 else WOOD[2])
    # posts and a railing
    posts = [(14, gy - 26), (cx - 32, gy - 34), (cx + 32, gy - 34), (W - 14, gy - 26), (cx - 34, gy - 19), (cx + 34, gy - 19)]
    for (px, py) in posts: c.rect(px - 2, 62, px + 2, py, lambda x, y: TRIM[5] if x < px else TRIM[2])
    for a, b in ((posts[0], posts[4]), (posts[5], posts[3]), (posts[0], posts[1]), (posts[2], posts[3])):
        c.line(a[0], a[1] - 12, b[0], b[1] - 12, TRIM[4]); c.line(a[0], a[1] - 4, b[0], b[1] - 4, TRIM[3])
    # the roof: an eight-sided green-and-cream cone with a gilt finial, scalloped valance
    c.poly([(4, 64), (W - 4, 64), (cx, 10)], lambda x, y: (GRN[4] if x < cx - 10 else GRN[3] if x < cx + 16 else GRN[2]) if int((math.atan2(x - cx, y - 8) + 1.6) * 6.4) % 2 else (TRIM[4] if x < cx - 10 else TRIM[3] if x < cx + 16 else TRIM[2]))
    for x in range(4, W - 4, 8): c.ellipse(x + 4, 66, 4, 4, lambda xx, yy, d: GRN[2] if yy > 64 else None)
    c.rect(4, 62, W - 4, 64, GRN[1]); c.rect(cx - 1, 2, cx + 1, 12, GOLD[4]); c.ellipse(cx, 4, 2.5, 2.5, GOLD[5])
    c.darken(14, 67, W - 14, 74, .72)
    c.outline(); return c
save('bandstand', bandstand(), 78, 164, foot=(-2.2, -1.1, 2.2, 0))

# ======================================================================== the memorial: an obelisk with the names, and fresh flowers every week
def memorial():
    W, Hh = 54, 104; c = C(W, Hh); gy = Hh - 4; cx = W / 2
    c.shadow(cx, gy, 24, 5)
    for k, (w, h) in enumerate(((22, 6), (17, 6))):
        y0 = gy - 6 - k * 6; c.rect(cx - w, y0, cx + w, y0 + h - 1, lambda x, y: GRANITE[5] if y == y0 else GRANITE[3] if x < cx + w - 4 else GRANITE[1])
    c.poly([(cx - 8, gy - 12), (cx + 8, gy - 12), (cx + 5, 16), (cx - 5, 16)], lambda x, y: GRANITE[4] if x < cx - 1 else GRANITE[2] if x > cx + 3 else GRANITE[3])
    c.poly([(cx - 5, 16), (cx + 5, 16), (cx, 6)], lambda x, y: GRANITE[5] if x < cx else GRANITE[3])
    c.rect(cx - 5, 40, cx + 4, 64, BRONZE[3]); c.rect(cx - 5, 40, cx + 4, 40, BRONZE[5])
    for y in range(43, 63, 3): c.rect(cx - 3, y, cx + 2 - (y % 2), y, BRONZE[1])
    for k, col in enumerate(('#c8402a', '#e8c040', '#e8e0f0', '#c8402a', '#b86ad8')):
        R = ramp(col, spread=.7); c.ellipse(cx - 12 + k * 6, gy - 13, 3, 2.4, lambda x, y, d, R=R: R[4] if d < .4 else R[2])
    c.outline(); return c
save('memorial', memorial(), 27, 100, foot=(-.7, -.5, .7, 0))

# ======================================================================== street furniture
def hydrant():
    c = C(20, 30); gy = 27; c.shadow(10, gy, 7, 2.5)
    c.rect(5, 10, 14, gy - 1, lambda x, y: RED[5] if x < 7 else RED[3] if x < 12 else RED[1]); c.ellipse(9.5, 9, 5, 4, lambda x, y, d: RED[5] if x < 9 else RED[3])
    c.rect(2, 14, 17, 17, lambda x, y: RED[4] if y == 14 else RED[2]); c.rect(8, 4, 11, 6, RED[4]); c.rect(4, gy - 2, 15, gy, RED[1]); c.p(10, 21, GOLD[4])
    c.outline(); return c
save('hydrant', hydrant(), 10, 27, foot=(-.2, -.15, .2, 0))
def parkbench():
    c = C(62, 40); gy = 36; c.shadow(31, gy, 28, 3.5)
    for x in (8, 52): c.rect(x, 16, x + 3, gy - 1, lambda xx, y: IRON[4] if xx == x else IRON[2])
    for k in range(3): c.rect(6, 8 + k * 4, 56, 10 + k * 4, lambda x, y: WOOD[5] if y == 8 + k * 4 else WOOD[3])
    c.rect(5, 22, 57, 25, lambda x, y: WOOD[5] if y == 22 else WOOD[3]); c.rect(5, 26, 57, 27, WOOD[1]); c.darken(8, 28, 54, gy - 2, .7)
    c.outline(); return c
save('parkbench', parkbench(), 31, 36, foot=(-.85, -.3, .85, 0))
def planter():
    c = C(44, 34); gy = 31; c.shadow(22, gy, 20, 3)
    c.rect(4, 16, 40, gy - 1, lambda x, y: WOOD[4] if y == 16 else WOOD[3] if x < 34 else WOOD[1]); c.rect(4, 16, 40, 17, WOOD[5])
    for k in range(14):
        x = 7 + H(k, 1) * 30; y = 8 + H(k, 2) * 8; col = ('#c8402a', '#e8c040', '#d86a2a', '#b86ad8')[k % 4]; R = ramp(col, spread=.7)
        c.ellipse(x, y + 2, 4, 3, lambda xx, yy, d: LEAF[3] if d > .5 else LEAF[4]); c.ellipse(x, y, 2.2, 2, lambda xx, yy, d, R=R: R[5] if d < .3 else R[3])
    c.outline(); return c
save('planter', planter(), 22, 31, foot=(-.6, -.3, .6, 0))
def trashcan():
    c = C(22, 32); gy = 29; c.shadow(11, gy, 8, 2.5)
    c.rect(4, 8, 17, gy - 1, lambda x, y: (GRN[4] if x < 7 else GRN[3] if x < 14 else GRN[1]) if (y - 8) % 6 else GRN[0]); c.ellipse(10.5, 7, 8, 2.6, lambda x, y, d: GRN[5] if y < 7 else GRN[2])
    c.rect(9, 3, 12, 4, IRON[3]); c.outline(); return c
save('trashcan', trashcan(), 11, 29, foot=(-.25, -.2, .25, 0))
def streetsign(t):
    W = max(30, tw(t) + 12); c = C(W, 72); gy = 69; cx = W // 2; c.shadow(cx, gy, 6, 2)
    c.rect(cx - 1, 14, cx + 1, gy - 1, lambda x, y: IRON[5] if x == cx - 1 else IRON[3]); c.rect(cx - 3, gy - 3, cx + 3, gy - 1, IRON[2])
    c.rect(2, 8, W - 3, 16, lambda x, y: GREEN[4] if y == 8 else GREEN[3] if y < 16 else GREEN[1]); c.rect(3, 9, W - 4, 9, GREEN[5])
    c.text(cx - tw(t) // 2, 10, t, (240, 240, 232)); c.ellipse(cx, 6, 2, 2, IRON[4])
    c.outline(); return c
for k, t in (('main', 'MAIN ST'), ('hill', 'HILL ST'), ('market', 'MARKET ST'), ('elm', 'ELM ST'), ('church', 'CHURCH ST'), ('orchard', 'ORCHARD LN'), ('east', 'EAST AVE'), ('green', 'GREEN ST'), ('mill', 'MILL RD')):
    c = streetsign(t); save('st_' + k, c, c.W / 2, 69, foot=(-.1, -.1, .1, 0))

# ======================================================================== yards
def clothesline(seed):
    W, Hh = 112, 70; c = C(W, Hh); gy = 66; c.shadow(W / 2, gy, 50, 3, 90)
    for x in (6, W - 8): c.rect(x, 12, x + 2, gy - 1, lambda xx, y: WOOD[4] if xx == x else WOOD[2]); c.rect(x - 5, 12, x + 7, 14, WOOD[3])
    for k in range(int(W - 16)): y = 14 + math.sin(k / (W - 16) * math.pi) * 5; c.p(9 + k, y, (200, 196, 186))
    x = 16
    for k in range(4):
        col = ('#e8e4dc', '#a8b8d0', '#d8a0a0', '#e8d8a0', '#ffffff', '#9ab89a')[int(H(k, 3, seed) * 6)]; R = ramp(col, spread=.4)
        w = 12 + int(H(k, 4, seed) * 10); h = 14 + int(H(k, 5, seed) * 14); y0 = 15 + math.sin((x - 9) / (W - 16) * math.pi) * 5
        c.rect(x, y0, x + w, y0 + h, lambda xx, yy: R[4] if xx < x + 2 else R[3] if (xx + yy) % 9 else R[2]); c.rect(x, y0 + h, x + w, y0 + h, R[1])
        c.p(x + 1, y0 - 1, WOOD[5]); c.p(x + w - 1, y0 - 1, WOOD[5]); x += w + 6
        if x > W - 26: break
    c.outline(); return c
save('clothesline', clothesline(1), 56, 66, foot=(-1.6, -.1, 1.6, 0)); save('clothesline_b', clothesline(7), 56, 66, foot=(-1.6, -.1, 1.6, 0))
def shed(R):
    W, Hh = 76, 84; c = C(W, Hh); gy = 80; c.shadow(W / 2, gy, 34, 5)
    c.poly([(4, 40), (W - 5, 40), (W - 12, 20), (11, 20)], lambda x, y: TAR[4] if y % 4 else TAR[2]); c.rect(4, 40, W - 5, 41, TAR[1])
    c.rect(8, 42, W - 9, gy - 2, clap(R, 9)); c.darken(8, 42, W - 9, 46, .7)
    c.rect(W / 2 - 9, 50, W / 2 + 8, gy - 3, lambda x, y: WOOD[3] if x < W / 2 else WOOD[2]); c.line(W / 2 - 9, 50, W / 2 + 8, gy - 3, WOOD[1]); c.p(W / 2 + 5, 66, IRON[5])
    c.rect(12, 50, 22, 58, (50, 60, 72)); c.rect(11, 59, 23, 59, TRIM[3])
    c.outline(); return c
save('shed', shed(ramp('#6a7a5a', spread=.55)), 38, 80, foot=(-1.05, -1.1, 1.05, 0)); save('shed_b', shed(ramp('#8a5a3a', spread=.55)), 38, 80, foot=(-1.05, -1.1, 1.05, 0))
def gardenbed(seed):
    W, Hh = 84, 50; c = C(W, Hh); gy = 46
    c.rect(4, 8, W - 5, gy - 2, lambda x, y: PEAT[3] if (y - 8) % 8 < 5 else PEAT[2]); c.rect(3, 7, W - 4, 8, WOOD[4]); c.rect(3, gy - 2, W - 4, gy - 1, WOOD[2]); c.rect(3, 7, 4, gy - 1, WOOD[4]); c.rect(W - 5, 7, W - 4, gy - 1, WOOD[2])
    for r in range(4):
        for k in range(6):
            x = 10 + k * 12 + (r % 2) * 4; y = 12 + r * 8; kind = int(H(r, k, seed) * 3)
            if kind == 0: c.ellipse(x, y, 4, 3, lambda xx, yy, d: LEAF[5] if d < .3 else LEAF[3] if d < .7 else LEAF[2])
            elif kind == 1: [c.line(x, y + 2, x + dx, y - 3, LEAF[4]) for dx in (-2, 0, 2)]; c.p(x, y + 2, (220, 120, 40))
            else: c.ellipse(x, y, 3, 2.5, lambda xx, yy, d: (190, 70, 60) if d < .6 else LEAF[3])
    return c
save('gardenbed', gardenbed(1), 42, 46, foot=(0, 0, 0, 0)); save('gardenbed_b', gardenbed(5), 42, 46, foot=(0, 0, 0, 0))
def hedge():
    W, Hh = 70, 40; c = C(W, Hh); gy = 36; c.shadow(W / 2, gy, 33, 3)
    c.rect(2, 12, W - 3, gy - 1, lambda x, y: HEDGE[4] if y < 16 else HEDGE[3] if H(x // 3, y // 3, 2) > .3 else HEDGE[2])
    for k in range(40): x = 3 + H(k, 1) * (W - 6); y = 10 + H(k, 2) * 6; c.ellipse(x, y, 3, 2.5, lambda xx, yy, d: HEDGE[5] if d < .4 else HEDGE[4])
    c.darken(2, gy - 6, W - 3, gy - 1, .72); c.outline(); return c
save('hedge', hedge(), 0, 36, foot=(0, -.3, 2.1, 0))
def birdbath():
    c = C(30, 40); gy = 37; c.shadow(15, gy, 11, 3)
    c.rect(12, 16, 17, gy - 1, lambda x, y: STONE[4] if x < 14 else STONE[2]); c.rect(8, gy - 3, 21, gy - 1, STONE[3])
    c.ellipse(15, 13, 12, 4.5, lambda x, y, d: STONE[5] if d > .55 and y < 13 else WATER[4] if d < .55 else STONE[3]); c.outline(); return c
save('birdbath', birdbath(), 15, 37, foot=(-.3, -.2, .3, 0))


# ======================================================================== the terrace under Hill Street: a cut-stone retaining wall and steps
WALLS = ramp('#8a8070', spread=.55)
def twall():
    W, Hh = 66, 52; c = C(W, Hh); gy = 42
    for x in range(0, W):   # contact shadow on the ground at the foot of the wall
        for y in range(gy + 1, gy + 8): c.p(x, y, (12, 12, 18), int(120 * (1 - (y - gy - 1) / 7) ** 1.4))
    c.rect(0, 2, W - 1, 7, lambda x, y: WALLS[6] if y == 2 else WALLS[5] if y < 5 else WALLS[4])   # the coping: lit top face
    c.rect(0, 8, W - 1, 8, WALLS[1])                                                                 # its shadow line on the face
    def face(x, y):
        row = (y - 9) // 8; off = 9 if row % 2 else 0; bx = (x + off) // 18
        if (y - 9) % 8 == 7 or (x + off) % 18 == 0: return WALLS[1]
        base = WALLS[3] if H(bx, row, 2) > .3 else WALLS[2] if H(bx, row, 3) > .4 else WALLS[4]
        t = (y - 9) / (gy - 9)   # darker toward the foot, where the light doesn't reach
        return tuple(v * (1 - .22 * t) for v in base)
    c.rect(0, 9, W - 1, gy, face)
    for k in range(10):   # moss streaks down from the coping and weeds at the foot
        x = int(H(k, 1) * W); L = 3 + int(H(k, 2) * 9)
        for y in range(9, 9 + L): c.p(x, y, MOSS[2 + (y % 2)])
    for k in range(6): x = int(H(k, 4) * (W - 4)); c.p(x, gy - 1, MOSS[4]); c.p(x + 1, gy - 2, MOSS[3]); c.p(x + 2, gy - 1, MOSS[4])
    return c
save('twall', twall(), 0, 42, foot=(0, -1.1, 2, 0))
def tsteps():
    W, Hh = 84, 54; c = C(W, Hh); gy = 44; x0, x1 = 6, W - 7
    for x in range(0, W):
        for y in range(gy + 1, gy + 8): c.p(x, y, (12, 12, 18), int(110 * (1 - (y - gy - 1) / 7) ** 1.4))
    # cheek walls either side, coped like the wall
    for cx0 in (0, x1 - 1):
        c.rect(cx0, 2, cx0 + 6, 7, lambda x, y: WALLS[6] if y == 2 else WALLS[5]); c.rect(cx0, 8, cx0 + 6, gy, lambda x, y: WALLS[3] if x < cx0 + 4 else WALLS[1])
    # five treads: each a lit top and a shaded riser, worn hollow in the middle
    n = 5
    for i in range(n):
        ty = 4 + i * 8; c.rect(x0 + 1, ty, x1 - 2, ty + 3, lambda x, y: STONE[5] if y == ty else STONE[4] if abs(x - W / 2) > 14 else STONE[3])
        c.rect(x0 + 1, ty + 4, x1 - 2, ty + 7, lambda x, y: STONE[2] if y < ty + 6 else STONE[1])
    c.darken(x0 + 1, 4, x0 + 4, gy, .8); c.darken(x1 - 5, 4, x1 - 2, gy, .7)
    c.outline(); return c
save('tsteps', tsteps(), 42, 44, foot=(0, 0, 0, 0))


# ======================================================================== a hedge running north-south, one metre a piece: west side, lit top, east side in shade
def hedge_v(seed):
    W, Hh = 30, 62; c = C(W, Hh); ay = 54; x0, x1 = 4, 23
    for y in range(ay - 31, ay + 1):   # its shadow falls east across the ground (one metre of it per piece, so the pieces don't double it)
        for x in range(x1 + 1, x1 + 6): c.p(x, y + 3, (12, 14, 18), int(90 * (1 - (x - x1 - 1) / 5)))
    for y in range(0, ay - 7):
        for x in range(x0, x1 + 1):
            n = H(x // 2, (y + seed * 7) // 2, seed); t = (x - x0) / (x1 - x0)
            if t < .18: col = HEDGE[3] if n > .3 else HEDGE[2]                      # west face
            elif t < .8: col = HEDGE[5] if n > .72 else HEDGE[4] if n > .22 else HEDGE[3]   # the clipped top, catching the light
            else: col = HEDGE[2] if n > .4 else HEDGE[1]                            # east face, in shade
            c.p(x, y + 4, col)
    for k in range(10):   # leafy lumps break the edges
        y = 6 + int(H(k, 1, seed) * (ay - 16)); side = x0 if k % 2 else x1
        c.ellipse(side, y, 2, 2.5, lambda xx, yy, d: HEDGE[3] if side == x0 else HEDGE[1])
    c.rect(x0, ay - 7, x1, ay, lambda x, y: HEDGE[2] if (x + y) % 3 else HEDGE[1])   # the south end, shown only by the last piece
    c.darken(x0, ay - 2, x1, ay, .75)
    return c
save('hedge_v', hedge_v(1), 13.5, 54, foot=(-.3, -1, .3, 0)); save('hedge_v_b', hedge_v(4), 13.5, 54, foot=(-.3, -1, .3, 0))

# ---- register
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w'))
print(len(SPR), 'sprites:', ' '.join(SPR))
