// Copies the game (../2d) into ./game so it ships inside the app. Run automatically before start and dist.
const fs=require('fs'),path=require('path');const src=path.join(__dirname,'..','2d'),dst=path.join(__dirname,'game');
fs.rmSync(dst,{recursive:true,force:true});fs.mkdirSync(dst,{recursive:true});
for(const f of ['index.html','CREDITS.txt'])fs.copyFileSync(path.join(src,f),path.join(dst,f));
fs.cpSync(path.join(src,'spr'),path.join(dst,'spr'),{recursive:true});fs.cpSync(path.join(src,'vendor'),path.join(dst,'vendor'),{recursive:true});
console.log('game copied into',dst);
