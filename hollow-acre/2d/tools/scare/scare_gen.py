# the Deep Corn ring's scarecrows in the field scarecrow's style: a carved pumpkin head on a post, a child's clothes hung on the
# crossbar, straw at the cuffs and hem. Drawn pixel by pixel in code. 44x76, the foot at (22,72), as the sprites they replace.
from PIL import Image
import sys,math
def hexc(h):h=h.lstrip('#');return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
PUMP=['#2a0e14','#4a1a22','#723418','#8e4a22','#b06a34','#c8844a']   # outline, deep, shade, body, lit, glint (the field scarecrow's own)
STEM=['#2a2a14','#4a5a24','#6e8a3c']
CARVE=['#f0c868','#d89038','#7a3010']   # lit from inside like the field scarecrow's: the glow, its falloff, the cut edge
WOOD=['#24160c','#3e2816','#5a3c20','#7a5632']
STRAW=['#5a4418','#8a6a28','#b8923c','#dcb85a']
OUT=(18,10,8,255)
CLOTH={'a':['#221c3a','#2e3e5c','#46608a','#6a88b0'],'b':['#2a1a24','#4a3226','#6a4a30','#86643e'],'c':['#3a1430','#6a3450','#9a5a72','#c084a0'],'bs':['#5a5468','#8a8690','#b4ae9e','#d4ccb4']}
HAT={'a':['#4a3010','#8a6a30','#c8a050','#e8c878','#8a2018'],'b':['#121218','#24242e','#3a3a48','#54546a','#6a2a22']}
def draw(kind,post_extra=0,key=False):
  W,H=44,76+post_extra;im=Image.new('RGBA',(W,H),(0,0,0,0));px=im.load()
  def P(x,y,c,w=1,h=1):
    for yy in range(y,y+h):
      for xx in range(x,x+w):
        if 0<=xx<W and 0<=yy<H:px[xx,yy]=hexc(c) if isinstance(c,str) else c
  F=72+post_extra   # the foot
  # the post, lit on its left, down into the corn stubble; the crossbar at the shoulders
  for y in range(30,F+1):P(21,y,WOOD[3]);P(22,y,WOOD[2]);P(23,y,WOOD[1])
  for y in (40,52,61):P(22,y+post_extra*(y>45),WOOD[1])          # a knot or two
  P(8,31,WOOD[3],29,1);P(8,32,WOOD[1],29,1)
  C=CLOTH[kind] if not key else ['#00003c','#000078','#0000b4','#0000f0']
  if kind=='b' and not key:C=CLOTH['bs']   # the faded shirt under the dungarees
  dress=kind=='c'
  # the clothes: a child's shirt hung on the bar, the sleeves along it, the body falling straight; a dress for c
  hem=50 if not dress else 58
  for y in range(31,hem+1):
    t=(y-31)/(hem-31);half=8+int(t*(3 if dress else 1))
    for x in range(22-half,22+half+1):
      col=C[2] if x<22-half+4 else C[1] if x>22+half-4 else C[2]
      if x==22-half:col=C[3] if y<40 else C[2]
      if x==22+half:col=C[0]
      P(x,y,col)
  for x in range(9,15):
    d=(14-x)//3
    for y in range(31+d,37+d):P(x,y,C[3] if y==31+d else C[2] if y<35+d else C[1])
    P(x,37+d,C[0])
  for x in range(30,36):
    d=(x-30)//3
    for y in range(31+d,37+d):P(x,y,C[2] if y==31+d else C[1] if y<35+d else C[0])
    P(x,37+d,C[0])
  P(15,33,C[1],1,3);P(29,33,C[0],1,3)                                    # the armholes' shade
  # folds: two hanging creases, lit on their left; a patch sewn on, its stitches
  for y in range(39,hem-1,1):P(18,y,C[1]);P(19,y,C[3] if y%5 else C[2])
  if not key:
    for y in range(41,hem-1):P(26,y,C[0])
  if kind=='b' and not key:   # the dungarees: legs from the waist, a bib up the chest, a strap over each shoulder, two brass buttons
    D=CLOTH['b']
    for y in range(40,hem+1):
      for x in range(15,30):P(x,y,D[2] if x<19 else D[1] if x>25 else D[2])
      P(22,y,D[0]) if y>44 else None
    for y in range(34,40):
      for x in range(18,27):P(x,y,D[2] if x<21 else D[1])
    for y in range(31,34):P(18,y,D[1]);P(19,y,D[2]);P(25,y,D[0]);P(26,y,D[1])
    P(18,34,D[3]);P(26,34,'#c8a050');P(18,34,'#c8a050');P(15,40,D[3],4,1)
    for y in range(41,hem-1):P(16,y,D[3])
  if dress:
    for x in range(12,33,3):P(x,hem,C[0])                              # a scalloped hem
    P(17,32,'#d8c8c0',4,1);P(18,33,'#c8b4b0',3,1);P(23,32,'#d8c8c0',4,1);P(23,33,'#c8b4b0',3,1)   # a round collar
  # straw out of the cuffs and the hem
  for (x,y,l,d) in [(8,33,3,-1),(7,35,2,-1),(8,37,2,-1),(36,34,3,1),(37,36,2,1),(36,38,2,1)]:
    for k in range(l):P(x+d*k,y+(k>1),STRAW[2] if k==0 else STRAW[3] if k==1 else STRAW[1])
  clumps=[(16,3,1),(20,2,0),(25,4,1),(28,2,0)] if not dress else [(13,3,1),(18,2,0),(23,4,1),(29,3,0)]
  for (x0,l,lean) in clumps:
    for j,(dx,ln) in enumerate([(0,l),(1,l+1),(2,l-1)]):
      for k in range(max(1,ln)):P(x0+dx+(lean if k>1 else 0),hem+1+k,STRAW[3] if (k==0 and j==1) else STRAW[2] if k<2 else STRAW[1])
  # the pumpkin: a squat round with ribs, lit top left, its stem; the carved face looks out
  cx,cy,rx,ry=22,21,8.2,7.2
  for y in range(12,31):
    for x in range(12,33):
      e=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2
      if e>1:continue
      lx=(x-cx)/rx;ly=(y-cy)/ry
      lit=-.55*lx-.7*ly+.25*math.sqrt(max(0,1-e))
      i=4 if lit>.55 else 3 if lit>.05 else 2 if lit>-.45 else 1
      rib=abs(((x-cx)/rx)*2.3)%1
      if (0.43<rib<0.57) and abs(ly)<.85:i=max(1,i-1)
      P(x,y,PUMP[i])
  P(17,15,PUMP[5]);P(16,16,PUMP[5]);P(18,15,PUMP[4])
  for (x,y,c) in [(22,12,STEM[1]),(22,13,STEM[2]),(23,12,STEM[0]),(23,11,STEM[1]),(24,11,STEM[0])]:P(x,y,c)
  # each child's own carving, lit from inside like the field scarecrow's (G glow, M its falloff, E the cut edge)
  G,M,E=CARVE
  if key:pass   # (the stand-in's face is painted over its carving)
  elif kind=='a':   # slanted triangle eyes, a wide grin with two teeth
    for (x,y,c) in [(18,20,M),(19,20,G),(20,19,G),(20,20,G),(19,19,E),(24,19,G),(24,20,G),(25,20,G),(26,20,M),(25,19,E)]:P(x,y,c)
    for x in range(17,28):P(x,24,G if 19<=x<=25 else M)
    for x in range(18,27):P(x,25,M if x in (18,26) else G)
    P(20,24,E);P(24,24,E);P(17,23,M);P(27,23,M)
  elif kind=='b':   # round eyes, a crooked slit mouth with a gap
    for (x,y,c) in [(18,19,E),(19,19,M),(18,20,M),(19,20,G),(25,19,E),(26,19,M),(25,20,M),(26,20,G)]:P(x,y,c)
    for x in range(18,27):P(x,24 if x<23 else 25,G if x not in (18,21,26) else M)
    P(22,24,E)
  else:   # crescent eyes, a small round mouth
    for (x,y,c) in [(18,20,M),(19,19,G),(20,19,G),(21,20,M),(24,20,M),(25,19,G),(26,19,G),(27,20,M)]:P(x,y,c)
    for (x,y,c) in [(21,23,M),(22,23,G),(23,23,M),(21,24,G),(22,24,G),(23,24,G),(22,25,M)]:P(x,y,c)
  # straw at the neck, where the pumpkin sits on the post
  for (x,y,c) in [(19,29,STRAW[2]),(20,30,STRAW[3]),(24,29,STRAW[1]),(25,30,STRAW[2]),(22,30,STRAW[2])]:
    if px[x,y][3]==0 or y>=29:P(x,y,c)
  # hats
  if kind in HAT and not key:
    h=HAT[kind]
    if kind=='a':P(12,14,h[1],21,1);P(13,13,h[2],19,1);P(16,10,h[2],12,3);P(17,9,h[3],10,1);P(16,12,h[4],12,1);P(12,15,h[0],21,1)
    else:P(13,13,h[2],19,1);P(13,14,h[0],19,1);P(16,9,h[2],12,4);P(17,8,h[3],10,1);P(16,12,h[4],12,1)
  # one outline round it all, its own darkest tone; the shadow on the ground
  a=im.copy().load();o=[]
  for y in range(H):
    for x in range(W):
      if a[x,y][3]:continue
      for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
        qx,qy=x+dx,y+dy
        if 0<=qx<W and 0<=qy<H and a[qx,qy][3]:o.append((x,y));break
  for x,y in o:
    if y>=F-1:continue
    lit=(x+1<W and a[x+1,y][3]) or (y+1<H and a[x,y+1][3])   # the pixel is above or left of the thing: the lit side
    px[x,y]=(70,40,30,255) if lit and y<F-14 else OUT
  for y in range(F-2,F+3):
    for x in range(12,36):
      e=((x+.5-24.5)/9.5)**2+((y+.5-F-.5)/2.2)**2
      if e<=1 and px[x,y][3]==0:px[x,y]=(50,33,37,int(153*(1 if e<.55 else .6)))
  return im
if __name__=='__main__':
  ims=[draw(k) for k in 'abc'];st=draw('a',12)
  for k,i in zip('abc',ims):i.save('rg_scare_%s_new.png'%k)
  W=sum(i.size[0] for i in ims)+st.size[0]+30;H=st.size[1]
  sheet=Image.new('RGBA',(W,H),(92,104,58,255));x=0
  for i in ims+[st]:sheet.alpha_composite(i,(x,H-i.size[1]));x+=i.size[0]+10
  sheet.save('new_1x.png');sheet.resize((W*5,H*5),Image.NEAREST).save('new_5x.png');print('ok')
# the stand-in in the ring's middle: your clothes on a taller post, your hair on the pumpkin, your face painted over its carving,
# the label pinned on. A template: the shirt in a pure blue key ramp and the hair in a pure green one, recoloured in the game.
def standin():
  im=draw('a',12,key=True);px=im.load();W,H=im.size
  def P(x,y,c,w=1,h=1):
    for yy in range(y,y+h):
      for xx in range(x,x+w):
        if 0<=xx<W and 0<=yy<H:px[xx,yy]=hexc(c) if isinstance(c,str) else c
  HK=['#003c00','#007800','#00b400']
  # the hair: a cap of it over the top of the pumpkin and down both sides, ragged at the ends
  for y in range(11,20):
    for x in range(13,32):
      e=((x+.5-22)/9.4)**2+((y+.5-20)/8.6)**2
      if e>1 or (y>15 and 16<=x<=28):continue
      P(x,y,HK[2] if (x<20 and y<15) else HK[1] if x<27 else HK[0])
  for (x,l) in [(13,4),(14,6),(30,5),(31,3)]:P(x,19,HK[0],1,l)
  # the face painted over the carving: a pale oval, two dark eyes, a red mouth
  for y in range(16,26):
    for x in range(16,29):
      if ((x+.5-22.5)/6.0)**2+((y+.5-21.0)/4.4)**2<=1:P(x,y,'#d8b090' if x<25 else '#c09878')
  for (x,y) in [(19,20),(20,20),(25,20),(26,20)]:P(x,y,'#2a1a16')
  # the pumpkin below the paint: a bright burnt-orange rim with its ribs, a value apart from the hair, so it never reads as a beard
  for y in range(24,30):
    for x in range(13,32):
      p_=px[x,y]
      if not p_[3] or p_[:3]==OUT[:3] or p_[:3] in [hexc(c)[:3] for c in ('#d8b090','#c09878')] or p_[1]>p_[0] or (p_[0]==0):continue
      if ((x+.5-22.5)/6.0)**2+((y+.5-21.0)/4.4)**2<=1:continue
      P(x,y,PUMP[2] if x in (16,19,25,28) else PUMP[4] if x<23 else PUMP[3])
  P(20,23,'#7a2018');P(21,23,'#a02818',4,1);P(25,23,'#7a2018')
  for (x,y,c) in [(22,9,STEM[1]),(22,10,STEM[2]),(23,9,STEM[0]),(23,8,STEM[1]),(24,8,STEM[0])]:P(x,y,c)   # its stem up through your hair
  # the label pinned to the chest
  P(15,37,'#2a1c10',15,7);P(16,38,'#d8c890',13,5);P(16,42,'#b8a46c',13,1);P(28,38,'#b8a46c',1,5);P(17,40,'#4a3a22',3,1);P(21,40,'#4a3a22',2,1);P(24,40,'#4a3a22',4,1);P(22,35,'#8a8a92',1,2)
  return im
def tint(im,shirt,hair):
  im=im.copy();px=im.load()
  def ramp(h,ks):
    r,g,b=hexc(h)[:3];return [tuple(min(255,int(c*k)) for c in (r,g,b))+(255,) for k in ks]
  S=ramp(shirt,[.45,.7,1,1.2]);Hr=ramp(hair,[.55,1,1.3])
  for y in range(im.size[1]):
    for x in range(im.size[0]):
      p=px[x,y]
      if p[3]<200:continue
      if p[0]==0 and p[1]==0 and p[2] in (0x3c,0x78,0xb4,0xf0):px[x,y]=S[(0x3c,0x78,0xb4,0xf0).index(p[2])]
      elif p[0]==0 and p[2]==0 and p[1] in (0x3c,0x78,0xb4):px[x,y]=Hr[(0x3c,0x78,0xb4).index(p[1])]
  return im
if __name__=='__main__':
  st=standin();st.save('rg_standin_t.png')
  ims=[draw(k) for k in 'abc']+[tint(st,'#b8402c','#5a3a20')]
  W=sum(i.size[0] for i in ims)+30;H=max(i.size[1] for i in ims)
  sheet=Image.new('RGBA',(W,H),(92,104,58,255));x=0
  for i in ims:sheet.alpha_composite(i,(x,H-i.size[1]));x+=i.size[0]+10
  sheet.save('new_1x.png');sheet.resize((W*5,H*5),Image.NEAREST).save('new_5x.png');print('sheet')
