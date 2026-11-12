import numpy as np, os
from PIL import Image, ImageDraw, ImageFont
FD='/home/user/Minecraftbot/hollow-acre/2d/spr/fonts/'
FB=lambda s:ImageFont.truetype(FD+'HollowPixel-Bold.ttf',s); FR=lambda s:ImageFont.truetype(FD+'HollowPixel-Regular.ttf',s)
fo=sorted(os.listdir('fo'));fn=sorted(os.listdir('fn'));N=min(len(fo),len(fn))
W0,W1=90,138              # the wipe runs from 3.0 s to 4.6 s
def ease(t):return t*t*(3-2*t)
def pill(img,text,x,y,alpha,sub=None):
    if alpha<=0:return
    d=ImageDraw.Draw(img,'RGBA');f=FB(30);bb=d.textbbox((0,0),text,font=f);w=bb[2]-bb[0];h=34
    sw=0
    if sub:fs=FR(20);sb=d.textbbox((0,0),sub,font=fs);sw=sb[2]-sb[0]+16
    tw=w+sw+32;X=x-tw//2
    d.rectangle([X,y,X+tw,y+h+12],fill=(24,16,14,int(205*alpha)),outline=(214,168,96,int(255*alpha)),width=3)
    d.text((X+16,y+6),text,font=f,fill=(246,226,180,int(255*alpha)))
    if sub:d.text((X+16+w+16,y+14),sub,font=FR(20),fill=(200,180,150,int(255*alpha)))
def title(img,alpha):
    if alpha<=0:return
    ov=Image.new('RGBA',img.size,(10,6,8,int(150*alpha)));img.alpha_composite(ov)
    d=ImageDraw.Draw(img,'RGBA')
    for txt,f,y,c in (('HOLLOW ACRE',FB(60),200,(236,206,140)),('one week of progress',FR(30),282,(220,200,170))):
        bb=d.textbbox((0,0),txt,font=f);x=(960-(bb[2]-bb[0]))//2
        d.text((x+3,y+3),txt,font=f,fill=(0,0,0,int(200*alpha)));d.text((x,y),txt,font=f,fill=c+(int(255*alpha),))
ys=np.arange(540)[:,None];xs=np.arange(960)[None,:]
frames=[]
for i in range(N):
    A=np.asarray(Image.open('fo/'+fo[i]).convert('RGB')).astype(np.float32);B=np.asarray(Image.open('fn/'+fn[i]).convert('RGB')).astype(np.float32)
    if i<W0:out=A
    elif i>=W1:out=B
    else:
        t=ease((i-W0)/(W1-W0));e=-140+t*(960+280)
        edge=e+(270-ys)*0.28                                   # a slanted edge
        m=(xs<edge).astype(np.float32)[...,None];out=B*m+A*(1-m)
        dist=np.abs(xs-edge)[...,None];glow=np.clip(1-dist/14,0,1)**2;core=(dist<2.5).astype(np.float32)
        col=np.array([255,232,176],np.float32);out=out*(1-glow*.55)+col*glow*.55;out=out*(1-core)+col*core
    img=Image.fromarray(np.clip(out,0,255).astype(np.uint8)).convert('RGBA')
    a_then=1.0 if i<W0-8 else max(0,(W0+4-i)/12);a_now=0 if i<W1-4 else min(1,(i-W1+4)/12)
    pill(img,'THEN',480,398,a_then if i>=34 else min(1,max(0,(i-22)/12)),'Nov 5');pill(img,'NOW',480,398,a_now,'Nov 12')
    if i<44:title(img,1.0 if i<26 else (44-i)/18)
    frames.append(img.convert('RGB'))
last=frames[-1]
for j in range(36):frames.append(last)
for k,f in enumerate(frames):f.save(f'out/{k:04d}.png')
print('frames',len(frames))
