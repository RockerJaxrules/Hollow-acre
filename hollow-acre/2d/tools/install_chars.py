import json, shutil, os
M = json.load(open('px/out/chibi2_meta.json')); os.makedirs('spr/lpc/pl', exist_ok=True)
for n, m in M.items():
    d = 'spr/lpc/pl' if n.startswith('pl_') else 'spr/lpc'
    shutil.copy(f'px/out/{n}.png', f'{d}/{n}.png'); json.dump(m, open(f'{d}/{n}.json', 'w'))
print(len(M))
