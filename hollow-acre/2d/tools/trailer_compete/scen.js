// the demo match the trailer shows: you (Jax) against a friend (Sam), the Vance orchard and the Dunn boys, a week and a bit in
module.exports.SETUP=`
S.tut.off=true;S.readLetter=true;S.look.name='Jax';
mpBegin({cabins:'own',money:'split',play:'compete',hands:2});
HOST.role='host';HOST.members=HOST.members||{};
S.coins=6000;S.day=7;
const FOOD=Object.keys(ITEMS).filter(k=>ITEMS[k].food&&!ITEMS[k].drink);
bwApply('Jax',{a:'open',name:'Jax Fresh Produce',type:'stand'});
bwApply('Sam',{a:'open',name:'Sam\\u2019s Kitchen',type:'kitchen'});
bwApply('Jax',{a:'hire',w:'tom'});bwApply('Jax',{a:'hire',w:'ellie'});
bwApply('Sam',{a:'hire',w:'ada'});bwApply('Sam',{a:'hire',w:'jonah'});
const mine=BW().shops.Jax,sams=BW().shops.Sam;mine.till=260;sams.till=180;
const crops=['pumpkin','turnip','pumpkin','egg','pumpkin','turnip'];
window.__dayRun=(n,shipMe,shipSam)=>{for(let d=0;d<n;d++){
  S.ship=[];for(let i=0;i<shipMe;i++){const k=crops[i%crops.length];S.ship.push({t:'P',id:k,value:mkBase(k),by:'Jax'});}
  for(let i=0;i<shipSam;i++){const k=crops[(i+3)%crops.length];S.ship.push({t:'P',id:k,value:mkBase(k),by:'Sam'});}
  bwApply('Jax',{a:'stock',items:Array.from({length:14},(_,i)=>({t:'P',id:crops[i%crops.length],value:mkBase(crops[i%crops.length])}))});
  bwApply('Sam',{a:'stock',items:Array.from({length:10},(_,i)=>({t:'I',id:FOOD[i%Math.min(4,FOOD.length)],value:28}))});
  S.day++;mkNight();S.ship=[];bwMorning();}};
__dayRun(3,10,9);
bwApply('Jax',{a:'ad',k:'bills'});bwApply('Sam',{a:'price',p:'cheap'});
__dayRun(2,12,10);
S.coins=2400;S.hour=10.2;S.weather&&(S.weather='clear');
[S.day,Object.keys(BW().shops),MK().contracts.length,BW().tenders.length,JSON.stringify(MK().earn),MK().rivals.map(r=>r.earn).join(',')]`;
