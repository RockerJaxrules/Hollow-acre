// Obfuscate the game's own JS: read stdin, minify+mangle, write stdout. (Trystero vendor is minified separately and kept.)
const terser=require('terser');
let src='';process.stdin.on('data',d=>src+=d);process.stdin.on('end',async()=>{
  try{const r=await terser.minify(src,{
    compress:{passes:2,drop_debugger:true},
    mangle:{toplevel:true},          // rename internal function/variable names (object keys like __game.S stay, so hooks keep working)
    format:{comments:false,ascii_only:true},
    sourceMap:false});
  if(r.error){process.stderr.write('ERR '+r.error);process.exit(1);}
  process.stdout.write(r.code);}catch(e){process.stderr.write('ERR '+e.message);process.exit(1);}});
