"""Compose LPC characters from Universal-LPC-Spritesheet-Character-Generator layers (CC-BY-SA / GPL / OGA-BY; credits collected)."""
import json, os, sys, subprocess, colorsys
import numpy as np
from PIL import Image
GEN = '/tmp/lpc/gen'; CACHE = '/tmp/lpc/cache'; OUT = 'spr/lpc'; os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)
RAW = 'https://raw.githubusercontent.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/master/spritesheets/'
ANIMS = ['walk', 'idle', 'thrust', 'watering', 'slash', 'hurt', 'spellcast', 'sit']
CREDITS = {}

def fetch(rel):
    p = os.path.join(CACHE, rel)
    if os.path.exists(p): return p if os.path.getsize(p) > 0 else None
    os.makedirs(os.path.dirname(p), exist_ok=True)
    r = subprocess.run(['curl', '-sS', '-f', '-L', '-o', p, RAW + rel.replace(' ', '%20')], capture_output=True)
    if r.returncode != 0: open(p, 'wb').close(); return None
    return p

def recolor(im, rgb, strength=1.0):
    """palette swap: re-map the layer's own shading ramp (by luminance) onto a ramp built around rgb."""
    a = np.asarray(im.convert('RGBA')).astype(np.float32); m = a[..., 3] > 0
    if not m.any(): return im
    lum = (a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11) / 255
    lo, hi = np.percentile(lum[m], 3), np.percentile(lum[m], 97)
    t = np.clip((lum - lo) / max(1e-3, hi - lo), 0, 1)
    h, l, s = colorsys.rgb_to_hls(*[c / 255 for c in rgb])
    out = a.copy()
    # 5-step ramp with hue shift (shadows cooler, lights warmer)
    steps = np.round(t * 4) / 4
    for k in np.unique(steps[m]):
        kk = (k - .5)
        hh = (h + (-.03 if kk < 0 else .015) * abs(kk) * 2) % 1; ll = min(.95, max(.04, l + kk * .55)); ss = min(1, s * (1 - .25 * abs(kk)) + .04)
        c = np.array(colorsys.hls_to_rgb(hh, ll, ss)) * 255
        sel = m & (steps == k)
        out[sel, :3] = out[sel, :3] * (1 - strength) + c * strength
    return Image.fromarray(out.astype(np.uint8), 'RGBA')

def defn(rel):
    return json.load(open(os.path.join(GEN, 'sheet_definitions', rel)))

def layers_for(rel, body, variant=None, color=None):
    d = defn(rel); out = []
    for k, v in d.items():
        if not k.startswith('layer_'): continue
        path = v.get(body) or v.get('male') or v.get('female') or next((x for kk, x in v.items() if kk not in ('zPos',) and isinstance(x, str)), None)
        if not path: continue
        out.append(dict(z=v['zPos'], path=path, variant=variant, color=color, src=rel))
    for c in d.get('credits', []):
        key = c.get('file', rel); CREDITS[key] = c
    return out

def compose(name, body, parts, anims=ANIMS):
    """parts: list of (definition json, variant or None, recolor rgb or None)."""
    L = []
    for rel, var, col in parts: L += layers_for(rel, body, var, col)
    L.sort(key=lambda l: l['z'])
    sheets = {}
    for an in anims:
        base = None
        for l in L:
            rel = l['path'] + (f'{an}/{l["variant"]}.png' if l['variant'] else f'{an}.png')
            p = fetch(rel)
            if not p and l['variant']: p = fetch(l['path'] + f'{an}.png')
            if not p:
                if 'body/bodies' in l['path']: base = None; break
                continue
            im = Image.open(p).convert('RGBA')
            if l['color']: im = recolor(im, l['color'])
            if base is None: base = Image.new('RGBA', im.size, (0, 0, 0, 0))
            if im.size != base.size:
                c = Image.new('RGBA', base.size, (0, 0, 0, 0)); c.alpha_composite(im.crop((0, 0, min(im.width, base.width), min(im.height, base.height)))); im = c
            base.alpha_composite(im)
        if base is not None: sheets[an] = base
    # pack: rows = anim x dir (N,W,S,E), each 64x64
    meta = dict(fw=64, fh=64, ax=32, ay=60, clips={})
    rows = []
    for an, im in sheets.items():
        nr = im.height // 64; nf = im.width // 64
        dirs = ['N', 'W', 'S', 'E'] if nr >= 4 else ['S']
        for di, d in enumerate(dirs):
            rows.append((an, d, im.crop((0, di * 64, nf * 64, di * 64 + 64)), nf))
    W = max(r[2].width for r in rows); sheet = Image.new('RGBA', (W, 64 * len(rows)), (0, 0, 0, 0))
    for i, (an, d, im, nf) in enumerate(rows):
        sheet.alpha_composite(im, (0, i * 64)); meta['clips'].setdefault(an, {})[d] = [i, nf]
    sheet.save(f'{OUT}/{name}.png', optimize=True); json.dump(meta, open(f'{OUT}/{name}.json', 'w'))
    print(name, {a: len(v) for a, v in meta['clips'].items()})
    return sheet, meta

SKIN = 'body/body.json'
HEADS = 'head/heads/human/'
C = dict(maroon=(122, 34, 30), denim=(52, 78, 120), brown=(92, 62, 40), dark=(28, 26, 30), cream=(214, 200, 170), plum=(96, 46, 92), sage=(92, 112, 80),
         grey=(128, 126, 120), tan=(168, 132, 86), navy=(40, 48, 78), red=(150, 40, 32), black=(22, 20, 24), white=(220, 216, 206), green=(56, 86, 52), straw=(196, 160, 90))
CAST = {
    'farmer': ('male', [(SKIN, None, None), (HEADS + 'heads_human_male.json', None, None), ('hair/short/hair_plain.json', None, (86, 56, 34)),
                        ('torso/shirts/longsleeve/torso_clothes_longsleeve.json', None, C['maroon']), ('legs/pants/legs_pants.json', None, C['denim']),
                        ('feet/boots/feet_boots_basic.json', None, C['brown']), ('torso/aprons/torso_aprons_suspenders.json', None, C['brown'])]),
    'mae': ('female', [(SKIN, None, None), (HEADS + 'heads_human_female_elderly.json', None, None), ('hair/pigtails/hair_bunches.json', None, (170, 164, 156)),
                       ('torso/shirts/torso_clothes_blouse_longsleeve.json', None, C['plum']), ('legs/skirts/legs_skirts_plain.json', None, C['plum']),
                       ('torso/aprons/torso_aprons_apron_full.json', 'white', None), ('feet/shoes/feet_shoes_basic.json', None, C['dark'])]),
    'hale': ('male', [(SKIN, None, None), (HEADS + 'heads_human_male_gaunt.json', None, None), ('hair/short/hair_parted.json', None, (190, 190, 186)),
                      ('torso/shirts/longsleeve/torso_clothes_longsleeve.json', None, C['white']), ('torso/jacket/torso_jacket_frock.json', 'black', None),
                      ('legs/pants/legs_formal.json', None, C['black']), ('feet/shoes/feet_shoes_basic.json', None, C['black']),
                      ('headwear/hats/formal/hat_formal_tophat.json', 'black', None)]),
    'tobias': ('child', [(SKIN, None, None), (HEADS + 'heads_human_child.json', None, None), ('hair/short/hair_mop.json', None, (120, 70, 30)),
                         ('torso/shirts/torso_clothes_child_shirt.json', 'blue', None), ('legs/pants/legs_childpants.json', 'brown', None)]),
    'hollis': ('male', [(SKIN, None, None), (HEADS + 'heads_human_male_plump.json', None, None), ('hair/short/hair_plain.json', None, (40, 32, 26)),
                        ('hair/beards/beards_beard.json', None, (52, 40, 30)), ('torso/shirts/longsleeve/torso_clothes_longsleeve.json', None, C['grey']),
                        ('legs/pants/legs_pants.json', None, C['green']), ('torso/aprons/torso_aprons_overalls.json', 'forest', None),
                        ('feet/boots/feet_boots_basic.json', None, C['dark']), ('headwear/hats/caps/hat_cap_leather.json', 'maroon', None)]),
    'agnes': ('female', [(SKIN, None, None), (HEADS + 'heads_human_female_elderly.json', None, None), ('hair/pigtails/hair_bunches.json', None, (232, 228, 220)),
                         ('torso/dresses/dress_bodice.json', 'black', None), ('legs/skirts/legs_skirts_plain.json', None, C['black']),
                         ('torso/shirts/torso_clothes_blouse_longsleeve.json', None, C['black']), ('feet/shoes/feet_shoes_basic.json', None, C['black'])]),
    'dunn': ('male', [(SKIN, None, None), (HEADS + 'heads_human_male_plump.json', None, None), ('hair/short/hair_plain.json', None, (36, 28, 22)),
                      ('hair/mustaches/beards_walrus.json', None, (40, 30, 22)), ('torso/shirts/longsleeve/torso_clothes_longsleeve.json', None, C['tan']),
                      ('legs/pants/legs_pants.json', None, C['brown']), ('feet/boots/feet_boots_basic.json', None, C['dark']),
                      ('headwear/hats/formal/hat_formal_bowler.json', 'brown', None)]),
    'ruth': ('child', [(SKIN, None, (200, 204, 210)), (HEADS + 'heads_human_child.json', None, (200, 204, 210)), ('hair/long/hair_long_straight.json', None, (14, 12, 16)),
                       ('torso/shirts/torso_clothes_child_shirt.json', 'white', None), ('legs/pants/legs_childpants.json', 'white', None)]),
    'hollow': ('male', [(SKIN, None, (120, 112, 96)), ('head/heads/undead/heads_zombie.json', None, (110, 96, 74)), ('torso/cape/cape_tattered.json', None, (40, 34, 30)),
                        ('torso/jacket/torso_jacket_frock.json', 'charcoal', None), ('legs/pants/legs_pantaloons.json', None, (60, 50, 40)),
                        ('headwear/hats/formal/hat_formal_tophat.json', 'base_brown', None)]),
}
if __name__ == '__main__':
    only = sys.argv[1:]
    for n, (body, parts) in CAST.items():
        if only and n not in only: continue
        try: compose(n, body, parts)
        except Exception as e: print('FAIL', n, e)
    # tools for the player (separate layers drawn with the body)
    if not only or 'farmer' in only:
        fp = CAST['farmer'][1]
        compose('farmer_hoe', 'male', fp + [('tools/tool_hoe.json', None, None)], anims=['thrust'])
        compose('farmer_can', 'male', fp + [('tools/tool_watering_can.json', None, None)], anims=['thrust'])
    json.dump(CREDITS, open(f'{OUT}/credits_chars.json', 'w'), indent=1)
