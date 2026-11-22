# the cow down on her side, her back away from you, her throat and legs toward you: one barrel, the forelegs folded, the head in
# profile lying on its cheek with the ear flat back along the neck; the hind legs drawn on their own (kicking, then still)
import sys, json
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pxk import *
from cow_stand import crop, R

D = os.path.dirname(os.path.abspath(__file__)) + '/'


def lie():
    s = Spr(320, 180, seed=11)
    H = MAT['hide']
    # the folded forelegs (the far one behind, darker), under the chest
    s.tube([[158, 142], [141, 160]], 8, 5.5, z=0, mat='hided', base=1.2)
    s.dome(139, 162, 5.5, 4.5, z=1, top=3, mat='leg', base=.9)
    s.tube([[142, 165], [158, 171]], 4, 4, z=0, mat='leg', base=.8)
    s.blob([(158, 167), (168, 167), (170, 176), (159, 176)], z=1, top=2, R=2, mat='hoof', base=1.0, notuft=1)
    # the barrel
    s.blob([(150, 70), (262, 64), (280, 74), (286, 100), (280, 128), (262, 140), (220, 152), (178, 150), (150, 142)], z=0, top=18, R=26, base=2.05)
    s.dome(214, 136, 40, 16, z=8, top=8, base=1.7)
    s.dome(166, 104, 24, 32, z=8, top=12, base=2.05)
    s.dome(256, 98, 28, 32, z=8, top=14, base=2.05)
    s.dome(256, 68, 9, 5, z=10, top=4, base=2.2)
    s.dome(279, 74, 7, 5, z=9, top=3, base=1.9)
    # the udder between the hind legs, and the tail laid out on the boards
    s.dome(240, 150, 10, 6.5, z=4, top=5, mat='pink', base=2.4, gain=2.6, notuft=1)
    s.tube([[236, 155], [234, 160]], 1.7, 1.4, z=5, mat='pink', base=2.0, notuft=1)
    s.tube([[244, 156], [243, 161]], 1.7, 1.4, z=5, mat='pink', base=1.8, notuft=1)
    s.tube([[282, 76], [292, 86], [298, 100], [300, 110]], 2.6, 2, z=14, mat='hided', base=1.7, notuft=1)
    s.dome(301, 118, 3.8, 8, z=14, top=3, mat='switch', base=1.6, notuft=1)
    # the near foreleg, folded: the forearm down toward you, the knee, the cannon folded back
    s.tube([[170, 136], [154, 155]], 9, 6, z=10, base=1.9)
    s.dome(152, 157, 6, 5, z=11, top=3, mat='leg', base=1.7)
    s.tube([[155, 160], [174, 165]], 4.5, 4.2, z=10, mat='leg', base=1.5)
    s.dome(175, 165, 4.5, 3.5, z=11, top=2, mat='leg', base=1.6)
    s.blob([(178, 160), (188, 160), (190, 169), (179, 169)], z=10, top=2, R=2, mat='hoof', base=1.7, notuft=1)
    # the neck, short and thick, sloping down from the withers to her head on the boards, the dewlap in folds along its underside
    s.blob([(118, 86), (150, 64), (174, 72), (174, 138), (152, 148), (124, 150), (108, 132)], z=2, top=14, R=18, base=1.9)
    for (cx, cy, rx) in ((122, 148, 8), (138, 151, 9), (156, 151, 8)):
        s.dome(cx, cy, rx, 4, z=12, top=2.5, base=1.6)
    # the head in profile on its cheek, the nose down toward the boards: the poll, the face to a broad muzzle, the heavy jaw,
    # the chin; the horn short, the ear flat back along the neck
    s.tube([[116, 90], [110, 80], [102, 75]], 4, 1.6, z=14, mat='horn', base=2.4, gain=2.6, notuft=1)
    s.dome(108, 101, 18, 16, z=6, top=11, base=2.05)
    s.tube([[102, 106], [78, 120]], 15, 14, z=6, base=2.0)
    s.dome(92, 126, 18, 15, z=5, top=10, base=1.7)
    s.tube([[68, 144], [92, 143]], 5.5, 6, z=4, base=1.4)
    s.dome(66, 128, 15, 15.5, z=8, top=8, mat='nose', base=2.5, gain=2.6, notuft=1)
    s.tube([[122, 94], [138, 88], [154, 91]], 6.5, 3.5, z=16, base=1.7, gain=2.6)
    s.finish(wob=.2, per=10, minc=10)
    # the ear's inside, pink, along its lower edge
    for x in range(126, 152): s.px(x, 93 - (1 if x > 132 else 0) - (1 if x > 140 else 0) + (1 if x > 146 else 0), 1, 2, MAT['inner'][1 if x % 7 else 2])
    # the nostril (a comma), the mouth line and the lower lip
    s.px(55, 119, 4, 6, '#3a1420'); s.px(56, 125, 4, 1, '#3a1420'); s.px(55, 118, 4, 1, MAT['nose'][4]); s.px(59, 120, 1, 4, MAT['nose'][1]); s.px(54, 120, 1, 4, MAT['nose'][2])
    for x in range(53, 86): s.px(x, 139 + (1 if x > 68 else 0), 1, 1, '#2a0e18')
    for x in range(57, 80): s.px(x, 141 + (1 if x > 70 else 0), 1, 1, MAT['nose'][1])
    # the jaw's back edge behind the cheek, and the neck's wrinkles
    for y in range(114, 140): s.px(round(110 + math.sin((y - 114) / 26 * math.pi) * 3), y, 1, 1, H[1])
    for y in range(96, 140): s.px(round(146 + math.sin((y - 96) / 44 * math.pi) * 3), y, 1, 1, H[1])
    # the halter: the noseband round the face behind the muzzle, the cheek strap up behind the eye
    for y in range(108, 146):
        x = round(82 + (y - 108) * -.18); s.px(x, y, 1, 1, R[2]); s.px(x + 1, y, 1, 1, R[1])
    for x in range(82, 118):
        y = round(122 - (x - 82) * .5); s.px(x, y, 1, 1, R[2]); s.px(x, y + 1, 1, 1, R[1])
    s.px(73, 143, 5, 4, R[1]); s.px(74, 144, 3, 2, '#2a2018'); s.px(73, 143, 5, 1, R[3])
    # the shoulder's back edge and the flank's hollow before the hip, as soft creases
    for x0 in (164,): s.px(x0, 171, 1, 6, '#120a0c')
    s.px(183, 161, 1, 8, '#120a0c')
    LT = LIT['hide']
    # the hip point (hook bone) and the pin bone at the rump, lit, a shadow under each
    for (x0, y0, w) in ((251, 64, 8), (250, 65, 10), (252, 66, 6)): s.px(x0, y0, w, 1, LT if y0 == 64 else H[3])
    for x in range(249, 263): s.px(x, 70 + (1 if 252 < x < 260 else 0), 1, 1, H[1])
    for (x0, y0, w) in ((276, 71, 5), (275, 72, 6)): s.px(x0, y0, w, 1, LT if y0 == 71 else H[3])
    for x in range(274, 282): s.px(x, 75, 1, 1, H[1])
    # the shoulder blade's back edge: a lit ridge with its shadow behind it, from the withers down toward the elbow
    for y in range(74, 122):
        x = round(181 + (y - 74) * .12 + math.sin((y - 74) / 48 * math.pi) * 4); f = min(y - 74, 122 - y)
        s.px(x - 1, y, 1, 1, H[3]) if y < 104 else None
        s.px(x, y, 1, 1, H[2] if f < 6 else H[1]); s.px(x + 1, y, 1, 1, H[2]) if f >= 6 else None
    # three ribs showing low on the barrel, uneven, each a little steeper than the one before, lit on their front edge
    for (x0, y0, ln, sl) in ((200, 100, 24, .28), (215, 96, 32, .2), (233, 104, 22, .1)):
        for i in range(ln):
            x = round(x0 - i * sl - math.sin(i / ln * math.pi) * 2); y = y0 + i; f = min(i, ln - 1 - i)
            s.px(x - 1, y, 1, 1, H[3]) if i < ln * .55 else None
            s.px(x, y, 1, 1, H[2] if f < 4 else H[1]); s.px(x + 1, y, 1, 1, H[2]) if f >= 4 else None
    return s.finish(wob=.2, per=10, minc=10)


def legs(f):
    """the hind legs: 0 out, 1 drawn up, 2 kicked, 3 still (settled, lower)"""
    s = Spr(320, 180, seed=21 + f)
    P = [  # stifle, hock, fetlock, hoof angle per pose: up leg, far leg
        [[(250, 128), (274, 150), (294, 160)], [(244, 138), (264, 160), (282, 170)]],
        [[(250, 128), (266, 152), (282, 146)], [(244, 138), (258, 162), (274, 158)]],
        [[(250, 128), (280, 146), (304, 150)], [(244, 138), (270, 158), (292, 166)]],
        [[(250, 128), (274, 152), (293, 165)], [(244, 138), (263, 162), (280, 173)]],
    ][f]
    for i, (st, hk, ft) in enumerate(P[::-1]):
        far = i == 0; b = 1.2 if far else 1.9; m = 'hided' if far else 'hide'
        z = 0 if far else 6
        s.tube([st, hk], 11, 6, z=z, mat=m, base=b)
        s.dome(hk[0], hk[1], 6, 5, z=z + 1, top=3, mat='leg', base=b - .2)
        dx, dy = ft[0] - hk[0], ft[1] - hk[1]; n = math.hypot(dx, dy); ux, uy = dx / n, dy / n
        s.tube([(hk[0] + ux * 3, hk[1] + uy * 3), ft], 4.5, 4.2, z=z, mat='leg', base=b - .4)
        s.dome(ft[0], ft[1], 4.5, 4, z=z + 1, top=2, mat='leg', base=b - .3)
        # the hoof: a wedge past the fetlock, the cleft along it
        hx0, hy0 = ft[0] + ux * 4, ft[1] + uy * 4; px_, py_ = -uy, ux
        poly = [(hx0 + px_ * 5, hy0 + py_ * 5), (hx0 - px_ * 5, hy0 - py_ * 5), (hx0 - px_ * 5 + ux * 9, hy0 - py_ * 5 + uy * 9), (hx0 + px_ * 6 + ux * 8, hy0 + py_ * 6 + uy * 8)]
        s.blob(poly, z=z, top=2, R=2, mat='hoof', base=b - .2, notuft=1)
        s.cleft = getattr(s, 'cleft', []) + [(hx0 + ux * 2, hy0 + uy * 2, ux, uy)]
    s.finish(wob=.3, per=8)
    for (x, y, ux, uy) in s.cleft:
        for k in range(7): s.px(round(x + ux * k), round(y + uy * k), 1, 1, '#120a0c')
    return s.finish(wob=.3, per=8)


if __name__ == '__main__':
    body = lie(); L4 = [legs(f) for f in range(4)]
    bg = Image.open(D + 'bg_stun.png').convert('RGBA')
    frames = []
    for f in (0, 2, 3):
        comp = bg.copy(); comp.alpha_composite(Image.fromarray(L4[f], 'RGBA')); comp.alpha_composite(Image.fromarray(body, 'RGBA')); frames.append(comp)
    frames[0].resize((960, 540), Image.NEAREST).save(D + 'lie_3x.png'); grey(frames[0]).resize((960, 540), Image.NEAREST).save(D + 'lie_grey.png')
    sh = Image.new('RGB', (640, 360)); [sh.paste(fr.convert('RGB'), ((i % 2) * 320, (i // 2) * 180)) for i, fr in enumerate(frames)]; sh.resize((1280, 720), Image.NEAREST).save(D + 'lie_poses.png')
    out = {}
    c, x0, y0 = crop(body); out['cowLie'] = list(encode(c)) + [x0, y0]
    for f in range(4):
        c, x0, y0 = crop(L4[f]); out['cowLeg%d' % f] = list(encode(c)) + [x0, y0]
    json.dump(out, open(D + 'lie.json', 'w'))
    print({k: (v[0], v[1], len(v[2]), len(v[3]), v[4], v[5]) for k, v in out.items()})
