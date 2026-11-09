"""Bundle every image the game page references into a few JSON packs (path -> data URL), so the published artifact
holds a handful of files instead of ~900 (a version can hold at most 511). The page loads packs.json first; when it
isn't there (GitHub Pages, local runs) the game loads each image from its own path as before."""
import re, json, os, base64
h = open('hollow-acre-2d.html').read()
refs = sorted(r for r in set(re.findall(r'(spr/[A-Za-z0-9_/.\-]+\.png)', h)) if os.path.exists(r))
LIM = 9_000_000
packs, cur, size = [], {}, 0
def flush():
    global cur, size
    if cur: packs.append(cur); cur, size = {}, 0
# the lazily loaded player layers go in their own packs, after everything the valley needs to start
for group in (lambda r: not r.startswith('spr/lpc/pl/'), lambda r: r.startswith('spr/lpc/pl/')):
    for r in [x for x in refs if group(x)]:
        d = 'data:image/png;base64,' + base64.b64encode(open(r, 'rb').read()).decode()
        if size + len(d) > LIM: flush()
        cur[r] = d; size += len(d)
    flush()
names = []
for i, p in enumerate(packs):
    n = f'pack_{i}.json'; json.dump(p, open(n, 'w'), separators=(',', ':')); names.append(n)
json.dump({'id': re.search(r'const BUILD_ID="(\d+)"', h).group(1), 'packs': names}, open('packs.json', 'w'))
print(len(refs), 'images in', len(names), 'packs', [round(os.path.getsize(n) / 1e6, 1) for n in names])
