# re-cut the last shot (the scare) so neither build's scare is hidden under the title card or the wipe
import os,sys
src=open('compose3.py').read()
head=src[:src.index("if os.path.isdir(f'{OUT}/out')")]          # helpers only
sys.argv=['x','rec3','v3'];exec(head)
START=4845
for f in sorted(os.listdir('v3/out')):
    if int(f[:5])>=START:os.remove('v3/out/'+f)
k=START
def emit(arr,over=None):
    global k;img=Image.fromarray(np.clip(arr,0,255).astype(np.uint8)).convert('RGBA')
    if over:over(img)
    img.convert('RGB').save(f'v3/out/{k:05d}.png');k+=1
i=[s[0] for s in SEG].index('scare');title=SEG[i][1]
fo,fn=extract('old',i),extract('new',i);No,Nn=len(fo),len(fn)
A0=load(fo[0])
for j in range(30):emit(A0*min(1,(j+1)/5),lambda im,j=j:card(im,title.upper(),None,1.0 if j<20 else (30-j)/10,120))
for j in range(No):A=load(fo[j]);emit(A,lambda im,j=j:pill(im,'THEN',title,min(1,j/6)))
B0=load(fn[0]);AL=load(fo[-1])
for j in range(OV):t=j/(OV-1);emit(wipe(AL,B0,t),lambda im,j=j:(pill(im,'THEN',title,max(0,1-j/8)),pill(im,'NOW',title,max(0,(j-OV+10)/10))))
for j in range(Nn):B=load(fn[j]);emit(B,lambda im,j=j:pill(im,'NOW',title,1))
B=load(fn[-1])
for j in range(66):emit(B,lambda im,j=j:card(im,'HOLLOW ACRE',None,min(1,j/14),190))
print('frames',k)
