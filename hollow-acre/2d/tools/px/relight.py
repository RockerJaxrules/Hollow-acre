"""Directional relight of small creature sheets (#211: rabbit, hen, chicken read at 5 'on flat value').
Each frame: a height field from the silhouette (distance to the edge, smoothed), a normal from its gradient, light from
the top-left and a little from the front; every large material (fur, feathers) is re-shaded on a 5-tone hue-shifted ramp
built from its own mean colour (shadows cooler and a touch more saturated, lights warmer), while the outline and small
accents (eye, nose, comb, beak, feet) keep their colours. The pixel's own offset from its material mean is kept at half
strength so hand-placed markings survive. No new outline, no rim halo: the edge pixels take the ramp like the rest.
    python3 relight.py IN.png OUT.png FW FH"""
import sys, math, colorsys
from PIL import Image

def lum(c): return .299 * c[0] + .587 * c[1] + .114 * c[2]

def ramp(mean):
    """5 tones from a material's mean. Hue shifts go the SHORT way round the wheel: warm hues shade toward red-purple and
    light toward yellow; cool hues shade toward blue; near-greys take a faint purple shade and a faint warm light
    (a linear shift from brown toward blue passes through green: the duck went green-pink)"""
    r, g, b = [v / 255 for v in mean]; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for k in (-2, -1, 0, 1, 2):
        if s < .12:
            hh, ss = (.72, s + .03 * -k) if k < 0 else (.11, s + .025 * k) if k > 0 else (h, s)
        elif h < .17 or h > .9:
            hh = (h - .022 * -k) % 1 if k < 0 else min(.155, h + .014 * k); ss = s * (1 + .1 * -k) if k < 0 else s * (1 - .08 * k)
        else:
            hh = h + .03 * -k if k < 0 else h - .02 * k; ss = s * (1 + .1 * -k) if k < 0 else s * (1 - .08 * k)
        vv = min(1, max(0, v * (1 + .17 * k)))
        rr, gg, bb = colorsys.hsv_to_rgb(hh % 1, min(1, max(0, ss)), vv); out.append((round(rr * 255), round(gg * 255), round(bb * 255)))
    return out


def relight(fr):
    W, H = fr.size; P = fr.load()
    op = [[P[x, y][3] > 0 for x in range(W)] for y in range(H)]
    # materials: cluster colours by hue/value; outline = very dark; accents = clusters with few pixels or high saturation
    cols = {}
    for y in range(H):
        for x in range(W):
            if op[y][x]: cols.setdefault(P[x, y][:3], []).append((x, y))
    def key(c):
        h, s, v = colorsys.rgb_to_hsv(*[q / 255 for q in c])
        return (round(h * 6) % 6 if s > .18 else 9, 0 if v < .5 else 1)
    mats = {}
    for c, pts in cols.items():
        if lum(c) < 48: continue                      # outline
        mats.setdefault(key(c), []).extend([(p, c) for p in pts])
    big = {k: v for k, v in mats.items() if len(v) >= 14}
    # height field: distance to the silhouette edge, capped, then a light blur
    INF = 99; d = [[0 if not op[y][x] else INF for x in range(W)] for y in range(H)]
    for _ in range(6):
        for y in range(H):
            for x in range(W):
                if d[y][x]:
                    m = min(d[yy][xx] if 0 <= xx < W and 0 <= yy < H else 0 for xx, yy in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
                    d[y][x] = min(d[y][x], m + 1)
    hf = [[min(4, d[y][x]) ** .7 for x in range(W)] for y in range(H)]
    L = (-.55, -.65, .52)
    for k, pts in big.items():
        mean = tuple(sum(c[i] for _, c in pts) / len(pts) for i in range(3)); R = ramp(mean); ml = lum(mean)
        for (x, y), c in pts:
            g = lambda xx, yy: hf[yy][xx] if 0 <= xx < W and 0 <= yy < H else 0
            nx = g(x - 1, y) - g(x + 1, y); ny = g(x, y - 1) - g(x, y + 1); nz = 1.4
            n = math.sqrt(nx * nx + ny * ny + nz * nz); lam = (nx * L[0] + ny * L[1] + nz * L[2]) / n
            t = (lam - .45) * 3.2 + (lum(c) - ml) / 38      # light term + half the pixel's own marking
            t += .35 if y < H * .45 else 0                    # the top of a body catches the sky
            P[x, y] = R[max(0, min(4, round(2 + t)))] + (P[x, y][3],)
    return fr

if __name__ == '__main__':
    src, dst, fw, fh = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
    im = Image.open(src).convert('RGBA'); out = im.copy()
    for fy in range(0, im.height, fh):
        for fx in range(0, im.width, fw):
            out.paste(relight(im.crop((fx, fy, fx + fw, fy + fh))), (fx, fy))
    out.save(dst); print('relit', dst)
