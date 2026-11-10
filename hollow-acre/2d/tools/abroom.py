"""room a/b sheets: python3 abroom.py <out> name:dir:slot ...  (slot = where the new shot goes)"""
import sys, os
from PIL import Image, ImageDraw
out = sys.argv[1]; os.makedirs(out, exist_ok=True); key = []
for i, a in enumerate(sys.argv[2:], 1):
    n, d, slot = a.split(':')
    new = Image.open(f'{d}/{n}.png').convert('RGB').crop((150, 60, 850, 644))
    old = Image.open(f'rooms_base/{n}.png').convert('RGB').crop((150, 60, 850, 644))
    L, R = (new, old) if slot == 'a' else (old, new)
    s = Image.new('RGB', (1430, 604), (20, 20, 20)); s.paste(L, (10, 18)); s.paste(R, (720, 18))
    g = ImageDraw.Draw(s); g.text((12, 3), 'a', fill=(230, 230, 230)); g.text((722, 3), 'b', fill=(230, 230, 230))
    s.save(f'{out}/room{i}.png'); key.append(f'{i} {n} new={slot}')
open(f'{out}_key.txt', 'w').write('\n'.join(key)); print('\n'.join(key))
