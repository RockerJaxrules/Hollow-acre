// Desktop shell for Hollow Acre (Electron). Copy ../2d into ./game before packaging:  cp -r ../2d game
// The Steamworks SDK (achievements, cloud saves, overlay) can be added later with steamworks.js.
const {app,BrowserWindow}=require('electron');const path=require('path');
function create(){const w=new BrowserWindow({width:1280,height:800,minWidth:960,minHeight:600,backgroundColor:'#07070a',autoHideMenuBar:true,title:'Hollow Acre',
  webPreferences:{contextIsolation:true,backgroundThrottling:false}});
  w.loadFile(path.join(__dirname,'game','index.html'));w.webContents.on('before-input-event',(e,i)=>{if(i.key==='F11'){w.setFullScreen(!w.isFullScreen());e.preventDefault();}});}
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
