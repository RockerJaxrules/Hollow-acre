// Copies the game (../2d) into ./game so it ships inside the app. Run automatically before start and dist.
// The app plays the live game from its website; this copy is only for a computer that has never been online.
// The art's old backups (spr/backup_*) aren't used by the game, so they're left out (about 110 MB smaller).
const fs=require('fs'),path=require('path');const src=path.join(__dirname,'..','2d'),dst=path.join(__dirname,'game');
fs.rmSync(dst,{recursive:true,force:true});fs.mkdirSync(dst,{recursive:true});
for(const f of ['index.html','sw.js','version.json','CREDITS.txt','manifest.webmanifest','icon-192.png','icon-512.png'])fs.copyFileSync(path.join(src,f),path.join(dst,f));
fs.cpSync(path.join(src,'spr'),path.join(dst,'spr'),{recursive:true,filter:s=>!/[\\/]spr[\\/]backup_[^\\/]*$/.test(s)});
fs.cpSync(path.join(src,'vendor'),path.join(dst,'vendor'),{recursive:true});
// the shipped page and its version file must name the same build, or the copy would ask for art under the wrong name
const id=JSON.parse(fs.readFileSync(path.join(dst,'version.json'),'utf8')).id,m=/BUILD_ID="(\d+)"/.exec(fs.readFileSync(path.join(dst,'index.html'),'utf8'));
if(!m||m[1]!==String(id))throw new Error(`version.json (${id}) and index.html (${m&&m[1]}) name different builds`);
console.log('game build',id,'copied into',dst);
