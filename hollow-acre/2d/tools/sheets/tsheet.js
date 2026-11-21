const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_mg4.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 const url=await pg.evaluate(()=>__game.ev(`(()=>{
  const parts=[];const add=(n,c)=>{if(c&&c.width)parts.push([n,c]);};
  for(const k of ['saw','plane','hammer','knife','brush','jug','ladle','fish','fillet','tin','sawhorse','crucible'])add(k,M4S[k]());
  add('pot',M4S.pot('i'));add('bowl',M4S.bowl('clay'));add('bowl2',M4S.bowl('wood'));
  for(const k of ['anvil','stump','shammer','tongs','wheel'])add(k,M4F[k]());for(const k of ['shears','needle','spoon','pin','flail'])add(k,M4C[k]());
  for(const sk of ['#f2cfb0','#e8b48c','#b8784c','#5e3a26']){S.look.skin=sk;add('hand',M4S.hand('r'));add('hand',M4S.hand('l'));add('palm',M4S.palm('r'));}
  // the textures themselves: swatches of every surface the rooms are made from
  const sw=(fn)=>{const c=document.createElement('canvas');c.width=48;c.height=48;const g=c.getContext('2d');const K=caKit(g,48,48);K.g=g;fn(K);return c;};
  add('planks',sw(K=>K.planks(0,0,48,48,CA_P.wood,8,3)));add('oak',sw(K=>K.planks(0,0,48,48,CA_P.oak,12,5,true)));add('bricks',sw(K=>K.bricks(0,0,48,48,CA_P.brick,14,6)));add('stones',sw(K=>K.stones(0,0,48,48,CA_P.stone)));
  add('iron',sw(K=>K.metal(0,0,48,48,CA_P.iron,8)));add('brass',sw(K=>K.metal(0,0,48,48,CA_P.brass,10)));add('copper',sw(K=>K.metal(0,0,48,48,CA_P.copper)));add('cloth',sw(K=>K.cloth(0,0,48,48,CA_P.cloth)));add('leather',sw(K=>K.leather(0,0,48,48,CA_P.leather)));
  add('fire',sw(K=>{K.px(0,0,48,48,'#1a0a04');MG4ART.fire(K,0,46,48,40,1,1.3);}));
  // pack on shelves over magenta, two pixels to one
  const W=760;let x=6,y=6,rowH=0;const pos=[];for(const [n,c] of parts){if(x+c.width>W-6){x=6;y+=rowH+6;rowH=0;}pos.push([c,x,y]);x+=c.width+6;rowH=Math.max(rowH,c.height);}
  const H=y+rowH+6;const out=document.createElement('canvas');out.width=W*2;out.height=H*2;const o=out.getContext('2d');o.imageSmoothingEnabled=false;o.fillStyle='#ff00ff';o.fillRect(0,0,W*2,H*2);
  for(const [c,px,py] of pos)o.drawImage(c,px*2,py*2,c.width*2,c.height*2);return out.toDataURL('image/png');})()`));
 fs.writeFileSync('minigame_parts.png',Buffer.from(url.split(',')[1],'base64'));
 // the rooms too
 const url2=await pg.evaluate(()=>__game.ev(`(()=>{const names=['workshop','kitchen','stove','forge','sewing','yard','barn'];const out=document.createElement('canvas');out.width=320*4+3*6;out.height=180*2+6;const o=out.getContext('2d');o.fillStyle='#ff00ff';o.fillRect(0,0,out.width,out.height);
   names.forEach((n,i)=>{const c=MG4ART.base(n,(k,gg)=>MG4ART.paint[n](k,gg));o.drawImage(c,(i%4)*326,((i/4)|0)*186);});return out.toDataURL('image/png');})()`));
 fs.writeFileSync('minigame_rooms.png',Buffer.from(url2.split(',')[1],'base64'));
 console.log(errs.join('\n')||'no errors');await b.close();})();
