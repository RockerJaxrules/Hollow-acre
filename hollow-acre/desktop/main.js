// Desktop app for Hollow Acre (Electron). `npm start` runs it; `npm run dist` builds installers for this computer's OS.
// Saves live in the app's own storage (localStorage in the user-data folder) and survive updates.
// The Steamworks SDK (achievements, cloud saves, overlay, Steam networking) can be added later with steamworks.js.
const {app,BrowserWindow,Menu,ipcMain,screen}=require('electron');const path=require('path');const fs=require('fs');
app.setName('Hollow Acre');
// the window remembers its size, place and full screen between runs; the first run opens at most of your screen (not a fixed
// 1280x800, which was small on a big monitor). The game's Display setting can resize it or go full screen (#273).
const winFile=()=>path.join(app.getPath('userData'),'window.json');
function loadWin(){try{return JSON.parse(fs.readFileSync(winFile(),'utf8'));}catch(e){return null;}}
function saveWin(w){try{if(w.isDestroyed())return;const full=w.isFullScreen();const b=full?(w._lastBounds||w.getBounds()):w.getBounds();fs.writeFileSync(winFile(),JSON.stringify({bounds:b,full}));}catch(e){}}
function create(){const wa=screen.getPrimaryDisplay().workArea,saved=loadWin();
  let b={width:Math.round(wa.width*.86),height:Math.round(wa.height*.86)};b.x=wa.x+Math.round((wa.width-b.width)/2);b.y=wa.y+Math.round((wa.height-b.height)/2);
  if(saved&&saved.bounds){const d=screen.getDisplayMatching(saved.bounds).workArea;if(saved.bounds.width>=640&&saved.bounds.height>=400&&saved.bounds.x<d.x+d.width&&saved.bounds.y<d.y+d.height)b=saved.bounds;}
  const w=new BrowserWindow({...b,minWidth:960,minHeight:600,backgroundColor:'#07070a',autoHideMenuBar:true,title:'Hollow Acre',fullscreen:!!(saved&&saved.full),
    icon:path.join(__dirname,'build','icon.png'),webPreferences:{contextIsolation:true,backgroundThrottling:false,preload:path.join(__dirname,'preload.js')}});
  Menu.setApplicationMenu(null);
  w.loadFile(path.join(__dirname,'game','index.html'));
  w.webContents.on('before-input-event',(e,i)=>{if(i.key==='F11'&&i.type==='keyDown'){w.setFullScreen(!w.isFullScreen());e.preventDefault();}});
  let t=null;const later=()=>{if(!w.isFullScreen())w._lastBounds=w.getBounds();clearTimeout(t);t=setTimeout(()=>saveWin(w),600);};
  w.on('resize',later);w.on('move',later);w.on('enter-full-screen',later);w.on('leave-full-screen',later);
  // closing the window lets the game write its last autosave first
  w.on('close',e=>{saveWin(w);if(w._saved)return;e.preventDefault();w.webContents.executeJavaScript("try{dispatchEvent(new Event('pagehide'))}catch(e){}").catch(()=>{}).finally(()=>{w._saved=true;w.close();});});}
const winOf=e=>BrowserWindow.fromWebContents(e.sender);
ipcMain.handle('hd:info',e=>{const w=winOf(e);const d=w?screen.getDisplayMatching(w.getBounds()):screen.getPrimaryDisplay();const sf=d.scaleFactor||1;
  return {w:Math.round(d.size.width*sf),h:Math.round(d.size.height*sf),sf};});
ipcMain.handle('hd:setWindow',(e,pw,ph)=>{const w=winOf(e);if(!w)return false;if(w.isFullScreen())w.setFullScreen(false);
  const d=screen.getDisplayMatching(w.getBounds()),sf=d.scaleFactor||1,wa=d.workArea;
  // a window of that many physical pixels, kept inside the screen's work area (minus the taskbar)
  const cw=Math.min(Math.round(pw/sf),wa.width),ch=Math.min(Math.round(ph/sf),wa.height-32);
  w.setContentSize(Math.max(960,cw),Math.max(600,ch));const nb=w.getBounds();w.setPosition(wa.x+Math.max(0,Math.round((wa.width-nb.width)/2)),wa.y+Math.max(0,Math.round((wa.height-nb.height)/2)));return true;});
ipcMain.handle('hd:full',(e,on)=>{const w=winOf(e);if(w)w.setFullScreen(!!on);return true;});
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
