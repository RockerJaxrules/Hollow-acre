"""Draws the cracked, taped windshield of the player's car (our own art, matching Part 1's car_beaten.py: a star crack
with five arms and a strip of beige tape just below the impact point).

Writes two textures into unreal/HollowAcre/SourceArt/ (imported by Scripts/build_drive.py):
  T_Windshield.png      RGB colour + alpha coverage (cracks pale, tape beige, clear glass alpha 0)
  T_WindshieldGlint.png grayscale, cracks only: where light catches the broken glass
The image maps to the whole windshield, 150 cm wide (x) by 79 cm along the slope (y, top of the image = roof edge).

Run with any Python 3 that has Pillow:
  python hollow-acre/unreal/tools/make_windshield_tex.py
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'HollowAcre', 'SourceArt')
W, H = 2048, 1080            # about 13.6 px per cm
PX_CM = W / 150.0
IMPACT = (0.66, 0.42)        # passenger side, a little above the middle (as a fraction of width, height)
random.seed(21)


def cm(v):
    return v * PX_CM


def crack_path(x, y, ang, length, depth, out):
    """A jagged crack that wanders and sometimes forks; appends polylines to out."""
    pts = [(x, y)]
    step = cm(1.2)
    n = int(length / step)
    for i in range(n):
        ang += random.gauss(0, 0.16)
        x += math.cos(ang) * step
        y += math.sin(ang) * step
        pts.append((x, y))
        if depth < 3 and random.random() < 0.035:
            crack_path(x, y, ang + random.choice((-1, 1)) * random.uniform(0.5, 1.1), length * random.uniform(0.25, 0.5),
                       depth + 1, out)
    out.append((pts, depth))


def main():
    os.makedirs(OUT, exist_ok=True)
    cx, cy = W * IMPACT[0], H * IMPACT[1]
    lines = []
    # five long arms (as in the pixel car) plus a few short ones
    for k, ang in enumerate((0.3, 1.4, 2.6, 3.7, 5.0)):
        crack_path(cx, cy, ang + random.gauss(0, 0.08), cm(random.uniform(26, 44)), 0, lines)
    for _ in range(7):
        crack_path(cx, cy, random.uniform(0, 6.283), cm(random.uniform(3, 9)), 2, lines)

    glint = Image.new('L', (W, H), 0)
    g = ImageDraw.Draw(glint)
    for pts, depth in lines:
        width = max(1, int(3 - depth))
        g.line(pts, fill=int(235 - depth * 45), width=width, joint='curve')
    # the impact point: a crushed spot with two broken rings around it
    for r, a in ((cm(0.6), 255), (cm(1.6), 170), (cm(2.6), 120)):
        segs = 14
        for s in range(segs):
            if random.random() < 0.3:
                continue
            a0 = 360 * s / segs + random.uniform(-6, 6)
            g.arc([cx - r, cy - r * 0.9, cx + r, cy + r * 0.9], a0, a0 + 360 / segs * random.uniform(0.6, 1.0), fill=a, width=2)
    g.ellipse([cx - cm(0.45), cy - cm(0.4), cx + cm(0.45), cy + cm(0.4)], fill=255)
    glint = glint.filter(ImageFilter.GaussianBlur(0.7))

    # colour + coverage
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = img.load()
    gp = glint.load()
    for y in range(H):
        for x in range(W):
            v = gp[x, y]
            if v:
                px[x, y] = (206, 216, 226, min(255, int(v * 0.85)))

    # the tape: a beige strip just below the impact, slanted, with torn ends and slightly uneven edges
    tape = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    t = ImageDraw.Draw(tape)
    ang = math.radians(19)
    length, width = cm(30), cm(5.0)
    tx, ty = cx - cm(1), cy + cm(5.5)
    ux, uy = math.cos(ang), math.sin(ang)
    vx, vy = -uy, ux
    poly = []
    for i in range(41):  # top edge
        s = -length / 2 + length * i / 40
        e = random.gauss(0, cm(0.06))
        poly.append((tx + ux * s - vx * (width / 2 + e), ty + uy * s - vy * (width / 2 + e)))
    for i in range(9):   # torn right end
        f = -width / 2 + width * i / 8
        poly.append((tx + ux * (length / 2 + random.uniform(-cm(0.5), cm(0.5))) + vx * f, ty + uy * (length / 2) + vy * f))
    for i in range(40, -1, -1):  # bottom edge
        s = -length / 2 + length * i / 40
        e = random.gauss(0, cm(0.06))
        poly.append((tx + ux * s + vx * (width / 2 + e), ty + uy * s + vy * (width / 2 + e)))
    for i in range(8, -1, -1):  # torn left end
        f = -width / 2 + width * i / 8
        poly.append((tx - ux * (length / 2 + random.uniform(-cm(0.5), cm(0.5))) + vx * f, ty - uy * (length / 2) + vy * f))
    t.polygon(poly, fill=(214, 200, 160, 250))
    # paper texture and a slightly darker, lifted edge
    tp = tape.load()
    for y in range(H):
        for x in range(W):
            r, gg, b, a = tp[x, y]
            if a:
                n = random.randint(-9, 9)
                tp[x, y] = (max(0, min(255, r + n)), max(0, min(255, gg + n)), max(0, min(255, b + n)), a)
    edge = tape.split()[3].filter(ImageFilter.FIND_EDGES)
    ep = edge.load()
    for y in range(H):
        for x in range(W):
            if ep[x, y] > 40 and tp[x, y][3]:
                r, gg, b, a = tp[x, y]
                tp[x, y] = (int(r * 0.82), int(gg * 0.82), int(b * 0.8), a)
    img = Image.alpha_composite(img, tape)

    # tape hides the glint under it
    tmask = tape.split()[3]
    glint = Image.composite(Image.new('L', (W, H), 0), glint, tmask)

    img.save(os.path.join(OUT, 'T_Windshield.png'))
    glint.save(os.path.join(OUT, 'T_WindshieldGlint.png'))
    print('wrote', OUT)


if __name__ == '__main__':
    main()
