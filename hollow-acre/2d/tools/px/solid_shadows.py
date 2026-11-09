"""Turn the props' dithered shadow strips into solid ones (judge, props 5/10: "dashed checkered shadow strips should
become solid #322125 shadows").

The old strips are three rows near the foot of a prop: a checker row (dark, gap, dark, ...), a solid dark row, a checker
row, all in the outline colour. Each checker row becomes a solid row of #322125 at a soft alpha, the solid row between
two checker rows becomes the same colour a little stronger; the prop itself (its legs, its outline) is left alone.

    python3 tools/px/solid_shadows.py [--install] [names...]     (run from hollow-acre/2d; without --install, previews
                                                                   go to the folder in $OUT or /tmp/shadow_prev)
"""
import sys, os, json, shutil
from PIL import Image

SH = (50, 33, 37)
EDGE_A, CORE_A = 120, 165


def dark(p): return p[3] > 0 and sum(p[:3]) < 200


def checker_span(px, W, y):
    """the run of a row that alternates dark / empty (at least 6 dark pixels in that rhythm): (x0, x1) or None"""
    xs = [x for x in range(1, W - 1) if dark(px[x, y]) and px[x - 1, y][3] == 0 and px[x + 1, y][3] == 0]
    if len(xs) < 6: return None
    return xs[0] - 1, xs[-1] + 1


def fix(im):
    im = im.convert('RGBA'); W, H = im.size; px = im.load(); changed = 0
    rows = {y: checker_span(px, W, y) for y in range(max(0, H - 10), H)}
    for y, sp in rows.items():
        if not sp: continue
        x0, x1 = sp
        for x in range(max(0, x0), min(W, x1 + 1)):
            p = px[x, y]
            if p[3] == 0 or (dark(p) and (x == 0 or px[x - 1, y][3] == 0 or x == W - 1 or px[x + 1, y][3] == 0 or x0 <= x <= x1)):
                if p[3] == 0 or dark(p): px[x, y] = SH + (EDGE_A,); changed += 1
        # the solid core row between two checker rows
        for yy in (y + 1,):
            if yy in rows and yy + 1 in rows and rows.get(yy + 1) and not rows.get(yy):
                for x in range(max(0, x0), min(W, x1 + 1)):
                    if dark(px[x, yy]): px[x, yy] = SH + (CORE_A,); changed += 1
    return im, changed


if __name__ == '__main__':
    inst = '--install' in sys.argv; names = [a for a in sys.argv[1:] if not a.startswith('--')]
    M = json.load(open('spr/lpc/objects.json'))
    if not names:
        for k, v in M.items():
            if v.get('clips') or not v['src'].startswith('spr/lpc/obj/'): continue
            try: im = Image.open(v['src']).convert('RGBA')
            except Exception: continue
            px = im.load(); W, H = im.size
            if sum(1 for y in range(max(0, H - 10), H) if checker_span(px, W, y)) >= 1: names.append(k)
    out = os.environ.get('OUT', '/tmp/shadow_prev'); os.makedirs(out, exist_ok=True)
    if inst: os.makedirs('spr/backup_v2/props_shadow', exist_ok=True)
    n = 0
    for k in names:
        src = M[k]['src']; im, ch = fix(Image.open(src))
        if not ch: continue
        if inst:
            bk = os.path.join('spr/backup_v2/props_shadow', os.path.basename(src))
            if not os.path.exists(bk): shutil.copy(src, bk)
            im.save(src)
        else: im.save(os.path.join(out, os.path.basename(src)))
        n += 1
    print(n, 'props', 'installed' if inst else 'previewed in ' + out)
