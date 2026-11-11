/* ================= profiles: everyone who plays on this device keeps their own farm. Each profile has a name, an optional password, its own save and its own look. A transfer code carries a profile's farm to another device. (Loaded early: the
   save and look keys depend on which profile is playing; switching profiles reloads the game.) ================= */
const ACCT=(()=>{let list=[],cur='default';try{list=JSON.parse(localStorage.getItem('hollowAccounts')||'[]')||[];cur=localStorage.getItem('hollowProfile')||'default';}catch(e){}
  if(!list.find(p=>p.id==='default'))list.unshift({id:'default',name:'Player 1',created:Date.now()});if(!list.find(p=>p.id===cur))cur='default';return {list,cur};})();
const ACCT_SUFFIX=ACCT.cur==='default'?'':'@'+ACCT.cur;
const acctKeys=id=>{const s=id==='default'?'':'@'+id;return {save:'hollowSave1'+s,morning:'hollowSave1'+s+'_morning',look:'hollowLook'+s};};
function acctStore(){try{localStorage.setItem('hollowAccounts',JSON.stringify(ACCT.list));localStorage.setItem('hollowProfile',ACCT.cur);}catch(e){}}
const acctMe=()=>ACCT.list.find(p=>p.id===ACCT.cur);
