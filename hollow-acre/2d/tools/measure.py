import sys
from PIL import Image
import numpy as np
REF=[4,6,8,10,11,11.5,12.5,12,11.5,11,10.5,10.5,9,6.5,7.5,9.5,10,11,11,11,10.5,8.5,9.5,8,7,6,7]
def prof(path,r=2,f=0):
  im=np.asarray(Image.open(path).convert('RGBA'))[r*64:(r+1)*64,f*48:(f+1)*48];m=im[...,3]>0
  ys=np.nonzero(m.any(1))[0];m=m[ys[0]:ys[-1]+1]
  w=np.array([(np.nonzero(r_)[0].max()-np.nonzero(r_)[0].min()+1) if r_.any() else 0 for r_ in m],float)
  h=len(w);s=27/h;idx=np.linspace(0,h-1,27);return h,[round(np.interp(i,range(h),w)*s,1) for i in idx]
for p in sys.argv[1:]:
  h,w=prof(p);print(p,h);print(' ours',w);print(' ref ',REF)
