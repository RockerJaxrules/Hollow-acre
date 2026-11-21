// Gives the game's Display setting (#273) a way to size the window and go full screen, and to read the real screen size.
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('hollowDesktop',{
  info:()=>ipcRenderer.invoke('hd:info'),                 // {w,h,sf}: the screen in physical pixels, and Windows/Mac scaling
  setWindow:(w,h)=>ipcRenderer.invoke('hd:setWindow',w,h), // a window of w x h physical pixels (kept inside the screen)
  setFullScreen:on=>ipcRenderer.invoke('hd:full',!!on)
});
