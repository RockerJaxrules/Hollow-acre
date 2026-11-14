"""Wickham Crossing's own houses: the village's buildings repainted from the valley's, region by region, keeping every bit of
shading. Walls and roofs are picked out by colour (and, where a colour is shared, by where on the building it is), then given
Wickham's colours: whitewash, weathered grey shingle, barn red and tarred timber; teal, moss, rust and pantile roofs; a dark
timber chapel with a copper roof gone green. Writes spr/lpc/obj/wk_*.png (+ the night versions) and their entries in objects.json."""
import json, colorsys
from PIL import Image
OBJ = 'spr/lpc/obj/'
def hsv(p): return colorsys.rgb_to_hsv(p[0] / 255, p[1] / 255, p[2] / 255)
def rgb(h, s, v): r, g, b = colorsys.hsv_to_rgb(h % 1, max(0, min(1, s)), max(0, min(1, v))); return (round(r * 255), round(g * 255), round(b * 255))
def hue_in(h, a, b):
    d = h * 360
    return a <= d <= b if a <= b else (d >= a or d <= b)
# each rule: (test(h,s,v,x,y,W,H) -> bool, new colour(h,s,v) -> (h,s,v)). The first rule that matches wins.
def slate(h, s, v, *_): return hue_in(h, 195, 255) and .1 <= s <= .6 and v < .56
def white(h, s, v, *_): return s < .13 and v > .55
def glow(h, s, v, *_): return v > .9 and s > .3 and hue_in(h, 30, 62)   # lit windows at night stay lit
RULES = {
  'house_a': [(glow, None),
              (slate, lambda h, s, v: (95 / 360, .32, v * 1.04)),                                   # moss-green roof
              (lambda h, s, v, x, y, W, H: white(h, s, v) and y > H * .3, lambda h, s, v: (205 / 360, .13, v * .84))],   # grey-blue shingle
  'house_b': [(glow, None),
              (lambda h, s, v, x, y, W, H: (hue_in(h, 340, 20)) and s > .4 and y < H * .62 and not (140 <= x <= 159 and y <= 27),
               lambda h, s, v: (182 / 360, s * .62, v * .92)),                                       # teal roof (the brick chimney left alone)
              (lambda h, s, v, x, y, W, H: hue_in(h, 28, 62) and s > .33 and y > H * .5, lambda h, s, v: (40 / 360, .07, min(1, v * 1.14)))],   # whitewash
  'house_c': [(glow, None),
              (lambda h, s, v, x, y, W, H: hue_in(h, 195, 240) and .15 < s < .6 and v >= .5 and y > H * .44, lambda h, s, v: (4 / 360, .56, v * .78)),   # barn red
              (slate, lambda h, s, v: (20 / 360, .5, min(1, v * 1.08)))],                         # rust roof
  'house_d': [(glow, None),
              (lambda h, s, v, x, y, W, H: hue_in(h, 355, 45) and .18 < s < .52 and v < .56 and y < H * .5, lambda h, s, v: (14 / 360, .62, min(1, v * 1.25))),   # pantiles
              (lambda h, s, v, x, y, W, H: hue_in(h, 55, 140) and .12 < s < .65 and y > H * .45, lambda h, s, v: (28 / 360, .25, v * .5))],   # tarred timber
  'church':  [(glow, None),
              (slate, lambda h, s, v: (168 / 360, .36, min(1, v * 1.22))),                        # copper gone green
              (lambda h, s, v, x, y, W, H: white(h, s, v) and y > H * .25, lambda h, s, v: (26 / 360, .3, v * .47))],   # dark stained timber
}
NAMES = {'house_a': 'wk_house_a', 'house_b': 'wk_house_b', 'house_c': 'wk_house_c', 'house_d': 'wk_house_d', 'church': 'wk_chapel'}
def paint(src, rules, night=False):
    im = Image.open(OBJ + src + '.png').convert('RGBA'); W, H = im.size; px = im.load()
    day = Image.open(OBJ + src.replace('_n', '') + '.png').convert('RGBA').load() if night else None
    for y in range(H):
        for x in range(W):
            p = px[x, y]
            if p[3] == 0: continue
            # night sprites are the day ones darkened (and windows lit): classify by the day colour, recolour the night one alike
            q = day[x, y] if night else p
            h, s, v = hsv(q)
            for test, fn in rules:
                if test(h, s, v, x, y, W, H):
                    if fn:
                        nh, ns, nv = fn(h, s, v)
                        if night:
                            h2, s2, v2 = hsv(p)
                            if glow(h2, s2, v2): break
                            nv = nv * (v2 / max(v, .01))
                        r, g, b = rgb(nh, ns, nv); px[x, y] = (r, g, b, p[3])
                    break
    return im
if __name__ == '__main__':
    meta = json.load(open('spr/lpc/objects.json'))
    for base, name in NAMES.items():
        for suf in ('', '_n'):
            if base + suf not in meta: continue
            im = paint(base + suf, RULES[base], night=bool(suf)); im.save(OBJ + name + suf + '.png')
            m = dict(meta[base + suf]); m['src'] = f'spr/lpc/obj/{name}{suf}.png'; meta[name + suf] = m
            print(name + suf, im.size)
    json.dump(meta, open('spr/lpc/objects.json', 'w'))
