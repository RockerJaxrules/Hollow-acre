import json,numpy as np
from PIL import Image,ImageFilter
R='spr/raw/car/'
def shadow(im,dx=2,dy=3,a=90):
    m=np.asarray(im)[...,3]>0;H,W=m.shape
    sh=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    sm=np.zeros((H,W),bool);s=np.asarray(sh)>0
    sm[dy:,dx:]=s[:H-dy,:W-dx]
    out=np.zeros((H,W,4),np.uint8);out[sm]=(8,10,16,a)
    base=Image.fromarray(out,'RGBA');base.alpha_composite(im);return base
d=json.load(open(R+'drive.json'));w=json.load(open(R+'wreck.json'))
fr=[shadow(Image.open(f'{R}px_drive_{i}.png')) for i in range(7)]
fw,fh=fr[0].size;sheet=Image.new('RGBA',(fw*7,fh))
for i,f in enumerate(fr):sheet.paste(f,(i*fw,0))
sheet.save('spr/px2/car_drive.png')
json.dump(dict(fw=fw,fh=fh,ax=d['drive_0']['ax'],ay=d['drive_0']['ay'],clips={'yaw':{'S':[0,7]}}),open('spr/px2/car_drive.json','w'))
sw=shadow(Image.open(R+'px_side_W.png'));sw.save('spr/px2/car_side.png')
json.dump(dict(anchor=[d['side_W']['ax'],d['side_W']['ay']]),open('spr/px2/car_side.json','w'))
for n in ('wreck','wreck_n'):
    shadow(Image.open(f'{R}px_{n}.png')).save(f'spr/px2/car_{n}.png')
json.dump(dict(anchor=[w['wreck']['ax'],w['wreck']['ay']],foot=w['wreck']['foot']),open('spr/px2/car_wreck.json','w'))
print(fw,fh,sw.size)
