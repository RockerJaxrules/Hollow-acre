/* ================= always the newest version, without anyone doing anything. When the game runs from a website (GitHub Pages,
   itch.io, a home-screen shortcut), it asks the server which version is current, skipping every cache: when it opens, whenever
   you come back to it, and every ten minutes. If a newer one is out it autosaves, reloads, and puts you back where you were.
   A service worker fetches the game page fresh whenever there's a connection (and lets it open offline). Never on claude.ai or in the apps. ================= */
(function(){if(!/^https?:$/.test(location.protocol)||/claude\.ai|claudeusercontent/.test(location.hostname))return;
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  let busy=false;
  function check(){if(busy)return;busy=true;fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(v=>{busy=false;if(!v||!v.id||v.id===BUILD_ID)return;
      let tried=null;try{tried=sessionStorage.getItem('hollowUpd');}catch(e){}if(tried===v.id)return;try{sessionStorage.setItem('hollowUpd',v.id);}catch(e){}
      const playing=S.mode==='play'||S.mode==='scare'||S.mode==='trans';
      if(playing){if(S.paused&&!$('note').hidden)return;try{flushSave&&flushSave();}catch(e){}try{sessionStorage.setItem('hollowAutoCont','update');}catch(e){}}
      else if(S.mode!=='title'&&S.mode!=='load')return;
      const u=new URL(location.href);u.searchParams.set('v',v.id);location.replace(u.toString());}).catch(()=>{busy=false;});}
  check();setInterval(check,10*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});addEventListener('pageshow',e=>{if(e.persisted)check();});addEventListener('focus',check);})();
