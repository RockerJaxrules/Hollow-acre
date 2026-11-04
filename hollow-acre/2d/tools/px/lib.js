// ---- Hollow Acre pixel kit: palette ramps + drawing helpers for LibreSprite scripts.
// Every ramp runs dark -> light. Light comes from the upper left.
const HEX=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const R=o=>{const r={};for(const k in o)r[k]=o[k].map(HEX);return r;};
const PAL=R({
  out:['#140e16','#1d1520'],
  wood:['#24180f','#3d2a1c','#5c3f29','#7d5636','#9e7146','#bf9361'],
  white:['#3e3d4a','#5f6072','#8c8d9c','#b9b9c2','#dedcd4','#f1eee4'],
  mustard:['#3e2d14','#654a1d','#8f6b27','#b88d36','#d6ad52','#ead07e'],
  blue:['#222c3d','#34465e','#4b6582','#6a87a4','#90abc2','#b9cfdc'],
  sage:['#222b1b','#36452b','#4f633e','#6d8355','#90a674','#b6c69a'],
  red:['#2e1214','#4d1c1d','#6e2a25','#913b31','#b25645','#cc7a60'],
  slate:['#191b26','#262a38','#363d50','#4a5369','#626d86','#828ca3'],
  rust:['#2e1617','#4a2121','#69302a','#8a4334','#a85f45','#c4825f'],
  bark:['#211712','#382720','#54392b','#71503a','#8f6b4d','#ab8865'],
  teal:['#121f21','#1d3333','#2a4a47','#3c645d','#548276','#74a194'],
  stone:['#232126','#3a373e','#56525a','#757079','#958f96','#b5afb3'],
  glass:['#0f1420','#1a2438','#283a57','#3c5677','#6487a8','#a4c4d8'],
  lit:['#5a2c0e','#9a5320','#d3863a','#f0b65c','#fbdc8f','#fff4c6'],
  brass:['#4a3410','#8a6420','#c99a3a','#efd27a'],
  moss:['#1f2a14','#33441f','#4d6230','#6c8243'],
  curtain:['#3d1a20','#6b2e33','#93463f','#b9665a'],
  cream:['#5a4d3b','#8a7a5e','#b8a682','#ddd0ac'],
  ink:['#120c0c','#241818'],
});
let SEED=1;const rnd=()=>{SEED=(SEED*1103515245+12345)&0x7fffffff;return SEED/0x7fffffff;};
const hsh=(x,y,s)=>{let h=(x*374761393+y*668265263+(s||0)*362437)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967295;};
function layer(name,w,h){return {name,w,h,d:new Uint8ClampedArray(w*h*4)};}
function P(L,x,y,c,a){x|=0;y|=0;if(x<0||y<0||x>=L.w||y>=L.h||!c)return;const i=(y*L.w+x)*4;L.d[i]=c[0];L.d[i+1]=c[1];L.d[i+2]=c[2];L.d[i+3]=a===undefined?255:a;}
function G(L,x,y){if(x<0||y<0||x>=L.w||y>=L.h)return null;const i=(y*L.w+x)*4;return L.d[i+3]?[L.d[i],L.d[i+1],L.d[i+2],L.d[i+3]]:null;}
function rect(L,x,y,w,h,c,a){for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(L,x+i,y+j,c,a);}
function hl(L,x,y,w,c){rect(L,x,y,w,1,c);}function vl(L,x,y,h,c){rect(L,x,y,1,h,c);}
function frame(L,x,y,w,h,lt,dk){hl(L,x,y,w,lt);vl(L,x,y,h,lt);hl(L,x,y+h-1,w,dk);vl(L,x+w-1,y,h,dk);}
function ell(L,cx,cy,rx,ry,c){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if((x*x)/(rx*rx+.01)+(y*y)/(ry*ry+.01)<=1)P(L,cx+x,cy+y,c);}
function shade(c,k){return [Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];}
// composite layers (painter's order) into one
function flatten(Ls,w,h){const o=layer('flat',w,h);for(const L of Ls)for(let i=0;i<w*h;i++){const a=L.d[i*4+3];if(!a)continue;const t=a/255;
  for(let k=0;k<3;k++)o.d[i*4+k]=o.d[i*4+k]*(1-t)+L.d[i*4+k]*t;o.d[i*4+3]=Math.max(o.d[i*4+3],a);}return o;}
// selective outline: transparent pixels touching the art take a darkened version of their neighbour
function outline(flat,name){const O=layer(name||'outline',flat.w,flat.h);
  for(let y=0;y<flat.h;y++)for(let x=0;x<flat.w;x++){if(G(flat,x,y))continue;let n=null;
    for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const c=G(flat,x+dx,y+dy);if(c&&c[3]>200){n=c;break;}}
    if(n)P(O,x,y,[Math.max(12,n[0]*.32|0),Math.max(8,n[1]*.28|0),Math.max(14,n[2]*.34|0)]);}
  return O;}
// push our layers into the open LibreSprite sprite and save .ase + .png
function emit(Ls,base){const S=app.activeSprite;
  for(const L of Ls){app.command.NewLayer();const ly=S.layer(S.layerCount-1);ly.name=L.name;const cel=ly.cel(0)||ly.createCel(0);
    const img=cel.image;if(img.width!==L.w||img.height!==L.h){console.log('size mismatch',L.name,img.width,img.height);}
    const data=img.getImageData();for(let i=0;i<data.length;i++)data[i]=L.d[i];img.putImageData(data);}
  S.layer(0).isVisible=false;
  S.saveAs(base+'.ase',true);S.saveAs(base+'.png',true);}
// 3x5 pixel font
const FONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',
J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',
T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',' ':'000000000000000','.':'000000000000010','0':'111101101101111','9':'111101111001111','1':'010110010010111','2':'111001111100111','3':'111001011001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111'};
function drawText(L,t,x,y,c,sh){for(const ch of t.toUpperCase()){const f=FONT[ch]||FONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){if(sh)P(L,x+i+1,y+j+1,sh);P(L,x+i,y+j,c);}x+=4;}}
