# the cow's pictures into the kill module: BK.IMG holds each as [w,h,palette,runs,x,y]; BK.img(name) paints it once into a canvas
import json, sys, re
sys.path.insert(0, '.')
from pxk import ALPH
D = {}
for f in ('stand.json', 'lie.json'): D.update(json.load(open(f)))
D = {k: v for k, v in D.items() if k in ('cowF', 'cowChest', 'cowStand', 'cowLie', 'cowLeg0', 'cowLeg1', 'cowLeg2', 'cowLeg3')}
lines = ['/*@@COWDATA (t373/mkdata.py: the cow drawn in t373/cow_stand.py and cow_lie.py) */', 'BK.AL=' + json.dumps(ALPH) + ';', 'BK.IMG={']
for k, v in D.items():
    w, h, pal, runs, x, y = v
    assert '/' not in runs and '*' not in runs and '<' not in runs and '"' not in runs and '\\' not in runs
    lines.append(' %s:[%d,%d,%s,%s,%d,%d],' % (k, w, h, json.dumps(','.join(pal)), json.dumps(runs), x, y))
lines.append('};')
lines.append("BK.img=n=>{const d=BK.IMG[n];return M4.pre('bkimg_'+n,d[0],d[1],(K,g)=>{const id=g.createImageData(d[0],d[1]),a=id.data,rgb=d[2].split(',').map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));let i=0;"
             "d[3].replace(/([^0-9])([0-9]*)/g,(m,c,n)=>{const k=n?+n:1;if(c!=='.'){const p=rgb[BK.AL.indexOf(c)];for(let q=0;q<k;q++){const o=(i+q)*4;a[o]=p[0];a[o+1]=p[1];a[o+2]=p[2];a[o+3]=255;}}i+=k;return '';});g.putImageData(id,0,0);});};")
lines.append('/*@@END*/')
out = '\n'.join(lines)
open('cowdata.js', 'w').write(out)
# splice into the kill module
p = sys.argv[1] if len(sys.argv) > 1 else 'butchkill.js'; src = open(p).read()
if '/*@@COWDATA' in src:
    a = src.index('/*@@COWDATA'); b = src.index('/*@@END*/') + len('/*@@END*/'); src = src[:a] + out + src[b:]
else:
    k = src.index('// ---------------------------------------------------------------- the hen: pin her'); src = src[:k] + out + '\n' + src[k:]
open(p, 'w').write(src); print(len(out), 'bytes of data')
