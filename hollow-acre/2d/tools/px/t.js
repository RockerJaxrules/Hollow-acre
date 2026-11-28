///permission fs.write
const img=app.activeImage;const C=app.pixelColor;
console.log('size',img.width,img.height,'layers',app.activeSprite.layerCount);
for(let y=0;y<32;y++)for(let x=0;x<32;x++)if((x-16)*(x-16)+(y-16)*(y-16)<100)img.putPixel(x,y,C.rgba(200,80,40,255));
app.activeSprite.saveAs('/tmp/claude-0/-home-user-Minecraftbot/f193b802-e794-5104-89ce-994e8f157fdf/scratchpad/px/t_out.png',true);
console.log('done');
