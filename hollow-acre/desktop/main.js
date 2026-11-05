// Desktop app for Hollow Acre (Electron). `npm start` runs it; `npm run dist` builds installers for this computer's OS.
// Saves live in the app's own storage (localStorage in the user-data folder) and survive updates.
// The Steamworks SDK (achievements, cloud saves, overlay, Steam networking) can be added later with steamworks.js.
const {app,BrowserWindow,Menu}=require('electron');const path=require('path');
app.setName('Hollow Acre');
function create(){const w=new BrowserWindow({width:1280,height:800,minWidth:960,minHeight:600,backgroundColor:'#07070a',autoHideMenuBar:true,title:'Hollow Acre',
  icon:path.join(__dirname,'build','icon.png'),webPreferences:{contextIsolation:true,backgroundThrottling:false}});
  Menu.setApplicationMenu(null);
  w.loadFile(path.join(__dirname,'game','index.html'));
  w.webContents.on('before-input-event',(e,i)=>{if(i.key==='F11'){w.setFullScreen(!w.isFullScreen());e.preventDefault();}});
  // closing the window lets the game write its last autosave first
  w.on('close',e=>{if(w._saved)return;e.preventDefault();w.webContents.executeJavaScript("try{dispatchEvent(new Event('pagehide'))}catch(e){}").catch(()=>{}).finally(()=>{w._saved=true;w.close();});});}
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
