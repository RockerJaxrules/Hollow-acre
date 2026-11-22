# the cut-apart and skinned cow for the processing steps: written into butchsteps as more of BK.IMG (python3 mkdata2.py <path of butchsteps.js>)
import json, sys
D = json.load(open('lie.json'))
keys = ['cowBodyB', 'cowHeadB', 'cowShankF', 'cowSkinB', 'cowThighH', 'cowShankH', 'cowThighS']
lines = ['/*@@STEPDATA (t373/mkdata2.py: the cow cut apart and skinned, drawn in cow_lie.py) */', 'Object.assign(BK.IMG,{']
for k in keys:
    w, h, pal, runs, x, y = D[k]
    assert '/' not in runs and '*' not in runs and '<' not in runs
    lines.append(' %s:[%d,%d,%s,%s,%d,%d],' % (k, w, h, json.dumps(','.join(pal)), json.dumps(runs), x, y))
lines.append('});'); lines.append('/*@@END2*/')
out = '\n'.join(lines)
p = sys.argv[1]; src = open(p).read()
a = src.index('/*@@STEPDATA'); b = src.index('/*@@END2*/') + len('/*@@END2*/'); open(p, 'w').write(src[:a] + out + src[b:]); print(len(out), 'bytes')
