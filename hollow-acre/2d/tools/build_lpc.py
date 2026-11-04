"""Cut LPC sprites into game assets and compose buildings from modular LPC tiles. Output: spr/lpc/obj/*.png + spr/lpc/objects.json"""
import json, os
import numpy as np
from PIL import Image
T = '/tmp/lpc/assets/LPC/img/tilesets/LPC/'; IA = T + 'Final Attributions/Individual Assets/'
OUT = 'spr/lpc/obj'; os.makedirs(OUT, exist_ok=True)
OBJ = json.load(open('ex_objects.png.json')); O95 = json.load(open('bx_o95.json')); COL = json.load(open('bx_col.json'))
WIN = json.load(open('bx_win.json')); DOOR = json.load(open('bx_door.json'))
IM = {}
def img(p):
    if p not in IM: IM[p] = Image.open(p).convert('RGBA')
    return IM[p]
META = {}
def trim(im):
    b = im.getbbox(); return im.crop(b) if b else im
def save(name, im, foot=None, anchor=None, night=None, extra=None):
    im = im if anchor else trim(im)
    ax, ay = anchor if anchor else (im.width / 2, im.height - 2)
    im.save(f'{OUT}/{name}.png'); m = dict(src=f'{OUT}/{name}.png', fw=im.width, fh=im.height, ax=round(ax, 1), ay=round(ay, 1), foot=foot or [0, 0, 0, 0])
    if night is not None: night.save(f'{OUT}/{name}_n.png'); META[name + '_n'] = dict(m, src=f'{OUT}/{name}_n.png')
    if extra: m.update(extra)
    META[name] = m
def crop(sheet, box): return img(sheet).crop(tuple(box))
def tile(sheet, c, r, w=1, h=1): return img(sheet).crop((c * 32, r * 32, (c + w) * 32, (r + h) * 32))
OS = T + 'Outside Objects.png'
# ---------------------------------------------------------------- nature (canopy + trunk trees, pines, dead tree)
def round_tree(name, canopy_box, trunk_box):
    can = trim(crop(OS, canopy_box)); tr = trim(crop(OS, trunk_box))
    W = max(can.width, tr.width); H = can.height + tr.height - 46
    im = Image.new('RGBA', (W, H)); im.alpha_composite(tr, ((W - tr.width) // 2, H - tr.height)); im.alpha_composite(can, ((W - can.width) // 2, 0))
    save(name, im, [-.3, -.25, .3, .1], anchor=(W / 2, H - 8))
round_tree('tree_orange', OBJ[94], OBJ[142]); round_tree('tree_green', OBJ[14], OBJ[143])
for n, i in (('pine_0', 39), ('pine_1', 52), ('pine_o0', 117), ('pine_o1', 121)): save(n, crop(OS, OBJ[i]), [-.3, -.2, .3, .1])
save('deadtree', crop(OS, (390, 255, 497, 350)), [-.3, -.2, .3, .1])
save('stump', crop(OS, OBJ[106]), [-.4, -.3, .4, .1])
for n, i in (('corn_0', 2), ('corn_1', 3), ('corn_2', 4)): save(n, crop(OS, O95[i]))
save('mushroom', crop(OS, O95[5])); save('mushroom_b', crop(OS, O95[6]))
for n, i in (('pumpkin', 65), ('pumpkin_b', 67), ('jack', 66), ('jack_b', 68), ('jack_c', 69)): save(n, crop(OS, OBJ[i]), [-.3, -.25, .3, .05])
save('hay', crop(OS, OBJ[154]), [-.8, -1.2, .8, 0]); save('barrel', crop(OS, OBJ[15]), [-.35, -.3, .35, 0])
save('firewood', crop(OS, OBJ[146]), [-.7, -.5, .7, 0]); save('sacks', crop(OS, O95[66]), [-.9, -.5, .9, 0]); save('cart', crop(OS, OBJ[214]), [-.9, -.4, .9, 0])
save('grave_0', crop(OS, O95[75]), [-.6, -.3, .6, 0]); save('grave_1', crop(OS, O95[72]), [-.4, -.2, .4, 0]); save('grave_2', crop(OS, O95[76]), [-.2, -.1, .2, 0]); save('grave_3', crop(OS, OBJ[162]), [-.6, -.3, .6, 0])
save('crate', crop(OS, O95[47]), [-.5, -.4, .5, 0]); save('signpost', crop(OS, OBJ[168]), [-.2, -.1, .2, 0])
# fences: horizontal segment (2 tiles) and vertical post+rails
save('fence_h', crop(OS, OBJ[150]), anchor=(0, crop(OS, OBJ[150]).height - 4)); save('fence_v', crop(OS, OBJ[156]))
# well
wl = img(IA + 'Xenodora/lpc-well.png'); save('well', trim(wl.crop((0, 0, 128, 128))), [-1.1, -.9, 1.1, .1])
# crops: growth stages from plants.png (each column a crop, rows = stages)
P = IA + 'Daniel Eddeland (Daneeklu)/plants.png'
def crop_stage(name, col, rows):
    for st, r in enumerate(rows): save(f'{name}_{st}', tile(P, col, r, 1, 2 if r < 0 else 1), anchor=(16, 28))
# plants.png: 9 crops (columns) x 6 rows of 32x64: rows 0-4 growth, row 5 produce
def stage(col, r): return img(P).crop((col * 32, r * 64, col * 32 + 32, r * 64 + 64))
for st, r in enumerate((0, 1, 3, 4)): save(f'turnip_{st}', stage(2, r), anchor=(16, 58))
for st, r in enumerate((0, 1, 2)): save(f'pumpkin_{st}', stage(5, r), anchor=(16, 58))
pk = Image.new('RGBA', (40, 64)); pk.alpha_composite(stage(5, 2), (4, 0)); pk.alpha_composite(trim(crop(OS, OBJ[65])), (8, 36)); save('pumpkin_3', pk, anchor=(20, 58))
# ---------------------------------------------------------------- buildings
HS = IA + 'Sharm/house.png'; CO = IA + 'Bluecarrot16/colonial.png'; TH = IA + 'Bluecarrot16/thatched-roof.png'; WS = IA + 'Bluecarrot16/windows.png'; DS = IA + 'Bluecarrot16/doors.png'
WALLS = {'brick': (HS, 0, 0, 3), 'cream': (CO, 18, 0, 4), 'blue': (CO, 25, 0, 4), 'yellow': (CO, 18, 7, 3), 'green': (CO, 25, 7, 3), 'stone': (CO, 0, 5, 3)}
ROOFS = {'slate': (HS, 3, 3, 4), 'thatch': (TH, 0, 4, 3), 'thatch_dark': (TH, 0, 11, 3), 'thatch_hip': (TH, 3, 1, 3), 'thatch_hip_dark': (TH, 3, 8, 3)}
def nine(sheet, c0, r0, rows, W, Hrows):
    """stretch a 3-column block (left, middle, right) to W tiles and Hrows rows: first row, repeated middle rows, last row."""
    out = Image.new('RGBA', (W * 32, Hrows * 32))
    for r in range(Hrows):
        sr = r0 if r == 0 else (r0 + rows - 1 if r == Hrows - 1 else r0 + 1 + (r - 1) % max(1, rows - 2))
        for c in range(W):
            sc = c0 if c == 0 else (c0 + 2 if c == W - 1 else c0 + 1)
            out.alpha_composite(tile(sheet, sc, sr), (c * 32, r * 32))
    return out
def building(name, W=6, wall='cream', roof='slate', wallrows=3, roofrows=4, door=0, wins=(1, 4), sign=None, chimney=True, lit=True, porch=False, tint=None):
    res = {}
    for night in (False, True):
        roof_im = nine(*ROOFS[roof][:3], ROOFS[roof][3], W + 1, roofrows)
        if tint:
            from lpc_chars import recolor
            roof_im = recolor(roof_im, tint)
        wall_im = nine(*WALLS[wall][:3], WALLS[wall][3], W, wallrows)
        H = roof_im.height + wall_im.height - 8; Wp = roof_im.width
        im = Image.new('RGBA', (Wp, H + 6))
        wx = 16; wy = roof_im.height - 8
        im.alpha_composite(wall_im, (wx, wy))
        # door and windows on the wall
        d = crop(DS, DOOR[door]); im.alpha_composite(d, (wx + (W * 32 - d.width) // 2, wy + wall_im.height - d.height - 4))
        for c in wins:
            wv = crop(WS, WIN[23 if night and lit else 7]); im.alpha_composite(wv, (wx + c * 32 + (32 - wv.width) // 2, wy + 18))
        im.alpha_composite(roof_im, (0, 0))
        if chimney:
            ch = tile(HS, 6, 0, 1, 2); im.alpha_composite(trim(ch), (Wp - 72, 0))
        if sign: im.alpha_composite(sign, ((Wp - sign.width) // 2, wy + 2))
        res[night] = im
    foot_w = W
    save(name, res[False], [-foot_w / 2, -(wallrows + roofrows - 1) * .9, foot_w / 2, 0], anchor=(res[False].width / 2, res[False].height - 8), night=res[True], extra=dict(bw=W))
building('cabin', W=6, wall='brick', roof='slate', door=0, wins=(1, 4), tint=(110, 74, 50))
building('house_a', W=6, wall='yellow', roof='slate', door=4, wins=(1, 4), wallrows=3)
building('house_b', W=6, wall='green', roof='slate', door=2, wins=(1, 4), tint=(120, 60, 46))
building('house_c', W=5, wall='blue', roof='slate', door=6, wins=(1, 3), lit=False)
building('house_d', W=7, wall='cream', roof='slate', door=7, wins=(1, 5), lit=False, tint=(70, 90, 84))
building('store', W=7, wall='brick', roof='slate', door=3, wins=(1, 5))
building('garage', W=8, wall='stone', roof='slate', door=7, wins=(6,), chimney=False)
# church: stone hall + tall spire tower in front with a bronze bell
cl = img('col_low.png')
def church():
    res = {}
    bel = cl.crop(tuple(COL[15])); aw = cl.crop(tuple(COL[32]))
    for night in (False, True):
        hall = nine(CO, 0, 5, 3, 8, 4); roof_im = nine(HS, 3, 3, 4, 9, 5)
        tw = nine(CO, 0, 5, 3, 3, 6)
        W = roof_im.width + 20; H = roof_im.height + hall.height + 330
        im = Image.new('RGBA', (W, H)); bx = (W - roof_im.width) // 2; gy = H - 10
        im.alpha_composite(roof_im, (bx, gy - hall.height - roof_im.height + 8)); im.alpha_composite(hall, (bx + 16, gy - hall.height))
        for sx in (bx + 40, bx + roof_im.width - 40 - aw.width):
            a2 = aw.copy()
            if night:
                arr = np.asarray(a2).copy(); m = (arr[..., 3] > 0) & (arr[..., :3].sum(-1) < 200); arr[m, :3] = (250, 190, 90); a2 = Image.fromarray(arr)
            im.alpha_composite(a2, (sx, gy - hall.height + 14))
        tx = (W - tw.width) // 2; ty = gy - tw.height + 6
        im.alpha_composite(tw, (tx, ty))
        d = crop(DS, DOOR[0]); im.alpha_composite(d, (tx + (tw.width - d.width) // 2, gy - d.height - 2))
        a3 = aw.resize((aw.width // 2, aw.height // 2), Image.NEAREST)
        if night:
            arr = np.asarray(a3).copy(); m = (arr[..., 3] > 0) & (arr[..., :3].sum(-1) < 200); arr[m, :3] = (250, 190, 90); a3 = Image.fromarray(arr)
        im.alpha_composite(a3, (tx + (tw.width - a3.width) // 2, ty + 40))
        im.alpha_composite(bel, (tx + (tw.width - bel.width) // 2, ty - bel.height + 14))
        res[night] = im
    save('church', res[False], [-4, -11, 4, 0], anchor=(res[False].width / 2, res[False].height - 10), night=res[True], extra=dict(bw=8))
church()
EX = T + 'Exterior Tiles.png'
lp = trim(img(EX).crop((880, 700, 912, 800))); save('lamp', lp, [-.1, -.1, .1, .05])
lv = crop(OS, OBJ[122])
for k in range(4): save(f'leaves_{k}', trim(lv.crop((0, k * 23, lv.width, k * 23 + 23))))
# non-LPC extras drawn earlier in this project (car, deer) and Blender-rendered animals
for n in ('car_wreck', 'deer'):
    im = Image.open(f'spr/px2/{n}.png'); mm = json.load(open(f'spr/px2/{n}.json'))
    im.save(f'{OUT}/{n}.png'); META[n] = dict(src=f'{OUT}/{n}.png', fw=im.width, fh=im.height, ax=mm['anchor'][0], ay=mm['anchor'][1], foot=mm.get('foot', [0, 0, 0, 0]))
import shutil
shutil.copy('spr/px2/car_wreck_n.png', f'{OUT}/car_wreck_n.png'); META['car_wreck_n'] = dict(META['car_wreck'], src=f'{OUT}/car_wreck_n.png')
json.dump(META, open('spr/lpc/objects.json', 'w'), indent=0)
print(len(META), 'objects')
