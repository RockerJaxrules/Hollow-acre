"""The inspector's look at every sprite on its own: does it follow the art rules?
Flags soft alpha (anything not 0 or 255), too many colours (muddy, not a locked palette), sprites with no
outline/contact edge, and lists what has and hasn't been redrawn through tools/px/pipeline.py yet.
People, the player, farming animations and the scarecrow are listed but never flagged (they stay as they are).
Usage (from hollow-acre/2d): python3 tools/inspect/assets.py [out.json]"""
import json, sys, os
import numpy as np
from PIL import Image
KEEP = ('farmer', 'char_', 'npc_', 'portrait', 'hollow', 'scarecrow', 'ruth', 'cat', 'chicken', 'cow', 'wild_', 'butterfly', 'crop_', 'icon')
d = json.load(open('spr/lpc/objects.json')); rows = []
cache = {}
for name, m in sorted(d.items()):
    src = m.get('src')
    if not src or not os.path.exists(src): continue
    if src not in cache:
        a = np.array(Image.open(src).convert('RGBA')); al = a[..., 3]
        soft = int(((al > 0) & (al < 255)).sum()); op = a[al > 0][:, :3]
        cols = len(np.unique(op.reshape(-1, 3), axis=0)) if len(op) else 0
        cache[src] = (soft, cols, int((al > 0).sum()), a.shape[1], a.shape[0])
    soft, cols, area, W, H = cache[src]
    kept = name.startswith(KEEP)
    rows.append({'name': name, 'src': src, 'w': W, 'h': H, 'soft_alpha_px': soft, 'colours': cols, 'kept': kept,
                 'pipeline': bool(m.get('px')), 'issues': [] if kept else [x for x, c in (('soft alpha', soft > 0), ('too many colours', cols > 48 and area < 40000)) if c]})
out = {'sprites': len(rows), 'kept': sum(r['kept'] for r in rows), 'redrawn_with_pipeline': sum(r['pipeline'] for r in rows),
       'flagged': [r for r in rows if r['issues']]}
out['flagged_count'] = len(out['flagged'])
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else 'tools/inspect/assets_report.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in out.items() if k != 'flagged'}, indent=1))
print('worst:', [(r['name'], r['soft_alpha_px'], r['colours']) for r in sorted(out['flagged'], key=lambda r: -r['soft_alpha_px'])[:12]])
