# Hollow Acre trailer: the early build then today's for each shared feature (slanted wipe), plus today's new features. No dates.
# usage: python3 compose2.py RECDIR OUTDIR   (RECDIR holds old.webm/new.webm and *_marks.json from scene.js)
import numpy as np, os, sys, json, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont
REC,OUT=sys.argv[1],sys.argv[2]
FD='/home/user/Minecraftbot/hollow-acre/2d/spr/fonts/'
FB=lambda s:ImageFont.truetype(FD+'HollowPixel-Bold.ttf',s); FR=lambda s:ImageFont.truetype(FD+'HollowPixel-Regular.ttf',s)
FPS=30; OV=36          # frames the wipe takes (old tail overlaps new head)
SEG=[('creator','Making your farmer',6.2,'both'),('crash','The crash',9.6,'both'),('walk','Walking',4.4,'both'),
     ('chop','Chopping',4.7,'both'),('mine','Mining',4.0,'both'),('farm','Farming',7.8,'both'),('fish','Fishing',5.7,'both'),
     ('craft','Crafting',5.8,'both'),('forge','The furnace',5.0,'new'),('bag','The backpack',3.0,'both'),('skills','Skills',3.4,'new'),
     ('map','The map',3.8,'both'),('town','The town',4.5,'both'),('talk','The people',5.6,'both'),('heart','Heart events',6.0,'new'),
     ("cabin","Grandpa's cabin",3.5,'both'),('store','The general store',3.5,'both'),('tavern','The Lamplighter',3.3,'new'),
     ('lake','Black Lake',4.0,'new'),('wickham','Wickham Crossing',3.8,'new'),('night','Night',4.3,'both'),('scare','The Hollow',3.5,'both')]
mk={b:json.load(open(f'{REC}/{b}_marks.json')) for b in ('old','new')}
def dur(b,i):
    n,D=SEG[i][0],SEG[i][2];t=mk[b][n];later=sorted(v for v in mk[b].values() if v>t)
    if later:D=min(D,(later[0]-t)/1000-.05)
    return D
def extract(b,i):
    n=SEG[i][0];d=f'{OUT}/src/{n}_{b}';os.makedirs(d,exist_ok=True)
    if not os.listdir(d):
        subprocess.run(['ffmpeg','-v','error','-ss',f'{mk[b][n]/1000:.3f}','-i',f'{REC}/{b}.webm','-t',f'{dur(b,i):.3f}','-vf',f'fps={FPS}',f'{d}/%04d.png'],check=True)
    return [f'{d}/{f}' for f in sorted(os.listdir(d))]
def load(p):return np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
def ease(t):return t*t*(3-2*t)
ys=np.arange(540)[:,None];xs=np.arange(960)[None,:];GL=np.array([255,232,176],np.float32)
def wipe(A,B,t):
    e=-140+ease(t)*(960+280);edge=e+(270-ys)*0.28;m=(xs<edge).astype(np.float32)[...,None];out=B*m+A*(1-m)
    dist=np.abs(xs-edge)[...,None];glow=np.clip(1-dist/14,0,1)**2;core=(dist<2.5).astype(np.float32)
    out=out*(1-glow*.55)+GL*glow*.55;return out*(1-core)+GL*core
def pill(img,text,sub,alpha,y=398):
    if alpha<=0:return
    d=ImageDraw.Draw(img,'RGBA');f=FB(30);fs=FR(20);w=d.textbbox((0,0),text,font=f)[2];sw=d.textbbox((0,0),sub,font=fs)[2]+16
    tw=w+sw+32;X=480-tw//2
    d.rectangle([X,y,X+tw,y+46],fill=(24,16,14,int(205*alpha)),outline=(214,168,96,int(255*alpha)),width=3)
    d.text((X+16,y+6),text,font=f,fill=(246,226,180,int(255*alpha)));d.text((X+16+w+16,y+14),sub,font=fs,fill=(200,180,150,int(255*alpha)))
def card(img,big,small,alpha,dim=150):
    if alpha<=0:return
    img.alpha_composite(Image.new('RGBA',img.size,(10,6,8,int(dim*alpha))));d=ImageDraw.Draw(img,'RGBA')
    rows=[(big,FB(56),214,(236,206,140))]+([(small,FR(26),290,(220,200,170))] if small else [])
    for txt,f,y,c in rows:
        bb=d.textbbox((0,0),txt,font=f);x=(960-(bb[2]-bb[0]))//2
        d.text((x+3,y+3),txt,font=f,fill=(0,0,0,int(200*alpha)));d.text((x,y),txt,font=f,fill=c+(int(255*alpha),))
if os.path.isdir(f'{OUT}/out'):shutil.rmtree(f'{OUT}/out')
os.makedirs(f'{OUT}/out');k=0
def emit(arr,over=None):
    global k;img=Image.fromarray(np.clip(arr,0,255).astype(np.uint8)).convert('RGBA')
    if over:over(img)
    img.convert('RGB').save(f'{OUT}/out/{k:05d}.png');k+=1
last_frame=None
for i,(n,title,_,kind) in enumerate(SEG):
    fn=extract('new',i);Nn=len(fn)
    if kind=='new':
        if i==0:
            A=load(fn[0])
            for j in range(54):emit(A,lambda im,j=j:card(im,'HOLLOW ACRE','then and now',1.0 if j<40 else (54-j)/14,170))
        for j in range(Nn):
            B=load(fn[j]);fade=min(1,(j+1)/5,(Nn-j)/5)
            emit(B*fade,lambda im,j=j:(card(im,title.upper(),None,1.0 if j<16 else max(0,(26-j)/10),120),pill(im,'NEW',title,min(1,max(0,(j-14)/8)))))
        last_frame=fn[-1];print(n,'new',Nn,k,flush=True);continue
    fo=extract('old',i);No=len(fo)
    if i==0:   # opening card over the first frame
        A=load(fo[0])
        for j in range(54):emit(A,lambda im,j=j:card(im,'HOLLOW ACRE','then and now',1.0 if j<40 else (54-j)/14,170))
    for j in range(No-OV):     # the early build
        A=load(fo[j]);fade=min(1,(j+1)/5) if i>0 else 1
        emit(A*fade,lambda im,j=j:(card(im,title.upper(),None,1.0 if j<16 else max(0,(26-j)/10),120),pill(im,'THEN',title,min(1,max(0,(j-14)/8)))))
    for j in range(OV):        # the wipe: old tail under new head
        A=load(fo[No-OV+j]);B=load(fn[j]);t=j/(OV-1)
        emit(wipe(A,B,t),lambda im,j=j:(pill(im,'THEN',title,max(0,1-j/8)),pill(im,'NOW',title,max(0,(j-OV+10)/10))))
    for j in range(OV,Nn):     # today's build
        B=load(fn[j]);last=i==len(SEG)-1;fade=1 if last else min(1,(Nn-j)/5)
        emit(B*fade,lambda im,j=j:pill(im,'NOW',title,1))
    last_frame=fn[-1];print(n,No,Nn,k,flush=True)
B=load(last_frame)
for j in range(66):emit(B,lambda im,j=j:card(im,'HOLLOW ACRE',None,min(1,j/14),190))
print('frames',k)
