"""render every HD portrait (portrait4.py) into out/portraits_hd.png + .json: one row per person per scene variant
(day, night by lantern, rain), one column per expression"""
import json, numpy as np
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
from portrait4 import portrait, EXPRS, VARIANTS
from chars4 import CH
IDS = ['nell', 'june', 'cora', 'ida', 'tess', 'iris', 'della', 'maud', 'mae']
ROWS = [(i, v) for i in IDS for v in VARIANTS]
def key(i, v): return i if v == 'day' else i + '@' + v
def one(a): (i, v), e = a; return a, portrait(CH[i], e, v)
if __name__ == '__main__':
    sheet = Image.new('RGBA', (128 * len(EXPRS), 128 * len(ROWS)))
    with ProcessPoolExecutor(4) as ex:
        for ((i, v), e), img in ex.map(one, [(r, e) for r in ROWS for e in EXPRS]):
            sheet.paste(Image.fromarray(img), (EXPRS.index(e) * 128, ROWS.index((i, v)) * 128))
    sheet.save('out/portraits_hd.png', optimize=True)
    json.dump(dict(ids=[key(i, v) for i, v in ROWS], pw=128, ph=128, expr=EXPRS), open('out/portraits_hd.json', 'w'))
    print('ok', sheet.size)
