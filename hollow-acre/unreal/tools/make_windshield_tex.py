"""Draws the player's windshield (our own art). By the ending the car is fixed and has new glass (Part 1 puts it in),
so the drive's windshield is clean glass with the blizzard on it: snow crusted along the bottom and in the corners where
the two wipers don't reach, and a faint haze. Part 2's crash cracks it: laminated glass breaks into a spider web round
the impact and long cracks across, and stays in its frame.

Writes into unreal/HollowAcre/SourceArt/ (imported by Scripts/build_drive.py):
  T_Windshield.png          the clean glass: RGB colour + alpha coverage (the crusted snow, the haze)
  T_WindshieldGlint.png     grayscale: where light catches (the snow's edge)
  T_WindshieldCrash.png     the cracked glass (RGB + alpha), drawn over the clean one when the car rolls
  T_WindshieldCrashGlint.png  the cracks catching light
  T_WindshieldHit.png       one spider-web crack round a blow, centred, 90 x 90 cm (grayscale: the crack lines);
                            placed on the glass wherever the creature strikes it, and spread out from there
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
IMPACT = (0.3, 0.2)          # the crash: the driver's side, high (the roof's edge hit the ground first)
WIPERS = ((0.38, 1.04), (0.727, 1.04))   # the wiper spindles (fraction of width, height: just below the glass)
SWEEP = 0.355                # each blade wipes out to about this radius (fraction of the width, 53 cm)
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


def clean():
    """The new glass in a blizzard: the wiped arcs clear, crusted snow outside them (thick along the bottom edge and in
    the corners, ragged where the blade stops), a faint haze of melt over the rest."""
    import numpy as np
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = xx / W, yy / H
    asp = H / W
    wiped = np.zeros((H, W), bool)
    for px_, py_ in WIPERS:
        d = np.hypot(u - px_, (v - py_) * asp)
        wiped |= (d < SWEEP) & (v < py_)
    rng = np.random.default_rng(31)

    def noise(scale, seed):
        g = np.random.default_rng(seed).random((int(H / scale) + 2, int(W / scale) + 2)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((W + int(scale), H + int(scale)), Image.BICUBIC)
        return np.asarray(im, np.float32)[:H, :W] / 255.0
    n = 0.55 * noise(90, 1) + 0.3 * noise(30, 2) + 0.15 * noise(8, 3)
    # outside the arcs the snow builds up, more toward the edges of the glass and the bottom
    edge = np.clip(1 - np.minimum.reduce([u, 1 - u, (1 - v) * 1.6, v * 2.5]) * 6, 0, 1)
    bottom = np.clip((v - 0.86) / 0.14, 0, 1)
    crust = np.where(wiped, 0.0, np.clip(0.25 + 0.75 * edge + bottom, 0, 1)) * (0.65 + 0.5 * n)
    crust = np.where(crust > 0.42, np.clip(crust, 0, 1), crust * 0.25)   # a crust with a ragged edge, not a gradient
    haze = 0.035 + 0.03 * n
    alpha = np.clip(np.maximum(crust, haze), 0, 1)
    col = np.stack([np.full_like(u, 222), np.full_like(u, 228), np.full_like(u, 236)], -1) * (0.9 + 0.1 * n[..., None])
    rgba = np.concatenate([col, (alpha * 255)[..., None]], -1).clip(0, 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, 'T_Windshield.png'))
    edge_glint = Image.fromarray((np.clip(crust, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1.2))
    edge_glint.save(os.path.join(OUT, 'T_WindshieldGlint.png'))


def main():
    os.makedirs(OUT, exist_ok=True)
    clean()
    cx, cy = W * IMPACT[0], H * IMPACT[1]
    lines = []
    # laminated glass: many radial cracks from the impact (a spider web), rings round it, long cracks running across
    for k in range(14):
        crack_path(cx, cy, 6.283 * k / 14 + random.gauss(0, 0.12), cm(random.uniform(20, 70)), 0, lines)
    for _ in range(18):
        crack_path(cx, cy, random.uniform(0, 6.283), cm(random.uniform(4, 14)), 2, lines)
    for _ in range(5):
        crack_path(random.uniform(0.2, 0.9) * W, random.uniform(0.5, 0.95) * H, random.uniform(-0.6, 0.6) + random.choice((0, 3.14)), cm(random.uniform(30, 60)), 1, lines)

    glint = Image.new('L', (W, H), 0)
    g = ImageDraw.Draw(glint)
    for pts, depth in lines:
        width = max(1, int(3 - depth))
        g.line(pts, fill=int(235 - depth * 45), width=width, joint='curve')
    # the impact point: a crushed spot with two broken rings around it
    for r, a in ((cm(1.5), 255), (cm(4), 200), (cm(7.5), 160), (cm(12), 120), (cm(18), 90)):
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

    img.save(os.path.join(OUT, 'T_WindshieldCrash.png'))
    glint.save(os.path.join(OUT, 'T_WindshieldCrashGlint.png'))
    hit()
    print('wrote', OUT)


HIT_CM = 90.0                # T_WindshieldHit.png covers 90 x 90 cm of glass, the blow in the middle
HIT_PX = 1024


def hit():
    """A blow on laminated glass (the creature's head, its claw): a crushed white star where it struck, radial cracks
    running out from it (a few long, most short), broken rings round it; the glass holds. Grayscale crack lines, the
    blow at the centre; the material spreads it out from there (as far as its radius has grown) and places it."""
    rnd = random.Random(57)
    px = HIT_PX / HIT_CM
    c = HIT_PX / 2.0
    lines = []

    def path(x, y, ang, length, depth):
        pts = [(x, y)]
        step = 1.0 * px
        for _ in range(int(length / step)):
            ang += rnd.gauss(0, 0.14)
            x += math.cos(ang) * step
            y += math.sin(ang) * step
            pts.append((x, y))
            if depth < 3 and rnd.random() < 0.04:
                path(x, y, ang + rnd.choice((-1, 1)) * rnd.uniform(0.5, 1.0), length * rnd.uniform(0.2, 0.45) * (1 - len(pts) * step / max(length, 1)), depth + 1)
        lines.append((pts, depth))
    n = 15
    for k in range(n):
        long_ = rnd.random() < 0.35
        path(c, c, 6.283 * k / n + rnd.gauss(0, 0.15), (rnd.uniform(26, 42) if long_ else rnd.uniform(9, 22)) * px, 0)
    for _ in range(46):
        path(c, c, rnd.uniform(0, 6.283), rnd.uniform(1.5, 8) * px, 2)
    img = Image.new('L', (HIT_PX, HIT_PX), 0)
    g = ImageDraw.Draw(img)
    # (bold enough to read from the driver's seat: the cracks catch the light as white lines a few millimetres wide)
    for pts, depth in lines:
        g.line(pts, fill=int(250 - depth * 30), width=max(2, int(6 - depth * 1.3)), joint='curve')
    for r, a in ((0.9, 255), (1.7, 240), (2.6, 220), (3.7, 200), (5.0, 175), (6.6, 150), (8.6, 125), (11.5, 100), (15.0, 80)):
        segs = 14
        for k in range(segs):
            if rnd.random() < 0.35:
                continue
            a0 = 360 * k / segs + rnd.uniform(-8, 8)
            R = r * px
            g.arc([c - R, c - R * 0.92, c + R, c + R * 0.92], a0, a0 + 360 / segs * rnd.uniform(0.55, 1.0), fill=min(255, a + 40), width=3)
    # the crushed zone round the blow: the glass powdered white between a mesh of tiny cracks (laminated glass holds it)
    for _ in range(140):
        r0, a0 = abs(rnd.gauss(0, 2.2)) * px, rnd.uniform(0, 6.283)
        path(c + math.cos(a0) * r0, c + math.sin(a0) * r0, rnd.uniform(0, 6.283), rnd.uniform(0.6, 2.4) * px, 3)
    for pts, depth in lines[-140:]:
        g.line(pts, fill=230, width=2, joint='curve')
    haze = Image.new('L', (HIT_PX, HIT_PX), 0)
    hd = ImageDraw.Draw(haze)
    for _ in range(900):
        r0, a0 = abs(rnd.gauss(0, 3.0)) * px, rnd.uniform(0, 6.283)
        x0, y0 = c + math.cos(a0) * r0, c + math.sin(a0) * r0
        e = rnd.uniform(0.2, 0.8) * px
        hd.ellipse([x0 - e, y0 - e, x0 + e, y0 + e], fill=int(rnd.uniform(110, 210)))
    haze = haze.filter(ImageFilter.GaussianBlur(2.5))
    img = Image.fromarray(__import__('numpy').maximum(__import__('numpy').asarray(img), __import__('numpy').asarray(haze)))
    g = ImageDraw.Draw(img)
    g.ellipse([c - 0.9 * px, c - 0.8 * px, c + 0.9 * px, c + 0.8 * px], fill=255)      # the crushed spot
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    # nothing at the edge (the material clamps the texture: past it, no cracks)
    border = Image.new('L', (HIT_PX, HIT_PX), 0)
    ImageDraw.Draw(border).rectangle([4, 4, HIT_PX - 5, HIT_PX - 5], fill=255)
    img = Image.composite(img, Image.new('L', (HIT_PX, HIT_PX), 0), border)
    img.save(os.path.join(OUT, 'T_WindshieldHit.png'))


if __name__ == '__main__':
    main()
