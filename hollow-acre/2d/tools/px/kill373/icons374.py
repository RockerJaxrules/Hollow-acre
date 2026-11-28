# the takings' icons (32x32): feathers, giblets, a raw hide rolled and tied, offal on its paper
import sys, base64, io, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pxk import *
MAT.update({'white': ['#4a4458', '#7e788e', '#b4aec0', '#e4e0e4'], 'giz': ['#3c1828', '#5e2834', '#82404a', '#a8605e'], 'liv': ['#2e0a16', '#4c1420', '#6a2028', '#8c3434'],
            'mh': ['#4e1219', '#741e26', '#962c32', '#b4443f'], 'paper': ['#6a4a2a', '#9a7448', '#c09a68', '#dcc08c'], 'twine': ['#5a4626', '#8a7040', '#b89a5c', '#d8be80'],
            'fatc': ['#8a7458', '#b8a07c', '#dccaa4', '#f0e6cc']})
LIT.update({'white': '#ffffff', 'giz': '#d0a0a0', 'liv': '#b45a4a', 'mh': '#e07a6e', 'paper': '#f0dcae', 'twine': '#f0dca0', 'fatc': '#fff8e8'})

def feathers():
    s = Spr(32, 32, seed=3)
    for (tip, b) in (((7, 6), 2.4), ((24, 5), 1.9), ((15, 3), 2.6)):
        s.tube([(16, 27), ((16 + tip[0]) / 2, (27 + tip[1]) / 2 + 1), tip], 1.3, 3.6, z=1, mat='white', base=b, gain=2.6, notuft=1)
    s.tube([(12, 24), (20, 24)], 1.6, 1.6, z=6, mat='twine', base=2.2, notuft=1)
    s.finish(wob=.1, per=6, minc=2, tufts=False)
    for (tip) in ((7, 6), (24, 5), (15, 3)):
        n = 18
        for i in range(2, n - 2):
            u = i / n; x = round(16 + (tip[0] - 16) * u); y = round(27 + (tip[1] - 27) * u); s.px(x, y, 1, 1, '#8a8496')
    s.px(15, 27, 2, 3, '#b4aec0')
    return s.finish(wob=.1, per=6, minc=2, tufts=False)

def giblets():
    s = Spr(32, 32, seed=5)
    s.dome(20, 21, 7, 5, z=0, top=4, mat='liv', base=2.2, gain=2.6, notuft=1); s.dome(13, 23, 6, 5, z=.5, top=4, mat='liv', base=1.9, gain=2.6, notuft=1)
    s.dome(11, 13, 7, 6, z=2, top=5, mat='giz', base=2.2, gain=2.6, notuft=1)
    s.dome(23, 11, 4.5, 5.5, z=3, top=4, mat='mh', base=2.1, gain=2.6, notuft=1)
    s.finish(wob=.1, per=6, minc=2, tufts=False)
    s.px(7, 13, 7, 1, '#c8ccd8'); s.px(8, 12, 4, 1, '#9aa0b4'); s.px(21, 6, 5, 2, '#dccaa4'); s.px(21, 6, 3, 1, '#f0e6cc'); s.px(23, 10, 1, 5, '#4e1219')
    s.px(17, 19, 4, 1, '#b45a4a')
    return s.finish(wob=.1, per=6, minc=2, tufts=False)

def rawhide():
    s = Spr(32, 32, seed=7)
    pelt = [(13, 3), (19, 3), (20, 7), (27, 5), (30, 9), (24, 12), (25, 19), (30, 23), (28, 27), (21, 25), (18, 30), (14, 30), (11, 25), (4, 27), (2, 23), (7, 19), (8, 12), (2, 9), (5, 5), (12, 7)]
    s.blob(pelt, z=0, top=3, R=6, mat='hide', base=2.0, gain=2.4)
    s.blob([(21, 21), (30, 23), (28, 27), (22, 25)], z=6, top=1.5, R=2, mat='fatc', base=2.4, gain=2.2, notuft=1)
    s.finish(wob=.2, per=5, minc=4)
    for (x0, y0, w, h) in ((12, 11, 6, 4), (11, 15, 9, 3), (14, 18, 5, 3), (9, 20, 3, 2)): s.px(x0, y0, w, h, '#7a3e2a')
    for (x0, y0, w) in ((13, 12, 3), (12, 15, 4)): s.px(x0, y0, w, 1, '#a8663a')
    s.px(22, 22, 4, 1, '#f0e6cc'); s.px(24, 24, 3, 1, '#c46a60')
    return s.finish(wob=.2, per=5, minc=4)

def offal():
    s = Spr(32, 32, seed=9)
    s.blob([(3, 12), (27, 6), (30, 22), (6, 28)], z=0, top=1.5, R=3, mat='paper', base=2.2, gain=2.0, notuft=1)
    s.dome(13, 18, 8, 5.5, z=3, top=4, mat='liv', base=2.2, gain=2.6, notuft=1); s.dome(20, 20, 6, 4.5, z=3.4, top=4, mat='liv', base=1.9, gain=2.6, notuft=1)
    s.dome(21, 12, 5, 6, z=5, top=5, mat='mh', base=2.1, gain=2.6, notuft=1)
    s.finish(wob=.1, per=6, minc=2, tufts=False)
    s.px(18, 6, 6, 2, '#dccaa4'); s.px(18, 6, 4, 1, '#f0e6cc'); s.px(21, 9, 1, 7, '#4e1219'); s.px(9, 16, 4, 1, '#b45a4a')
    for (x, y) in ((6, 14), (26, 9), (8, 26)): s.px(x, y, 3, 1, '#9a7448')
    return s.finish(wob=.1, per=6, minc=2, tufts=False)

if __name__ == '__main__':
    out = {}; sheet = Image.new('RGBA', (4 * 34 * 4, 34 * 4), (40, 30, 24, 255))
    for i, (k, f) in enumerate((('feathers', feathers), ('giblets', giblets), ('rawhide', rawhide), ('offal', offal))):
        im = Image.fromarray(f(), 'RGBA'); b = io.BytesIO(); im.save(b, 'PNG'); out[k] = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
        im.save(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icon32_%s.png' % k)); sheet.alpha_composite(im.resize((128, 128), Image.NEAREST), (i * 136, 4))
    sheet.save(sys.argv[1] if len(sys.argv) > 1 else 'icons374.png'); json.dump(out, open('icons374.json', 'w')); print({k: len(v) for k, v in out.items()})
