"""Drive LibreSprite headless: one script per asset = palette/helpers + builder, with CFG injected."""
import json, os, subprocess, sys
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(D, 'out'); os.makedirs(OUT, exist_ok=True)
LS = '/tmp/ls/build/bin/libresprite'
def run(builder, cfg, size):
    blank = os.path.join(OUT, f'_{cfg["name"]}_blank.png'); Image.new('RGBA', size, (0, 0, 0, 0)).save(blank)
    cfg = dict(cfg, out=os.path.join(OUT, cfg['name']))
    sc = os.path.join(OUT, f'_{cfg["name"]}.js')
    open(sc, 'w').write('///permission fs.write\nconst CFG=' + json.dumps(cfg) + ';\n' + open(os.path.join(D, 'lib.js')).read() + '\n' + open(os.path.join(D, builder)).read())
    r = subprocess.run([LS, '-b', blank, '--script', sc], capture_output=True, text=True, env=dict(os.environ, SDL_VIDEODRIVER='dummy'), timeout=120)
    meta = None
    for line in (r.stdout + r.stderr).splitlines():
        if line.startswith('META '): meta = json.loads(line[5:])
        elif 'rror' in line or 'mismatch' in line: print('  !', line)
    os.remove(blank)
    return meta
