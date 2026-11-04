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
save('deadtree', crop(OS, (390, 255, 474, 350)), [-.3, -.2, .3, .1])
save('stump', crop(OS, OBJ[106]), [-.4, -.3, .4, .1])
for n, i in (('corn_0', 2), ('corn_1', 3), ('corn_2', 4)): save(n, crop(OS, O95[i]))
save('mushroom', crop(OS, O95[5])); save('mushroom_b', crop(OS, O95[6]))
for n, i in (('pumpkin', 65), ('pumpkin_b', 67), ('jack', 66), ('jack_b', 68), ('jack_c', 69)): save(n, crop(OS, OBJ[i]), [-.3, -.25, .3, .05])
save('hay', crop(OS, OBJ[154]), [-.8, -1.2, .8, 0]); save('barrel', crop(OS, OBJ[15]), [-.35, -.3, .35, 0])
save('firewood', crop(OS, OBJ[146]), [-.7, -.5, .7, 0]); save('sacks', crop(OS, O95[66]), [-.9, -.5, .9, 0]); save('cart', crop(OS, OBJ[214]), [-.9, -.4, .9, 0])
save('grave_0', crop(OS, O95[75]), [-.6, -.3, .6, 0]); save('grave_1', crop(OS, O95[72]), [-.4, -.2, .4, 0]); save('grave_2', crop(OS, O95[76]), [-.2, -.1, .2, 0]); save('grave_3', crop(OS, OBJ[162]), [-.6, -.3, .6, 0])
save('crate', crop(OS, O95[47]), [-.5, -.4, .5, 0]); save('signpost', crop(OS, OBJ[168]), [-.2, -.1, .2, 0])
# fences: horizontal segment (2 tiles) and vertical post+rails
fh = crop(OS, OBJ[152]); save('fence_h', fh, anchor=(0, fh.height - 3))
b156 = OBJ[156]; fv = trim(img(OS).crop((b156[0], b156[1] + 30, b156[0] + 14, b156[1] + 30 + 70))); save('fence_v', fv, anchor=(fv.width / 2, fv.height - 3))
# well
wl = img(IA + 'Xenodora/lpc-well.png'); save('well', Image.open('spr/px2/well_c.png').convert('RGBA'), [-1.1, -.9, 1.1, .1])   # composed from Xenodora's well parts: ring, winch frame, tile roof, bucket
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
RMETA = json.load(open('spr/raw/roof/meta.json'))
def roof_px(rn):
    return Image.open(f'spr/raw/roof/px_{rn}.png').convert('RGBA'), RMETA[rn]['ax'], RMETA[rn]['ay']
def building(name, W=6, wall='cream', roof='roof_slate', wallrows=3, roofrows=4, door=0, wins=(1, 4), sign=None, chimney=True, lit=True, porch=False, tint=None):
    """LPC walls/doors/windows under a Blender-rendered shingle gable roof."""
    res = {}
    roof_im, rax, ray = roof_px(roof)
    for night in (False, True):
        wall_im = nine(*WALLS[wall][:3], WALLS[wall][3], W, wallrows)
        Wp = max(roof_im.width, W * 32 + 8); top = int(round(ray)); H = top + wall_im.height + 6
        im = Image.new('RGBA', (Wp, H))
        wx = (Wp - W * 32) // 2; wy = top
        im.alpha_composite(wall_im, (wx, wy))
        d = crop(DS, DOOR[door]); im.alpha_composite(d, (wx + (W * 32 - d.width) // 2, wy + wall_im.height - d.height - 4))
        for c in wins:
            wv = crop(WS, WIN[23 if night and lit else 7]); im.alpha_composite(wv, (wx + c * 32 + (32 - wv.width) // 2, wy + 30))
        im.alpha_composite(roof_im, (int(round(Wp / 2 - rax)), 0))
        if sign: im.alpha_composite(sign, ((Wp - sign.width) // 2, wy + 22))
        res[night] = im
    save(name, res[False], [-W / 2, -3.3, W / 2, 0], anchor=(res[False].width / 2, res[False].height - 8), night=res[True], extra=dict(bw=W))
building('cabin', W=6, wall='brick', roof='roof_cabin', door=0, wins=(1, 4))
building('house_a', W=6, wall='yellow', roof='roof_slate', door=4, wins=(1, 4), wallrows=3)
building('house_b', W=6, wall='green', roof='roof_red', door=2, wins=(1, 4))
building('house_c', W=5, wall='blue', roof='roof_blue', door=6, wins=(1, 3), lit=False)
building('house_d', W=7, wall='cream', roof='roof_teal', door=7, wins=(1, 5), lit=False)
building('store', W=7, wall='brick', roof='roof_store', door=3, wins=(1, 5))
building('garage', W=8, wall='stone', roof='roof_garage', door=7, wins=(6,), chimney=False)
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
for n in ('gas_pump', 'phone_booth', 'board'):
    im = Image.open(f'spr/px2/{n}.png'); mm = json.load(open(f'spr/px2/{n}.json'))
    im.save(f'{OUT}/{n}.png'); META[n] = dict(src=f'{OUT}/{n}.png', fw=im.width, fh=im.height, ax=mm['anchor'][0], ay=mm['anchor'][1], foot=mm.get('foot', [0, 0, 0, 0]))
    import os as _o
    if _o.path.exists(f'spr/px2/{n}_n.png'): shutil.copy(f'spr/px2/{n}_n.png', f'{OUT}/{n}_n.png'); META[n + '_n'] = dict(META[n], src=f'{OUT}/{n}_n.png')
# Kenney Car Kit sedan (CC0), rendered in Blender: driving frames + side view
_m = json.load(open('spr/px2/car_east.json')); META['car_east'] = _m
_m = json.load(open('spr/px2/car_drive.json')); shutil.copy('spr/px2/car_drive.png', f'{OUT}/car_drive.png'); META['car_drive'] = dict(_m, src=f'{OUT}/car_drive.png')
_i = Image.open('spr/px2/car_side.png'); _m = json.load(open('spr/px2/car_side.json')); _i.save(f'{OUT}/car_side.png')
META['car_side'] = dict(src=f'{OUT}/car_side.png', fw=_i.width, fh=_i.height, ax=_m['anchor'][0], ay=_m['anchor'][1])
_i = Image.open('spr/px2/road.png'); _i.save(f'{OUT}/road.png'); META['road'] = dict(src=f'{OUT}/road.png', fw=_i.width, fh=_i.height, ax=_i.width // 2, ay=0)

# ---- buildings drawn in LibreSprite (px/house.js); .ase sources live in px/out
import json as _j
_PM = _j.load(open('px/out/houses_meta.json'))
for _n in ('house_a', 'house_b', 'house_c', 'house_d', 'cabin', 'store', 'garage', 'church', 'coop'):
    _m = _PM[_n]; _d = Image.open(f'px/out/{_n}.png').convert('RGBA'); _nt = Image.open(f'px/out/{_n}_n.png').convert('RGBA')
    _top = min(_d.getbbox()[1], _nt.getbbox()[1]); _d = _d.crop((0, _top, _d.width, _d.height)); _nt = _nt.crop((0, _top, _nt.width, _nt.height))
    _foot = [-_m['bw'] / 2, -3.3 if _n != 'church' else -4.2, _m['bw'] / 2, 0]
    save(_n, _d, _foot, anchor=(_m['ax'], _m['ay'] - _top), night=_nt, extra=dict(bw=_m['bw'], chim=([_m['chim'][0], _m['chim'][1] - _m['ay']] if _m.get('chim') else None)))

# ---- props + fences drawn in LibreSprite (px/props.js)
_PROPS = {'fence_h': (0, 22), 'fence_v': (7, 66), 'picket_h': (0, 23), 'picket_v': (7, 66), 'lamp': None, 'phone_booth': None, 'board': None, 'gas_pump': None,
          'signpost': None, 'barrel': None, 'crate': None, 'hay': None, 'sacks': None, 'cart': None, 'well': None, 'firewood': None}
for _n, _a in _PROPS.items():
    _d = Image.open(f'px/out/{_n}.png').convert('RGBA'); _nf = f'px/out/{_n}_n.png'
    _old = META.get(_n, {}); _foot = _old.get('foot', [0, 0, 0, 0])
    if _n == 'cart': _foot = [-1.2, -.5, 1.2, 0]
    save(_n, _d, _foot, anchor=_a or (_d.width / 2, _d.height - 3), night=Image.open(_nf).convert('RGBA') if os.path.exists(_nf) else None)

# ---- terrain + landmarks (px/worldart.js)
for _n, _a, _f in (('cbridge', 'B', [-4.7, -6.2, 4.7, 0]), ('barn', 'b', [-3.4, -3.4, 3.4, 0]), ('silo', 'b', [-.8, -.8, .8, 0]), ('windpump', 'b', [-.5, -.4, .5, 0]),
                   ('mailbox', 'b', [-.15, -.1, .15, 0]), ('footbridge', 'c', [0, 0, 0, 0]), ('dock', 'c', [0, 0, 0, 0]), ('cportal', 'b', [-3.6, -7, 3.6, 0])):
    _d = Image.open(f'px/out/{_n}.png').convert('RGBA'); _nf = f'px/out/{_n}_n.png'
    save(_n, _d, _f, anchor=(_d.width / 2, _d.height - 17) if _a == 'B' else (_d.width / 2, _d.height - 3) if _a == 'b' else (_d.width / 2, _d.height / 2), night=Image.open(_nf).convert('RGBA') if os.path.exists(_nf) else None)
for _n in ('maple_orange', 'maple_red', 'maple_gold', 'maple_green', 'bush_green', 'bush_red', 'bush_gold'):
    _d = Image.open(f'px/out/{_n}.png').convert('RGBA'); save(_n, _d, [-.4, -.3, .4, .1], anchor=(_d.width / 2, _d.height - (6 if _n.startswith('maple') else 4)))
for _n, _nf in (('falls', 4), ('blades', 4), ('chicken', 3), ('butterfly', 2), ('tgrass', 2), ('tgold', 2)):
    _d = Image.open(f'px/out/{_n}.png').convert('RGBA'); _fw = _d.width // _nf
    _d.save(f'{OUT}/{_n}.png'); META[_n] = dict(src=f'{OUT}/{_n}.png', fw=_fw, fh=_d.height, ax=_fw / 2, ay=_d.height - (1 if _n in ('chicken', 'butterfly') else 2), clips={'a': {'S': [0, _nf]}}, foot=[0, 0, 0, 0])
for _n in ('cliff', 'decor', 'tex_grass', 'tex_forest', 'tex_dirt', 'tex_stone', 'tex_water'):
    _d = Image.open(f'px/out/{_n}.png').convert('RGBA'); _d.save(f'{OUT}/{_n}.png'); META[_n] = dict(src=f'{OUT}/{_n}.png', fw=_d.width, fh=_d.height, ax=0, ay=0, foot=[0, 0, 0, 0])
# ---- interiors (px/interior.js)
_im = json.load(open('px/out/interior_meta.json'))
for _n, _m in _im.items():
    _d = Image.open(f'px/out/{_n}.png').convert('RGBA'); _d.save(f'{OUT}/{_n}.png')
    if _n.startswith('room_'): META[_n] = dict(src=f'{OUT}/{_n}.png', fw=_d.width, fh=_d.height, ax=0, ay=0, foot=[0, 0, 0, 0], side=_m['side'], top=_m['top'], room=_m['room'])
    else: META[_n] = dict(src=f'{OUT}/{_n}.png', fw=_d.width, fh=_d.height, ax=_d.width / 2, ay=_d.height - 3, foot=[0, 0, 0, 0])
json.dump(META, open('spr/lpc/objects.json', 'w'), indent=0)
print(len(META), 'objects')
