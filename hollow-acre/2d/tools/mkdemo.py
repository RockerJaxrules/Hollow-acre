#!/usr/bin/env python3
"""Builds the demo's page from tools/demo_src.html, with the loading screen's night scene (src/loader.html) and the game's pixel
font (src/fontdata.js) put into it.

  python3 tools/mkdemo.py                      -> 2d/demo/index.html, the demo link: it plays ../index.html (the live game)
  python3 tools/mkdemo.py --gamejolt OUT.zip   -> the Game Jolt browser build: index.html (this page) + game.html (the
                                                  game) + its pictures, every path relative, no service worker

The demo page never needs rebuilding for a game update: it always plays the newest game. Rebuild it only when demo_src.html,
the night scene or the font changes, and rebuild the Game Jolt zip whenever Game Jolt should get a newer game.
"""
import json, os, re, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
D2 = os.path.normpath(os.path.join(HERE, '..'))           # hollow-acre/2d


def page(cfg, icon):
    s = open(os.path.join(HERE, 'demo_src.html'), encoding='utf-8').read()
    L = open(os.path.join(D2, 'src', 'loader.html'), encoding='utf-8').read()
    a = L.index('window.HAScene=function'); b = L.index('requestAnimationFrame(frame);};', a) + len('requestAnimationFrame(frame);};')
    fd = open(os.path.join(D2, 'src', 'fontdata.js'), encoding='utf-8').read()
    font = re.search(r'css\.textContent=`([\s\S]*?)`;document\.head', fd).group(1)
    out = (s.replace('/*@@SCENE@@*/', L[a:b]).replace('/*@@FONT@@*/', font).replace('/*@@ICON@@*/', icon)
             .replace('/*@@CFG@@*/', 'const DM_CFG=' + json.dumps(cfg) + ';'))
    assert '@@' not in out, 'a placeholder was left in the page'
    return out


WEB = {'where': 'web', 'game': '../index.html', 'base': '../',
       'full': 'https://rockerjaxrules.github.io/Hollow-acre/hollow-acre/2d/',
       'apps': 'https://github.com/RockerJaxrules/Hollow-acre/releases/latest', 'newTab': False}


def web():
    os.makedirs(os.path.join(D2, 'demo'), exist_ok=True)
    p = os.path.join(D2, 'demo', 'index.html')
    open(p, 'w', encoding='utf-8').write(page(WEB, '../icon-192.png'))
    print('demo page', p, os.path.getsize(p), 'bytes')


def gamejolt(zpath):
    """The Game Jolt build: inside Game Jolt's frame the game can't reach the website's copy, so the zip carries the game too."""
    cfg = dict(WEB, where='gamejolt', game='game.html', base='', newTab=True)
    html = open(os.path.join(D2, 'index.html'), encoding='utf-8').read()
    bid = re.search(r'BUILD_ID="(\d+)"', html).group(1)
    v = json.load(open(os.path.join(D2, 'version.json')))
    assert str(v['id']) == bid, 'index.html and version.json name different builds'
    files = {'index.html': page(cfg, 'icon-192.png').encode('utf-8'), 'game.html': html.encode('utf-8')}
    for f in ('version.json', 'CREDITS.txt', 'icon-192.png', 'icon-512.png'):
        files[f] = open(os.path.join(D2, f), 'rb').read()
    for root in ('spr', 'vendor'):
        for dp, dn, fn in os.walk(os.path.join(D2, root)):
            dn[:] = sorted(d for d in dn if not d.startswith('backup_'))   # (old art backups the game never asks for)
            for f in sorted(fn):
                full = os.path.join(dp, f); rel = os.path.relpath(full, D2).replace(os.sep, '/')
                files[rel] = open(full, 'rb').read()
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for rel in sorted(files, key=lambda r: (r != 'index.html', r)):
            zi = zipfile.ZipInfo(rel, (2026, 1, 1, 0, 0, 0)); zi.external_attr = 0o644 << 16
            z.writestr(zi, files[rel], zipfile.ZIP_DEFLATED)
    print('game jolt build', zpath, 'game build', bid, len(files), 'files', os.path.getsize(zpath), 'bytes')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--gamejolt':
        gamejolt(sys.argv[2])
    else:
        web()
