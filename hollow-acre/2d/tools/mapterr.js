// writes g2d/mapterr366.js: the valley's ground samples for the map (water, stone, dirt, deep woods, grass), so the map doesn't
// spend seconds sampling them on every player's first visit. Run after anything changes the ground; the game checks the samples
// against the ground before it trusts them, and samples again itself if they're stale.
//   node tools/mapterr.js http://localhost:8766/<a built page>.html src/mapterr366.js     (then build again)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/nostr|relay|degmods|trystero|wss:/,r=>r.abort());await pg.route('**/version.json*',r=>r.abort());
 await pg.goto(process.argv[2]+'?v='+Date.now());await pg.waitForFunction(()=>window.__game&&__game.S.mode==='title',null,{timeout:180000});
 const out=await pg.evaluate(()=>__game.ev("(()=>{const J=mapTerr();return {key:J.D.key,n:J.cls.length,rle:m6RleEncode(J.cls)}})()"));
 const js='/* ================= t366 the valley\'s ground for the map, sampled ahead of time (tools/mapterr.js): one kind per sample, run-length\n   coded (water, stone, dirt, deep woods, grass). map366.js checks it against the ground before using it. ================= */\nconst MAP6_TERR='+JSON.stringify(out)+';\n';
 fs.writeFileSync(process.argv[3],js);console.log('wrote',process.argv[3],js.length,'bytes, key',out.key,'samples',out.n);await b.close();})();
