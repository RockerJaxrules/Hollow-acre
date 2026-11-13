import os
import subprocess as _sp, sys as _sys
if _sp.call([_sys.executable,'lintcomments.py'])!=0: raise SystemExit('fix the swallowed code above first')
import json, os, re
head = open('g2d/head_src.html').read()
base = open('base2.html').read()
a = base.index('const LETTER='); b = base.index('/* ================= characters')
story = base[a:b]
SPR = {}
SPR.update(json.load(open('spr/lpc/objects.json')))
import glob as _g
for n in ('farmer', 'farmer_hoe', 'farmer_can', 'farmer_pick', 'farmer_axe', 'farmer_rod', 'farmer_bun', 'farmer_bun_pick', 'farmer_spiky', 'farmer_spiky_can', 'farmer_bangs', 'farmer_long', 'mae', 'hale', 'tobias', 'hollis', 'agnes', 'dunn', 'ruth', 'hollow', 'silas', 'june', 'otto', 'cora', 'wes', 'ida', 'gideon', 'nell', 'ezra', 'pip', 'orla', 'bram', 'abel', 'della', 'maud', 'corwin', 'tess', 'hob', 'lyle', 'vera', 'quinn', 'nan', 'finn', 'iris', 'moss', 'ada'):
    m = json.load(open(f'spr/lpc/{n}.json')); m['src'] = f'spr/lpc/{n}.png'; SPR[n] = m
# the player's layers (body + outfit per tool, hair, facial hair, hats, glasses, the tool in front), assembled in custom.js
for f in sorted(_g.glob('spr/lpc/pl/pl_*.json')):
    n = os.path.basename(f)[:-5]; m = json.load(open(f)); m['src'] = f'spr/lpc/pl/{n}.png'; m['lazy'] = 1; SPR[n] = m
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
#scare{object-fit:cover}
#scare.slam{animation:slam .26s steps(4) forwards, shake .05s linear infinite}
@keyframes slam{0%{transform:scale(.7);opacity:1}30%{transform:scale(1.28);opacity:1}100%{transform:scale(1.08);opacity:1}}
#btnAct.off{opacity:.55}
#loadScr{position:fixed;inset:0;z-index:999;background:#07070a;color:#cdbf9f;font-family:'Hollow Pixel',ui-monospace,monospace;transition:opacity .8s;overflow:hidden}
#loadCv{position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}
#loadScr .lwrap{position:absolute;left:0;right:0;top:12%;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
#loadScr .lt{--p:calc(var(--K,3)*1px);font-size:calc(var(--K,3)*20px);letter-spacing:0;color:#f0a040;text-shadow:var(--p) 0 0 #140a04,calc(-1*var(--p)) 0 0 #140a04,0 var(--p) 0 #140a04,0 calc(-1*var(--p)) 0 #140a04,calc(2*var(--p)) calc(2*var(--p)) 0 #0009;white-space:nowrap}
#loadScr .lt span{display:inline-block;opacity:0;transform:translateY(-22px);animation:ltIn .5s steps(5) forwards,ltFlick 4.5s steps(1) 1.6s infinite}
#loadScr .lt span:nth-child(1){animation-delay:.05s,1.6s}#loadScr .lt span:nth-child(2){animation-delay:.12s,2.3s}#loadScr .lt span:nth-child(3){animation-delay:.19s,1.9s}#loadScr .lt span:nth-child(4){animation-delay:.26s,2.8s}
#loadScr .lt span:nth-child(5){animation-delay:.33s,2.1s}#loadScr .lt span:nth-child(6){animation-delay:.40s,3.1s}#loadScr .lt span:nth-child(8){animation-delay:.54s,2.5s}#loadScr .lt span:nth-child(9){animation-delay:.61s,1.7s}
#loadScr .lt span:nth-child(10){animation-delay:.68s,3.4s}#loadScr .lt span:nth-child(11){animation-delay:.75s,2.2s}#loadScr .lt .sp{width:.4em}
@keyframes ltIn{to{opacity:1;transform:none}}@keyframes ltFlick{0%,92%,100%{opacity:1}93%{opacity:.45}95%{opacity:1}96%{opacity:.7}}
#loadScr .lk{font-size:max(12px,calc(var(--K,3)*5px));letter-spacing:.32em;text-transform:uppercase;color:#b8a888;opacity:0;animation:ltIn .8s steps(4) 1s forwards;text-shadow:2px 2px 0 #000}
#loadScr .lfoot{position:absolute;left:0;right:0;bottom:4px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:0 16px;text-align:center}
#loadScr .ls{font-size:max(13px,calc(var(--K,3)*5px));color:#e8dcc0;text-shadow:2px 2px 0 #000,-1px -1px 0 #000;max-width:90vw;min-height:2.6em;margin-top:6px;text-align:center;padding:0 16px}
#loadScr .ls.in{animation:lsIn .6s steps(4)}@keyframes lsIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
#loadScr .lc{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a7c64;text-shadow:1px 1px 0 #000}
#loadScr .lb{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0}#loadScr .lb i{display:block}
@media (prefers-reduced-motion:reduce){#loadScr .lt span,#loadScr .lk{animation:none;opacity:1;transform:none}}
#credits{font-size:11px;opacity:.6;margin-top:8px}#credits a{color:inherit}
</style>'''
head = head.replace('</style>', css, 1)
head = head.replace('<div id="app">', '<div id="app">\n  <canvas id="view"></canvas>', 1)
head = head.replace('<div class="small">Headphones on, silent mode off.</div>', '<div class="small">Headphones on, silent mode off.</div>\n    <div class="small" id="credits">Everything by Jaxon Charlton. Multiplayer library: Trystero (MIT), see CREDITS.</div>')
head = head.replace('<div><b>Right thumb</b> drag to look. Your lantern follows your eyes.</div>', '<div><b>Your lantern</b> shines where you walk. Point it at what hunts you.</div>')
head = head.replace('<div><b>Left thumb</b> walk. Push far to run.</div>', '<div><b>Drag anywhere</b> to walk. Push far to run.</div>')
loader = open('g2d/loader.html').read() + '\n'
# the pixel font right in the page's head, so the loading screen has it from its first frame
import re as _re
_fd = open('g2d/fontdata.js').read(); _m = _re.search(r'@font-face\{[^`]*?\}', _fd)
if _m: head = head.replace('</style>', _m.group(0) + '\n</style>', 1)
import base64
_pm = json.load(open('px/out/portraits.json')); _pm['src'] = 'data:image/png;base64,' + base64.b64encode(open('px/out/portraits.png','rb').read()).decode()
_ph = json.load(open('px/out/portraits_hd.json')); _ph['srcs'] = {v: 'data:image/png;base64,' + base64.b64encode(open(f'px/out/portraits_hd_{v}.png','rb').read()).decode() for v in _ph['vars']}
import time as _t
# the player's sheets for the axe, hoe and pick are pixel-for-pixel the same picture (the tool head is drawn on top in toolfx.js):
# point them all at one file, so each is downloaded (and published) once
import hashlib as _hl
_seen = {}
for _n in sorted(SPR):
    if not (_n.startswith('farmer') or _n.startswith('pl_')): continue
    _s = SPR[_n].get('src')
    if not _s or not _s.endswith('.png') or not os.path.exists(_s): continue
    _d = _hl.md5(open(_s, 'rb').read()).hexdigest()
    if _d in _seen and _seen[_d] != _s: SPR[_n]['src'] = _seen[_d]
    else: _seen.setdefault(_d, _s)
BUILD_ID = str(int(_t.time()))
open('version.json','w').write(json.dumps({'id': BUILD_ID}))
js = 'const BUILD_ID=' + json.dumps(BUILD_ID) + ';\nconst SPR=' + json.dumps(SPR) + ';\nconst PORTRAITS=' + json.dumps(_pm) + ';\nconst PORTRAITS_HD=' + json.dumps(_ph) + ';\n' + open('g2d/account.js').read() + '\n' + open('g2d/audio.js').read() + '\n' + open('g2d/world.js').read() + '\n' + open('g2d/expand.js').read() + '\n' + open('g2d/engine.js').read() + '\n' + open('g2d/perfgrid.js').read() + '\n' + open('g2d/game.js').read().replace('//@@STORY@@', story) + '\n' + open('g2d/main.js').read() + '\n' + open('g2d/mind.js').read() + '\n' + open('g2d/life.js').read() + '\n' + open('g2d/social.js').read() + '\n' + open('g2d/farm.js').read() + '\n' + open('g2d/interior.js').read() + '\n' + open('g2d/depth.js').read() + '\n' + open('g2d/econ.js').read() + '\n' + open('g2d/regen.js').read() + '\n' + open('g2d/benches.js').read() + '\n' + open('g2d/place.js').read() + '\n' + open('g2d/furnrot.js').read() + '\n' + open('g2d/town.js').read() + '\n' + open('g2d/shops.js').read() + '\n' + open('g2d/custom.js').read() + '\n' + open('g2d/toolfx.js').read() + '\n' + open('g2d/lantern.js').read() + '\n' + open('g2d/craftui.js').read() + '\n' + open('g2d/craftart.js').read() + '\n' + open('g2d/craftgames.js').read() + '\n' + open('g2d/craftgames3.js').read() + '\n' + open('g2d/craftrecipes.js').read() + '\n' + open('g2d/menu.js').read() + '\n' + open('g2d/fishing.js').read() + '\n' + open('g2d/hearts.js').read() + '\n' + open('g2d/tutorial.js').read() + '\n' + open('g2d/folk2.js').read() + '\n' + open('g2d/wickham.js').read() + '\n' + open('g2d/wick2.js').read() + '\n' + open('g2d/story.js').read() + '\n' + open('g2d/horror.js').read() + '\n' + open('g2d/finale.js').read() + '\n' + open('g2d/save.js').read() + '\n' + open('g2d/progress.js').read() + '\n' + open('g2d/guide.js').read() + '\n' + open('g2d/net.js').read() + '\n' + open('g2d/coop.js').read() + '\n' + open('g2d/death.js').read() + '\n' + open('g2d/host.js').read() + '\n' + open('g2d/portraits.js').read() + '\n' + open('g2d/mapx.js').read() + '\n' + open('g2d/wayfind.js').read() + '\n' + open('g2d/carfix.js').read() + '\n' + open('g2d/tapact.js').read() + '\n' + open('g2d/fontdata.js').read() + '\n' + open('g2d/ui.js').read() + '\n' + open('g2d/layout.js').read() + '\n' + open('g2d/hud2.js').read() + '\n' + open('g2d/update.js').read() + '\n' + open('g2d/houseup.js').read() + '\n' + open('g2d/shipbin.js').read() + '\n' + open('g2d/skills.js').read() + '\n' + open('g2d/quarry.js').read() + '\n' + open('g2d/fish2.js').read() + '\n' + open('g2d/fish3.js').read() + '\n' + open('g2d/fish5.js').read() + '\n' + (open('g2d/fish4.js').read() + '\n' if os.environ.get('FISH4') else '') + open('g2d/craftico.js').read() + '\n' + open('g2d/mg4core.js').read() + '\n' + open('g2d/mg4art.js').read() + '\n' + open('g2d/mg4games.js').read() + '\n' + open('g2d/mg4forge.js').read() + '\n' + open('g2d/mg4craft.js').read() + '\n' + open('g2d/mg4build.js').read() + '\n' + open('g2d/mg4car.js').read() + '\n' + open('g2d/mg4car2.js').read() + '\n' + open('g2d/quality.js').read() + '\n' + open('g2d/npcpath.js').read() + '\n' + open('g2d/homes2.js').read() + '\n' + open('g2d/accountui.js').read() + '\n' + open('g2d/world67.js').read() + '\n' + open('g2d/gifts.js').read() + '\n' + open('g2d/romance.js').read() + '\n' + open('g2d/perks.js').read() + '\n' + open('g2d/scare2.js').read() + '\n' + open('g2d/actchip.js').read() + '\n' + open('g2d/flora.js').read() + '\n' + open('g2d/wildlife.js').read() + '\n' + open('g2d/carry.js').read() + '\n' + open('g2d/furn2.js').read() + '\n' + open('g2d/shops2.js').read() + '\n' + open('g2d/shopsbig.js').read() + '\n' + open('g2d/mine2.js').read() + '\n' + open('g2d/hevents.js').read() + '\n' + open('g2d/sound.js').read() + '\n' + open('g2d/sprink2.js').read() + '\n' + open('g2d/fsx.js').read() + '\n' + open('g2d/snug.js').read() + '\n' + open('g2d/saga.js').read() + '\n' + open('g2d/romance2.js').read() + '\n' + open('g2d/festival.js').read() + '\n' + open('g2d/hearts2.js').read() + '\n' + open('g2d/homes3.js').read() + '\n' + open('g2d/ambient.js').read() + '\n' + open('g2d/regions.js').read() + '\n' + open('g2d/regionstory.js').read() + '\n' + open('g2d/rgfolk.js').read() + '\n' + open('g2d/rgfest.js').read() + '\n' + open('g2d/rgrooms.js').read() + '\n' + open('g2d/rgnight.js').read() + '\n' + open('g2d/rgplaces.js').read() + '\n' + open('g2d/rgcount.js').read() + '\n' + open('g2d/newtown.js').read() + '\n' + open('g2d/homesdress.js').read() + '\n' + open('g2d/routines.js').read() + '\n' + open('g2d/reactive.js').read() + '\n' + open('g2d/darkpath.js').read() + '\n' + open('g2d/gore.js').read() + '\n' + open('g2d/declutter.js').read() + '\n' + open('g2d/porch.js').read() + '\n' + open('g2d/safety.js').read() + '\n' + open('g2d/turn.js').read() + '\n' + open('g2d/seat.js').read() + '\n' + open('g2d/stage.js').read() + '\n' + open('g2d/carrepair.js').read() + '\n' + open('g2d/flaws.js').read() + '\n' + open('g2d/heartstage.js').read() + '\n' + open('g2d/heartmae.js').read() + '\n' + open('g2d/heartshow.js').read() + '\n' + open('g2d/mpworld.js').read() + '\n' + open('g2d/mpcompete.js').read() + '\n' + open('g2d/mplove.js').read() + '\n' + open('g2d/spouse.js').read() + '\n' + open('g2d/seasons.js').read() + '\n' + open('g2d/mending.js').read() + '\n' + open('g2d/decor.js').read() + '\n' + open('g2d/buildmode.js').read() + '\n' + open('g2d/dyeing.js').read() + '\n' + open('g2d/skillrecipes.js').read() + '\n' + open('g2d/crops2.js').read() + '\n' + open('g2d/brewing.js').read() + '\n' + open('g2d/butchery.js').read() + '\n' + open('g2d/pantry.js').read() + '\n' + open('g2d/mpident.js').read() + '\n' + open('g2d/mpsleep.js').read() + '\n' + open('g2d/journal2.js').read() + '\n' + open('g2d/npcwalk.js').read() + '\n' + open('g2d/mptut.js').read() + '\n' + open('g2d/land.js').read() + '\n' + open('g2d/cloud.js').read() + '\n' + open('g2d/titlefx.js').read() + '\n' + open('g2d/readup.js').read() + '\n' + open('g2d/housex.js').read() + '\n' + open('g2d/bizx.js').read() + '\n' + open('g2d/bizwar.js').read() + '\n' + open('g2d/empire.js').read() + '\n' + open('g2d/mapmarks.js').read() + '\n' + open('g2d/mpsync.js').read() + '\n' + open('g2d/mpstory.js').read() + '\n' + open('g2d/sights.js').read() + '\n' + open('g2d/countsight.js').read() + '\n' + open('g2d/display.js').read() + '\n' + open('g2d/mpcabin.js').read() + '\n' + open('g2d/growguide.js').read() + '\n' + open('g2d/fhouse.js').read() + '\n' + open('g2d/townhall.js').read() + '\n' + open('g2d/bizgrow.js').read() + '\n' + open('g2d/handshed.js').read() + '\n' + open('g2d/fixes310.js').read() + '\n' + open('g2d/fixes313.js').read() + '\n' + open('g2d/guides314.js').read() + '\n' + open('g2d/fixes321.js').read() + '\n' + open('g2d/fixes323.js').read() + '\n' + open('g2d/fest324.js').read() + '\n' + open('g2d/fest324g.js').read() + '\n' + open('g2d/art325.js').read() + '\n' + open('g2d/fixes326.js').read() + '\n' + open('g2d/hands333.js').read() + '\n' + open('g2d/mach334.js').read()
out = '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<meta name="theme-color" content="#07070a">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Hollow Acre">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-192.png">\n' + loader + head + '\n<script>\n/* Trystero (MIT) https://github.com/dmotz/trystero */\n' + open('g2d/trystero.iife.js' if os.path.exists('g2d/trystero.iife.js') else 'vendor/trystero.iife.js').read() + '\n</script>\n<script>\n(function(){\n"use strict";\n' + js + '\n})();\n</script>\n'
open('hollow-acre-2d.html', 'w').write(out); print(len(out))
