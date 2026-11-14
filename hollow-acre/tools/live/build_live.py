"""Builds the shareable Hands Work Log page from the newest renders. Run, then publish site/index.html with its images."""
import os, time, json, html, subprocess
from PIL import Image
import sys, argparse
ap = argparse.ArgumentParser(description='Build the live work log page (Hands Work Log artifact).')
ap.add_argument('--renders', required=True, help='folder of render/screenshot images (scanned recursively, newest first)')
ap.add_argument('--site', required=True, help='output folder: index.html + img/')
ap.add_argument('--status', default='', help='text file with the one-paragraph status line')
ap.add_argument('--repo', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'), help='git repo for the "latest saved steps" list')
A = ap.parse_args()
ROOT = os.path.abspath(A.renders); SITE = os.path.abspath(A.site); os.makedirs(os.path.join(SITE, 'img'), exist_ok=True)
N = 12
NAMES = {'game_desk_mid': "Driver's seat", 'game_desk_dark': "Driver's seat, dark skin", 'game_desk_light': "Driver's seat, light skin",
         'game_phone_mid': 'Phone screen', 'thumb': 'Close-up', 'look': 'Material views', 'look_R': 'Material views, right hand',
         'shape': 'Shape views', 'shape_R': 'Shape views, right hand', 'shape_rest': 'Flat hand (skeleton check)',
         'compare': 'Next to the real photo (photo: eddie.welker, CC BY-SA)', 'compare_zoom': 'Next to the real photo, zoomed (photo: eddie.welker, CC BY-SA)', 'compare_game': 'In-game next to the real photo (photo: eddie.welker, CC BY-SA)', 'parity_page': 'Blender vs in-game, page crop', 'parity': 'Blender vs in-game',
         'tones': 'All 7 skin tones (in-game)', 'sleeves': 'Sleeve types (in-game)', 'z_hands_mid': 'In-game close-up', 'z_hands_dark': 'In-game close-up, dark skin'}
def label(rel):
    parts = rel.split('/'); rnd = parts[0].upper() if parts[0].startswith('r') else ''
    base = os.path.splitext(parts[-1])[0]
    if base.startswith('tone_'): name = f'In-game skin tone #{base[5:]}'
    elif base.startswith('sl_'):
        _, kind, col = base.split('_', 2); name = f'In-game {kind} sleeve #{col}'
    else: name = NAMES.get(base, base.replace('_', ' '))
    if 'page' in parts[:-1] and not name.startswith('In-game'): name = 'In-game: ' + name
    return rnd, name
fs = []
for d, _, files in os.walk(ROOT):
    if 'old_pose' in d: continue
    for f in files:
        if f.lower().endswith(('.png', '.jpg')): p = os.path.join(d, f); fs.append((os.path.getmtime(p), p))
fs = sorted(fs, reverse=True)[:N]
items = []
for i, (t, p) in enumerate(fs):
    im = Image.open(p).convert('RGB'); im.thumbnail((1000, 1000)); out = f'img/{i:02d}.jpg'
    im.save(os.path.join(SITE, out), 'JPEG', quality=82)
    rnd, name = label(os.path.relpath(p, ROOT)); items.append(dict(src=out, t=int(t), rnd=rnd, name=name, w=im.width, h=im.height))

# Always show the newest in-game frames first, whatever else rendered later
import re
rounds = sorted([d for d in os.listdir(ROOT) if re.fullmatch(r'r\d+', d)], key=lambda d: int(d[1:]))
game = []
for rd in reversed(rounds):
    cand = [('page/game_desk_mid.png', "In the game: driver's seat"), ('page/game_desk_dark.png', 'In the game: darker skin, sweater'),
            ('page/game_phone_mid.png', 'In the game: on a phone'), ('compare_game.png', 'In the game next to the real photo (photo: eddie.welker, CC BY-SA)')]
    have = [(os.path.join(ROOT, rd, f), n) for f, n in cand if os.path.exists(os.path.join(ROOT, rd, f))]
    if have:
        for i, (p, n) in enumerate(have):
            im = Image.open(p).convert('RGB'); im.thumbnail((1400, 1400)); out = f'img/g{i}.jpg'
            im.save(os.path.join(SITE, out), 'JPEG', quality=84)
            game.append(dict(src=out, t=int(os.path.getmtime(p)), rnd=rd.upper(), name=n, w=im.width, h=im.height))
        break
log = subprocess.run(['git', '-C', A.repo, 'log', '-8', '--format=%ct|%s'], capture_output=True, text=True).stdout.splitlines()
steps = [dict(t=int(l.split('|', 1)[0]), s=l.split('|', 1)[1].split('\n')[0]) for l in log if '|' in l]
data = dict(built=int(time.time()), items=items, game=game, steps=steps, status=open(A.status).read().strip() if A.status and os.path.exists(A.status) else '')
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'template.html')).read()
open(os.path.join(SITE, 'index.html'), 'w').write(tpl.replace('/*DATA*/null', json.dumps(data)))
print(len(items), 'images;', [x['name'] for x in items[:4]])
