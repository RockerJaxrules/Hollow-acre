/* ================= (#302) The split carcass on the gambrel (gut her, split her, wash her down), at every gore level: the two tops
   under the hooks were round lit domes over a V and still leaned toward reading as buttocks. Each side is now cut square below its
   hock: a nearly flat top running out to a squared shoulder, then straight down, with a dull sawn bone edge along the cut, so the
   gap under the hook is a narrow slot, not a V. Each side is painted the same way as before (BS.side, from the beef's own height
   field), only from a copy of the field whose outline is cut square at the top; everything else on the sides is unchanged. ========= */
if(typeof BS!=='undefined'&&typeof BS.side==='function'&&typeof BT3!=='undefined'&&BT3.beefField){
  // one side's outline with its top cut square (the rest is the beef's own outline, point for point)
  BS.sqOutline=()=>BT3.smooth([[42,0],[52,0],[53,12],[54,14],[62,15.5],[70,17],[74,18.5],[76.5,21],[77.5,27],[78,40],[79,58],[75,70],[80,84],[87,98],[88,112],[84,124],[86,132],[78,140],[68,147],[58,153],[48,155],[38,152],[27,144],[18,134],[11,120],[9,104],[10,88],[12,72],[16,54],[17.5,40],[18,27],[19,21],[21,18.5],[28,17],[35,15.5],[40,14],[41,12]],6);
  // the beef's height field built exactly as BT3.beefField builds it, from the squared outline. Toned paints from the raw field (Full and
  // Extreme take the high dome back out in BS.side), so Toned's copy has that dome cut to the same small rise, or a round lit lump stays
  BS.sqField=tn=>{const kk=tn?'_sqft':'_sqf';if(BS[kk])return BS[kk];const F=BT3.hf(100,156),M=BT3.mk(100,156);BT3.poly(M,BS.sqOutline(),1);
    const dist=new Float32Array(M.w*M.h).fill(99),q=[];
    for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const i=y*M.w+x;if(!M.m[i])continue;if(!BT3.in(M,x-1,y)||!BT3.in(M,x+1,y)||!BT3.in(M,x,y-1)||!BT3.in(M,x,y+1)){dist[i]=0;q.push(i);}}
    for(let h=0;h<q.length;h++){const i=q[h],x=i%M.w,y=(i/M.w)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(!BT3.in(M,X,Y))continue;const j=Y*M.w+X;if(dist[j]>dist[i]+1){dist[j]=dist[i]+1;q.push(j);}}}
    const domes=[[50,44,22,22,tn?.4:3.5],[46,98,40,28,2.5],[44,138,20,12,2.5]];
    for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const i=y*M.w+x;if(!M.m[i])continue;let h=Math.min(1,dist[i]/5)**.6*5;
      for(const [cx,cy,rx,ry,t] of domes){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)h+=t*Math.sqrt(1-d);}F.H[i]=h;F.id[i]=1;}
    BT3.limb(F,47,1,47,12,4,5,6,7,2);
    F.left=new Int16Array(M.h).fill(-1);F.right=new Int16Array(M.h).fill(-1);for(let y=0;y<M.h;y++){for(let x=0;x<M.w;x++)if(M.m[y*M.w+x]){if(F.left[y]<0)F.left[y]=x;F.right[y]=x;}}
    F.dist=dist;return BS[kk]=F;};
  // the sawn bone along the flat top of each side: dull bone a pixel or two deep under the outline, broken here and there by blood,
  // with the dark cut meat under it
  BS.sqEdge=(K,mir,tn)=>{const F=BS.sqField(tn),B=BT3.BONE,BL=tn?(BG71.BLT||BG71.BL):BG71.BL,M=BT3.MEAT;
    const Hs=(a,b)=>{let v=(a*374761393+b*668265263)|0;v=(v^(v>>>13))*1274126177|0;return((v^(v>>>16))>>>0)/4294967295;};
    for(let x=12;x<88;x++){let yt=-1;for(let y=0;y<40;y++)if(F.id[y*F.w+x]){yt=y;break;}if(yt<13||yt>24||F.id[yt*F.w+x]!==1)continue;
      const X=mir?99-x:x,Y=yt+(mir?2:0),r=Hs(x,7+(mir?1:0)),deep=r<.7?2:1,lit=mir?x>47:x<47;
      K.px(X,Y,1,1,r>.9&&!tn?BL[2]:bt3pick(B,lit?3.4:2.8));if(deep>1)K.px(X,Y+1,1,1,r>.82&&!tn?BL[3]:bt3pick(B,lit?2.2:1.8));K.px(X,Y+deep,1,1,M[1]);}};
  const _side=BS.side;
  BS.side=mir=>{const xr=typeof BK!=='undefined'&&BK.X&&BK.X(),tn=!!window.GORE_TONED;
    return M4.pre((tn?'bs_sq4_':xr?'bs_sq9x_':'bs_sq9_')+(mir?1:0),100,158,(K,g)=>{const bf=BT3._bf;BT3._bf=BS.sqField(tn);let c=null;
      try{for(const k of ['bs_side4_','bs_side9x_','bs_side9_'])delete M4.C[k+(mir?1:0)];c=_side(mir);}finally{BT3._bf=bf;}
      for(const k of ['bs_side4_','bs_side9x_','bs_side9_'])delete M4.C[k+(mir?1:0)];g.drawImage(c,0,0);BS.sqEdge(K,mir,tn);});};
}
