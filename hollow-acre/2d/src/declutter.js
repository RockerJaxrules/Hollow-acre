/* ================= declutter: after the whole world is built, nothing small stands inside something else. A pumpkin inside a
   barrel, a gravestone through a shed wall, a hedge through a porch, a sapling in a boulder: the inspector finds these by their
   footprints. The smaller, purely decorative piece is taken away (and any collider it brought with it), so the bigger thing
   reads cleanly. Wall and fence runs overlap on purpose and are left alone, as is the bucket by the well. ================= */
const DECLUTTER={removed:[]};
{const _bw=buildWorld;buildWorld=function(){_bw();try{declutter();}catch(e){console.error('declutter',e);}};}
function declutter(){
  const DECOR=/^(pumpkin|jack|sacks|crate|barrel|bucket|weeds|fern|deadtree|spruce|pine_|hedge|grave_|tyres|drum|firewood|hay|bush_|holly|juniper|elder|sumac|mushroom|rock_)/;
  const SKIP=/^(twall|fence|picket|rgiron|stonewall)/;
  const foot=o=>{const m=SPR[o.spr];if(!m||!m.foot)return null;const f=m.foot;if(!(f[2]-f[0]>.05&&f[3]-f[1]>.02))return null;return [o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]];};
  const L=OBJ.filter(o=>!o.hide&&!o.room&&o.x<250&&o.spr&&!SKIP.test(o.spr)&&!['deco','flat','grass','anim'].includes(o.kind)&&!o.grass).map(o=>[o,foot(o)]).filter(q=>q[1]);
  const cell=new Map();const key=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);
  for(const q of L){const k=key(q[0].x,q[0].z);(cell.get(k)||cell.set(k,[]).get(k)).push(q);}
  const area=f=>(f[2]-f[0])*(f[3]-f[1]);
  for(const [a,fa] of L){if(a.hide)continue;
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const C=cell.get((Math.floor(a.x/4)+i)+','+(Math.floor(a.z/4)+j));if(!C)continue;
      for(const [b,fb] of C){if(b===a||b.hide||a.hide)continue;
        const w=Math.min(fa[2],fb[2])-Math.max(fa[0],fb[0]),h=Math.min(fa[3],fb[3])-Math.max(fa[1],fb[1]);if(w<=0||h<=0)continue;
        const small=area(fa)<=area(fb)?a:b,big=small===a?b:a;if(w*h<=Math.min(area(fa),area(fb))*.3)continue;
        if(big.spr==='well'&&small.spr==='bucket')continue;
        if(!DECOR.test(small.spr)){if(DECOR.test(big.spr)){gone(big);}continue;}
        gone(small);}}}
  function gone(o){o.hide=true;DECLUTTER.removed.push(o.spr+'@'+o.x.toFixed(1)+','+o.z.toFixed(1));
    if(typeof circles!=='undefined')for(let k=circles.length-1;k>=0;k--)if(Math.abs(circles[k].x-o.x)<.5&&Math.abs(circles[k].z-o.z)<.5)circles.splice(k,1);}
}
