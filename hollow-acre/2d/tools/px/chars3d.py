"""Characters through the blockout method (prototype): a 3D chibi built from the same look descriptions as
chibi3.js (skin, hair style and colour, outfit, colours, accessories, allure), rendered at 30 degrees in 48x64 frames,
then hand-finished: crisp eyes, lashes and mouth are painted on after the render (the parts that go to mush in 3D).

    python3 chars3d.py june          -> chars3d_gen/june_proto.png (4 facings standing + a walk cycle)
"""
import sys, os, json, math, subprocess, colorsys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from blockprops import POOL
GEN = os.path.join(HERE, 'blockouts', 'chars'); OUT = os.path.join(HERE, 'chars3d_gen'); os.makedirs(GEN, exist_ok=True); os.makedirs(OUT, exist_ok=True)
ELEV = 12   # characters are drawn nearly face-on (the LPC / Stardew convention), the world at 30
CY = math.cos(math.radians(ELEV)); SY = math.sin(math.radians(ELEV))


def Y(v): return v / CY


def ramp(hexc, n=5):
    """a hue-shifted ramp round a base colour: shades sink toward purple, lights warm toward yellow"""
    r, g, b = (int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)); h, l, s = colorsys.rgb_to_hls(r, g, b)
    out = []
    for k in range(n):
        t = (k - 2) / 2   # -1 .. 1, base in the middle
        hh = (h + (-.035 if t < 0 else .03) * abs(t)) % 1; ll = max(.03, min(.95, l + t * (.22 if t < 0 else .16))); ss = max(0, min(1, s * (1 + .1 * t)))
        rr, gg, bb = colorsys.hls_to_rgb(hh, ll, ss); out.append('#%02x%02x%02x' % (int(rr * 255), int(gg * 255), int(bb * 255)))
    return out


LOOKS = {   # the same descriptions the 2D generator uses (chibi.py / chibi3.py)
    # Caitlyn (id 'mae'), from her own photos: blonde with pink lengths, square black glasses, a black tank top, jeans, white sneakers
    'mae': dict(skin='#f3d2b8', hair='#e2c27e', hairTip='#e58fb0', hairStyle='long', outfit='tank', shirt='#1e1c22', pants='#7a96bc', shoes='#e8e4dc',
                glasses='square', accessory='necklace', acc='#3a3238', eye='#6a8aa4', allure=1),
    'june': dict(skin='#f0c4a0', hair='#c86a2a', hairStyle='wavy', outfit='shirt', shirt='#3e5e90', pants='#4a4a5a', shoes='#3a2618',
                 hat='cap', hatColor='#3a5a8a', accessory='necklace', acc='#e8c860', eye='#3a5a7a', allure=1),
}


def capsule(a, b, r0, r1, m, **k): return dict(type='branch', a=a, b=b, r0=r0, r1=r1, mat=m, **k)
def ell(c, rr, m, **k): return dict(type='ellipsoid', c=c, rr=rr, mat=m, **k)
def sph(c, r, m, **k): return dict(type='sphere', c=c, r=r, mat=m, **k)
def box(mn, mx, m, **k): return dict(type='box', min=mn, max=mx, mat=m, **k)


def body(L, phase=0.0, walking=False):
    """the figure facing +z (south). phase 0..1 through a walk cycle"""
    A = bool(L.get('allure')); P = []
    sw = math.sin(phase * 2 * math.pi) if walking else 0; bob = abs(math.cos(phase * 2 * math.pi)) * .8 if walking else 0
    hip = Y(11.5) + bob
    for s in (-1, 1):   # legs swing from the hip, feet stay flat
        ang = s * sw * .45; fx, fz = s * 2.8, math.sin(ang) * Y(12) * .9
        knee = [s * 3.1, hip - Y(5), fz * .5 + 1]; ankle = [fx, Y(2.2) + max(0, -s * sw) * 1.2, fz]
        P += [capsule([s * 3.1, hip, 0], knee, 3.0, 2.6, 'pants'), capsule(knee, ankle, 2.6, 2.2, 'pants'),
              ell([fx, Y(1.4) + max(0, -s * sw) * 1.2, fz + 1.2], [2.7, 1.7, 3.6], 'shoes')]
    # the torso: hips, a narrower waist, the chest
    P += [ell([0, hip + Y(1.5), 0], [6.9 if A else 6.4, Y(3.6), 4.3], 'pants'),
          ell([0, hip + Y(6.3), 0], [5.6 if A else 6.0, Y(4.0), 3.9], 'shirt'),
          ell([0, hip + Y(10.8), .3], [7.0, Y(3.6), 4.3], 'shirt')]
    neck_y = hip + Y(14.0)
    if A:   # a young adult woman: the bust under a low neckline, skin above it, a clear cleavage
        for s in (-1, 1):
            P.append(sph([s * 2.6, hip + Y(10.7), 3.2], 3.0, 'skin'))
            # the top covers the lower half of each curve: a cup of cloth cut by the neckline plane
            P.append(sph([s * 2.6, hip + Y(10.6), 3.3], 3.2, 'shirt', planes=[[s * .25, 1, .15, -.35]]))
        P.append(ell([0, hip + Y(12.0), 1.9], [4.6, Y(2.3), 2.5], 'skin'))                              # the chest above the neckline
        P.append(capsule([0, hip + Y(9.6), 5.9], [0, hip + Y(11.1), 5.5], .55, .45, 'crease'))            # cleavage
    P.append(capsule([0, neck_y - 1, 0], [0, neck_y + Y(3.4), -.2], 2.1, 2.0, 'skin'))
    # arms swing against the legs
    for s in (-1, 1):
        ang = -s * sw * .5; sh = [s * 7.4, hip + Y(12.4), 0]
        el = [s * 8.2, hip + Y(7.2), math.sin(ang) * 3.2]; hd = [s * 8.6, hip + Y(2.6), math.sin(ang) * 6]
        tank = L.get('outfit') == 'tank'
        if tank: P.append(capsule([s * 3.2, hip + Y(12.4), 2.6], [s * 4.6, hip + Y(14.2), .5], .7, .7, 'shirt'))   # a strap over the shoulder
        P += [capsule(sh, el, 2.4, 2.1, 'skin' if tank else 'shirt'), capsule(el, hd, 2.0, 1.8, 'shirt' if L.get('outfit') in ('shirt', 'sweater', 'jacket') else 'skin'),
              sph(hd, 2.2, 'skin')]
    # the head: big, round, chibi
    hc = [0, neck_y + Y(10.9), .4]; P.append(sph(hc, 9.7, 'skin'))
    for s in (-1, 1): P.append(ell([s * 9.6, hc[1] - 1, .8], [1.4, 2.2, 1.6], 'skin'))                    # ears
    # hair: a cap over the skull that leaves the face, bangs, long waves down the back and over the shoulders
    P.append(sph([0, hc[1] + 1.2, hc[2] - 1], 10.9, 'hair', planes=[[0, -.62, .78, 2.2]]))          # leaves the whole face clear
    P.append(ell([1.5, hc[1] + 6.4, 6.6], [7.2, 2.4, 3.0], 'hair', lumps=.5, lumpfreq=1.1))                 # a sweep of bangs
    style = L.get('hairStyle', 'short')
    if style in ('wavy', 'long'):
        P += [ell([0, hc[1] - 9, hc[2] - 6], [8.6, 12, 3.6], 'hair', lumps=.9, lumpfreq=.9),
              ell([-9.6, hc[1] - 10, hc[2] - 2.5], [2.4, 10, 2.6], 'hair', lumps=.8, lumpfreq=1.0),
              ell([9.6, hc[1] - 10, hc[2] - 2.5], [2.4, 10, 2.6], 'hair', lumps=.8, lumpfreq=1.0)]
        if L.get('hairTip'):   # the coloured lengths: the ends of the hair, a little fuller than the hair above them
            P += [ell([0, hc[1] - 15, hc[2] - 6.2], [8.9, 7.0, 4.0], 'hairtip', lumps=.7, lumpfreq=1.0),       # the lower half, from the shoulders down
                  ell([-9.6, hc[1] - 15.5, hc[2] - 2.5], [2.8, 6.0, 3.0], 'hairtip', lumps=.6, lumpfreq=1.0),
                  ell([9.6, hc[1] - 15.5, hc[2] - 2.5], [2.8, 6.0, 3.0], 'hairtip', lumps=.6, lumpfreq=1.0)]
    if L.get('hat') == 'cap':
        P += [sph([0, hc[1] + 3.2, hc[2] - 1.2], 11.0, 'hat', planes=[[0, -1, 0, -3.4]]),
              ell([0, hc[1] + 6.9, hc[2] + 9.4], [6.8, .8, 3.6], 'hat')]                                    # a short brim, above the eyes
    if L.get('accessory') == 'necklace':
        P.append(dict(type='torus', c=[0, neck_y - Y(1.4), 2.8], R=3.2, r=.45, mat='acc'))
    return P


def render_frame(name, L, yaw, phase, walking, tag):
    parts = body(L, phase, walking)
    ramps = {'skin': ramp(L['skin'])[:4] + [ramp(L['skin'])[3]], 'hair': [ramp(L['hair'])[0]] + ramp(L['hair'])[:4], 'shirt': ramp(L['shirt']), 'pants': ramp(L['pants']), 'shoes': ramp(L['shoes']),
             'hairtip': [ramp(L.get('hairTip', L['hair']))[0]] + ramp(L.get('hairTip', L['hair']))[:4],
             'hat': [ramp(L.get('hatColor', '#5a4a3a'))[0]] + ramp(L.get('hatColor', '#5a4a3a'))[:4], 'acc': ramp(L.get('acc', '#e8c860')), 'crease': ramp('#8a4a3a')}
    used = []
    for p in parts:
        if p['mat'] not in used: used.append(p['mat'])
    mats, pal, k = {}, {}, 0
    for m in used:
        ch = POOL[k:k + 5]; k += 5; mats[m] = {'chars': ch, 'ambient': .3 if m != 'hair' else .2, 'shade': .35 if m != 'hair' else .5}; pal.update(dict(zip(ch, ramps[m])))
    pal['s'] = '#32212566'
    W, H = 48, 64; scene = {'size': [W, H], 'origin': [24, 60], 'elev': ELEV, 'materials': mats, 'palette': pal, 'shapes': parts, 'gamma': 1.0,
                            'light': [-.4, 1, .55], 'shadow_light': [0, 1, 0], 'rotate': {'yaw': yaw}}
    sp = os.path.join(GEN, f'{name}_{tag}'); json.dump(scene, open(sp + '.json', 'w'))
    fin = {'name': f'{name}_{tag}', 'anchor': [24, 60], 'leaf': '', 'bark': '', 'palette': pal, 'outline': ['#1a1016', '#3a2630'],
           'min_cluster': 2, 'tips': False, 'tufts': False, 'deep_edge': False}
    json.dump(fin, open(sp + '_finish.json', 'w'))
    subprocess.run([sys.executable, os.path.join(HERE, 'blockout.py'), sp + '.json', sp], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'finish.py'), sp + '.grid.txt', sp + '.pxg', sp + '_finish.json'], check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'grid.py'), 'build', sp + '.pxg', OUT], check=True, capture_output=True)
    from PIL import Image
    im = Image.open(os.path.join(OUT, f'{name}_{tag}.png')).convert('RGBA')
    face(im, L, yaw, phase, walking)
    return im


def face(im, L, yaw, phase, walking):
    """the hand finish for the face: eyes with a highlight, lashes for the young women, a small mouth"""
    px = im.load(); bob = abs(math.cos(phase * 2 * math.pi)) * .8 if walking else 0
    hip = Y(11.5) + bob; neck_y = hip + Y(14.0); hc_y = neck_y + Y(10.9)
    sy = round(60 - (hc_y - 1.0) * CY - 9.6 * SY)   # eye row on screen (the face's front at z ~ 9.6)
    def C(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    eye, white, lash, lip = C(ramp(L.get('eye', '#3a5a7a'))[1]), (250, 246, 240, 255), C('#1a1016'), C(ramp('#c84a5a')[2])
    hair = C(ramp(L['hair'])[0]); ir = ramp(L.get('eye', '#3a5a7a')); I0, I1, I2 = C(ir[0]), C(ir[2]), C(ir[3]); blush = C('#e88a8a')
    def put(x, y, c):
        if 0 <= x < im.width and 0 <= y < im.height and px[x, y][3] > 0: px[x, y] = c
    if yaw % 360 == 0:   # facing you: big eyes with a highlight, lashes, brows, a little blush, lips
        for side, ex in ((-1, 24 - 6), (1, 24 + 3)):
            for dx in range(3): put(ex + dx, sy - 1, lash)                       # the lid line
            if L.get('allure'): put(ex + (-1 if side < 0 else 3), sy - 2, lash)   # a winged lash
            put(ex, sy, white); put(ex + 1, sy, I2); put(ex + 2, sy, I1)
            put(ex, sy + 1, I1); put(ex + 1, sy + 1, I0); put(ex + 2, sy + 1, I0)
            put(ex + (0 if side < 0 else 1), sy + 2, I1); put(ex + (1 if side < 0 else 2), sy + 2, I0)
            for dx in range(3): put(ex + dx - (1 if side < 0 else -1) * (1 if dx == 0 else 0), sy - 3 - (1 if dx == 1 else 0), hair)   # brow
            put(ex + (-1 if side < 0 else 3), sy + 3, blush)
        if L.get('glasses') == 'square':   # square black frames round both eyes and a bridge between them
            for ex in (24 - 6, 24 + 3):
                for dx in range(-1, 4): put(ex + dx, sy - 2, lash); put(ex + dx, sy + 3, lash)
                for dy in range(-2, 4): put(ex - 1, sy + dy, lash); put(ex + 3, sy + dy, lash)
            put(23, sy, lash); put(24, sy, lash)
        if L.get('allure'): put(23, sy + 5, lip); put(24, sy + 5, lip); put(24, sy + 6, C(ramp('#c84a5a')[1]))
        else: put(24, sy + 5, lip)
    elif yaw % 360 in (90, 270):   # in profile: one eye toward the facing side
        d = 1 if yaw % 360 == 90 else -1; ex = 24 + (5 if d > 0 else -6)
        put(ex, sy - 1, lash); put(ex, sy, I2); put(ex, sy + 1, I0); put(ex, sy + 2, I1)
        put(ex - d, sy, white if False else I1)
        if L.get('allure'): put(ex + d, sy - 1, lash); put(ex + d, sy - 2, lash)
        put(ex - d, sy - 3, hair); put(ex, sy - 3, hair)
        put(ex + d * 2, sy + 5, lip)

if __name__ == '__main__':
    from PIL import Image
    name = sys.argv[1] if len(sys.argv) > 1 else 'june'; L = LOOKS[name]
    frames = [render_frame(name, L, y, 0, False, f'stand{y}') for y in (0, 90, 180, 270)]
    frames += [render_frame(name, L, 0, ph / 6, True, f'walk{ph}') for ph in range(6)]
    sheet = Image.new('RGBA', (48 * len(frames), 64))
    for i, f in enumerate(frames): sheet.alpha_composite(f, (i * 48, 0))
    sheet.save(os.path.join(OUT, name + '_proto.png')); print('ok')
