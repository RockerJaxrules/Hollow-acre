/* ================= the profiles panel on the title screen: who is playing, switch, make a new profile (name and optional password),
   rename, delete, and a transfer code to move a profile's farm to another device ================= */
{const css=document.createElement('style');css.textContent=`#acctBar{display:flex;gap:10px;align-items:center;justify-content:center;margin:0 0 14px;font-size:14px;color:#f4e6c8;background:rgba(30,18,10,.55);padding:6px 8px 6px 14px;border-radius:999px;box-shadow:0 0 0 2px rgba(232,146,63,.35)}
#acctBar b{color:#ffd27a}#acctBar button{font:inherit;font-size:13px;padding:4px 12px;border-radius:999px;border:1px solid rgba(232,146,63,.6);background:#3a2210;color:#f4e6c8;cursor:pointer}
#acctPanel{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(8,6,4,.72)}#acctPanel[hidden]{display:none}
#acctPanel .box{width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;background:#2a1a0e;color:#f4e6c8;padding:16px;border-radius:10px;box-shadow:0 0 0 3px #5a3418,0 0 0 6px #b8823c,0 10px 30px rgba(0,0,0,.6);text-align:left}
#acctPanel h3{margin:0 0 10px;font-family:var(--font-display);letter-spacing:.06em;color:#ffd27a}#acctPanel .row{display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;background:rgba(255,255,255,.04);margin-bottom:6px}
#acctPanel .row.cur{box-shadow:inset 0 0 0 2px #e8923f}#acctPanel .row .who{flex:1;min-width:0}#acctPanel .row .who small{display:block;opacity:.7}
#acctPanel button{font:inherit;font-size:13px;padding:6px 10px;border-radius:6px;border:1px solid rgba(232,146,63,.55);background:#4a2c14;color:#f4e6c8;cursor:pointer}#acctPanel button.warn{border-color:#c04a2a;background:#4a1a10}
#acctPanel input,#acctPanel textarea{font:inherit;width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #8a5a2a;background:#1a0e06;color:#f4e6c8;margin:4px 0}
#acctPanel textarea{height:90px;font-size:11px;word-break:break-all}#acctPanel .acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}#acctPanel .msg{min-height:18px;font-size:13px;color:#ffd27a;margin-top:6px}`;document.head.appendChild(css);}
const acctSummary=id=>{try{const d=JSON.parse(localStorage.getItem(acctKeys(id).save)||'null');return d&&d.v===1?`Day ${d.S.day} · ${new Date(d.t).toLocaleDateString()}`:'No farm yet';}catch(e){return 'No farm yet';}};
async function acctHash(id,pin){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('hollow:'+id+':'+pin));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
const acctEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function acctSwitch(id){ACCT.cur=id;acctStore();const p=acctMe();if(p)p.last=Date.now();acctStore();location.reload();}
{const bar=document.createElement('div');bar.id='acctBar';const t=$('title');const kick=t.querySelector('.kicker');(kick||t.firstChild).before(bar);
  const panel=document.createElement('div');panel.id='acctPanel';panel.hidden=true;panel.innerHTML='<div class="box"></div>';document.body.appendChild(panel);
  panel.addEventListener('pointerdown',e=>{if(e.target===panel)panel.hidden=true;});
  const me=acctMe();bar.innerHTML=`Farming as <b>${acctEsc(me.name)}</b><button id="acctOpen">Profiles</button>`;$('acctOpen').addEventListener('click',()=>acctShow('list'));
  // a new profile starts with its own name on the character
  try{if(!localStorage.getItem(acctKeys(ACCT.cur).look)&&me.id!=='default'&&S.look){S.look.name=me.name.slice(0,14);if($('cName'))$('cName').value=S.look.name;}}catch(e){}}
function acctShow(view,arg){const box=$('acctPanel').querySelector('.box');$('acctPanel').hidden=false;const msg=t=>{const m=box.querySelector('.msg');if(m)m.textContent=t;};
  if(view==='list'){box.innerHTML=`<h3>Profiles</h3><div class="rows">${ACCT.list.map(p=>`<div class="row${p.id===ACCT.cur?' cur':''}" data-id="${p.id}"><div class="who"><b>${acctEsc(p.name)}</b>${p.pin?' 🔒':''}<small>${acctSummary(p.id)}</small></div>
      ${p.id===ACCT.cur?'<button data-a="rename">Rename</button>':'<button data-a="play">Play</button>'}<button data-a="more">…</button></div>`).join('')}</div>
      <div class="acts"><button data-a="new">New profile</button><button data-a="import">Enter a transfer code</button><button data-a="close">Close</button></div><div class="msg"></div>`;
    box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const id=b.closest('.row')&&b.closest('.row').dataset.id,a=b.dataset.a;
      if(a==='close')$('acctPanel').hidden=true;else if(a==='new')acctShow('new');else if(a==='import')acctShow('import');else if(a==='rename')acctShow('rename',id);else if(a==='more')acctShow('more',id);
      else if(a==='play'){const p=ACCT.list.find(q=>q.id===id);if(p.pin)acctShow('pin',id);else acctSwitch(id);}}));return;}
  if(view==='pin'){const p=ACCT.list.find(q=>q.id===arg);box.innerHTML=`<h3>${acctEsc(p.name)}</h3>Log in — enter your password.<input id="acctPin" type="password" maxlength="32" autocomplete="off"><div class="acts"><button data-a="ok">Log in</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    const go=async()=>{const h=await acctHash(p.id,$('acctPin').value.trim());if(h===p.pin)acctSwitch(p.id);else{msg('That isn’t it.');$('acctPin').value='';}};
    box.querySelector('[data-a=ok]').addEventListener('click',go);$('acctPin').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')go();});box.querySelector('[data-a=back]').addEventListener('click',()=>acctShow('list'));$('acctPin').focus();return;}
  if(view==='new'||view==='rename'){const p=view==='rename'?ACCT.list.find(q=>q.id===arg):null;
    box.innerHTML=`<h3>${p?'Rename profile':'New profile'}</h3>Name<input id="acctName" maxlength="16" value="${p?acctEsc(p.name):''}" autocomplete="off">${p?'':'Password (optional) so only you can open this farm<input id="acctNewPin" type="password" maxlength="32" autocomplete="off">'}
      <div class="acts"><button data-a="ok">${p?'Save':'Create and play'}</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    box.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>e.stopPropagation()));
    box.querySelector('[data-a=back]').addEventListener('click',()=>acctShow('list'));
    box.querySelector('[data-a=ok]').addEventListener('click',async()=>{const name=$('acctName').value.trim().slice(0,16);if(!name){msg('Give it a name.');return;}
      if(p){p.name=name;acctStore();$('acctBar').querySelector('b').textContent=name;acctShow('list');return;}
      const pin=$('acctNewPin').value.trim();if(pin&&pin.length<4){msg('A password needs 4 or more characters.');return;}const id='p'+Date.now().toString(36);const np={id,name,created:Date.now()};if(pin)np.pin=await acctHash(id,pin);ACCT.list.push(np);acctSwitch(id);});
    $('acctName').focus();return;}
  if(view==='more'){const p=ACCT.list.find(q=>q.id===arg);box.innerHTML=`<h3>${acctEsc(p.name)}</h3><small>${acctSummary(p.id)}</small>
      <div class="acts"><button data-a="code">Make a transfer code</button>${p.id!=='default'?'<button data-a="pin">'+(p.pin?'Remove password':'Set a password')+'</button>':''}<button class="warn" data-a="del">${p.id==='default'?'Erase this farm':'Delete profile'}</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    box.querySelector('[data-a=back]').addEventListener('click',()=>acctShow('list'));box.querySelector('[data-a=code]').addEventListener('click',()=>acctShow('export',p.id));
    const pb=box.querySelector('[data-a=pin]');if(pb)pb.addEventListener('click',async()=>{if(p.pin){delete p.pin;acctStore();acctShow('more',p.id);}else{const v=(prompt('Set a password for '+p.name+' (4+ characters):')||'').trim();if(v.length>=4){p.pin=await acctHash(p.id,v);acctStore();acctShow('more',p.id);}else msg('A password needs 4 or more characters.');}});
    let arm=0;box.querySelector('[data-a=del]').addEventListener('click',()=>{if(!arm){arm=1;msg(p.id==='default'?'Tap again to erase this farm for good.':'Tap again to delete this profile and its farm for good.');return;}
      const k=acctKeys(p.id);try{localStorage.removeItem(k.save);localStorage.removeItem(k.morning);localStorage.removeItem(k.look);}catch(e){}
      if(p.id!=='default')ACCT.list=ACCT.list.filter(q=>q.id!==p.id);if(ACCT.cur===p.id)acctSwitch('default');else{acctStore();acctShow('list');}});return;}
  if(view==='export'){const p=ACCT.list.find(q=>q.id===arg);box.innerHTML=`<h3>Transfer code</h3>Copy this, then on the other device open Profiles, “Enter a transfer code” and paste it. It carries ${acctEsc(p.name)}’s farm and look.<textarea id="acctCode" readonly>Making the code…</textarea>
      <div class="acts"><button data-a="copy">Copy</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    box.querySelector('[data-a=back]').addEventListener('click',()=>acctShow('more',p.id));
    acctEncode(p).then(code=>{$('acctCode').value=code;});box.querySelector('[data-a=copy]').addEventListener('click',async()=>{const ta=$('acctCode');ta.select();try{await navigator.clipboard.writeText(ta.value);msg('Copied.');}catch(e){try{document.execCommand('copy');msg('Copied.');}catch(e2){msg('Select it and copy it by hand.');}}});return;}
  if(view==='import'){box.innerHTML=`<h3>Enter a transfer code</h3>Paste the code from the other device. The farm comes in as a new profile.<textarea id="acctCode"></textarea><div class="acts"><button data-a="ok">Bring it in</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    $('acctCode').addEventListener('keydown',e=>e.stopPropagation());box.querySelector('[data-a=back]').addEventListener('click',()=>acctShow('list'));
    box.querySelector('[data-a=ok]').addEventListener('click',async()=>{try{const d=await acctDecode($('acctCode').value);const id='p'+Date.now().toString(36);const k=acctKeys(id);
      if(d.save)localStorage.setItem(k.save,d.save);if(d.morning)localStorage.setItem(k.morning,d.morning);if(d.look)localStorage.setItem(k.look,d.look);
      let name=(d.name||'Farmer').slice(0,16);if(ACCT.list.some(q=>q.name===name))name=(name+' 2').slice(0,16);ACCT.list.push({id,name,created:Date.now()});acctSwitch(id);}catch(e){msg('That code didn’t work. Check it was copied whole.');}});return;}}
// the code: the profile's save, morning save and look, gzipped (where the browser can) and written in letters
async function acctEncode(p){const k=acctKeys(p.id);const o={v:1,name:p.name,save:localStorage.getItem(k.save),morning:localStorage.getItem(k.morning),look:localStorage.getItem(k.look)};
  let bytes=new TextEncoder().encode(JSON.stringify(o)),tag='HA1';
  if(typeof CompressionStream!=='undefined'){bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());tag='HA1Z';}
  let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));return tag+':'+btoa(s);}
async function acctDecode(code){code=code.trim().replace(/\s+/g,'');const m=/^(HA1Z?):(.+)$/.exec(code);if(!m)throw new Error('bad');const bin=atob(m[2]);let bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  if(m[1]==='HA1Z')bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());const o=JSON.parse(new TextDecoder().decode(bytes));if(o.v!==1)throw new Error('bad');return o;}
