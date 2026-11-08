"""Install the Aseprite buildings into a game tree: copy out/bld/*.png to <root>/spr/lpc/obj and update objects.json.
Existing entries keep their footprint ('foot', 'bw'); new one-of-a-kind houses copy theirs from the base plan they were drawn from.
Usage: python3 install.py <out dir with meta.txt> <game root (has spr/lpc/objects.json)> [<more roots for the PNGs only>]"""
import sys, json, shutil, os
src, root, roots = sys.argv[1], sys.argv[2], sys.argv[3:]
oj = os.path.join(root, 'spr/lpc/objects.json'); O = json.load(open(oj))
rows = [l.split() for l in open(os.path.join(src, 'meta.txt')) if l.startswith('META ')]
n = 0
for row in rows:
    _, fn, w, h, ax, ay, wt, chim, base = row[:9]; extra = dict(kv.split('=') for kv in row[9:])
    for r in [root] + roots:
        shutil.copy(os.path.join(src, fn + '.png'), os.path.join(r, 'spr/lpc/obj', fn + '.png'))
    e = O.get(fn)
    if e is None:
        b = O.get(base) if base != '-' else (O.get(fn[:-2]) if fn.endswith('_n') else None)   # a new night sprite copies its day twin
        if b is None: raise SystemExit(f'{fn}: no entry and no base to copy a footprint from')
        e = {k: v for k, v in b.items() if k in ('foot', 'bw')}
    e.update(src=f'spr/lpc/obj/{fn}.png', fw=int(w), fh=int(h), ax=float(ax), ay=float(ay), px='ase')
    if not fn.endswith('_n'):
        e['chim'] = [int(v) for v in chim.split(',')] if chim != '-' else None
    for k, v in extra.items(): e[k] = float(v)
    O[fn] = e; n += 1
json.dump(O, open(oj, 'w'))
print('installed', n)
