"""The car after Hollis's parts go in: the same car, beaten but running. Made from car_east.png (all seven turning frames):
a primer-grey hood and front fender, rust along the sills and wheel arches, dents and scratches, a cracked windshield taped over."""
import json, random
from PIL import Image
src = Image.open('../spr/lpc/obj/car_east.png').convert('RGBA'); W, H = src.size; FW = 173
out = src.copy(); px = out.load()
def isred(c): return c[3] > 0 and c[0] > c[1] + 35 and c[0] > c[2] + 30
def isglass(c): return c[3] > 0 and c[2] >= c[0] + 6 and c[2] > 40 and max(c[:3]) < 150
def isdark(c): return c[3] > 0 and max(c[:3]) < 50
def lum(c): return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]
random.seed(9)
for f in range(W // FW):
    x0 = f * FW
    reds = [(x, y) for y in range(H) for x in range(x0, x0 + FW) if isred(px[x, y])]
    if not reds: continue
    bx0 = min(x for x, y in reds); bx1 = max(x for x, y in reds); by0 = min(y for x, y in reds); by1 = max(y for x, y in reds)
    colbot = {}
    for x, y in reds: colbot[x] = max(colbot.get(x, 0), y)
    for x, y in reds:
        c = px[x, y]; l = lum(c)
        # the replacement hood and front fender came off another car: grey primer
        if x > bx1 - (bx1 - bx0) * 0.22:
            g = int(l * 0.9 + 52); px[x, y] = (g, g + 2, g - 2, 255); continue
        # rust along the sills and the wheel arches
        near_tire = any(isdark(px[min(W - 1, max(0, x + dx)), min(H - 1, max(0, y + dy))]) for dx, dy in ((0, 2), (0, 3), (2, 2), (-2, 2)))
        if (colbot[x] - y < 4 or near_tire) and random.random() < 0.45:
            px[x, y] = random.choice([(132, 70, 34, 255), (104, 52, 26, 255), (156, 90, 44, 255)])
    # dents: a few darker patches, each with a lit upper edge
    for _ in range(3):
        cx = random.randint(bx0 + 10, int(bx1 - (bx1 - bx0) * 0.3)); cy = random.randint(by0 + 6, by1 - 6); rx, ry = random.randint(3, 6), random.randint(2, 3)
        for y in range(cy - ry, cy + ry + 1):
            for x in range(cx - rx, cx + rx + 1):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1: continue
                c = px[x, y]
                if not isred(c): continue
                k = 0.78 if y > cy - ry + 1 else 1.18
                px[x, y] = (min(255, int(c[0] * k)), min(255, int(c[1] * k)), min(255, int(c[2] * k)), 255)
    # long scratches
    for _ in range(2):
        sx, sy = random.randint(bx0 + 8, bx1 - 30), random.randint(by0 + 8, by1 - 8)
        for i in range(random.randint(10, 18)):
            x, y = sx + i, sy + (i // 5)
            if isred(px[x, y]): px[x, y] = (214, 150, 140, 255)
    # the windshield: a star crack and a strip of tape
    glass = [(x, y) for y in range(H) for x in range(x0, x0 + FW) if isglass(px[x, y])]
    if glass:
        gx0 = min(x for x, y in glass); gx1 = max(x for x, y in glass); gy0 = min(y for x, y in glass); gy1 = max(y for x, y in glass)
        gl = set(glass); cx, cy = int(gx0 + (gx1 - gx0) * 0.7), int(gy0 + (gy1 - gy0) * 0.45)
        for ang in (0.3, 1.4, 2.6, 3.7, 5.0):
            import math
            for r in range(1, 9):
                x, y = int(cx + math.cos(ang) * r), int(cy + math.sin(ang) * r * 0.7)
                if (x, y) in gl: px[x, y] = (206, 216, 226, 255)
        for i in range(-6, 7):
            for t in range(3):
                x, y = cx - 3 + i, cy + 4 + int(i * 0.35) + t
                if (x, y) in gl: px[x, y] = (214, 200, 160, 255) if t < 2 else (176, 160, 120, 255)
out.save('../spr/lpc/obj/car_beaten.png')
o = json.load(open('../spr/lpc/objects.json')); m = dict(o['car_east']); m['src'] = 'spr/lpc/obj/car_beaten.png'; o['car_beaten'] = m
json.dump(o, open('../spr/lpc/objects.json', 'w'), indent=0); print('ok', W, H)
