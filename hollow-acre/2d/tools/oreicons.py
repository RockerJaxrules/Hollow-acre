"""Item icons for the raw resources, drawn at 32x32 (they were 16x16 blown up, and copper and iron read as grey stone):
stone, copper ore (copper veins, a little green patina), iron ore (rust-red veins, silver glints), coal (glossy black facets).
Each is a lumpy rock lit from the upper left with hue-shifted ramps and a dark outline. Also a proper stump sprite in place
of the broken one (it was a slice of tree trunk with leaves in it). Writes spr/lpc/obj/ and objects.json."""
import json, math, colorsys
from PIL import Image
H = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1
def ramp(hexc, n=6, spread=.7):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1) - .55; tgt = .72 if t < 0 else .13; d = ((tgt - h + .5) % 1) - .5; hh = (h + d * min(1, abs(t) * .5)) % 1
        out.append(tuple(round(c * 255) for c in colorsys.hsv_to_rgb(hh, max(0, min(1, s * (1.05 - t * .3))), max(0, min(1, v * (1 + t * spread * (1.3 if t < 0 else 1)))))))
    return out
OUT = (24, 18, 22)
def rock(R, seed, blobs):
    im = Image.new('RGBA', (32, 32), (0, 0, 0, 0)); px = im.load(); L = (-.6, -.65, .45)
    zb = {}
    for k, (cx, cy, r) in enumerate(blobs):
        for y in range(32):
            for x in range(32):
                dx, dy = x + .5 - cx, y + .5 - cy; rr = r * (1 + .12 * math.sin(math.atan2(dy, dx) * 5 + seed + k))
                d2 = dx * dx + dy * dy
                if d2 > rr * rr: continue
                nz = math.sqrt(1 - d2 / (rr * rr)); f = nz * rr + k * .3
                if (x, y) not in zb or f > zb[(x, y)][0]: zb[(x, y)] = (f, dx / rr, dy / rr, nz)
    for (x, y), (f, nx, ny, nz) in zb.items():
        # flat-ish facets: quantise the normal so the lump reads as chipped stone, not a ball
        qx, qy = round(nx * 2.5) / 2.5, round(ny * 2.5) / 2.5; l = max(0, qx * L[0] + qy * L[1] + nz * L[2])
        k = max(0, min(len(R) - 1, int(round((.15 + .95 * l + (H(x, y, seed) - .5) * .12) * (len(R) - 1)))))
        px[x, y] = (*R[k], 255)
    return im, zb
def outline(im):
    px = im.load(); a = [[px[x, y][3] > 0 for x in range(32)] for y in range(32)]
    for y in range(32):
        for x in range(32):
            if not a[y][x] and ((x > 0 and a[y][x - 1]) or (x < 31 and a[y][x + 1]) or (y > 0 and a[y - 1][x]) or (y < 31 and a[y + 1][x])): px[x, y] = (*OUT, 255)
    return im
def veins(im, zb, C, seed, n, glint=None, dots=None):
    px = im.load()
    for v in range(n):
        x, y = 8 + H(v, seed) * 16, 9 + H(v, seed, 2) * 13; a = H(v, seed, 3) * 6.28
        for t in range(7):
            xi, yi = int(x), int(y)
            if (xi, yi) in zb:
                lit = zb[(xi, yi)][1] < .1 and zb[(xi, yi)][2] < .2
                px[xi, yi] = (*C[2 if lit else 1], 255)
                if (xi - 1, yi - 1) in zb and lit: px[xi - 1, yi - 1] = (*C[3], 255)
            x += math.cos(a) * 1.1; y += math.sin(a) * 1.1; a += (H(v, t, seed) - .5) * 1.2
    for (x, y) in (glint or []):
        if (x, y) in zb: px[x, y] = (255, 255, 255, 255)
    for (x, y, c) in (dots or []):
        if (x, y) in zb: px[x, y] = (*c, 255)
    return im
SPR = {}
def save(name, im, fw=32, fh=32, ay=None):
    im.save(f'spr/lpc/obj/{name}.png'); SPR[name] = {'src': f'spr/lpc/obj/{name}.png', 'fw': fw, 'fh': fh, 'ax': fw / 2, 'ay': float(ay if ay is not None else fh - 2), 'foot': [0, 0, 0, 0]}
B1 = [(15, 18, 10), (21, 21, 7.5), (10, 22, 6.5)]
im, zb = rock(ramp('#8a8680'), 1, B1); save('icon32_stone', outline(im))
im, zb = rock(ramp('#7a6e64'), 2, [(15, 18, 10), (22, 20, 7), (10, 22, 7)])
veins(im, zb, [(122, 54, 24), (190, 96, 40), (232, 140, 66), (252, 196, 120)], 5, 5, glint=[(12, 14), (19, 16)], dots=[(9, 20, (74, 168, 138)), (22, 23, (74, 168, 138)), (17, 26, (60, 140, 116))])
save('icon32_copper', outline(im))
im, zb = rock(ramp('#6a6a72'), 3, [(16, 18, 10), (9, 21, 6.5), (22, 22, 7)])
veins(im, zb, [(92, 34, 22), (150, 58, 36), (196, 92, 62), (226, 140, 108)], 9, 5, glint=[(11, 13), (14, 12), (20, 15), (23, 19)])
save('icon32_iron', outline(im))
im, zb = rock(ramp('#2e2c30', spread=.9), 4, [(15, 19, 9.5), (21, 21, 7), (10, 22, 6)])
px = im.load()
for (x, y), (f, nx, ny, nz) in zb.items():
    if nx < -.2 and ny < -.1 and H(x // 2, y // 2, 4) > .55: px[x, y] = (150, 150, 168, 255)   # the glossy facets that catch the light
save('icon32_coal', outline(im))
# ---- a stump to replace the broken one: the oak stump, set on the old sprite's canvas
st = Image.open('spr/lpc/obj/stump_oak.png').convert('RGBA'); c = Image.new('RGBA', (46, 32), (0, 0, 0, 0)); c.alpha_composite(st, ((46 - st.width) // 2, 30 - st.height + 3))
c.save('spr/lpc/obj/stump.png')
d = json.load(open('spr/lpc/objects.json')); d.update(SPR); json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok', list(SPR))
