"""render every HD portrait (portrait4.py) into out/portraits_hd.png + .json"""
import json, numpy as np
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
from portrait4 import portrait, EXPRS
from chars4 import CH
IDS = ['nell', 'june', 'cora', 'ida', 'tess', 'iris', 'della', 'maud', 'mae']
def one(a): i, e = a; return a, portrait(CH[i], e)
if __name__ == '__main__':
    sheet = Image.new('RGBA', (128 * len(EXPRS), 128 * len(IDS)))
    with ProcessPoolExecutor(4) as ex:
        for (i, e), img in ex.map(one, [(i, e) for i in IDS for e in EXPRS]):
            sheet.paste(Image.fromarray(img), (EXPRS.index(e) * 128, IDS.index(i) * 128))
    sheet.save('out/portraits_hd.png', optimize=True)
    json.dump(dict(ids=IDS, pw=128, ph=128, expr=EXPRS), open('out/portraits_hd.json', 'w'))
    print('ok', sheet.size)
