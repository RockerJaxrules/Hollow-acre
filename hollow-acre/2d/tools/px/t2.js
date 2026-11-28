///permission fs.write
const S=app.activeSprite,C=app.pixelColor;
app.command.NewLayer();
const L=S.layer(S.layerCount-1);L.name='shade';
let cel=L.cel(0)||L.createCel(0);
console.log('layers',S.layerCount,'cel',!!cel,cel.image&&cel.image.width);
cel.image.putPixel(3,3,C.rgba(0,0,255,255));
S.saveAs('/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/px/t2.ase',true);
S.saveAs('/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/px/t2.png',true);
console.log('ok');
