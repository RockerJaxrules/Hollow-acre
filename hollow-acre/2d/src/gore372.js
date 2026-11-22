/* ================= (t372d) the animals the Hollow kills and the cold house's hooks, drawn again from one description at two sizes
   (tools/gore4.py): the world sprite and its detailed close-up are the same thing. The rabbit, the deer and the ribcage get a
   toned-down version too; walking up on each kind the first time shows its close-up. The story's deer on the farm track and the
   cold house's rack show the same close-ups, Full or Toned, and their props follow the setting. ================= */
// (owner: "the grounds on the close up images don't match the placing") every gore close-up lies on the ground it really lies on:
// the world's own ground chunks under it and the small things lying near it, enlarged to the close-up's scale; the close-up on top
const GORE_CUS={g_p_hiker:3,g_p_lantern:4,g_p_boots:4,g_p_coat:3,g_p_tree:2,g_deer_open:2,g_rabbit:4,g_ribs:3,g_hooks:1.5};
function goreGround(at,img,S,ax,ay,skip){const mx=14,top=Math.max(0,Math.min(12,131-img.height)),cw=img.width+mx*2,ch=img.height+top;
  const W0=at.x*32-(ax+mx)/S,H0=at.z*32-(ay+top)/S,ww=Math.ceil(cw/S)+2,hh=Math.ceil(ch/S)+2,bx=Math.floor(W0),by=Math.floor(H0);
  const src=document.createElement('canvas');src.width=ww;src.height=hh;const sg=src.getContext('2d');sg.imageSmoothingEnabled=false;
  for(let cy=Math.floor(by/CH);cy<=Math.floor((by+hh)/CH);cy++)for(let cx=Math.floor(bx/CH);cx<=Math.floor((bx+ww)/CH);cx++){try{sg.drawImage(chunk(cx,cy),cx*CH-bx,cy*CH-by);}catch(e){}}
  const near=OBJ.filter(o=>o&&!o.hide&&!skip.includes(o)&&Math.abs(o.x*32-(bx+ww/2))<ww/2+48&&Math.abs(o.z*32-(by+hh/2))<hh/2+72).sort((a,b)=>a.z-b.z);
  for(const o of near){const m=SPR[o.spr],im=m&&IMG[m.src];if(!im||m.clips||m.fh>80||m.fw>120)continue;sg.drawImage(im,0,0,m.fw,m.fh,Math.round(o.x*32-m.ax-bx),Math.round(o.z*32-m.ay-by),m.fw,m.fh);}
  const out=document.createElement('canvas');out.width=cw;out.height=ch;const g=out.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(src,Math.round(-(W0-bx)*S),Math.round(-(H0-by)*S),Math.round(ww*S),Math.round(hh*S));g.drawImage(img,mx,top);return out;}
if(typeof goreCloseImg==='function'){const _gci=goreCloseImg;goreCloseImg=function(name,at,skip){const n=name+'_cu',m=SPR[n],im=m&&IMG[m.src];
  if(!at||!im||!im.width||typeof sgtC!=='function')return _gci(name);const base=name.replace(/_t$/,''),S=GORE_CUS[base]||2;
  try{const g=goreGround(at,im,S,m.ax,m.ay,skip||[]);return sgtC('gcu_'+n+'_'+Math.round(at.x*10)+'_'+Math.round(at.z*10),g.width,g.height,(P,q)=>{q.drawImage(g,0,0);});}catch(e){return _gci(name);}};}
{const G4T={rabbit:{tmain:'g_rabbit_t',tlook:'A rabbit on its side in the grass, whole, its eyes open. The grass round it is flattened and dark. Nothing has been eaten.'},
    deer:{tmain:'g_deer_open_t',tlook:'A deer on its side in the grass, its legs out stiff. There is a dark patch under its throat and the flies have found it. It is lying very neatly.'},
    ribs:{tmain:'g_ribs_t',tlook:'A long drag mark through the grass, ending in a flattened dark patch and a few tufts of hair. Whatever was dragged here was carried on from here.'}};
  if(typeof KILLS!=='undefined')for(const k in G4T)if(KILLS[k])Object.assign(KILLS[k],G4T[k]);
  const CAP={rabbit:'Nothing has been eaten. It was killed and left, neatly, where you would walk.',ribs:'Whatever did this carried the rest of it somewhere. The crows won’t go near the drag mark.',
    deer:'Twelve pieces round it, the heart at the top. It is the same every time. It is telling the time.'};
  // a carcass in the fields: the first of each kind (and of each version) comes up close, in detail
  if(typeof goreCloseImg==='function')goreSight=function(k){const K=KILLS[k.kind];if(!K||K.person||S.mode!=='play'||S.paused||(typeof H!=='undefined'&&H.state==='chase'))return false;
    const ton=!!(k.ton&&K.tmain),g=goreS(),sk='sight_'+k.kind+(ton?'_t':'');if(g.seen[sk])return false;const img=goreCloseImg(ton?K.tmain:K.main,{x:k.x,z:k.z},(GORE.objs[k.id]||[]).slice(0,1));if(!img)return false;
    g.seen[sk]=1;if(!ton)g.seen['sight_'+k.kind]=1;return sgtOpen({x:k.x,z:k.z},img,ton?K.tlook:(CAP[k.kind]||K.look),{flies:ton?1:3});};
  // the story's deer and the cold house: their close-ups are the detailed images (the heart still beats, at its place in the ring)
  if(typeof SGT_BEATS!=='undefined'&&typeof SGT_ART!=='undefined'&&typeof goreCloseImg==='function'){
    const at=id=>{const os=typeof SGW!=='undefined'&&SGW.objs[id];if(os&&os[0])return [{x:os[0].x,z:os[0].z},[os[0]]];const b=typeof SAGA!=='undefined'&&SAGA.find(b=>b.id===id);if(b&&b.at){const p=b.at();return [{x:p.x,z:p.z},[]];}return [null,[]];};
    SGT_ART.g4_deer=()=>{const [p,sk]=at('deer');return goreCloseImg(goreToned()?'g_deer_open_t':'g_deer_open',p,sk);};
    SGT_ART.g4_cold=()=>{const [p,sk]=at('cold');return goreCloseImg(goreToned()?'g_hooks_t':'g_hooks',p,sk);};
    const B=SGT_BEATS;if(B.deer){B.deer.art='g4_deer';delete B.deer.sp;const m=SPR.g_deer_open_cu;const top=m?Math.max(0,Math.min(12,131-m.fh)):0;const heart=m?[72+14,m.ay-49+top]:[86,22];   /* the heart's place in the close-up, on its ground patch */
      Object.defineProperty(B.deer,'fx',{get(){return goreToned()?{flies:2}:{pulse:heart,flies:5,ribs:1};},configurable:true});}
    if(B.cold){B.cold.art='g4_cold';delete B.cold.sp;}}
  // their props in the world follow the gore setting
  {const _u=update;update=function(dt){_u(dt);if(typeof SGW==='undefined')return;const t=goreToned();
    for(const [id,n] of [['deer','g_deer_open'],['cold','g_hooks']]){const os=SGW.objs[id];if(!os)continue;for(const o of os)if(o.spr===n||o.spr===n+'_t'){const w=t?n+'_t':n;if(o.spr!==w)o.spr=w;}}};}}
