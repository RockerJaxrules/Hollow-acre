"""render every HD portrait (portrait4.py): one sheet per scene version (day, night by lantern, rain), one row per person,
one column per expression -> out/portraits_hd_<var>.png + out/portraits_hd.json"""
import json, sys
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
from portrait4 import portrait, EXPRS, VARIANTS
from chars4 import CH
from faces4 import face
IDS = ['nell', 'june', 'cora', 'ida', 'tess', 'iris', 'della', 'maud', 'mae',
       'hale', 'tobias', 'hollis', 'agnes', 'dunn', 'ruth', 'gideon', 'ezra', 'pip', 'silas', 'otto', 'wes', 'hob', 'lyle', 'vera', 'quinn',
       'nan', 'finn', 'moss', 'ada', 'orla', 'bram', 'abel', 'corwin']
def one(a): i, e, v = a; return a, portrait(face(i, CH[i]), e, v)
if __name__ == '__main__':
    only = sys.argv[1].split(',') if len(sys.argv) > 1 else None
    for v in VARIANTS:
        path = f'out/portraits_hd_{v}.png'
        try: sheet = Image.open(path).convert('RGBA') if only else None
        except Exception: sheet = None
        if sheet is None or sheet.size != (128 * len(EXPRS), 128 * len(IDS)): sheet = Image.new('RGBA', (128 * len(EXPRS), 128 * len(IDS)))
        todo = [(i, e, v) for i in IDS if not only or i in only for e in EXPRS]
        with ProcessPoolExecutor(4) as ex:
            for (i, e, _), img in ex.map(one, todo):
                sheet.paste(Image.fromarray(img), (EXPRS.index(e) * 128, IDS.index(i) * 128))
        sheet.save(path, optimize=True); print(v, sheet.size, flush=True)
    json.dump(dict(ids=IDS, vars=VARIANTS, pw=128, ph=128, expr=EXPRS), open('out/portraits_hd.json', 'w'))
