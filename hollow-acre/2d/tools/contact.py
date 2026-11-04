import json,sys
from PIL import Image,ImageDraw
src,bx,out=sys.argv[1],json.load(open(sys.argv[2])),sys.argv[3]
im=Image.open(src).convert('RGBA');C=72;cols=16
keep=[(i,b) for i,b in enumerate(bx) if (b[2]-b[0])>=10 and (b[3]-b[1])>=10]
rows=(len(keep)+cols-1)//cols;sh=Image.new('RGBA',(cols*C,rows*(C+12)),(60,60,70,255));d=ImageDraw.Draw(sh)
for k,(i,b) in enumerate(keep):
    c=im.crop(b);s=min(1,(C-4)/max(c.size));c=c.resize((max(1,int(c.width*s)),max(1,int(c.height*s))),Image.NEAREST)
    x=(k%cols)*C;y=(k//cols)*(C+12);sh.alpha_composite(c,(x+2,y+12));d.text((x+2,y),f'{i} {b[2]-b[0]}x{b[3]-b[1]}',fill=(255,255,0))
sh.save(out);print(len(keep))
