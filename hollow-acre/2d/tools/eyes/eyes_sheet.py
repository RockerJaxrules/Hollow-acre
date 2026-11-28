# night sheets of every NPC x 4 directions x the walk frames: before (the fixed two pixels 35 up, on every frame and facing) and
# after (the table: on the face, following the bob, none facing away). Also checks every frame of every clip for eyes off the face.
from PIL import Image,ImageDraw,ImageFilter
import json,sys
T=json.load(open('bugs/eyes_tab.json'));NP=T['npc'];TPL=T['tpl']
def eyes(n,clip,d,f):
  r=NP.get(n);
  if not r or r['h0'] is None or d=='N':return []
  t=TPL.get(clip,{}).get(d) or TPL.get(clip,{}).get('S')
  dd=t[f] if t and f<len(t) and t[f] else [0,0]
  y=r['h0']+dd[1]
  if d=='S':return [[-5+dd[0],y],[3+dd[0],y]]
  x=r['w'] if d=='W' else r['e']
  return [[x+dd[0],y]]
def lum(p):return .3*p[0]+.59*p[1]+.11*p[2]
def night(fr):
  px=fr.load();W,H=fr.size
  for y in range(H):
    for x in range(W):
      p=px[x,y]
      if p[3]:px[x,y]=(int(p[0]*.22),int(p[1]*.25),int(p[2]*.38),p[3])
  return fr
def glow(base,cx,cy,r=3,a=.9):
  g=Image.new('RGBA',base.size,(0,0,0,0));dr=ImageDraw.Draw(g)
  for k in range(r*3,0,-1):
    al=int(255*a*(1-k/(r*3))**2*.8);dr.ellipse([cx-k,cy-k,cx+k,cy+k],fill=(255,60,30,al))
  return Image.alpha_composite(base,g)
NAMES=list(NP.keys())
def sheet(after,path):
  cw,chh=48,64;cols=36;out=Image.new('RGBA',(cols*cw+70,len(NAMES)*chh),(14,16,28,255));dr=ImageDraw.Draw(out)
  for i,n in enumerate(NAMES):
    im=Image.open('spr/lpc/%s.png'%n).convert('RGBA');m=json.load(open('spr/lpc/%s.json'%n));ax,ay=m['ax'],m['ay']
    dr.text((2,i*chh+26),n,fill=(220,200,170,255))
    for j,d in enumerate('NWSE'):
      row,nf=m['clips']['walk'][d]
      for f in range(9):
        fr=night(im.crop((f*48,row*64,(f+1)*48,(row+1)*64)).copy())
        X0=70+(j*9+f)*cw;Y0=i*chh
        cell=Image.new('RGBA',(cw,chh),(14,16,28,255));cell.alpha_composite(fr)
        if after:
          for ex,ey in eyes(n,'walk',d,f):
            px=cell.load();x,y=ax+ex,ay+ey
            for (u,v,c) in ((0,0,(255,42,20,255)),(1,0,(255,42,20,255)),(0,1,(176,18,6,255)),(1,1,(176,18,6,255))):px[x+u,y+v]=c
            cell=glow(cell,x+1,y+1)
        else:
          px=cell.load();y=ay-35
          px[ax-3,y]=(255,42,20,255);px[ax+2,y]=(255,42,20,255)
          cell=glow(glow(cell,ax-2.5,y+.5),ax+2.5,y+.5)
        out.paste(cell,(X0,Y0))
  for j in range(1,4):dr.line([(70+j*9*cw,0),(70+j*9*cw,out.size[1])],fill=(120,100,80,255))
  out.save(path);return out
if __name__=='__main__':
  b=sheet(False,'bugs/shots/eyes_before.png');a=sheet(True,'bugs/shots/eyes_after.png');print(a.size)
  # every frame of every clip: is each eye block on the face (not on clear pixels or hair far from skin)?
  bad=[]
  for n in NAMES:
    im=Image.open('spr/lpc/%s.png'%n).convert('RGBA');m=json.load(open('spr/lpc/%s.json'%n));ax,ay=m['ax'],m['ay']
    for clip,D in m['clips'].items():
      for d,(row,nf) in D.items():
        for f in range(nf):
          for ex,ey in eyes(n,clip,d,f):
            x,y=f*48+ax+ex,row*64+ay+ey;q=[im.getpixel((x+u,y+v)) for u in (0,1) for v in (0,1)]
            if sum(1 for p in q if p[3]<128)>0:bad.append((n,clip,d,f,'clear'))
  print('eye blocks on clear pixels:',len(bad),bad[:20])
