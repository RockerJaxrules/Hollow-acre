import sys,glob,os,json;sys.path.insert(0,'.')
from pix import *
from PIL import Image
names=sys.argv[1].split(',');ncol=int(sys.argv[2]) if len(sys.argv)>2 else 40
data=[pixelize(f'spr/raw/car/{n}.png') for n in names]
stack=np.concatenate([grade(r)[a>.45] for r,a in data])[:,None,:]
pal=Image.fromarray((stack*255).astype(np.uint8),'RGB').quantize(colors=ncol,method=Image.Quantize.MEDIANCUT)
for n,(r,a) in zip(names,data): finish(grade(r),a,pal).save(f'spr/raw/car/px_{n}.png')
