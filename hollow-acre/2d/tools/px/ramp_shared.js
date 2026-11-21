// ---- shared with custom.js: hue-shifted five-step ramps (deep, shadow, mid, base, light) and the outline colour
function rgb2hsv(c){const r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,mx?d/mx:0,mx];}
function hsv2rgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
function hueToward(h,t,a){let d=((t-h+540)%360)-180;if(Math.abs(d)<a)return t;return (h+Math.sign(d)*a+360)%360;}
function rampRGB(c){const [h,s,v]=rgb2hsv(c);const cl=x=>Math.max(0,Math.min(1,x));
  const mk=(tgt,amt,ks,kv,add)=>hsv2rgb(hueToward(h,tgt,amt),cl(s*ks+(ks>1?.04:0)),cl(v*kv+add));
  return [mk(265,26,1.22,.3,0),mk(265,16,1.14,.56,0),mk(265,7,1.06,.79,0),[c[0],c[1],c[2]],mk(55,12,.78,1.1,.07)];}
function outlineRGB(n){const [h,s,v]=rgb2hsv(n);return hsv2rgb(hueToward(h,250,30),Math.max(0,Math.min(1,s*1.15+.15)),Math.max(.07,v*.26));}
