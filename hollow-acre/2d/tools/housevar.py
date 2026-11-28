"""Colour variants of the town houses, so no two neighbours on a street are the same house: the siding and the roof are
re-hued separately (the roof is everything above the eave line), windows, doors, trim and outlines keep their colours."""
import json, colorsys
from PIL import Image
d = json.load(open('spr/lpc/objects.json'))
def eave(im):
    # the eave is the first row from the top, below the roof's middle, that is mostly bright trim
    W, H = im.size; px = im.load(); best = int(H * .5)
    for y in range(int(H * .3), int(H * .8)):
        n = sum(1 for x in range(W) if px[x, y][3] > 200 and sum(px[x, y][:3]) > 560)
        if n > W * .45: return y
    return best
def dominant(im, y0, y1):
    px = im.load(); W = im.size[0]; hist = [0] * 36
    for y in range(y0, y1):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a < 200: continue
            h, s_, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s_ < .12 or v < .15: continue
            hist[int(h * 36) % 36] += 1
    k = max(range(36), key=lambda i: hist[i] + .6 * (hist[i - 1] + hist[(i + 1) % 36])); return (k + .5) / 36
def recolor(src, dst, wall, roof):
    base = Image.open(d[src]['src']).convert('RGBA'); ey = eave(base); H0 = base.size[1]
    hw, hr = dominant(base, ey, H0), dominant(base, 0, ey)   # only the siding's own colour and the roof's own colour move; doors, shutters, brick stay
    for suf in ('', '_n'):
        n = src + suf
        if n not in d: continue
        im = Image.open(d[n]['src']).convert('RGBA'); W, H = im.size; px = im.load()
        for y in range(H):
            for x in range(W):
                r, g, b, a = px[x, y]
                if a < 10: continue
                h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                if s < .12 or v < .12: continue
                if suf == '_n' and v > .85 and r > 220 and g > 170: continue   # lit windows stay lit
                ref, (dh, ss, vv) = (hr, roof) if y < ey else (hw, wall)
                if abs(((h - ref + .5) % 1) - .5) > .09: continue
                h = (h + dh) % 1; s = min(1, s * ss); v = min(1, v * vv)
                rr, gg, bb = colorsys.hsv_to_rgb(h, s, v); px[x, y] = (round(rr * 255), round(gg * 255), round(bb * 255), a)
        out = f'spr/lpc/obj/{dst}{suf}.png'; im.save(out); m = dict(d[n]); m['src'] = out; d[dst + suf] = m
# [source, new name, (wall hue shift, sat, value), (roof hue shift, sat, value)]
for src, dst, wall, roof in (('house_c', 'house_c2', (.4, .5, 1.05), (.45, .8, .95)), ('house_b', 'house_b2', (.42, .45, 1.02), (.5, .6, .85)),
                             ('house_d', 'house_d2', (.5, .7, 1.0), (.0, .5, .8)), ('house_a', 'house_a2', (.0, 1.0, 1.0), (.45, 1.1, 1.0))):
    recolor(src, dst, wall, roof)
json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok')
