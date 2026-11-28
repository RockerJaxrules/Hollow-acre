import numpy as np
from PIL import Image
im=Image.open('spr/raw/road.png').convert('RGBA');W,H=im.size
a=np.asarray(im).astype(np.float32)/255;pm=a.copy();pm[...,:3]*=pm[...,3:4]
s=Image.fromarray((pm*255).astype(np.uint8)).resize((W//4,H//4),Image.BOX);b=np.asarray(s).astype(np.float32)/255
al=b[...,3];rgb=np.where(al[...,None]>0,b[...,:3]/np.maximum(al[...,None],1e-3),0)
rgb=np.round(rgb*255/6)*6
o=np.dstack([np.clip(rgb,0,255).astype(np.uint8),np.where(al>.5,255,0).astype(np.uint8)]);Image.fromarray(o,'RGBA').save('spr/px2/road.png')
g=Image.new('RGBA',(W//4,H//4),(46,70,38,255));r=Image.open('spr/px2/road.png');g.paste(r,(0,0),r);g.crop((0,0,320,240)).resize((640,480),0).save('roadprev.png')
