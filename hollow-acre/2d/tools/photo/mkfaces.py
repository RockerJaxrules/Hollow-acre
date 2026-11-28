# Synthetic test portraits for the photo-to-character feature: painted heads, never real people. Each one is shaded like a lit
# head (soft gradients, a nose shadow, eye whites, irises and pupils) so a face detector trained on photos can find it, and
# each has a known answer (skin, hair colour and style, beard, glasses, eye colour) for the test to check.
# python3 mkfaces.py OUTDIR
import json, math, os, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SET2 = len(sys.argv) > 2 and sys.argv[2] == 'set2'
W, H = 768, 1024
SKIN = {'pale': (241, 214, 196), 'light': (226, 184, 150), 'tan': (198, 148, 110), 'olive': (176, 130, 92), 'brown': (140, 94, 62), 'dark': (92, 60, 42)}
HAIR = {'black': (24, 20, 20), 'darkbrown': (58, 38, 26), 'brown': (110, 72, 44), 'blonde': (214, 178, 112), 'red': (150, 58, 30), 'grey': (168, 166, 164)}
EYES = {'brown': (92, 56, 30), 'blue': (70, 120, 180), 'green': (80, 130, 78), 'grey': (120, 130, 140)}
CASES = [
    dict(id='t01', skin='light', hair='brown', style='short', beard=False, glasses=False, eye='blue', bg=(70, 90, 110)),
    dict(id='t02', skin='dark', hair='black', style='curly', beard=True, glasses=False, eye='brown', bg=(200, 200, 190)),
    dict(id='t03', skin='pale', hair='red', style='long', beard=False, glasses=True, eye='green', bg=(120, 140, 100)),
    dict(id='t04', skin='tan', hair='darkbrown', style='medium', beard=False, glasses=False, eye='brown', bg=(40, 40, 50)),
    dict(id='t05', skin='olive', hair='black', style='short', beard=True, glasses=True, eye='brown', bg=(150, 160, 170)),
    dict(id='t06', skin='light', hair='blonde', style='long', beard=False, glasses=False, eye='blue', bg=(90, 60, 70)),
    dict(id='t07', skin='brown', hair='black', style='bald', beard=True, glasses=False, eye='brown', bg=(180, 170, 150)),
    dict(id='t08', skin='pale', hair='grey', style='short', beard=True, glasses=True, eye='grey', bg=(60, 80, 70)),
]

def blend(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)

def face(case, seed):
    global W, H
    W, H = case.get('wh', (768, 1024))
    rnd = random.Random(seed)
    im = Image.new('RGB', (W, H), case['bg'])
    # a soft vertical light on the background
    bg = np.array(im).astype(float); g = np.linspace(1.12, .82, H)[:, None, None]; im = Image.fromarray(np.clip(bg * g, 0, 255).astype('uint8'))
    d = ImageDraw.Draw(im)
    cx, cy = W // 2 + rnd.randint(-30, 30), int(H * .44) + rnd.randint(-20, 20)
    fw, fh = int(250 * case.get('size', 1)), int(330 * case.get('size', 1))
    skin, hair = SKIN[case['skin']], HAIR[case['hair']]
    st = case['style']
    # hair behind the head (long and medium fall past the jaw)
    if st == 'long':
        d.rounded_rectangle([cx - fw * .78, cy - fh * .72, cx + fw * .78, cy + fh * 1.05], 120, fill=shade(hair, .9))
    elif st == 'medium':
        d.rounded_rectangle([cx - fw * .74, cy - fh * .72, cx + fw * .74, cy + fh * .42], 110, fill=shade(hair, .9))
    elif st == 'curly':
        for k in range(70):
            a = rnd.uniform(math.pi * .95, math.pi * 2.05); r = rnd.uniform(.55, .78)
            x = cx + math.cos(a) * fw * r * 1.25; y = cy - fh * .12 + math.sin(a) * fh * r * .95; rr = rnd.randint(34, 56)
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=shade(hair, rnd.uniform(.8, 1.1)))
    # a bald head still has its crown: the skull rises above the forehead
    if st == 'bald':
        d.ellipse([cx - fw * .52, cy - fh * .74, cx + fw * .52, cy + fh * .1], fill=shade(skin, .97))
    # neck and shoulders
    d.rectangle([cx - fw * .28, cy + fh * .35, cx + fw * .28, cy + fh * .75], fill=shade(skin, .82))
    d.ellipse([cx - fw * 1.3, cy + fh * .62, cx + fw * 1.3, cy + fh * 1.6], fill=(60, 70, 90) if case['bg'][0] > 120 else (170, 60, 50))
    # long hair falls in front of the shoulders
    if st == 'long':
        for s_ in (-1, 1):
            d.rounded_rectangle(sorted([cx + s_ * fw * .42, cx + s_ * fw * .8]) [0:1] + [cy + fh * .1] + sorted([cx + s_ * fw * .42, cx + s_ * fw * .8])[1:2] + [cy + fh * 1.1], 40, fill=shade(hair, .95))
    # the face: an oval, lit from the upper left
    lay = Image.new('L', (W, H), 0); ImageDraw.Draw(lay).ellipse([cx - fw / 2, cy - fh / 2, cx + fw / 2, cy + fh / 2], fill=255)
    col = Image.new('RGB', (W, H), skin); arr = np.array(col).astype(float)
    yy, xx = np.mgrid[0:H, 0:W]; lit = 1.08 - .28 * np.clip(((xx - cx) / fw + (yy - cy) / fh * .6) + .2, 0, 1)
    arr = np.clip(arr * lit[..., None], 0, 255).astype('uint8'); im.paste(Image.fromarray(arr), (0, 0), lay)
    # the shading a lit face has: eye sockets, the sides of the nose, under the nose, under the lip, the jaw's edge
    sh = Image.new('L', (W, H), 0); sd = ImageDraw.Draw(sh); ey0 = cy - fh * .06
    for s_ in (-1, 1): sd.ellipse([cx + s_ * fw * .2 - 46, ey0 - 40, cx + s_ * fw * .2 + 46, ey0 + 26], fill=120)
    sd.rectangle([cx - 24, ey0, cx - 10, cy + fh * .16], fill=70); sd.rectangle([cx + 10, ey0, cx + 24, cy + fh * .16], fill=50)
    sd.ellipse([cx - 40, cy + fh * .19, cx + 40, cy + fh * .25], fill=110); sd.ellipse([cx - 34, cy + fh * .35, cx + 34, cy + fh * .4], fill=90)
    sd.arc([cx - fw / 2 + 6, cy - fh / 2 + 6, cx + fw / 2 - 6, cy + fh / 2 - 6], 20, 160, fill=140, width=26)
    for s_ in (-1, 1): sd.ellipse([cx + s_ * fw * .5 - 30, cy - fh * .25, cx + s_ * fw * .5 + 30, cy + fh * .25], fill=90)
    sh = sh.filter(ImageFilter.GaussianBlur(14)); dark = Image.new('RGB', (W, H), shade(skin, .55)); face_mask = lay.filter(ImageFilter.GaussianBlur(2))
    from PIL import ImageChops
    im.paste(dark, (0, 0), ImageChops.multiply(sh, face_mask))
    d = ImageDraw.Draw(im)
    # hair on top (none when bald), a fringe line for short hair
    if st in ('short', 'medium', 'long'):
        d.chord([cx - fw * .58, cy - fh * .66, cx + fw * .58, cy - fh * .02], 180, 360, fill=hair)
        d.rectangle([cx - fw * .56, cy - fh * .34, cx - fw * .44, cy - fh * .02], fill=hair); d.rectangle([cx + fw * .44, cy - fh * .34, cx + fw * .56, cy - fh * .02], fill=hair)
    elif st == 'curly':
        for k in range(26):
            x = cx + rnd.uniform(-.5, .5) * fw; y = cy - fh * .44 + rnd.uniform(-.12, .08) * fh; rr = rnd.randint(26, 40)
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=shade(hair, rnd.uniform(.85, 1.1)))
    # brows, eyes (whites, iris, pupil, a catch light), nose shadow, mouth
    ey = cy - fh * .06; ex = fw * .2
    brow = shade(hair if st != 'bald' else (60, 40, 30), .9)
    for s in (-1, 1):
        x = cx + s * ex
        d.line([x - 30, ey - 34 + (4 if s < 0 else 0), x + 30, ey - 36], fill=brow, width=9)
        d.ellipse([x - 28, ey - 12, x + 28, ey + 12], fill=(222, 214, 204))
        d.ellipse([x - 13, ey - 13, x + 13, ey + 13], fill=EYES[case['eye']])
        d.ellipse([x - 6, ey - 6, x + 6, ey + 6], fill=(12, 10, 10))
        d.ellipse([x + 2, ey - 6, x + 6, ey - 2], fill=(250, 250, 250))
        d.arc([x - 31, ey - 15, x + 31, ey + 15], 190, 350, fill=shade(skin, .45), width=3)
    d.polygon([(cx - 6, ey + 10), (cx - 22, cy + fh * .17), (cx + 12, cy + fh * .19)], fill=shade(skin, .8))
    d.ellipse([cx - 22, cy + fh * .15, cx + 22, cy + fh * .21], fill=shade(skin, .72))
    my = cy + fh * .29
    d.chord([cx - 46, my - 14, cx + 46, my + 16], 0, 180, fill=(150, 62, 62)); d.line([cx - 46, my, cx + 46, my], fill=(90, 40, 40), width=3)
    if case['beard']:
        bl = Image.new('L', (W, H), 0); bd = ImageDraw.Draw(bl)
        bd.chord([cx - fw * .5, cy - fh * .05, cx + fw * .5, cy + fh * .56], 0, 180, fill=255)
        bd.ellipse([cx - 52, my - 16, cx + 52, my + 18], fill=0)
        im.paste(Image.new('RGB', (W, H), shade(hair if st != 'bald' else HAIR['black'], 1.0)), (0, 0), bl.filter(ImageFilter.GaussianBlur(3)))
        d = ImageDraw.Draw(im); d.chord([cx - 46, my - 14, cx + 46, my + 16], 0, 180, fill=(140, 58, 58))
    if case['glasses']:
        fr = (30, 28, 32)
        for s in (-1, 1):
            x = cx + s * ex; d.rounded_rectangle([x - 44, ey - 30, x + 44, ey + 30], 14, outline=fr, width=7)
        d.line([cx - ex + 44, ey - 6, cx + ex - 44, ey - 6], fill=fr, width=7)
        d.line([cx - ex - 44, ey - 10, cx - fw * .5, ey - 14], fill=fr, width=6); d.line([cx + ex + 44, ey - 10, cx + fw * .5, ey - 14], fill=fr, width=6)
    im = im.filter(ImageFilter.GaussianBlur(1.6))
    # a little sensor noise, like a phone photo
    a = np.array(im).astype(float) + np.random.default_rng(seed).normal(0, 3.5, (H, W, 3))
    case['_geo'] = dict(cx=cx, cy=cy, fw=fw, fh=fh, eye_y=round(ey), eye_dx=round(ex), mouth_y=round(my))
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

if SET2:
    CASES = [
        dict(id='h01', skin='tan', hair='black', style='long', beard=False, glasses=False, eye='brown', bg=(210, 205, 200), size=.8, wh=(1024, 768)),
        dict(id='h02', skin='pale', hair='blonde', style='short', beard=True, glasses=False, eye='blue', bg=(50, 70, 60), size=1.15),
        dict(id='h03', skin='brown', hair='darkbrown', style='medium', beard=False, glasses=True, eye='brown', bg=(140, 120, 100), size=.9),
        dict(id='h04', skin='light', hair='red', style='short', beard=True, glasses=False, eye='green', bg=(30, 30, 35), size=1.0, wh=(900, 900)),
        dict(id='h05', skin='dark', hair='grey', style='bald', beard=True, glasses=True, eye='brown', bg=(100, 110, 140), size=.95),
        dict(id='h06', skin='olive', hair='brown', style='curly', beard=False, glasses=False, eye='green', bg=(190, 180, 120), size=.85),
    ]
answers = {}
for k, c in enumerate(CASES):
    face(c, (500 if SET2 else 100) + k).save(os.path.join(OUT, c['id'] + '.jpg'), quality=88)
    answers[c['id']] = {x: c[x] for x in ('skin', 'hair', 'style', 'beard', 'glasses', 'eye', '_geo')}
json.dump(answers, open(os.path.join(OUT, 'answers.json'), 'w'), indent=1)
print('made', len(CASES))
