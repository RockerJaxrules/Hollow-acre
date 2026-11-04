import json, os, re
head = open('g2d/head_src.html').read()
base = open('base2.html').read()
a = base.index('const LETTER='); b = base.index('/* ================= characters')
story = base[a:b]
SPR = {}
SPR.update(json.load(open('spr/lpc/objects.json')))
for n in ('farmer', 'farmer_hoe', 'farmer_can', 'farmer_pick', 'farmer_axe', 'farmer_long_pick', 'farmer_long_axe', 'farmer_bun_pick', 'farmer_bun_axe', 'farmer_spiky_pick', 'farmer_spiky_axe', 'farmer_bangs_pick', 'farmer_bangs_axe', 'farmer_long', 'farmer_long_hoe', 'farmer_long_can', 'farmer_bun', 'farmer_bun_hoe', 'farmer_bun_can', 'farmer_spiky', 'farmer_spiky_hoe', 'farmer_spiky_can', 'farmer_bangs', 'farmer_bangs_hoe', 'farmer_bangs_can', 'mae', 'hale', 'tobias', 'hollis', 'agnes', 'dunn', 'ruth', 'hollow'):
    m = json.load(open(f'spr/lpc/{n}.json')); m['src'] = f'spr/lpc/{n}.png'; SPR[n] = m
bl = json.load(open('spr/out/sprites.json'))
for n in ('cat',):
    m = bl[n]; SPR[n] = dict(src=f'spr/out/{n}.png', fw=m['fw'], fh=m['fh'], ax=m['ax'], ay=m['ay'], clips=m['clips'])
for k, m in SPR.items():
    if 'foot' not in m: m['foot'] = [0, 0, 0, 0]
head = head.replace('/* Layout: full-bleed 3D world;', '/* Layout: full-bleed pixel world;')
css = '''
[hidden]{display:none!important}
#view{position:absolute;inset:0;image-rendering:pixelated;image-rendering:crisp-edges;display:block}
#joy{opacity:0;transition:opacity .15s}#joy.on{opacity:1}
#scare{image-rendering:pixelated}
#scare.slam{animation:slam .34s steps(5) forwards, shake .06s linear infinite}
@keyframes slam{0%{transform:scale(.35);opacity:.2}40%{transform:scale(1.15);opacity:1}100%{transform:scale(1.05);opacity:1}}
#btnAct.off{opacity:.55}
#loadScr{position:fixed;inset:0;z-index:999;background:#07070a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#cdbf9f;font-family:Georgia,serif;transition:opacity .8s}
#loadScr .lt{font-size:30px;letter-spacing:.12em;text-transform:uppercase;color:#e8dcc0}
#loadScr .lb{width:min(260px,70vw);height:3px;background:#221d18;overflow:hidden}#loadScr .lb i{display:block;height:100%;width:0;background:#b8521c;transition:width .2s}
#loadScr .ls{font-size:14px;opacity:.75}
#credits{font-size:11px;opacity:.6;margin-top:8px}#credits a{color:inherit}
</style>'''
head = head.replace('</style>', css, 1)
head = head.replace('<div id="app">', '<div id="app">\n  <canvas id="view"></canvas>', 1)
head = head.replace('<div class="small">Headphones on, silent mode off.</div>', '<div class="small">Headphones on, silent mode off.</div>\n    <div class="small" id="credits">Pixel art from the Liberated Pixel Cup (CC-BY-SA 3.0 / GPL 3.0) by Lanea Zimmerman (Sharm), Daniel Eddeland, bluecarrot16, Casper Nilsson, Xenodora, Daniel Armstrong, Eliza Wyatt, Johannes Sjölund, Stephen Challener and many more. Cars: Kenney Car Kit (CC0). Full list in CREDITS.</div>')
head = head.replace('<div><b>Right thumb</b> drag to look. Your lantern follows your eyes.</div>', '<div><b>Your lantern</b> shines where you walk. Point it at what hunts you.</div>')
head = head.replace('<div><b>Left thumb</b> walk. Push far to run.</div>', '<div><b>Drag anywhere</b> to walk. Push far to run.</div>')
loader = '<div id="loadScr" role="status" aria-live="polite"><div class="lt">Hollow Acre</div><div class="lb"><i id="loadBar"></i></div><div class="ls" id="loadTxt">Loading the valley…</div></div>\n'
js = 'const SPR=' + json.dumps(SPR) + ';\n' + open('g2d/audio.js').read() + '\n' + open('g2d/world.js').read() + '\n' + open('g2d/engine.js').read() + '\n' + open('g2d/game.js').read().replace('//@@STORY@@', story) + '\n' + open('g2d/main.js').read() + '\n' + open('g2d/mind.js').read() + '\n' + open('g2d/life.js').read() + '\n' + open('g2d/social.js').read() + '\n' + open('g2d/farm.js').read() + '\n' + open('g2d/interior.js').read() + '\n' + open('g2d/depth.js').read() + '\n' + open('g2d/econ.js').read() + '\n' + open('g2d/custom.js').read() + '\n' + open('g2d/ui.js').read()
out = '<meta charset="utf-8">\n' + loader + head + '\n<script>\n(function(){\n"use strict";\n' + js + '\n})();\n</script>\n'
open('hollow-acre-2d.html', 'w').write(out); print(len(out))
