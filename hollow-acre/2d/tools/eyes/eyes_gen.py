# each NPC's eyes in every frame, from its sheet: the shared LPC head bobs the same way for everyone, so each NPC is its eye row
# in the standing front frame (h0), its eye columns facing front, left and right, and one shared table of how far the eyes move in
# each frame of each clip. Writes bugs/eyes_tab.json
from PIL import Image
import json
from collections import Counter,defaultdict
exec(open('bugs/eyes.py').read().split('R={};bad=[]')[0])   # NPCS, lum, eyes_in
def eyes_any(fr):
  W,H=fr.size;px=fr.load();out=[]
  for y in range(0,min(H-1,48)):
    for x in range(W-1):
      a,b=px[x,y],px[x+1,y]
      if a[3]<200 or b[3]<200:continue
      wa=a[:3]==(255,255,255);wb=b[:3]==(255,255,255)
      if wa==wb:continue
      pup=b if wa else a
      if not(lum(pup)<110 and pup[2]>=pup[0]):continue
      c,d=px[x,y+1],px[x+1,y+1]
      if c[3]<200 or d[3]<200 or c[:3]==(255,255,255) or d[:3]==(255,255,255):continue
      if not(lum(c)<170 and lum(d)<170 and c[2]-c[0]>=15 and d[2]-d[0]>=15):continue
      out.append([x,y])
  return out
def frame(n,clip,d,f):
  im=Image.open('spr/lpc/%s.png'%n).convert('RGBA');m=json.load(open('spr/lpc/%s.json'%n));row=m['clips'][clip][d][0]
  return im.crop((f*m['fw'],row*m['fh'],(f+1)*m['fw'],(row+1)*m['fh'])),m
def broad_h0(n):
  # the eyes of heads drawn without the glint (blind, black-eyed, behind round lenses): the topmost row where both eye columns
  # (19 and 28) are dark and the middle of the face (23, 24) is light
  fr,m=frame(n,'walk','S',0);px=fr.load();dark=lambda p:p[3]>200 and lum(p)<70;light=lambda p:p[3]>200 and lum(p)>120
  for y in range(14,50):
    if dark(px[19,y]) and dark(px[28,y]) and lum(px[19,y+1])<100 and lum(px[28,y+1])<100 and all(light(px[x,y]) for x in range(22,26)):
      # a lens with its pupil in the middle: the eye's own row is the pupil's
      return y-m['ay']
  return None
out={'npc':{},'tpl':{}};T=defaultdict(Counter);XS=defaultdict(Counter)
for n in NPCS:
  fr,m=frame(n,'walk','S',0);e=eyes_in(fr,m['fw'],m['fh']);e=[q for q in e if q[0] in(19,27)]
  if len(e)>2:e=[q for q in e if q[1]==Counter(z[1] for z in e).most_common(1)[0][0]]
  ys=Counter(q[1] for q in e);h0=(ys.most_common(1)[0][0]-m['ay']) if len(e)>=2 else broad_h0(n)
  rec={'h0':h0,'ax':m['ax'],'ay':m['ay']}
  for d,key in (('W','w'),('E','e')):
    xs=Counter()
    for f in range(9):
      fr,_=frame(n,'walk',d,f);xs.update(q[0]-m['ax'] for q in eyes_in(fr,m['fw'],m['fh']))
    if xs:rec[key]=xs.most_common(1)[0][0]
    elif h0 is not None:
      # no glint: the dark eye beside the face, on the eye row
      fr,_=frame(n,'walk',d,0);px=fr.load();y=h0+m['ay']
      for x in ((18,16) if d=='W' else (27,29)):
        if px[x,y][3]>200 and lum(px[x,y])<100 or px[x+1,y][3]>200 and lum(px[x+1,y])<100:rec[key]=x-m['ax'];break
  out['npc'][n]=rec
  if len(e)==2 and 'w' in rec:
    base={'S':19-m['ax'],'W':rec['w'],'E':rec['e']}
    for clip,D in m['clips'].items():
      for d,(row,nf) in D.items():
        if d=='N':continue
        for f in range(nf):
          fr,_=frame(n,clip,d,f);q=sorted(eyes_any(fr))
          if len(q)==(2 if d=='S' else 1):T[(clip,d)].update([(f,(q[0][0]-m['ax']-base[d],q[0][1]-m['ay']-h0))])
# the shared table: each clip and direction, how far each frame's eyes sit from h0 (a frame with none found, a blink, takes its
# neighbour's)
m=json.load(open('spr/lpc/mae.json'))
for clip,D in m['clips'].items():
  out['tpl'][clip]={}
  for d,(row,nf) in D.items():
    if d=='N':continue
    c=T[(clip,d)];per={}
    for (f,dy),k in c.items():
      if f not in per or k>per[f][1]:per[f]=(dy,k)
    arr=[list(per[f][0]) if f in per else None for f in range(nf)]
    for f in range(nf):
      if arr[f] is None:
        for k in range(1,nf):
          for g in (f-k,f+k):
            if 0<=g<nf and per.get(g):arr[f]=list(per[g][0]);break
          if arr[f] is not None:break
    out['tpl'][clip][d]=arr
json.dump(out,open('bugs/eyes_tab.json','w'),separators=(',',':'))
for n,r in out['npc'].items():print(n,r)
print(json.dumps(out['tpl'])[:900])
