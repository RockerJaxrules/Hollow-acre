// Desktop app for Hollow Acre (Electron). `npm start` runs it; `npm run dist` builds installers for this computer's OS.
//
// The window plays the live game from its website (GitHub Pages), so every game update reaches the app at once, with no
// reinstall. The site's service worker keeps a copy for playing offline. If the app has never been online, it plays the copy
// of the game that ships inside it, served under the website's own address, so the save is the same one either way.
// The app itself (this shell) updates itself from GitHub Releases: the Windows installer and the Linux AppImage download a new
// version quietly, say "Update ready, restart to apply", and install it when the player restarts or quits. Never mid-game.
// The Mac app has no Apple certificate, so it can't replace itself: it asks GitHub Releases for the newest version and says
// "A new version is ready" with a Download button. The game inside it updates live on every computer, the Mac included.
const {app,BrowserWindow,Menu,ipcMain,screen,session,shell,net}=require('electron');const path=require('path');const fs=require('fs');
app.setName('Hollow Acre');
// sound starts without a click or a key first, so a game played only on a controller has its sound from the title screen
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');

// ---------------------------------------------------------------- where the game lives
const SITE='https://rockerjaxrules.github.io';        // the Pages origin (every Pages site of this account shares it, so the path is checked too)
const SITE_PATH='/Hollow-acre/';
const GAME_PATH='/Hollow-acre/hollow-acre/2d/';
const GAME_URL=SITE+GAME_PATH;
const RELEASES='https://github.com/RockerJaxrules/Hollow-acre/releases/latest';
const BUNDLE=path.join(__dirname,'game');               // the copy shipped inside the app (copy-game.js)
const trusted=u=>{try{const x=new URL(u);return x.origin===SITE&&x.pathname.startsWith(SITE_PATH);}catch(e){return false;}};
const fromGame=e=>{try{return trusted(e.senderFrame.url);}catch(x){return false;}};

// ---------------------------------------------------------------- a small log in the app's data folder, for when something goes wrong
function log(...a){const s=new Date().toISOString()+' '+a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ')+'\n';
  try{const f=path.join(app.getPath('userData'),'desktop.log');try{if(fs.statSync(f).size>256e3)fs.renameSync(f,f+'.old');}catch(e){}fs.appendFileSync(f,s);}catch(e){}
  if(!app.isPackaged||process.env.HOLLOW_LOG)process.stdout.write(s);}

// one copy at a time: a second launch (a double click, or Steam starting it again) brings the first window forward
const PRIMARY=app.requestSingleInstanceLock();
if(!PRIMARY)app.quit();
else app.on('second-instance',()=>{const w=WIN;if(w&&!w.isDestroyed()){if(w.isMinimized())w.restore();w.focus();}});

// ---------------------------------------------------------------- the Steam Deck: Steam sets SteamDeck=1 for what it launches on a
// Deck; SteamOS names itself in /etc/os-release (Desktop Mode, launched from the file manager); the Deck's panel is 1280 x 800
let DECK='';
function deckWhy(){if(process.env.SteamDeck==='1')return 'SteamDeck=1';
  if(process.platform!=='linux')return '';
  try{const r=fs.readFileSync('/etc/os-release','utf8');if(/^ID=steamos\s*$/m.test(r)||/^NAME="?SteamOS/m.test(r))return 'SteamOS';}catch(e){}
  try{const d=screen.getPrimaryDisplay(),sf=d.scaleFactor||1,w=Math.round(d.size.width*sf),h=Math.round(d.size.height*sf);
    if((w===1280&&h===800)||(w===800&&h===1280))return '1280x800 screen';}catch(e){}
  return '';}

// ---------------------------------------------------------------- the window remembers its size, place and full screen between runs;
// the first run opens at most of your screen. The game's Display setting can resize it or go full screen (#273).
const winFile=()=>path.join(app.getPath('userData'),'window.json');
function loadWin(){try{return JSON.parse(fs.readFileSync(winFile(),'utf8'));}catch(e){return null;}}
function saveWin(w){try{if(w.isDestroyed())return;const full=w.isFullScreen();const b=full?(w._lastBounds||w.getBounds()):w.getBounds();fs.writeFileSync(winFile(),JSON.stringify({bounds:b,full}));}catch(e){}}
let WIN=null;
function create(){const wa=screen.getPrimaryDisplay().workArea,saved=loadWin();
  let b={width:Math.round(wa.width*.86),height:Math.round(wa.height*.86)};b.x=wa.x+Math.round((wa.width-b.width)/2);b.y=wa.y+Math.round((wa.height-b.height)/2);
  if(saved&&saved.bounds){const d=screen.getDisplayMatching(saved.bounds).workArea;if(saved.bounds.width>=640&&saved.bounds.height>=400&&saved.bounds.x<d.x+d.width&&saved.bounds.y<d.y+d.height)b=saved.bounds;}
  let full=!!(saved&&saved.full);
  // on a Deck the game always starts full screen on its 1280 x 800 panel (in Game Mode and in Desktop Mode)
  if(DECK){const d=screen.getPrimaryDisplay().bounds;b={x:d.x,y:d.y,width:Math.min(1280,d.width),height:Math.min(800,d.height)};full=true;}
  const w=WIN=new BrowserWindow({...b,minWidth:960,minHeight:600,backgroundColor:'#07070a',autoHideMenuBar:true,title:'Hollow Acre',fullscreen:full,
    icon:path.join(__dirname,'shell','icon.png'),
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,webviewTag:false,spellcheck:false,
      backgroundThrottling:false}});   // (the game keeps its music and its clock going when the window is behind another)
  Menu.setApplicationMenu(process.platform==='darwin'?macMenu():null);
  w.webContents.on('before-input-event',(e,i)=>{if(i.key==='F11'&&i.type==='keyDown'){w.setFullScreen(!w.isFullScreen());e.preventDefault();}});
  let t=null;const later=()=>{if(!w.isFullScreen())w._lastBounds=w.getBounds();clearTimeout(t);t=setTimeout(()=>saveWin(w),600);};
  w.on('resize',later);w.on('move',later);w.on('enter-full-screen',later);w.on('leave-full-screen',later);
  // closing the window lets the game write its last autosave first
  w.on('close',e=>{saveWin(w);if(w._saved)return;e.preventDefault();autosave(w).finally(()=>{w._saved=true;w.close();});});
  // no connection and nothing cached (or the site answers with an error): play the copy inside the app, at the same address
  w.webContents.on('did-fail-load',(e,code,desc,url,main)=>{if(!main||code===-3||!trusted(url))return;log('load failed',code,desc,url);useBundled(w,desc);});
  w.webContents.on('did-navigate',(e,url,status)=>{if(trusted(url)&&(status===404||status>=500)){log('site answered',status);useBundled(w,'HTTP '+status);}});
  w.webContents.on('did-start-navigation',d=>{if(d.isMainFrame&&!d.isSameDocument)LOADED=false;});
  let crashes=0;w.webContents.on('render-process-gone',(e,d)=>{log('renderer gone',d.reason);if(d.reason!=='clean-exit'&&++crashes<=3)w.reload();});
  w.loadURL(GAME_URL);}
// a Mac app needs its menu bar for the keys every Mac app has: Cmd+Q to quit (the game autosaves first, as when the window
// closes), Cmd+H to hide, Cmd+M to minimise, Ctrl+Cmd+F for full screen, and Cmd+C / Cmd+V in the game's text boxes
function macMenu(){return Menu.buildFromTemplate([
  {label:app.name,submenu:[{role:'about'},{type:'separator'},{role:'hide'},{role:'hideOthers'},{role:'unhide'},{type:'separator'},{role:'quit'}]},
  {label:'Edit',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},
  {label:'View',submenu:[{role:'togglefullscreen'}]},
  {label:'Window',submenu:[{role:'minimize'},{role:'zoom'},{type:'separator'},{role:'close'}]}]);}
const autosave=w=>w.webContents.executeJavaScript("try{dispatchEvent(new Event('pagehide'))}catch(e){}").catch(()=>{});

// ---------------------------------------------------------------- the copy inside the app. Every request for the game's address
// still tries the internet first; only when that fails does the shipped file answer. Art asked for under another build's name
// (?b=<build>) is not answered from the shipped copy, so an old picture is never cached as a new build's.
let BUNDLED=false,LOADED=false;
const BUNDLED_ID=(()=>{try{return String(JSON.parse(fs.readFileSync(path.join(BUNDLE,'version.json'),'utf8')).id);}catch(e){return null;}})();
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json',
  '.txt':'text/plain; charset=utf-8','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp'};
function bundledFile(u){let rel=decodeURIComponent(u.pathname.slice(GAME_PATH.length));if(!rel||rel.endsWith('/'))rel+='index.html';
  const b=u.searchParams.get('b');if(b&&BUNDLED_ID&&b!==BUNDLED_ID)return new Response('',{status:504});
  const f=path.normalize(path.join(BUNDLE,rel));if(!f.startsWith(BUNDLE+path.sep))return new Response('',{status:403});
  let data;try{data=fs.readFileSync(f);}catch(e){return new Response('',{status:404});}
  return new Response(data,{status:200,headers:{'content-type':TYPES[path.extname(f).toLowerCase()]||'application/octet-stream','cache-control':'no-cache'}});}
async function bundledHandler(req){const u=new URL(req.url);const pass=()=>net.fetch(req,{bypassCustomProtocolHandlers:true});
  if(u.origin!==SITE||!u.pathname.startsWith(GAME_PATH))return pass();
  try{const r=await pass();if(r.status!==404&&r.status<500)return r;}catch(e){}
  return bundledFile(u);}
// the game's page is up (preload.js says so when its document is ready; an error page never does)
ipcMain.on('hd:ready',e=>{const w=WIN;if(!w||w.isDestroyed()||e.sender!==w.webContents||!fromGame(e))return;LOADED=true;
  log('game loaded',BUNDLED?'(the copy inside the app)':'(the website, or its offline copy)',e.senderFrame.url);w.focus();
  if(BUNDLED)notice({id:'off',text:'Offline: playing the copy inside the app, with your same save.',ms:12000});
  else warmCache(w);
  if(UPD.ready)notice(UPD.ready);else if(UPD.out)notice(UPD.out);
  if(MIG.note){notice(MIG.note);MIG.note=null;}});
function useBundled(w,why){if(BUNDLED){if(!LOADED)w.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<body style="background:#07070a;color:#e8dcc0;font:18px sans-serif;padding:40px">Hollow Acre could not start: there is no connection, and the copy of the game inside the app could not be opened. Connect to the internet and start it again.</body>'));return;}
  if(!BUNDLED_ID||!fs.existsSync(path.join(BUNDLE,'index.html'))){log('no copy of the game inside the app');return;}
  BUNDLED=true;LOADED=false;log('playing the copy inside the app, build',BUNDLED_ID,'because',why);
  session.defaultSession.protocol.handle('https',bundledHandler);w.loadURL(GAME_URL);}

// ---------------------------------------------------------------- offline play: the game's service worker keeps what the game has
// loaded. The very first visit's page and the pictures loaded only when needed (the character creator's clothes and hair) are
// fetched once after the game is up, through the same service worker, so the next start without a connection has all of it.
function warmCache(w){setTimeout(()=>{if(w.isDestroyed()||BUNDLED)return;
  w.webContents.executeJavaScript(`(async()=>{try{const G=window.__game,SPR=G&&G.ev&&G.ev('typeof SPR==="object"?SPR:null'),BUILD_ID=G&&G.ev&&G.ev('typeof BUILD_ID==="string"?BUILD_ID:null');
    if(!navigator.serviceWorker||!navigator.serviceWorker.controller||!SPR||!BUILD_ID)return 'skip';
    if(window.__hdWarm===BUILD_ID)return 'done';window.__hdWarm=BUILD_ID;
    const page=new URL('./',location.href).href;let pg='kept';if(!(await caches.match(page,{ignoreSearch:true}))){try{pg=(await fetch(page,{cache:'no-store'})).ok?'fetched':'failed';}catch(e){pg='failed';}}
    const L=[...new Set(Object.values(SPR).map(m=>m&&m.src).filter(s=>typeof s==='string'&&/^spr\\//.test(s)))];let had=0,got=0,bad=0;
    const one=async s=>{const u=new URL(s+'?b='+BUILD_ID,location.href).href;if(await caches.match(u)){had++;return;}try{const r=await fetch(u);r.ok?got++:bad++;}catch(e){bad++;}};
    for(let i=0;i<L.length;i+=4){if(!navigator.onLine)break;await Promise.all(L.slice(i,i+4).map(one));}
    return 'build '+BUILD_ID+': the page '+pg+'; '+L.length+' pictures: '+had+' kept, '+got+' fetched, '+bad+' failed';}catch(e){return 'error '+e.message;}})()`)
    .then(r=>{if(r!=='done')log('offline copy:',r);}).catch(()=>{});},25000);}

// ---------------------------------------------------------------- saves from the old app (0.2 and earlier played the game from the
// files inside it, so its saves are in the file:// storage). On the first start they are read through a hidden window on a local
// page, kept in a backup file, and written into the website's storage before the game's own scripts run (preload.js). A key the
// website's storage already has is never overwritten.
const MIG={pending:null,flag:null,note:null};
async function readOldSaves(){const ud=app.getPath('userData');MIG.flag=path.join(ud,'saves-moved.json');
  if(fs.existsSync(MIG.flag))return;
  const w=new BrowserWindow({show:false,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}});
  try{await w.loadFile(path.join(__dirname,'shell','blank.html'));
    const dump=await w.webContents.executeJavaScript('(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;})()');
    const keys=Object.keys(dump||{});
    if(!keys.length){writeFlag({moved:0,why:'the old app had no saves'});return;}
    const bk=path.join(ud,'saves-from-old-app.json');if(!fs.existsSync(bk))fs.writeFileSync(bk,JSON.stringify(dump));
    MIG.pending=dump;log('old saves found:',keys.length,'keys, backed up in',bk);
  }catch(e){log('could not read the old saves',e&&e.message);}finally{w.destroy();}}
function writeFlag(o){try{fs.writeFileSync(MIG.flag,JSON.stringify({...o,app:app.getVersion()}));}catch(e){}}
ipcMain.on('hd:migrate',e=>{e.returnValue=fromGame(e)&&MIG.pending?MIG.pending:null;});
ipcMain.on('hd:migrated',(e,r)=>{if(!fromGame(e)||!MIG.pending)return;log('old saves moved',r);
  if(r&&r.error)return;   // tried again at the next start
  writeFlag({moved:r.written,kept:r.skipped});MIG.pending=null;
  if(r.written)MIG.note={id:'mig',text:'Your saves from the old app were moved over.',ms:9000};});

// ---------------------------------------------------------------- what the game can ask the app (only from the game's own pages)
const winOf=e=>BrowserWindow.fromWebContents(e.sender);
ipcMain.handle('hd:info',e=>{if(!fromGame(e))return null;const w=winOf(e);const d=w?screen.getDisplayMatching(w.getBounds()):screen.getPrimaryDisplay();const sf=d.scaleFactor||1;
  return {w:Math.round(d.size.width*sf),h:Math.round(d.size.height*sf),sf,deck:!!DECK,app:app.getVersion(),offline:BUNDLED};});
ipcMain.handle('hd:setWindow',(e,pw,ph)=>{if(!fromGame(e))return false;const w=winOf(e);if(!w)return false;pw=+pw||0;ph=+ph||0;if(w.isFullScreen())w.setFullScreen(false);
  const d=screen.getDisplayMatching(w.getBounds()),sf=d.scaleFactor||1,wa=d.workArea;
  // a window of that many physical pixels, kept inside the screen's work area (minus the taskbar)
  const cw=Math.min(Math.round(pw/sf),wa.width),ch=Math.min(Math.round(ph/sf),wa.height-32);
  w.setContentSize(Math.max(960,cw),Math.max(600,ch));const nb=w.getBounds();w.setPosition(wa.x+Math.max(0,Math.round((wa.width-nb.width)/2)),wa.y+Math.max(0,Math.round((wa.height-nb.height)/2)));return true;});
ipcMain.handle('hd:full',(e,on)=>{if(!fromGame(e))return false;const w=winOf(e);if(w)w.setFullScreen(!!on);return true;});
ipcMain.handle('hd:notice',(e,act)=>{if(!fromGame(e))return false;
  if(act==='restart')restartToUpdate();else if(act==='page')shell.openExternal(UPD.url||RELEASES);
  else if(act==='close'){if(UPD.ready)UPD.ready.shown=true;if(UPD.out)UPD.out.shown=true;}return true;});
function notice(n){if(!n||n.shown||!WIN||WIN.isDestroyed()||!LOADED)return;try{WIN.webContents.send('hd:notice',n);}catch(e){}}

// ---------------------------------------------------------------- the app's own updates (GitHub Releases, through electron-updater).
// The Windows installer and the AppImage download the new version in the background and install it when you restart from the
// notice, or the next time you quit. The portable .exe and the .deb can't replace themselves: they say a new version is out.
const UPD={ready:null,out:null,au:null,url:null};
function initUpdater(){if(!app.isPackaged||process.platform==='darwin'||process.env.HOLLOW_NO_UPDATES)return;
  let au;try{au=require('electron-updater').autoUpdater;}catch(e){log('updater missing',e&&e.message);return;}
  UPD.au=au;const canInstall=(process.platform==='win32'&&!process.env.PORTABLE_EXECUTABLE_DIR)||(process.platform==='linux'&&!!process.env.APPIMAGE);
  au.autoDownload=canInstall;au.autoInstallOnAppQuit=canInstall;au.allowPrerelease=false;
  au.logger={info:m=>log('update:',String(m)),warn:m=>log('update warning:',String(m)),error:m=>log('update error:',String(m)),debug:()=>{}};
  au.on('update-available',i=>{if(canInstall)return;UPD.out={id:'upd',text:`Hollow Acre ${i.version} is out`,btn:[['Download page','page'],['Later','close']],ms:20000};notice(UPD.out);});
  au.on('update-downloaded',i=>{UPD.ready={id:'upd',text:'Update ready, restart to apply',btn:[['Restart now','restart'],['Later','close']],ms:25000,v:i.version};notice(UPD.ready);});
  au.on('error',e=>log('update failed:',e&&e.message));
  const check=()=>au.checkForUpdates().catch(e=>log('update check failed:',e&&e.message));
  setTimeout(check,+process.env.HOLLOW_UPDATE_DELAY||12000);setInterval(check,4*3600*1000);}
// ---- the Mac: an unsigned app can't install its own update, so it only looks for one. It asks GitHub for the newest release a
// few seconds after it starts (and every four hours), and if that is a newer version it says so once, with a Download button
// that opens the right .dmg for this Mac (Apple silicon or Intel) in the browser. Dragging the new app into Applications
// replaces the old one; the saves are kept, because they are in ~/Library/Application Support/Hollow Acre, not in the app.
const LATEST_API='https://api.github.com/repos/RockerJaxrules/Hollow-acre/releases/latest';
const verNum=v=>String(v||'').replace(/^[^0-9]*/,'').split(/[.+-]/).slice(0,3).map(x=>parseInt(x,10)||0);
const newer=(a,b)=>{const x=verNum(a),y=verNum(b);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;};
function initMacCheck(){if(!app.isPackaged||process.platform!=='darwin'||process.env.HOLLOW_NO_UPDATES)return;let told=null;
  const check=async()=>{try{const r=await net.fetch(LATEST_API,{headers:{accept:'application/vnd.github+json','user-agent':'HollowAcre-desktop'}});
      if(!r.ok){log('update check: GitHub answered',r.status);return;}const j=await r.json();const v=String(j.tag_name||'').replace(/^desktop-v/,'');
      if(!newer(v,app.getVersion())){log('update check: up to date',app.getVersion(),'(newest',v+')');return;}
      if(told===v)return;told=v;
      // (an Intel copy running on Apple silicon through Rosetta is offered the Apple silicon one)
      const arch=process.arch==='arm64'||app.runningUnderARM64Translation?'arm64':'x64';
      const a=(j.assets||[]).find(x=>new RegExp('-mac-'+arch+'\\.dmg$').test(x.name||''));
      UPD.url=(a&&a.browser_download_url)||j.html_url||RELEASES;log('update check:',v,'is out; download',UPD.url);
      UPD.out={id:'upd',text:'A new version is ready',sub:`Hollow Acre ${v}. Download it, open it and drag it into Applications to replace this one. Your saves stay.`,
        btn:[['Download','page'],['Later','close']],ms:30000};notice(UPD.out);
    }catch(e){log('update check failed:',e&&e.message);}};
  setTimeout(check,+process.env.HOLLOW_UPDATE_DELAY||12000);setInterval(check,4*3600*1000);}
function restartToUpdate(){if(!UPD.au||!UPD.ready)return;const w=WIN;log('restarting to update');
  const go=()=>{if(w&&!w.isDestroyed()){saveWin(w);w._saved=true;}app.releaseSingleInstanceLock();UPD.au.quitAndInstall(true,true);};
  if(w&&!w.isDestroyed())autosave(w).finally(go);else go();}

// ---------------------------------------------------------------- security: the game's pages are the only thing the window shows.
// Links anywhere else open in the system browser; no new windows, no webviews; only the permissions the game uses.
const PERMS=new Set(['fullscreen','clipboard-sanitized-write','pointerLock','keyboardLock','persistent-storage']);
function openOutside(url){try{const u=new URL(url);if(u.protocol==='https:'||u.protocol==='http:')shell.openExternal(u.href);}catch(e){}}
app.on('web-contents-created',(ev,wc)=>{
  wc.on('will-navigate',(e,url)=>{if(trusted(url))return;e.preventDefault();log('blocked a page change to',url);openOutside(url);});
  wc.on('will-redirect',(e,url)=>{if(trusted(url)||!trusted(wc.getURL()||GAME_URL))return;e.preventDefault();log('blocked a redirect to',url);});
  wc.setWindowOpenHandler(({url})=>{openOutside(url);return {action:'deny'};});
  wc.on('will-attach-webview',e=>e.preventDefault());});

app.whenReady().then(async()=>{if(!PRIMARY)return;const ses=session.defaultSession;
  ses.setPermissionRequestHandler((wc,p,cb,d)=>cb(PERMS.has(p)&&trusted((d&&d.requestingUrl)||wc.getURL())));
  ses.setPermissionCheckHandler((wc,p,origin)=>{try{return PERMS.has(p)&&new URL(origin).origin===SITE;}catch(e){return false;}});
  DECK=deckWhy();log('Hollow Acre',app.getVersion(),process.platform,process.arch,'electron',process.versions.electron,DECK?'Steam Deck ('+DECK+')':'');
  await readOldSaves();create();initUpdater();initMacCheck();});
app.on('window-all-closed',()=>{if(WIN)app.quit();});   // (not the hidden window that reads the old saves)
