"""More of what the night leaves in the fields, drawn by code with the same helpers and ramps as gore.py
(lit from the upper left, hue-shifted reds, wet highlights, contact shadows, dark outlines).
  g_rabbit   a rabbit torn open on the grass: fur scattered in tufts, one hind leg a little way off, a pool under it
  g_ribs     the ribcage of something deer-sized, standing on its spine, picked nearly clean, strips of meat still on it
  g_drag     a long smear where something heavy was pulled through the grass (flat, under everything)
  g_spatter  a spray of drops and flecks round a small pool, the kind a struggle leaves (flat)
Writes spr/lpc/obj/g_*.png and merges them into spr/lpc/objects.json. Run from hollow-acre/2d."""
import json, math
src = open('tools/gore.py').read()
exec(src[:src.index('# ---- the deer')])
FUR = ramp('#9a8268', spread=.8); FURW = ramp('#d8ccb8', spread=.5); GRASSD = (40, 52, 30)

# ---- the rabbit
c = C(40, 24)
c.pool(20, 16, 12, 4.2, 5, 5)
for i in range(9):   # tufts of fur blown about
    a = H(i, 3) * 6.28; r = 9 + H(i, 4) * 7; x, y = 20 + math.cos(a) * r, 15 + math.sin(a) * r * .38
    c.ell(x, y, 1.4 + H(i, 5) * .8, .9, FURW if i % 3 == 0 else FUR, rot=a)
c.ell(18, 13.5, 6.4, 3.4, FUR); c.ell(16.5, 12.6, 3.6, 2, FURW, k=1.1)
for x in range(13, 23):   # the belly opened along its length
    for y in range(int(14 - .9 * math.sin((x - 13) / 10 * math.pi)), 16): c.p(x, y, BLOOD[1] if (x + y) % 3 else BLOOD[0])
for x in (15, 18, 21): c.p(x, 14, BONE[4]); c.p(x, 15, BONE[2])
c.ell(14, 15.8, 2.2, 1.2, MEAT, wet=True); c.ell(21.5, 16, 1.6, 1, FAT)
c.ell(25.4, 11.6, 2.6, 2.2, FUR); c.p(26.8, 11.2, (14, 8, 8))                      # the head, turned back
c.ell(24.6, 8.6, .9, 2.4, FUR, rot=-.4); c.ell(26.2, 8.4, .9, 2.2, FURW, rot=-.2)  # ears
c.ell(31, 18, 3.2, 1.4, FUR, rot=.3); c.ell(33.6, 18.8, 1.1, .8, MEAT, wet=True)   # a hind leg, off by itself
for i in range(5): c.p(28.5 + i * .9, 17.2 + i * .3, BLOOD[2])
c.outline(below=20); save('g_rabbit', c, 20, 16)

# ---- a ribcage standing on its spine
c = C(44, 36); c.shadow(22, 32, 19, 3)
c.pool(22, 31, 14, 3.2, 7, 4)
for x in range(6, 39):   # the spine along the ground
    y = 29 - math.sin((x - 6) / 32 * math.pi) * 1.2; c.p(x, y, BONE[3]); c.p(x, y + 1, BONE[1])
    if x % 3 == 0: c.p(x, y - 1, BONE[4])
for i, x0 in enumerate(range(9, 37, 3)):   # the ribs curving up and over
    h = 18 - abs(x0 - 22) * .55; lean = (x0 - 22) * .08
    for k in range(int(h)):
        t = k / h; x = x0 + math.sin(t * math.pi) * 3.2 + lean * k; y = 28 - k
        c.p(x, y, BONE[4] if k < h * .6 else BONE[5]); c.p(x + 1, y, BONE[2])
    if i % 3 == 1:   # meat still on some of them
        for k in range(3, int(h * .6)): c.p(x0 + 1 + math.sin(k / h * math.pi) * 3.2 + lean * k, 28 - k, MEAT[2] if k % 2 else BLOOD[2])
c.ell(10, 27, 2.4, 1.6, MEAT, wet=True); c.ell(34, 27.6, 2, 1.3, BLOOD, wet=True)
c.outline(below=33); save('g_ribs', c, 22, 31, foot=(-0.6, -0.2, 0.6, 0))

# ---- a drag smear
c = C(64, 16)
for x in range(4, 60):
    t = (x - 4) / 56; w = 2.2 + 1.6 * math.sin(t * math.pi) + H(x, 1) * .8; y0 = 8 + math.sin(t * 5) * 1.6
    for y in range(int(y0 - w), int(y0 + w) + 1):
        d = abs(y - y0) / w
        if H(x, y, 2) < .15 and d > .5: continue
        c.p(x, y, BLOOD[2] if d < .35 else BLOOD[1] if d < .75 else BLOOD[0], int(235 - t * 70))
    if x % 7 == 0: c.p(x, y0 - w - 1, BLOOD[1]); c.p(x + 1, y0 + w + 1, BLOOD[0])
for i in range(6): c.p(8 + i * 9, 8 + math.sin(i) * 3, (200, 110, 110))
c.pool(6, 8, 4, 2.4, 3, 2); save('g_drag', c, 32, 8)

# ---- a spray of blood round a small pool
c = C(48, 22)
c.pool(24, 12, 7, 3, 11, 3)
for i in range(40):
    a = H(i, 7) * 6.28; r = 6 + H(i, 8) ** 1.6 * 16; x, y = 24 + math.cos(a) * r, 12 + math.sin(a) * r * .42
    c.p(x, y, BLOOD[1] if H(i, 9) < .6 else BLOOD[2])
    if H(i, 10) < .3: c.p(x + math.cos(a), y + math.sin(a) * .4, BLOOD[0])
save('g_spatter', c, 24, 12)

d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok', list(SPR))
