# thumbnail atlases for the wardrobe: the idle, facing-you frame (row 10, frame 0) of every item's layer, one atlas per position group.
# The game recolours each cell with the look you're wearing. Run again whenever layers are added.
import glob,os,json,sys
from PIL import Image
# usage: python3 thumbs.py [dir holding the pl_*.png layers, default spr/lpc/pl]
PL=sys.argv[1] if len(sys.argv)>1 else 'spr/lpc/pl'
VAR=('_hoe','_can','_pick','_axe','_rod','_u')
groups={}
for f in sorted(glob.glob(PL+'/pl_*.png')):
    n=os.path.basename(f)[:-4]
    if n.startswith('pl_wdthumb') or n.startswith('pl_toolf') or any(n.endswith(v) for v in VAR): continue
    parts=n.split('_',2)
    if len(parts)<3: continue
    cat=parts[1]
    g={'body':'top'}.get(cat,cat)
    groups.setdefault(g,[]).append(n)
for g,names in groups.items():
    cols=min(16,len(names));rows=(len(names)+cols-1)//cols
    A=Image.new('RGBA',(48*cols,64*rows),(0,0,0,0));ids=[]
    for i,n in enumerate(names):
        im=Image.open(PL+'/'+n+'.png').convert('RGBA')
        A.paste(im.crop((0,10*64,48,11*64)),((i%cols)*48,(i//cols)*64));ids.append(n)
    out=PL+f'/pl_wdthumb_{g}'
    A.save(out+'.png',optimize=True);json.dump({'ids':ids,'cols':cols},open(out+'.json','w'),separators=(',',':'))
    print(g,len(names),os.path.getsize(out+'.png'))
