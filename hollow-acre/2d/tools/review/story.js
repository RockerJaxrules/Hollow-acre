// t337 playthrough bot: the story driver, evaluated inside the game's scope. story() takes one step toward whatever the goal
// bar asks for, the way a player would (walk there, press the action button, talk, buy, use the tool), and says what it did.
// force() is the fallback when a step can't be done by playing within a few tries: it does the step's result directly and the
// report marks it FORCED, so the reviewer knows the bot (not the player's path) moved past it.
(()=>{const pb=window.__pb;
  const field=()=>tiles.filter(t=>!t.parcel&&!t.gh&&!t.home);
  const npcAt=id=>{try{return npcById(id);}catch(e){return null;}};
  const talkTo=id=>{const n=npcAt(id);if(!n)return 'no '+id;if(S.room)try{leaveRoom();}catch(e){}pb.near(n.x,n.z,.8);try{talk(n);}catch(e){return 'talk err '+e.message;}return 'talk '+id;};
  const night=()=>{if(!isNight()){S.hour=Math.max(S.hour,20.3);}};
  const day=h=>{if(isNight()||S.hour<(h||8)||S.hour>17){S.hour=h||10;}};
  // the Tithe House door: its own interaction (set the stones, or open it on Tithe night), pressed standing at the door
  const tdAct=()=>{let td=null;try{td=interact.find(e=>e.x===TITHE.x&&Math.abs(e.z-(TITHE.z-1.15))<.01);}catch(e){}
    if(!td)return pb.goAct(TITHE_DOOR.x,TITHE_DOOR.z,3);try{const R=S.room&&roomOf();if(R){S.room=null;P.x=R.out.x;P.z=R.out.z;S.mode='play';}}catch(e){}   /* out through the door, as leaveRoom does after its fade */pb.near(td.x,td.z,.5);try{td.act();return 'door: '+(td.label?td.label():'act');}catch(e){return 'door err '+e.message;}};
  const sgB=()=>{try{return typeof sgCurrent==='function'?sgCurrent():null;}catch(e){return null;}};
  pb.story=function(){const o=pb.obj(),t=o.t;const st=S.st||{};
    if(typeof cine!=='undefined'&&cine)return 'cine';
    if(t==='Three stones'&&/Set the stones/.test(o.d))return 'set the stones: '+tdAct();
    if(S.room&&!/bed/.test(o.d)&&S.room!=='undercroft'){try{leaveRoom();}catch(e){}return 'leave room';}
    // a beat of the saga the goal bar is pointing at
    const b=sgB();if(b&&o.t===pb.strip(sgVal(b.name))){
      if(b.npc){day(10);return 'saga beat (person): '+talkTo(sgVal(b.npc));}
      if(b.night)night();else if(isNight())S.hour=10;const p=b.at();pb.near(p.x,p.z,.4);return 'saga beat (place): '+b.id;}
    if(S.st&&S.st.started&&!S.st.done&&S.st.tithe&&typeof stLeft==='function'){const L=stLeft();
      if(L<=0){night();return 'Tithe night: '+tdAct();}
      if(L===1&&!S.st.drawn){try{if(S.room)leaveRoom();}catch(e){}S.hour=Math.max(S.hour,18.05);pb.near(CHURCH_STEP.x,CHURCH_STEP.z,.6);return 'at the church at six for the drawing';}}
    switch(t){
      case 'Stranded':pb.near(doorPos.x,doorPos.z+1.6);return 'walk to the farm';
      case 'The farm':return 'read the note: '+pb.goAct(doorPos.x,doorPos.z);
      case 'Farm':{const f=field().find(t=>!t.tilled);if(f){pb.near(f.x,f.z,.9);P.anim=null;doTill(f);return 'till';}break;}
      case 'Plant':{const f=field().find(t=>t.tilled&&!t.crop);S.sel=S.seeds.turnip>0?'turnip':Object.keys(S.seeds).find(k=>S.seeds[k]>0);if(f){pb.near(f.x,f.z,.9);P.anim=null;doPlant(f);return 'plant '+S.sel;}break;}
      case 'Water':{S.water=Math.max(S.water,S.waterMax||10);const f=field().find(t=>t.crop&&!t.crop.watered);if(f){pb.near(f.x,f.z,.9);P.anim=null;doWater(f);return 'water';}break;}
      case 'Sell':{const ripe=tiles.find(t=>t.crop&&t.crop.stage>=3&&!t.gh);
        if(ripe){pb.near(ripe.x,ripe.z,.9);P.anim=null;doHarvest(ripe);return 'harvest';}
        if(S.basket.length){pb.goAct(binPos.x,binPos.z);setTimeout(()=>{try{$('sbCrops').click();}catch(e){}},300);return 'ship at the bin';}
        let n=0;for(const t of tiles){const c=t.crop;if(c&&c.stage<3&&!t.gh){c.watered=true;c.growth=SEEDS[c.type].grow*3;c.stage=3;n++;}}return 'days pass: '+n+' crops ripen';}
      case 'The car':{
        if(!S.q.hollis){day(10);return talkTo('hollis');}
        const cs=typeof CAR_STAGES!=='undefined'?CAR_STAGES[S.carStage||0]:null;const need=cs&&cs.need&&!(S.parts[cs.need]>=1)?cs.need:null;
        if(need==='tire'){day(10);S.coins=Math.max(S.coins,40);const r=talkTo('mae');try{if(pb.vis($('talkTrade'))){$('talkTrade').click();const row=[...document.querySelectorAll('#shopRows .shop-row')].find(e=>/tire/i.test(e.textContent));const bt=row&&row.querySelector('button');bt&&bt.click();}}catch(e){}return 'a tire from Caitlyn: '+r;}
        if(need==='battery'){day(10);if(basketCount('pumpkin')<3)for(let i=0;i<3;i++)S.basket.push({kind:'pumpkin',value:18});return 'three pumpkins for the battery: '+talkTo('hollis');}
        if(need==='belt'){day(10);if(S.cat==='lost'&&!S.q.agnes)return 'ask Agnes for the belt: '+talkTo('agnes');if(S.cat==='lost'){pb.near(cat.x,cat.z,.6);return 'find Whiskers in the corn: '+pb.act();}return 'bring Whiskers home: '+talkTo('agnes');}
        if(need==='gas'){S.coins=Math.max(S.coins,25);return 'gas from the pump: '+pb.goAct(pumpPos.x,pumpPos.z,3);}
        day(10);return 'repair at the car: '+pb.goAct(carPos.x,carPos.z,6);}
      case 'Leave':{if(S.hour<17.2)S.hour=17.3;const c=typeof CAR_SPOTS!=='undefined'?CAR_SPOTS.crash:carPos;return 'get in the car: '+pb.goAct(o.x!=null?o.x:c.x,o.z!=null?o.z:c.z,5);}
      case 'Candles':{S.hour=Math.max(S.hour,20.3);S.coins=Math.max(S.coins,120);   // the peddler trades after 7:30 pm
        const r=pb.goAct(crossPos.x+.6,crossPos.z+2.6,3);
        setTimeout(()=>{try{for(let i=0;i<3;i++){const row=[...document.querySelectorAll('#shopRows .shop-row')].find(e=>/candle/i.test(e.textContent));const bt=row&&row.querySelector('button');if(bt&&!bt.disabled)bt.click();}}catch(e){}},300);return 'peddler: '+r;}
      case 'Wait':night();return 'wait for the bell';
      case 'The rite':{night();const a=altars.find(a=>!a.lit&&Math.hypot(a.x-(o.x||a.x),a.z-(o.z||a.z))<.5)||altars.find(a=>!a.lit);if(a){return 'light the '+a.name+' stone: '+pb.goAct(a.x,a.z,3);}break;}
      case 'A letter':day(9);return 'mailbox: '+pb.goAct(MAILPOS.x,MAILPOS.z);
      case 'Three stones':{
        if(/Set the stones/.test(o.d)){return 'set the stones: '+tdAct();}
        if(!st.got.dock){S.rod=Math.max(S.rod||1,2);day(10);return 'the lake dock: '+pb.goAct(LAKE.x,LAKE.z-LAKE.rz+2.6,2);}
        if(!st.got.tree){S.tools.axe=Math.max(S.tools.axe||1,2);S.hour=12;return 'the hollow tree at noon: '+pb.goAct(HOLLOW_TREE.x,HOLLOW_TREE.z-1.3,2);}
        if(!st.got.bed){S.tools.pick=Math.max(S.tools.pick||1,2);try{if(S.room!=='cabin')enterRoom('cabin');}catch(e){}setTimeout(()=>{try{pb.near(BEDPOS.x,BEDPOS.z,.8);pb.act();}catch(e){}},1700);return 'under the bed';}
        break;}
      case 'The drawing':S.hour=Math.max(S.hour,18.05);pb.near(CHURCH_STEP.x,CHURCH_STEP.z,.6);return 'at the church for the drawing';
      case 'Tithe night':night();return 'the Tithe House: '+tdAct();
      // under the church: tear the roots out of the one who was taken, fast, the way a player mashes the action button on each root
      case 'Cut her free':case 'Cut him free':{if(S.room!=='undercroft')break;const d=typeof DK==='function'?DK():null;if(!d||!d.roots)break;const R=ROOMS.undercroft;let n=0;
        for(let i=0;i<d.roots.length&&n<9;i++)while(d.roots[i]&&d.roots[i].hp>0&&n<9){pb.near(R.ox+DK_ROOTS[i][0],R.oz+DK_ROOTS[i][1],.6);dkTear(i);n++;}
        return 'tore at the roots '+n+' times ('+d.roots.filter(r=>r.hp>0).length+' left)';}
      case 'The last days':case 'Stay':return 'sleep';
      case 'The Ward':{day(11);const w=WARD.find(w=>!S.ward[w.k]&&w.need.every(r=>r[0]==='b'||r[0]==='i'));if(!w)return 'ward';
        for(const r of w.need){const lack=wardNeed(r)-wardHave(r);if(lack<=0)continue;if(r[0]==='b')for(let i=0;i<lack;i++)S.basket.push({kind:r[1],value:5});else if(r[0]==='i')addInv(r[1],lack);}
        try{if(S.room)leaveRoom();}catch(e){}pb.near(CHURCH_STEP.x,CHURCH_STEP.z,.3);openWard();const bt=document.querySelector('#noteText .wardb');bt&&bt.click();return 'offer the '+w.name+' bundle at the church ledger';}
      case 'The Tithe':{if(o.x!=null){day(11);pb.near(o.x,o.z,.5);return 'visit: '+o.d.split('Next:')[1];}
        // ask around: the townsfolk, one after another
        const ids=npcs.filter(n=>PEOPLE[n.def.id]).map(n=>n.def.id);pb._ask=((pb._ask||0)+1)%Math.max(1,ids.length);day(11);S.talkedToday={};return 'ask around: '+talkTo(ids[pb._ask]);}
    }
    if(o.npc){day(10);return talkTo(o.npc);}
    if(o.x!=null){return 'go there: '+pb.goAct(o.x,o.z,3);}
    return 'idle';};
  // the step's result, when playing it didn't move the story within a few tries
  pb.force=function(){const o=pb.obj(),t=o.t;const st=S.st||{};const b=sgB();
    if(b&&o.t===pb.strip(sgVal(b.name))){sgPlay(b);return 'FORCED saga beat '+b.id;}
    switch(t){
      case 'Stranded':S.foundCabin=true;return 'FORCED foundCabin';
      case 'The farm':S.readLetter=true;return 'FORCED readLetter';
      case 'Farm':S.everTilled=true;return 'FORCED till';case 'Plant':S.everPlanted=true;return 'FORCED plant';case 'Water':S.everWatered=true;return 'FORCED water';
      case 'Sell':S.shipped=Math.max(1,S.shipped);return 'FORCED ship';
      case 'The car':{if(!S.q.hollis){S.q.hollis=1;return 'FORCED hollis';}const cs=typeof CAR_STAGES!=='undefined'?CAR_STAGES[S.carStage||0]:null;if(cs&&cs.need&&!(S.parts[cs.need]>=1)){S.parts[cs.need]=1;return 'FORCED part '+cs.need;}
        S.carStage=(S.carStage||0)+1;if(typeof CAR_STAGES!=='undefined'&&S.carStage>=CAR_STAGES.length)S.carFixed=true;return 'FORCED car stage';}
      case 'Leave':S.looped=true;S.mode='play';try{endCine();}catch(e){}return 'FORCED looped';
      case 'Candles':S.candles=3;return 'FORCED candles';
      case 'Wait':case 'The rite':{const a=altars.find(a=>!a.lit);if(a){if(S.candles<1)S.candles=1;lightAltar(a);return 'FORCED light '+a.name;}break;}
      case 'The Tithe':{const p=ST_PLACES.find(p=>!st.seen[p.k]);if(p){st.seen[p.k]=1;addLore(p.lore);return 'FORCED seen '+p.k;}
        if(stKnown()<8){addLore('(bot) a thing someone told you '+S.lore.length);return 'FORCED lore';}
        if(sgB()){sgPlay(sgB());return 'FORCED saga';}break;}
      case 'The Ward':{const w=WARD.find(w=>!wardDoneOne(w));if(w){wardForce(w);return 'FORCED ward '+w.k;}break;}
      case 'A letter':st.mail=null;st.lettersRead=(st.lettersRead||0)+1;return 'FORCED letter';
      case 'Three stones':{for(const k of ['dock','tree','bed'])if(!st.got[k]){st.got[k]=1;return 'FORCED stone '+k;}if(st.set<3){const r=tdAct();if(st.set<3){st.set=3;if(!st.tithe)st.tithe=S.day+8;}return 'FORCED set stones ('+r+')';}break;}
      case 'The drawing':st.drawn=true;return 'FORCED drawn';
    }
    return null;};
  // the Ward helpers (progress.js keeps bundles in S.ward)
  window.wardDoneOne=w=>{try{return !!(S.ward&&S.ward[w.k]);}catch(e){return false;}};
  window.wardForce=w=>{S.ward=S.ward||{};S.ward[w.k]=S.day;};
})();1;
