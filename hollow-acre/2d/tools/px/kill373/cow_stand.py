# the cow standing, roped, her head toward you and her body turned away to the right: the head (front view), her chest with the
# shoulders, the dewlap and the forelegs, and her body (a straight back, the barrel, the hips, the hind legs, the udder, the tail)
import sys, json
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pxk import *

D = os.path.dirname(os.path.abspath(__file__)) + '/'
R = ['#5a4626', '#8a7040', '#b89a5c', '#d8be80']  # rope


def head():
    s = Spr(76, 86, seed=3)
    s.tube([[20, 24], [8, 27], [1.5, 31]], 6, 3.6, base=1.9, gain=2.6)
    s.tube([[56, 24], [68, 27], [74.5, 31]], 5.8, 3.4, base=1.5, gain=2.6)
    s.tube([[25, 15], [17, 9], [14, 2.6]], 4, 1.8, z=3, mat='horn', base=2.4, gain=2.6, notuft=1)
    s.tube([[51, 15], [59, 9], [62, 2.6]], 4, 1.8, z=3, mat='horn', base=2.0, gain=2.6, notuft=1)
    s.dome(38, 24, 22, 14, z=2, top=11, base=2.0, gain=2.8)
    s.tube([[38, 28], [38, 50]], 20, 17.5, z=2, base=1.9, gain=2.8)
    s.dome(23, 49, 10, 13, z=1.6, top=7, base=1.6, gain=2.8)
    s.dome(53, 49, 10, 13, z=1.6, top=7, base=1.3, gain=2.8)
    s.dome(38, 65, 19.5, 12, z=4.8, top=8, mat='nose', base=2.6, gain=2.6, notuft=1)
    img = s.finish(wob=.3, per=6)
    H = MAT['hide']
    # the inside of the ears, pink in their shade
    for (x0, y0, w) in [(3, 29, 6), (4, 30, 4), (67, 29, 6), (68, 30, 4)]: s.px(x0, y0, w, 1, MAT['inner'][1] if y0 == 30 else MAT['inner'][2])
    # the whorl on her brow, where the sledge goes
    s.px(36, 27, 4, 1, H[3]); s.px(35, 28, 1, 2, H[3]); s.px(39, 28, 2, 1, H[3]); s.px(37, 29, 2, 1, H[1]); s.px(36, 26, 3, 1, H[2])
    # the pale ring round the muzzle (a Jersey's)
    for x in range(22, 55):
        y = 52 + round(abs(x - 38) * .12)
        s.px(x, y, 1, 1, H[3] if (x // 5) % 3 else '#dcaa6a')
    # nostrils: two flared, a groove between
    N = MAT['nose']
    s.px(27, 62, 5, 6, '#3a1420'); s.px(27, 61, 5, 1, N[4]); s.px(28, 68, 3, 1, N[1]); s.px(26, 63, 1, 4, N[1])
    s.px(44, 62, 5, 6, '#3a1420'); s.px(44, 61, 5, 1, N[3]); s.px(45, 68, 3, 1, N[1]); s.px(49, 63, 1, 4, N[1]); s.px(38, 64, 1, 6, N[1])
    # the halter: over the nose and up behind the cheeks, its ring under the chin
    for x in range(19, 58):
        y = round(54 + abs(x - 38) * .05); s.px(x, y, 1, 1, R[2]); s.px(x, y + 1, 1, 1, R[1])
    for sg in (-1, 1):
        for y in range(37, 54):
            x = round(38 + sg * (19 + ((y - 37) / 17) * .8)); s.px(x, y, 1, 1, R[2 if sg < 0 else 1]); s.px(x + sg, y, 1, 1, R[0])
    s.px(35, 80, 6, 4, R[1]); s.px(36, 81, 4, 2, '#2a2018'); s.px(35, 80, 6, 1, R[3])
    return s.finish(wob=.3, per=6)


def chest():
    # frame coordinates (320x180); cropped later
    s = Spr(320, 180, seed=5)
    # the neck, from behind her head back to the withers, its top running into her back
    s.blob([(140, 58), (196, 50), (214, 56), (224, 78), (216, 104), (188, 116), (140, 114)], z=0, top=12, R=16, base=1.8, gain=2.6)
    s.dome(133, 117, 15, 18, z=2, top=10, base=2.1)
    s.dome(187, 117, 15, 18, z=2, top=10, base=1.6)
    s.dome(160, 128, 27, 17, z=1, top=12, base=1.7)
    # the forelegs: forearm, the knee proud, the cannon, the fetlock, the hoof
    for (x, b) in ((134, 2.0), (186, 1.5)):
        s.tube([[x - 1, 124], [x, 153]], 10, 6.5, z=3, base=b)
        s.dome(x, 156.5, 7, 5.5, z=4, top=4, mat='leg', base=b + .4)
        s.tube([[x, 160], [x, 170]], 5, 4.5, z=3.5, mat='leg', base=b)
        s.dome(x, 171.5, 5.5, 3, z=4, top=2, mat='leg', base=b + .2)
        s.blob([(x - 6, 173), (x + 6, 173), (x + 7, 180), (x - 7, 180)], z=3, top=2, R=2, mat='hoof', base=b + .6, notuft=1)
    # the dewlap hangs in front of the chest from the throat, folded, its foot wavy
    s.tube([[160, 100], [160, 118], [161, 134]], 8, 11, z=8, z1=10, base=2.3, gain=3.0)
    s.dome(155, 139, 6, 3.6, z=9, top=2.5, base=2.0)
    s.dome(166, 138, 5.5, 3.6, z=9, top=2.5, base=1.7)
    s.finish(wob=.3, per=7)
    H = MAT['hide']
    for x in (134, 186):  # the hoof's cleft and a lit toe
        s.px(x, 174, 1, 6, '#120a0c'); s.px(x - 5, 174, 3, 1, '#6a585c')
    for (x, y0, y1) in ((157, 106, 132), (164, 110, 130)):  # folds down the dewlap
        for y in range(y0, y1): s.px(x + (1 if y > (y0 + y1) // 2 else 0), y, 1, 1, H[1])
    # the crease where the neck meets the shoulder, behind the jaw
    for y in range(86, 110): s.px(round(205 - (y - 86) * .35), y, 1, 1, H[1])
    return s.finish(wob=.3, per=7)


def body():
    s = Spr(320, 180, seed=9)
    s.blob([(186, 60), (270, 55), (282, 64), (284, 108), (270, 138), (236, 150), (200, 146), (182, 130), (176, 96)], z=0, top=16, R=24, base=1.95)
    s.dome(232, 128, 40, 22, z=4, top=10, base=1.8)
    s.dome(272, 88, 24, 33, z=6, top=14, base=2.0)
    s.dome(262, 58, 9, 5, z=10, top=4, base=2.1)
    s.dome(290, 61, 7, 5, z=9, top=3, base=1.9)
    # the far hind leg, behind
    s.tube([[254, 130], [256, 150]], 8, 5, z=2, mat='hided', base=1.2)
    s.tube([[256, 153], [256, 170]], 4, 4, z=2, mat='leg', base=.9)
    s.blob([(250, 172), (262, 172), (263, 178), (249, 178)], z=2, top=2, R=2, mat='hoof', base=1.0, notuft=1)
    # the udder between them
    s.dome(266, 142, 11, 8, z=5, top=6, mat='pink', base=2.4, gain=2.6, notuft=1)
    s.tube([[261, 148], [261, 153]], 1.7, 1.4, z=6, mat='pink', base=2.0, notuft=1)
    s.tube([[269, 149], [269, 154]], 1.7, 1.4, z=6, mat='pink', base=1.8, notuft=1)
    # the near hind leg: the thigh, the hock proud at the back, the cannon, the hoof
    s.tube([[280, 98], [285, 126], [286, 140]], 15, 7, z=8, base=1.7)
    s.dome(287, 145, 6, 5, z=9, top=3, mat='leg', base=1.6)
    s.tube([[286, 149], [285, 169]], 4.5, 4.2, z=8, mat='leg', base=1.4)
    s.dome(285, 170.5, 5, 3, z=9, top=2, mat='leg', base=1.6)
    s.blob([(279, 172), (291, 172), (292, 178), (278, 178)], z=8, top=2, R=2, mat='hoof', base=1.6, notuft=1)
    # the tail, down from the tailhead, a dark switch at its end
    s.tube([[293, 62], [298, 80], [300, 110], [300, 132]], 2.6, 2, z=14, mat='hided', base=1.6, notuft=1)
    s.dome(300, 141, 3.8, 9, z=14, top=3, mat='switch', base=1.6, notuft=1)
    s.finish(wob=.28, per=9)
    H = MAT['hide']
    for y in range(66, 124): s.px(round(222 + math.sin((y - 66) / 58 * math.pi) * 5), y, 1, 1, H[1])
    for y in range(70, 92): s.px(round(250 - math.sin((y - 70) / 22 * math.pi) * 3), y, 1, 1, H[1])
    for x in (256, 285): s.px(x, 173, 1, 5, '#120a0c')
    return s.finish(wob=.28, per=9)


def crop(img):
    a = img[:, :, 3] > 0; ys, xs = np.where(a); x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    return img[y0:y1, x0:x1], int(x0), int(y0)


if __name__ == '__main__':
    hd = head(); ch = chest(); bd = body()
    bg = Image.open(D + 'bg_stun.png').convert('RGBA')
    comp = bg.copy()
    for im, (x, y) in ((bd, (0, 0)), (ch, (0, 0)), (hd, (122, 24))):
        comp.alpha_composite(Image.fromarray(im, 'RGBA'), (x, y))
    comp.save(D + 'stand_1x.png'); comp.resize((960, 540), Image.NEAREST).save(D + 'stand_3x.png')
    grey(comp).resize((960, 540), Image.NEAREST).save(D + 'stand_grey.png')
    out = {}
    for name, im, ox, oy in (('cowF', hd, 0, 0),):
        out[name] = list(encode(im)) + [ox, oy]
    for name, im in (('cowChest', ch), ('cowStand', bd)):
        c, x0, y0 = crop(im); out[name] = list(encode(c)) + [x0, y0]
    json.dump(out, open(D + 'stand.json', 'w'))
    print({k: (v[0], v[1], len(v[2]), len(v[3]), v[4], v[5]) for k, v in out.items()})
