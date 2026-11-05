/* ================= always the newest version: when the game is opened from a website (GitHub Pages, itch.io), it asks the server
   which version is current, skipping every cache, and reloads itself if a newer one is out. Never on claude.ai or in the apps. ================= */
(function(){if(!/^https?:$/.test(location.protocol)||/claude\.ai|claudeusercontent/.test(location.hostname))return;
  let tried=null;try{tried=sessionStorage.getItem('hollowUpd');}catch(e){}
  fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(v=>{if(!v||!v.id||v.id===BUILD_ID)return;
    if(tried===v.id)return;try{sessionStorage.setItem('hollowUpd',v.id);}catch(e){}
    if(S.mode==='title'||S.mode==='load'){const u=new URL(location.href);u.searchParams.set('v',v.id);location.replace(u.toString());}
    else toast('A new version of Hollow Acre is out. It loads next time you open the game.',4);}).catch(()=>{});})();
