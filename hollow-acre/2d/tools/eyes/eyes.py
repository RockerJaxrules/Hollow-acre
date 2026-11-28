# finds each NPC's eyes in every frame of its sheet: an LPC eye is a 2x2 block whose top row is a dark pupil beside a pure white
# glint (either order) and whose bottom row is the iris. Writes bugs/eyes.json: {id:{clip:{dir:[[ [dx,dy],... ] per frame]}}}
# (dx,dy) = the eye block's top-left pixel, relative to the frame's anchor (ax,ay).
from PIL import Image
import json,sys
NPCS=['mae','hale','tobias','hollis','agnes','dunn','ruth','silas','june','otto','cora','wes','ida','gideon','nell','ezra','pip','orla','bram','abel','della','maud','corwin','tess','hob','lyle','vera','quinn','nan','finn','iris','moss','ada']
def lum(p):return .3*p[0]+.59*p[1]+.11*p[2]
XOK=(16,18,19,27,29)   # where an LPC eye block can start: facing front 19 and 27; left 18 (16 on the older heads); right 27 (29)
def eyes_in(fr,fw,fh):
  W,H=fr.size;px=fr.load();out=[]
  for y in range(0,min(H-1,48)):
    for x in XOK:
      a,b=px[x,y],px[x+1,y]
      if a[3]<200 or b[3]<200:continue
      wa=a[:3]==(255,255,255);wb=b[:3]==(255,255,255)
      if wa==wb:continue
      pup=b if wa else a
      if not lum(pup)<110:continue
      c,d=px[x,y+1],px[x+1,y+1]
      if c[3]<200 or d[3]<200:continue
      if c[:3]==(255,255,255) or d[:3]==(255,255,255):continue
      if not(lum(c)<170 and lum(d)<170):continue
      out.append([x,y])
  return out
R={};bad=[]
for n in NPCS:
  try:im=Image.open('spr/lpc/%s.png'%n).convert('RGBA');m=json.load(open('spr/lpc/%s.json'%n))
  except Exception as e:print('skip',n,e);continue
  fw,fh,ax,ay=m['fw'],m['fh'],m['ax'],m['ay'];R[n]={}
  for clip,dirs in m['clips'].items():
    R[n][clip]={}
    for d,(row,nf) in dirs.items():
      L=[]
      for f in range(nf):
        fr=im.crop((f*fw,row*fh,(f+1)*fw,(row+1)*fh));e=eyes_in(fr,fw,fh);L.append([[x-ax,y-ay] for x,y in e])
        want={'S':2,'W':1,'E':1,'N':0}[d]
        if len(e)!=want:bad.append((n,clip,d,f,len(e)))
      R[n][clip][d]=L
json.dump(R,open('bugs/eyes.json','w'),separators=(',',':'))
from collections import Counter
print('npcs',len(R),'mismatches',len(bad));c=Counter((b[1],b[2],b[4]) for b in bad);print(c.most_common(30))
print([b for b in bad if b[1] in('walk','idle','sit')][:40])
