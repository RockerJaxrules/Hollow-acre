// profiles: separate farms, PIN, switching, transfer code round trip, delete
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:900,height:640}});await ctx.grantPermissions(['clipboard-read','clipboard-write']);const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 const load=async()=>{await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.waitForTimeout(400);};
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const bar=()=>pg.evaluate(()=>document.getElementById('acctBar').textContent+' | cont: '+(document.getElementById('cont')?document.getElementById('cont').textContent:'none'));
 const click=async sel=>{await pg.click(sel);await pg.waitForTimeout(150);};const btn=a=>`#acctPanel [data-a=${a}]`;
 await pg.goto('http://localhost:8766/test2d.html');await load();await pg.evaluate(()=>localStorage.clear());await pg.reload();await load();
 console.log('1 fresh:',await bar());await pg.screenshot({path:'TA_1title.png'});
 // a farm for Player 1
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 await ev("S.tut.off=true;S.readLetter=true;S.day=4;S.coins=777;saveGame(true);");await pg.reload();await load();console.log('2 after farm:',await bar());
 // new profile with a PIN
 await click('#acctOpen');await pg.screenshot({path:'TA_2panel.png'});await click(btn('new'));await pg.fill('#acctName','Sam');await pg.fill('#acctNewPin','1234');
 await Promise.all([pg.waitForNavigation(),pg.click(btn('ok'))]);await load();console.log('3 as Sam:',await bar());
 // back to Player 1 (no PIN)
 await click('#acctOpen');await Promise.all([pg.waitForNavigation(),pg.click('#acctPanel .row:not(.cur) [data-a=play]')]);await load();console.log('4 back to P1:',await bar());
 console.log('   P1 coins in save:',await pg.evaluate(()=>JSON.parse(localStorage.getItem('hollowSave1')).S.coins));
 // Sam needs the PIN
 await click('#acctOpen');const rows=await pg.$$('#acctPanel .row');for(const r of rows){if((await r.textContent()).includes('Sam')){await (await r.$('[data-a=play]')).click();break;}}await pg.waitForTimeout(200);
 await pg.fill('#acctPin','0000');await click(btn('ok'));await pg.waitForTimeout(300);console.log('5 wrong pin msg:',await pg.textContent('#acctPanel .msg'));
 await pg.fill('#acctPin','1234');await Promise.all([pg.waitForNavigation(),pg.click(btn('ok'))]);await load();console.log('6 right pin:',await bar());
 // transfer code: export Player 1, import it as a new profile
 await click('#acctOpen');const rows2=await pg.$$('#acctPanel .row');for(const r of rows2){if((await r.textContent()).includes('Player 1')){await (await r.$('[data-a=more]')).click();break;}}await pg.waitForTimeout(150);
 await click(btn('code'));await pg.waitForFunction(()=>document.getElementById('acctCode').value.startsWith('HA1'));const code=await pg.inputValue('#acctCode');console.log('7 code length',code.length,code.slice(0,12));await pg.screenshot({path:'TA_3code.png'});
 await click(btn('back'));await click(btn('back'));await click(btn('import'));await pg.fill('#acctCode',code);await Promise.all([pg.waitForNavigation(),pg.click(btn('ok'))]);await load();console.log('8 imported:',await bar());
 console.log('   profiles:',await pg.evaluate(()=>localStorage.getItem('hollowAccounts')));
 // delete the imported one (it's current -> falls back to Player 1)
 await click('#acctOpen');const rows3=await pg.$$('#acctPanel .row.cur');await (await rows3[0].$('[data-a=more]')).click();await pg.waitForTimeout(150);await click(btn('del'));
 await Promise.all([pg.waitForNavigation(),pg.click(btn('del'))]);await load();console.log('9 after delete:',await bar(),'| profiles',await pg.evaluate(()=>JSON.parse(localStorage.getItem('hollowAccounts')).map(p=>p.name).join(',')));
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
