/* ================= #378 the wardrobe, part 1: the registry, the colours and the composer. Every choice about how you look lives in one
   registry: the hair, clothes, hats and the rest the generator drew (wardrobe_art378.js adds the new ones), the face and makeup that are
   painted on at runtime, and some forty colour slots, each one any colour at all. The composer builds your sheets from it: the walking
   sheet once, then only the four rows a tool swing changes. Every layer is recoloured by its own slots, ramp for ramp, with the darkest
   and lightest colours kept readable. An old look carries over unchanged, and a friend on an older build sees the nearest look they know. ================= */
const WD={reg:[],by:{},cats:{},art:0,face:null,sheets:new Map(),pend:null,busy:false,ver:0,stat:{ms:0,n:0}};
const WD_PAL={"cloth":"5e1a1e7a22289a2f2ab8402cc8513ea83a4ad86a5a6a2a3a8a3a1ab85a24d8803ac89a3ae0b45a8a5a2a6a42244a2e1ca89a3a7a7a3a5a6a3e4f7a3e3a5a322e4a3a6a8a5a8aa07a2a6a6a3a7a8a2a4a5a3e6a9a5a7ac83a4e7a2a3a5a1e2a444a3a6a6a4a8a7a4a8a8a6a9a5a2a5ac86a8ae0a0a8a85a7ae8e0d0d8ccb0c8b890a898788a8a906a6a724a4a502a2a2e1a16183a3a405a4a3e7a6a5ab8b0a0f0ece49aa0a8c8c0b8c82a2ae8c84a3a8a5a2a5aa88a2a6ae86a3a4ab0a8d8d060","leather":"1e1a182a22203a26184a30205a3a246a4a2a7a5a3a8a5a2aa06a3ab8823cc89a5ad8b07a6a2a227a2a228a3a2a5a2a2a3a3a404a4a506a6a728a8a90e0d8c8c8c0a8b8a8889a8a6a3a4a2e4a5a3a2e3a523a5a8a5a2a5a7a4a8ac83a3ae86a8ad8a0303a6a5a2a2a2e1412106a5a4a8a7a6aa89a805a4a3a4a3a307a6a50b85a244f7a3e2a4a5a9a2f24e8e4dcc8b090","hair":"0e0c0c14100e1e16122a1a143a24164a30205a3a246a42247a4a2a8a5a2a9a5a2aa06a34b8823cc89a5ad8b070d8c27ae8d8a0f0e8c88a2e1aa83a1ec85a24d87a3a6a2a1a5a2a1a9a9aa0b8b8bcd0ccc4e8e4dc6a6a6a4a4a4e8a7a6aa89a808a1a2ab82a3ad86a9ae8a0c05a2a5a7a3a9aa080c83a4a6a2a5a9a6aa0d02e6a4a3a8a6a2a7a8a8ac8b0c8d860e8803af0c0403a2a4a1a2a2ac8c8d8e86a4a6020304a2a3a7a5a4a","skin":"fbe4d4f6d8c0f2cfb0f0c8a8ecc09ce8b48ce4ac84e0a47cd8a078d49a70cc9068c98c62c08458b8784cb07048a86a449e623e94603a8a543480502e764a2c6c4428623e265e3a26523222462a1e3e261c34201af0d0b8e8c0a8d8a890c8a088b89070a8805c98785ae8c890d0a868d8d4c8c8ccc0b8c0b09aa890a8a0b08a8a98c0b8d0e8e0d87a8a7ab0b8c89a7a8a","eye":"2a1a123a24164a30205a3a246a4a2a7a5a308a6a3a7a7a3aa8782ac8902ad8b0403a6a3a2e5a3a4a7a4a5a8a5a3a7a6a3a5a7a2a4a6a4a6a9a5a8ab87aa0c82a3a5a6a6a728a8a92a0a4ac4a4a522a7a8a3a8a9a6a3a7a8a5aa81a14180e0c10a82a2ad84a3ae0d8c8c8d0406ad0c09a2a6ad8e0e8b86a2a","metal":"c8a040e0b84ab8902ad8907ac87a68b89a4aa88a3a9a6a3a8a5a2ab86a3ac87a4ac0c4c8a8acb4d8dce08a90986a70787a7a804a4e563a3e462a2a2e1e1e225a9a8a4a8a7ae0dcd0d0d4d86a6a72a080389a9ca08a7a40a8503a3a4a6ae8c870f0d890b0b8c0707880584838c0a878d8c8a89080605a5e66","gem":"b81a2a7a1a24d84a6ae88aa88a4ab85a2a6a2a4ab81a2a6a6ac0d02a8a8a1a8a4a4a9a6a9ac84ae8c03ae8902ac8701ae0e8f0c8d0e0f0ece01a1a1e0e0c106a5a4aa8701ac8481a2a3a9a3ab0b02a6a4a3a4a3ae8b0b85a4ab8c82a5a4a7a6ae86a5a2a222af0f4f82a2a4ae87a4a4a5aa8e8b0988a1a4a","lens":"8a8a906a6a724a4a522a2a308a6a4a6a4a2aa88050c8902ae0b040d88a9ac86a7aa84a5aa82a2ac84a3a4a7a4a6a9a6a2a5a3a4a6a9a6a8ab82a4a7a8ab0d07a5a9a5a3a7ad8c84a3a8a8a6ab0b0b8c0c8d0d8e0d8b860a8bcc81a1a1e5a6a5a9a7a5ab89ab8e0a0607a8a9a3a3a5a8a3a5aa0a890c0b0a0","lip":"c8887ab87a6aa86a5ad89a8ae0a8989a5a4a8a4a3ad86a8ae88aa8c84a6ae0607af0a0b0b85a7ab81a2ac82a2a9a1a22d83a3aa8202ae04a3a8a1a3a7a1a2a6a1a3a9a2a5aa83a6a5a1a3a4a1a2a6a2a4a7a3a5a6a3a2a5a2a1a8a4a2a7a4a3a2a14181a0e103a1a2ae86a5af08060d8603a6a2a7a8a4a9a2a3a7a3a5a9a2a5a3a4a7a4a6a6a72e0d8ccc8a040b8687a","liner":"1a12140e0a0c2a22243a24165a3a246a4a2a1e2a4a2a3a6a3a5a9a2a6a6a2a4a2a3a6a3a1a6a4a4a1a3a5a2a6a7a4a9a6a1a2a9a1a22c82a2aa8582ac8a0408a6a3ab8bcc4e8e4dc6a6a723a3a405a5a2a5a1a24141a2a8a3a1a4a4a52d8d0bc2a1a2a4a2a1a6a7a8a3a2a4ac86a8ad8b0604a6a5a7a2a3a","shadow":"8a7a6aa890806a5a4ac8a890e0c8b05a4a3e7a5a3a8a5a2aa06a3a6a42244a3020c8a040d8b060b88a3aa8603ac87a4a9a5a2ac87a8ad89aa8a85a6ae0a0a87a3a5a5a2a4a8a4a7a6a2a5a6a4a8a8a6aa84a2a6aa08ac03a4a7a4a6a9a6a8ab82a3a5a2a6a6a3a8a8a3a5a3a5a7a4a6a8a5a2a4a3a3a3a402a2a2e5a5a621e1a1e8a2a2aa83a3a6a1a22a88a3a8a9a7a","blush":"d86a6ae07a7ae88a8af09a9ac85a5ab84a4ad87a8ae890a0c86a7ab85a6ae08a6ae89a7ad8805ac8704af0a890e8b0a0a84a5a984050c87a9ad890b0b86a8a9a5a7ae86a5af07a6ad8a0a0c89090b87a7aa86a6a8a4a4a7a3a3ae0c0b0f0d0c0c86048a85040d07858e8a088b06070905060cc8888dc9c8c","paint":"f0ece4e0d8c4d8d4cca8a8a87a7a803a3a401a16180e0c0e8a1a1ab81a1a5a1a148a3a1aa84a2ab8683ac8902ad8b0405a4a326a4a2a3a2a1a4a5a2a8a9a5a8ab05a3a5a3a2a4a7a2a2a5a4a3a6a6a3a8a6a7a9ac8d8e02a6a6a4a9a8ad8701ae0b040e8d060d8c890c8b0703a1e14e85a2ac84a3a5a1a2a4a1a3ae08aa0c8202ac8a040b8bcc4f8f8f0d8d0a0b8c8c8","tattoo":"1a1a1e2a2a301e2a44222a3a2a3a323a4a6a5a5a628a1a1ab82a2a5a1a224a30206a4a2a2a5a3a2a5a5a4a2a5a6a3a7ae8e4dcc8c0b0c8a030c86a2a2a4a8a4a7ab0c86a8aa8803ae0c8b88a3a1a5a20107a7a804a3a5a3a3a404a4a2a7a3a1a1414183a2a3a2a1a145a6a7a6a2a2a3a5a4a8a8a90d8d8d0"};
const WD_ANC={"":["GN2WGN2WGO2XGN2WGM2VGN2WGO2XGN2WGM2V","GN0WGN0WGO0XGN0WGM0VGN0WGO0XGN0WGM0V","GN0WGN0WGO0XGN0WGM0VGN0WGO0XGN0WGM0V","GN0WGN0WGO0XGN0WGM0VGN0WGO0XGN0WGM0V","GO2WGO2WGP2XGP2XGO2WGO2WGP2XGP2XGO2W","CN0WCN0WCO0XCO0XCN0WCN0WCO0XCO0XCN0W","GO0WGO0WGP0XGP0XGO0WGO0WGP0XGP0XGO0W","KN0WKN0WKO0XKO0XKN0WKN0WKO0XKO0XKN0W","GN2WGO2XGO2XGN3W","GN0WGO0XGO0XGN1W","GN0WGO0XGO0XGN1W","GN0WGO0XGO0XGN1W","GN2WGN2WGN2WGN2WGN2WGN2WGN2WGN2W","GN0WGN0WGN0WGN0WGN0WGN0WGN0WGN0W","GN0WGN0WGN0WGN0WGN0WGN0WGN0WGN0W","GN0WGN0WGN0WGN0WGN0WGN0WGN0WGN0W","GN2WGR2ZGU2]GU2]GQ2ZGN2W","GN0WDR0ZBT0\\BT0\\DQ0ZGN0W","GN0WGR0ZGU0]GU0]GQ0ZGN0W","GN0WJR0ZLT0\\LT0\\JQ0ZGN0W","GK0UGJ0TGN1WGR1ZGO0XGN0W","GN2WGN2WGN2WGN2WGN2WGN2WGN2W","GN0WGN0WGN4WGN4WGN4WGN4WGN4W","GN0WGN0WGN0WGN0WGN0WGN0WGN0W","GN0WGN0WGN4WGN4WGN4WGN4WGN4W","GO2XGP2YGP2YGO3X","GP0YGQ0ZGQ0ZGP1Y","GO0XGP0YGP0YGO1X","GP0YGQ0ZGQ0ZGP1Y"],"_hoe":["GN2WGM2VGL2UGM2VGP2YGR2[GR2[GO2X","GN0WIM0VJL0UJM0VFP0YDR0[DR0[FO0X","GN0WGM0VGL0UGM0VGP0YGR0[GR0[GO0X","GN0WEM0VDL0UDM0VHP0YJR0[JR0[HO0X"],"_can":["GN2WGN2WGN2WGO2XGO2XGO2XGO2XGN2W","GN0WGN0WGN0WFO0XFO0XFO0XFO0XGN0W","GN0WGN0WGN0WGO0XGO0XGO0XGO0XGN0W","GN0WGN0WGN0WHO0XHO0XHO0XHO0XGN0W"],"_pick":["GN2WGM2VGK2TGK2TGP2YGS2\\GQ2ZGO2X","GN0WIM0VJK0TKK0TFP0YCS0\\DQ0ZFO0X","GN0WGM0VGK0TGK0TGP0YGS0\\GQ0ZGO0X","GN0WEM0VDK0TCK0THP0YKS0\\JQ0ZHO0X"],"_axe":["GN2WGM2VGM2VGM2VGO2XGP2YGP2YGO2X","GN0WHM0VJM0VJM0VFO0XDP0YDP0YFO0X","GN0WGM0VGM0VGM0VGO0XGP0YGP0YGO0X","GN0WFM0VDM0VDM0VHO0XJP0YJP0YHO0X"],"_rod":["GN2WGM2VGL2UGM2VGP2YGR2[GR2[GO2X","GN0WIM0VJL0UJM0VFP0YDR0[DR0[FO0X","GN0WGM0VGL0UGM0VGP0YGR0[GR0[GO0X","GN0WEM0VDL0UDM0VHP0YJR0[JR0[HO0X"]};
// ---- the colour slots: key, label, group, palette, the colour new art falls back to, and the slot it follows while unset
const WD_KEYS=[
  ['skin','Skin','face','skin','#e8b48c'],['eye','Eyes','face','eye','#3a5a7a'],['eye2','Second eye','face','eye',null,'eye'],['brow','Eyebrows','face','hair',null,'hair'],
  ['hair','Hair','hair','hair','#6a4224'],['hair2','Second colour','hair','hair','#c89a5a'],['beard','Facial hair','hair','hair',null,'hair'],
  ['top','Top','top','cloth','#b8402c'],['top2','Collar & trim','top','cloth','#e8e0d0'],['toppat','Pattern','top','cloth',null],
  ['bottom','Bottoms','bottom','cloth','#3a4e7a'],['bottom2','Belt & trim','bottom','leather','#3e281a'],['botpat','Pattern','bottom','cloth',null],
  ['outer','Outerwear','outer','cloth','#6a7a3a'],['outer2','Lining & trim','outer','cloth','#c8b890'],['outpat','Pattern','outer','cloth',null],
  ['shoes','Shoes','shoes','leather','#3a2618'],['shoes2','Soles & laces','shoes','cloth','#d8ccb0'],['socks','Socks','shoes','cloth','#e8e0d0'],
  ['hat','Hat','hat','cloth','#8a5a2a'],['hat2','Band & ribbon','hat','cloth','#2a1c14'],
  ['frame','Frames','eyewear','metal','#403a46'],['lens','Lens tint','eyewear','lens',null],
  ['metal','Metal','jewel','metal','#c8a040'],['gem','Stones','jewel','gem','#c83a4a'],['ear','Earrings','jewel','metal','#c8a040'],
  ['neck','Neckwear','acc','cloth','#c83a5a'],['neck2','Neckwear trim','acc','cloth','#e8e0d0'],
  ['headacc','Head piece','acc','cloth','#c83a5a'],['headacc2','Head piece trim','acc','cloth','#e8e0d0'],
  ['waist','Belt','acc','leather','#4a3020'],['waist2','Belt trim','acc','leather','#c8a040'],
  ['back','Bag','acc','leather','#6a4a2a'],['back2','Bag trim','acc','leather','#3a2618'],
  ['wrist','Watch & bracelet','acc','leather','#3a2618'],['hand','Gloves','acc','leather','#4a3a2e'],
  ['lip','Lipstick','makeup','lip','#9a2a3a'],['liner','Eyeliner','makeup','liner','#1a1214'],['shadow','Eyeshadow','makeup','shadow','#7a3a5a'],
  ['blush','Blush','makeup','blush','#d86a6a'],['paint','Face paint','makeup','paint','#e0d8c4'],['paint2','Paint accent','makeup','paint','#1a1618'],
  ['tattoo','Tattoo ink','makeup','tattoo','#222a3a'],['mark','Freckles & marks','face','skin',null,'skin'],['pierce','Piercings','face','metal',null,'metal']];
const WD_K={};WD_KEYS.forEach(([k,label,grp,pal,def,fol],i)=>WD_K[k]={k,label,grp,pal,def,fol,i});
// the bases the art is drawn in (agreed with the art: every ramp colour and outline is unique among them)
const WD_BASE={skin:'#e8b48c',hair:'#6a4224',eye:'#3a5a7a',pants:'#3a4e7a',shoes:'#3a2618',extra:'#6a7a3a',hatColor:'#8a5a2a',acc:'#c83a5a',
  top2:'#5aa08a',outer2:'#b8a02c',shoes2:'#4ab8b8',hat2:'#b84a8a',acc2:'#4a6ab8',metal:'#b89a4a',lens:'#6a8a9a',bottom2:'#9579bd',
  hand:'#e6b68e',wrist:'#e7b58a',brow:'#66472a',gem:'#34a5c2',frame:'#535163',ankle:'#e9b28e',shin:'#e8b189',knee:'#eab090'};
// the shirt's pattern phases: the 8 bases the generator gives every top pixel (row%4, column%4===1); a pattern is a shade shift per phase
const WD_PAT={'':[0,0,0,0,0,0,0,0]};
{const mk=(id,f)=>{const a=[];for(let c=0;c<8;c++)a.push(f(c>>1,c&1));WD_PAT[id]=a;};
  mk('plaid',(j,v)=>v+(j===2?1:0));mk('stripes',(j,v)=>j<2?1:0);mk('dots',(j,v)=>(v&&j===1)?-1:0);
  mk('pinstripe',(j,v)=>v);mk('thinstripe',(j,v)=>j===0?1:0);mk('check',(j,v)=>(j<2)!==!!v?1:0);mk('grid',(j,v)=>(v||j===0)?1:0);
  mk('ticking',(j,v)=>v?1:(j===2?-1:0));mk('dashes',(j,v)=>(v&&j<2)?1:0);mk('fine',(j,v)=>j%2===0?1:0);mk('spots',(j,v)=>(v&&j===1)?1:0);
  mk('tartan',(j,v)=>v*2+(j===2?1:0));mk('bars',(j,v)=>(j===1||j===2)?1:0);mk('rows',(j,v)=>j===3?-1:(j===1?1:0));}
const WD_PAT_LABEL={'':'Plain',plaid:'Plaid',stripes:'Stripes',dots:'Dots',pinstripe:'Pinstripe',thinstripe:'Thin stripes',check:'Check',grid:'Windowpane',ticking:'Ticking',
  dashes:'Dashes',fine:'Fine lines',spots:'Dark spots',tartan:'Tartan',bars:'Bands',rows:'Ribbed'};
// ---- the registry. Positions are what you wear at once (one item each); an accessory's position is its depth
const WD_POS=['hair','dye','beard','top','bottom','outer','shoes','socks','hat','glasses','neck','ear','headacc','waist','back','wrist','hand',
  'brows','eyes','lips','liner','shadow','blush','freckles','mole','scar','paint','tattoo','pnose','pbrow','plip'];
const WD_ACC=['neck','ear','headacc','waist','back','wrist','hand'];
// the drawing order, low to high (agreed with the art); the face is painted straight onto the base
const WD_Z={_u:0,base:10,legacy:10,socks:18,shoes:20,bottom:30,top:40,waist:45,outer:50,back:55,wrist:55,hand:56,beard:60,hair:65,neck:70,ear:70,glasses:75,hat:80,headacc:85,toolf:99};
const WD_REQ={top:1,bottom:1};
const wdPos=e=>e.cat==='acc'?(e.depth||'neck'):e.cat;
function wdAdd(list){for(const r of [].concat(list||[])){if(!r||!r.id||!r.cat)continue;const e=Object.assign({slots:[],tags:[],flags:[]},r);
    e.id=String(e.id).toLowerCase().replace(/[^a-z0-9_]/g,'');e.pos=wdPos(e);if(!WD_POS.includes(e.pos)&&e.pos!=='base')continue;
    if(e.layer===undefined)e.layer=e.v==='none'?null:e.cat==='base'?'pl_base':'pl_'+e.cat+'_'+e.id;if(!e.v)e.v=/^(hair|beard|hat|glasses|acc)$/.test(e.cat)&&!/^(waist|back|wrist|hand)$/.test(e.pos)?'head':'body';
    if(e.z===undefined)e.z=WD_Z[e.pos]!=null?WD_Z[e.pos]:60;e.label=String(e.label||e.id).slice(0,16);
    const k=e.pos+':'+e.id,old=WD.by[k],C=WD.cats[e.pos]||(WD.cats[e.pos]=[]);if(old){WD.reg[WD.reg.indexOf(old)]=e;C[C.indexOf(old)]=e;}else{WD.reg.push(e);C.push(e);}WD.by[k]=e;}
  WD.ver++;}
const wdItem=(pos,id)=>id?WD.by[pos+':'+id]||null:null;
// the legacy items: the shapes the old creator offered, drawn with fixed base colours
{const T={short:['short'],crop:['short'],sidepart:['short'],bangs:['short'],shaggy:['short'],spiky:['short'],buzz:['short'],mohawk:['short'],topknot:['updo'],curly:['curly','short'],
    afro:['curly'],wavy:['long'],bob:['medium'],long:['long'],ponytail:['long','updo'],pigtails:['long','updo'],bun:['updo'],spacebuns:['updo'],braids:['long'],pixie:['short'],
    mullet:['medium'],lob:['medium'],swoop:['long'],slick:['short'],curlylong:['long','curly'],halfup:['long']};
  const L=[];
  for(const [id,label] of LOOK_OPTS.style)L.push(id==='bald'?{cat:'hair',id,label,v:'none',layer:null,tags:['short'],legacy:{style:id}}:{cat:'hair',id,label,v:'head',slots:['hair','hair2'],tags:T[id]||[],legacy:{style:id}});
  for(const [id,label] of LOOK_OPTS.beard)if(id)L.push({cat:'beard',id,label,v:'head',slots:['beard'],legacy:{beard:id}});
  const EX={jacket:1,cardigan:1,longcoat:1,openshirt:1,vest:1},NOPANT={dress:1};
  for(const [id,label] of LOOK_OPTS.outfit)L.push({cat:'top',id,label,v:'body',layer:'pl_body_'+id,z:10,flags:['legacyBody','onepiece'],
    slots:['top','toppat'].concat(EX[id]?['outer']:[],NOPANT[id]?[]:['bottom'],['shoes'],/^(tee|shirt|openshirt|overalls|vest)$/.test(id)?['metal']:[],/^(tee|shirt|openshirt)$/.test(id)?['bottom2']:[],/^(shirt|vest|hoodie|cardigan)$/.test(id)?['top2']:[]),
    tags:/^(dress|skirt)$/.test(id)?['skirt']:[],legacy:{outfit:id}});
  for(const [id,label] of LOOK_OPTS.hat)if(id)L.push({cat:'hat',id,label,v:'head',slots:id==='straw'?['hat','hat2']:/^(top|witch)$/.test(id)?['hat','hat2']:id==='cowboy'?['hat','hat2']:['hat'],flags:['hatTop'],legacy:{hat:id},
    def:id==='top'?{hat:'#1c1a20',hat2:'#781e1e'}:id==='witch'?{hat:'#2a2236',hat2:'#602e78'}:id==='straw'?{hat:'#e8cc76'}:null});
  for(const [id,label] of LOOK_OPTS.glasses)if(id)L.push({cat:'glasses',id,label,v:'head',slots:id==='monocle'?['metal','lens']:['frame','lens'],legacy:{glasses:id}});
  const DEP={bow:'headacc',flower:'headacc',headband:'headacc',scarf:'neck',bandana:'neck',necklace:'neck',choker:'neck',earrings:'ear'};
  for(const [id,label] of LOOK_OPTS.accessory)if(id)L.push({cat:'acc',id,label,depth:DEP[id],v:'head',z:70,layer:'pl_acc_'+id,slots:id==='earrings'?['ear']:id==='necklace'?[DEP[id],'gem']:[DEP[id]],
    tags:id==='necklace'||id==='earrings'||id==='choker'?['jewel']:[],legacy:{accessory:id}});
  wdAdd(L);}
// colours the old art drew as fixed values: [slot, the natural colour (unchanged while the slot is that colour or unset), [[rgb, ramp step], ...]]
const WD_FIX={
  body:[['bottom2','#3e281a',[[[40,26,16],1],[[62,40,26],3],[[96,64,38],4]]],['metal','#debe60',[[[222,190,96],3]]],['top2','#eeeae2',[[[238,234,226],3],[[214,208,198],2]],'collar']],
  glasses:[['frame','#403a46',[[[64,58,70],3],[[40,34,44],1]]],['lens','#c4d4e0',[[[196,212,224],4]]]],
  shades:[['frame','#221e26',[[[34,30,38],3]]],['lens','#141016',[[[20,16,22],3],[[90,90,100],4]]]],
  monocle:[['metal','#d6b052',[[[214,176,82],3],[[150,118,52],1]]],['lens','#c8d6e2',[[[200,214,226],4]]]],
  cowboy:[['hat2','#281c14',[[[40,28,20],3]]]],
  top:[['hat','#1c1a20','ramp'],['hat2','#781e1e',[[[120,30,30],3],[[80,20,20],1]]]],
  witch:[['hat','#2a2236','ramp'],['hat2','#602e78',[[[96,46,120],3],[[60,26,76],1]]],['metal','#e6be46',[[[230,190,70],3]]]],
  straw:[['hat','#e8cc76',[[[110,80,30],0],[[160,124,52],1],[[204,168,82],2],[[232,204,118],3],[[248,230,160],4]]]],
  earrings:[['ear','#e6be46',[[[230,190,70],3],[[255,236,150],4]]]],
  necklace:[['gem','#ffffff',[[[255,255,255],4]]]]};
const wdFixFor=e=>!e?null:(e.flags.includes('legacyBody')||/^(top|bottom|outer)$/.test(e.cat))?WD_FIX.body:e.cat==='glasses'?(e.id==='shades'?WD_FIX.shades:e.id==='monocle'?WD_FIX.monocle:WD_FIX.glasses):
  e.cat==='hat'?WD_FIX[e.id]||null:e.cat==='acc'?WD_FIX[e.id]||null:null;
// the dye modes for a second hair colour, and the 0-byte recolours (gloves on the hands, socks on the legs)
wdAdd([{cat:'dye',id:'tips',label:'Tips',v:'none',layer:null,slots:['hair2']},{cat:'dye',id:'ombre',label:'Ombré',v:'none',layer:null,slots:['hair2']},
  {cat:'dye',id:'roots',label:'Dark roots',v:'none',layer:null,slots:['hair2']},{cat:'dye',id:'streak',label:'Streak',v:'none',layer:null,slots:['hair2']},
  {cat:'dye',id:'highlights',label:'Highlights',v:'none',layer:null,slots:['hair2']},{cat:'dye',id:'under',label:'Underlayer',v:'none',layer:null,slots:['hair2']},
  {cat:'dye',id:'split',label:'Split dye',v:'none',layer:null,slots:['hair2']},{cat:'dye',id:'fringe',label:'Coloured fringe',v:'none',layer:null,slots:['hair2']},
  {cat:'socks',id:'ankle',label:'Ankle socks',v:'none',layer:null,slots:['socks'],flags:['bands1']},{cat:'socks',id:'crew',label:'Crew socks',v:'none',layer:null,slots:['socks'],flags:['bands2']},
  {cat:'socks',id:'knee',label:'Knee socks',v:'none',layer:null,slots:['socks'],flags:['bands3']},
  {cat:'acc',depth:'hand',id:'gloves',label:'Gloves',v:'none',layer:null,slots:['hand'],flags:['recolourHand'],tags:['gloves']},
  {cat:'acc',depth:'wrist',id:'cuff',label:'Wrist cuff',v:'none',layer:null,slots:['wrist'],flags:['recolourWrist'],tags:['jewel']}]);
// the art's own entries (wardrobe_art378.js), whenever they load
function wdArt(){const A=window.WARDROBE_ART;if(!Array.isArray(A)||A.length===WD.art)return;WD.art=A.length;
  // the art names the bases it is drawn in; the wardrobe shows them as the colours they become where the item is worn
  const key=(r,s)=>{const dep=r.cat==='acc'?(r.depth||'neck'):null;if(s==='pants')return 'bottom';if(s==='extra')return 'outer';if(s==='hatColor')return 'hat';if(s==='shirt')return 'top';
    if(s==='hair'&&r.cat==='beard')return 'beard';if(s==='acc')return dep||(/^(hair|beard)$/.test(r.cat)?'headacc':r.cat==='hat'?'hat2':'neck');if(s==='acc2')return dep?(dep==='ear'?'gem':dep+'2'):'neck2';
    if(s==='hand'||s==='wrist'||s==='ankle'||s==='shin'||s==='knee')return 'skin';return s;};
  wdAdd(A.map(r=>Object.assign({},r,{flags:[].concat(r.flags||[]),tags:[].concat(r.tags||[]),slots:[...new Set([].concat(r.slots||[]).map(s=>key(r,s)))],
    def:r.def&&typeof r.def==='object'?Object.fromEntries(Object.entries(r.def).map(([k,v])=>[key(r,k),v])):r.def})));}
wdArt();
// pattern tiles for the new garments (16x16; '.' the garment, '+' a step lighter, '-' a step darker, '2' the pattern colour, '3' it a step darker)
const WD_TILE={};
function wdTiles(){const T=window.WARDROBE_PAT;if(!Array.isArray(T))return;for(const t of T){if(!t||!t.id||!Array.isArray(t.rows)||t.rows.length!==16||t.rows.some(r=>typeof r!=='string'||r.length!==16))continue;WD_TILE[String(t.id)]={label:String(t.label||t.id).slice(0,16),rows:t.rows};}}
// the old patterns as tiles too, so the new tops (drawn in one plain ramp) can wear them: a phase that went a step darker is the pattern colour
for(const id in WD_PAT){if(!id)continue;const P=WD_PAT[id],rows=[];for(let y=0;y<16;y++){let r='';for(let x=0;x<16;x++){const sft=P[(y%4)*2+(x%4===1?1:0)];r+=sft===0?'.':sft===1?'2':sft>=2?'3':'+';}rows.push(r);}WD_TILE[id]={label:WD_PAT_LABEL[id]||id,rows};}
wdTiles();
// ---- the look you wear. S.look keeps the old keys (older builds and other code read them); S.look.w holds every choice:
// it: one item per position, pat: a pattern per garment, c: the colours you have set (a slot left unset follows another or keeps the art's own colour)
const WD_HEX=/^#[0-9a-f]{6}$/i;
const wdBlank=()=>({v:1,it:{},pat:{},c:{}});
function wdCol(w,k,d){const v=w&&w.c&&w.c[k];if(typeof v==='string'&&WD_HEX.test(v))return v.toLowerCase();const K=WD_K[k];if(K&&K.fol&&(d||0)<4)return wdCol(w,K.fol,(d||0)+1);return null;}
const wdColD=(w,k)=>wdCol(w,k)||(WD_K[k]&&WD_K[k].def)||'#888888';
// an old look (the old keys only) becomes the new state, so it draws exactly as before
function wdMigrate(L){const w=wdBlank(),it=w.it,c=w.c;L=L||{};const hx=v=>typeof v==='string'&&WD_HEX.test(v)?v.toLowerCase():null;
  it.hair=L.style||'short';if(L.beard)it.beard=L.beard;it.top=L.outfit==='flannel'?'shirt':(L.outfit||'shirt');if(L.hat)it.hat=L.hat;
  if(L.glasses)it.glasses=L.glasses===true?'round':L.glasses;
  if(L.accessory){const e=WD_ACC.map(p=>wdItem(p,L.accessory)).find(Boolean);if(e)it[e.pos]=e.id;}
  w.pat.top=L.outfit==='flannel'?'plaid':(L.pattern||'');
  for(const [k,o] of [['skin','skin'],['hair','hair'],['eye','eye'],['top','shirt'],['bottom','pants'],['shoes','shoes'],['outer','extra'],['hat','hatColor']])c[k]=hx(L[o])||LOOK_BASE[o];
  // one accessory colour used to colour every accessory (and the hair ties): it still does
  const a=hx(L.acc)||LOOK_BASE.acc;for(const p of ['neck','headacc'])c[p]=a;
  // hats whose colours were fixed in the old art keep them
  if(it.hat==='straw'){c.hat2=c.hat;c.hat='#e8cc76';}else if(it.hat==='top')c.hat='#1c1a20';else if(it.hat==='witch')c.hat='#2a2236';
  return w;}
// a look that comes in (a save, a friend, a preset) is tidied: only known kinds of values, unknown ids kept (a newer build may know them)
function wdClean(w){const o=wdBlank();if(!w||typeof w!=='object')return o;const id=v=>typeof v==='string'&&/^[a-z0-9_]{0,24}$/.test(v)?v:'';
  for(const p of WD_POS){const v=id(w.it&&w.it[p]);if(v)o.it[p]=v;}for(const g of ['top','bottom','outer']){const v=w.pat&&w.pat[g];if(typeof v==='string'&&/^[a-z0-9_]{1,24}$/.test(v))o.pat[g]=v;}
  for(const k in WD_K){const v=w.c&&w.c[k];if(typeof v==='string'&&WD_HEX.test(v))o.c[k]=v.toLowerCase();}
  if(!o.it.hair)o.it.hair='short';if(!o.it.top)o.it.top='shirt';return o;}
// what an item resolves to right now (an id this build doesn't have counts as nothing; a required one falls back)
function wdGet(w,pos){const e=wdItem(pos,w.it[pos]);if(e)return e;if(pos==='top')return wdItem('top','shirt');if(pos==='hair')return wdItem('hair','short');return null;}
const wdLegacyBody=w=>{const t=wdGet(w,'top');return !!(t&&t.flags.includes('legacyBody'));};
// the old keys, worked out from the new state: the nearest old shape and the colours an older build understands
function wdLegacy(w){const o={},leg=(pos,k,d)=>{const e=wdGet(w,pos);const v=e&&e.legacy&&e.legacy[k];return v!=null?v:d;};
  o.style=leg('hair','style','short');o.beard=leg('beard','beard','');
  const ou=wdGet(w,'outer'),ol=ou&&ou.legacy&&ou.legacy.outfit;o.outfit=/^(jacket|cardigan|longcoat|vest|overalls|openshirt)$/.test(ol||'')?ol:leg('top','outfit','shirt');
  const pt=w.pat.top||'';o.pattern=/^(plaid|stripes|dots)$/.test(pt)?pt:'';o.hat=leg('hat','hat','');o.glasses=leg('glasses','glasses','');
  let accPos='';o.accessory='';for(const p of ['headacc','neck','ear']){const e=wdGet(w,p),v=e&&e.legacy&&e.legacy.accessory;if(v){o.accessory=v;accPos=p;break;}}
  for(const [k,n] of [['skin','skin'],['hair','hair'],['eye','eye'],['shirt','top'],['pants','bottom'],['shoes','shoes'],['extra','outer']])o[k]=wdColD(w,n);
  o.hatColor=o.hat==='straw'?(wdCol(w,'hat2')||LOOK_BASE.hatColor):wdColD(w,'hat');o.acc=wdCol(w,accPos||'neck')||LOOK_BASE.acc;
  for(const k of ['skin','hair','eye','shirt','pants','shoes','extra','hatColor','acc'])if(!WD_HEX.test(o[k]||''))o[k]=LOOK_BASE[k];return o;}
// once the body is split into a base and garments, an old one-piece outfit becomes its parts (the art's map: outfit -> top, bottom, outer, shoes)
function wdSplit(w){const MP=window.WARDROBE_OUTFIT_MAP||{};let t=wdItem('top',w.it.top);
  // an old outfit whose one-piece sheet has gone becomes its parts
  if(t&&t.flags.includes('legacyBody')&&(!SPR[t.layer]||(WD.cats.base||[]).length)){const m=MP[t.id];if(!m)return w;const c=w.c,old=t.id;
    for(const p of ['top','bottom','outer','shoes'])if(m[p])w.it[p]=m[p];else if(p!=='top')delete w.it[p];
    // where a colour lived in the old one-piece and where it lives now: the open shirt is now the outerwear over a tee, the overalls' bib and legs are outerwear
    if(old==='openshirt'){const a=c.top,b=c.outer;if(a)c.outer=a;if(b)c.top=b;if(w.pat.top){w.pat.outer=w.pat.top;delete w.pat.top;}}
    else if(old==='overalls'){if(c.bottom)c.outer=c.bottom;}
    t=wdItem('top',w.it.top);}
  if(!t||t.flags.includes('legacyBody'))return w;const m=MP[w.it.top];
  if(m&&!w.it.bottom&&!t.flags.includes('onepiece')){for(const p of ['top','bottom','outer','shoes'])if(m[p]!==undefined&&(p==='top'||!w.it[p])){if(m[p])w.it[p]=m[p];else delete w.it[p];}}
  if(!w.it.bottom&&!t.flags.includes('onepiece')){const b=(WD.cats.bottom||[]).find(e=>!e.flags.includes('legacyBody'));if(b)w.it.bottom=b.id;}
  if(!w.it.shoes){const sh=(WD.cats.shoes||[]).find(e=>!e.flags.includes('legacyBody'));if(sh)w.it.shoes=sh.id;}return w;}
function wdSync(){const L=S.look;if(!L.w)L.w=wdMigrate(L);wdSplit(L.w);Object.assign(L,wdLegacy(L.w));}
function wdSave(){wdSync();try{localStorage.setItem('hollowLook'+ACCT_SUFFIX,JSON.stringify(S.look));}catch(e){}}
// the compact form a friend's game is sent: "1|items|colours|patterns", only what's set. The codes never change once given (new ones go at the end)
const WD_IC={hair:'h',dye:'d',beard:'b',top:'t',bottom:'o',outer:'u',shoes:'s',socks:'x',hat:'a',glasses:'g',neck:'n',ear:'e',headacc:'c',waist:'w',back:'k',wrist:'r',hand:'p',
  brows:'B',eyes:'E',lips:'L',liner:'I',shadow:'S',blush:'U',freckles:'F',mole:'M',scar:'C',paint:'P',tattoo:'T',pnose:'N',pbrow:'R',plip:'Q'};
const WD_IR={};for(const k in WD_IC)WD_IR[WD_IC[k]]=k;
const WD_AL='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
function wdEnc(w){const it=[],cs=[],ps=[];for(const p of WD_POS){const v=w.it[p];if(v&&WD_IC[p])it.push(WD_IC[p]+v);}
  for(const K of WD_KEYS){const v=w.c[K[0]];if(typeof v==='string'&&WD_HEX.test(v))cs.push(WD_AL[WD_K[K[0]].i]+v.slice(1).toLowerCase());}
  for(const g of ['top','bottom','outer'])if(w.pat[g])ps.push(g[0]+w.pat[g]);return '1|'+it.join(',')+'|'+cs.join('')+'|'+ps.join(',');}
function wdDec(s){if(typeof s!=='string'||s.length>2400)return null;const P=s.split('|');if(P[0]!=='1')return null;const w=wdBlank();
  for(const t of (P[1]||'').split(','))if(t.length>1&&WD_IR[t[0]])w.it[WD_IR[t[0]]]=t.slice(1);
  const cs=P[2]||'';for(let i=0;i+7<=cs.length;i+=7){const K=WD_KEYS[WD_AL.indexOf(cs[i])];if(K)w.c[K[0]]='#'+cs.slice(i+1,i+7);}
  for(const t of (P[3]||'').split(','))if(t.length>1){const g={t:'top',b:'bottom',o:'outer'}[t[0]];if(g)w.pat[g]=t.slice(1);}return wdClean(w);}
// a friend's look: their new state if their build sends it, else the old keys
function wdFromLook(look){if(!look||typeof look!=='object')return wdMigrate({});if(look.w&&typeof look.w==='object')return wdClean(look.w);
  const d=typeof look.w==='string'?wdDec(look.w):null;return d||wdMigrate(Object.assign({},LOOK_DEF,look));}
// your saved look, read again: the old creator dropped values it didn't know (a new pattern, say), so the saved copy is the one that counts
{let raw=null;try{raw=JSON.parse(localStorage.getItem('hollowLook'+ACCT_SUFFIX)||'null');}catch(e){}
  S.look.w=raw&&raw.w&&raw.w.v?wdClean(raw.w):wdMigrate(raw?Object.assign({},LOOK_DEF,raw):S.look);
  if(raw&&raw.w){for(const k of ['wfav','wpre','wrec'])if(raw[k]!==undefined)S.look[k]=raw[k];}wdSync();}
// ---- ramps that stay readable at every colour: a near-black is lifted until its shadow steps apart from its base, a near-white lowered until
// its light shows. Every colour in between gets the same ramp as before
const wdLuma=c=>.299*c[0]+.587*c[1]+.114*c[2];
const WD_RC=new Map();
function wdRamp(hex){const k=hex+(WD.legacyRamp?'L':'');let R=WD_RC.get(k);if(R)return R;const c=hexRGB(hex);R=rampRGB(c);
  if(!WD.legacyRamp){let [h,s,v]=rgb2hsv(c),g=0;while(g++<60&&v<1&&wdLuma(R[3])-wdLuma(R[1])<12){v=Math.min(1,v+.01);R=rampRGB(hsv2rgb(h,s,v));}
    g=0;while(g++<60&&v>0&&wdLuma(R[4])-wdLuma(R[3])<10){v=Math.max(0,v-.01);R=rampRGB(hsv2rgb(h,s,v));}}
  WD_RC.set(k,R);return R;}
const wdKey=c=>(c[0]<<16)|(c[1]<<8)|c[2];
function wdPut(M,a,b){M.set(wdKey(a),b);M.set(wdKey(outlineRGB(a)),outlineRGB(b));}
function wdRampPut(M,base,to){if(!to||to===base)return;const A=lookRamp(base),B=wdRamp(to);for(let i=0;i<5;i++)wdPut(M,A[i],B[i]);}
// ---- the per-frame anchors (from the generator's poses): the face's axis cx, the eye row hy, flags (1 eyes shut, 2 facing away, 4 an arm over
// the face) and the torso top. Every tool shares the walking sheet's anchors except on its four swing rows
const WD_ANCD={};for(const t in WD_ANC)WD_ANCD[t]=WD_ANC[t].map(s=>{const a=[];for(let i=0;i+3<s.length;i+=4)a.push([s.charCodeAt(i)-48,s.charCodeAt(i+1)-48,s.charCodeAt(i+2)-48,s.charCodeAt(i+3)-48]);return a;});
function wdAnchor(tool,row,col){const T=tool&&row>=12&&row<16?WD_ANCD[tool]:null;const R=T?T[row-12]:WD_ANCD[''][row];return (R&&R[col])||null;}
const WD_ROWDIR=[];{const cl=(SPR.farmer&&SPR.farmer.clips)||{};for(const c in cl)for(const d in cl[c])WD_ROWDIR[cl[c][d][0]]=d;}
const WD_TOOLS=['','_hoe','_can','_pick','_axe','_rod'];
// ---- the layers a look draws, low to high, for one tool
function wdLayers(w,tool){const out=[];const add=(e,name,z,kind)=>{const m=SPR[name];if(m)out.push({e,name,z,kind:kind||e.pos,m});};
  const vr=(base,e)=>{if(!tool)return base;if(e.v==='head'&&(tool==='_hoe'||tool==='_rod'))return base;return SPR[base+tool]?base+tool:base;};
  const legacy=wdLegacyBody(w);
  if(!legacy){const b=wdItem('base','base')||wdItem('base','default')||(WD.cats.base||[])[0];if(b&&b.layer)add(b,vr(b.layer,b),WD_Z.base,'base');}
  for(const p of WD_POS){const e=wdGet(w,p);if(!e||!e.layer)continue;if(legacy&&(p==='bottom'||p==='outer'||p==='shoes'))continue;
    if(!legacy&&e.flags.includes('legacyBody'))continue;
    if(e.flags.includes('under'))add(e,vr(e.layer+'_u',e),WD_Z._u,'under');
    // in the rows facing away (N) a piece can change sides with the hair: earrings flagged underHairN go under it, and bags
    // (and anything flagged overHairN) over it, so long hair doesn't hide them; the other rows keep the piece's own depth
    const nz=e.flags.includes('underHairN')&&e.z>WD_Z.hair?WD_Z.hair-1:(p==='back'||e.flags.includes('overHairN'))&&e.z<WD_Z.hair?WD_Z.hair+1:null;
    if(nz!==null){const n=out.length;add(e,vr(e.layer,e),e.z,p);if(out.length>n){out[n].rows=0;out.push(Object.assign({},out[n],{z:nz,rows:1}));}}
    else add(e,vr(e.layer,e),e.z,e.flags.includes('legacyBody')?'base':p);}
  out.sort((a,b)=>a.z-b.z);
  if(tool&&SPR['pl_toolf'+tool])out.push({e:null,name:'pl_toolf'+tool,z:99,kind:'toolf',m:SPR['pl_toolf'+tool]});
  return out;}
function wdNeed(w,tools){const s=new Set();for(const t of tools)for(const L of wdLayers(w,t)){const src=L.m.src;if(src&&!(IMG[src]&&IMG[src].width)&&!(WD.tried&&WD.tried.has(src)))s.add(src);}return [...s];}
// ---- the colour map of one layer: which colour each of its art's base colours becomes (static), and which depend on where the pixel is (dynamic)
function wdMaps(w,L){const e=L.e,pos=L.kind,cs=[];const accK=WD_ACC.includes(pos)?pos:pos==='hair'?'headacc':pos==='hat'?'hat2':'neck';
  const base=pos==='base'||pos==='under'&&e&&e.cat==='base';
  const hairK=pos==='beard'?'beard':base?'brow':'hair';
  const glove=wdGet(w,'hand'),gl=glove&&glove.flags.includes('recolourHand'),cuff=wdGet(w,'wrist'),cu=cuff&&cuff.flags.includes('recolourWrist');
  const sock=wdGet(w,'socks'),sb=sock?(sock.flags.includes('bands3')?3:sock.flags.includes('bands2')?2:1):0;
  const C={skin:wdColD(w,'skin'),hair:wdColD(w,hairK),eye:wdColD(w,'eye'),pants:wdColD(w,'bottom'),shoes:wdColD(w,'shoes'),extra:wdColD(w,'outer'),
    hatColor:wdColD(w,e&&e.bk&&e.bk.hatColor||(e&&e.id==='straw'&&e.cat==='hat'?'hat2':'hat')),acc:wdColD(w,accK)};
  const sig=[pos,e&&e.cat,e&&e.id,C.skin,C.hair,C.eye,C.pants,C.shoes,C.extra,C.hatColor,C.acc,w.pat.top||'',wdCol(w,'toppat'),wdColD(w,'top'),
    WD_KEYS.map(K=>wdCol(w,K[0])).join(),gl,cu,sb,w.it.dye||'',w.pat.bottom||'',w.pat.outer||'',WD.legacyRamp?1:0].join('|');
  const ck=WD.maps||(WD.maps=new Map());let r=ck.get(sig);if(r)return r;
  const M=new Map(),D=new Map();
  // the old order, so an old look recolours exactly as it did
  for(const k of ['skin','hair','eye','pants','shoes','extra','hatColor','acc']){if(C[k]===LOOK_BASE[k])continue;wdRampPut(M,LOOK_BASE[k],C[k]);}
  const to=wdRamp(wdColD(w,'top')),P=WD_PAT[w.pat.top||'']||WD_PAT[''],pc=wdCol(w,'toppat'),PR=pc?wdRamp(pc):null;
  SHIRT_BASES.forEach((b,cls)=>{const s=P[cls];const R=s&&PR?shiftRamp(PR,s>0?s-1:s+1):shiftRamp(to,s);const A=lookRamp(b);for(let i=0;i<5;i++)wdPut(M,A[i],R[i]);});
  // the new bases (the art always draws them in their base colour, so they are always mapped)
  const nb={top2:'top2',outer2:'outer2',shoes2:'shoes2',hat2:'hat2',acc2:accK==='ear'?'gem':accK+'2',metal:'metal',gem:'gem',frame:'frame',bottom2:'bottom2',brow:'brow',lens:'lens'};
  for(const b in nb){const k=nb[b];const v=wdCol(w,k)||(k==='lens'?'#8a9aa4':WD_K[k]?WD_K[k].def:null);if(v)wdRampPut(M,WD_BASE[b],v);}
  wdRampPut(M,WD_BASE.hand,gl?wdColD(w,'hand'):C.skin);wdRampPut(M,WD_BASE.wrist,gl?wdColD(w,'hand'):cu?wdColD(w,'wrist'):C.skin);
  wdRampPut(M,WD_BASE.ankle,sb>=1?wdColD(w,'socks'):C.skin);wdRampPut(M,WD_BASE.shin,sb>=2?wdColD(w,'socks'):C.skin);wdRampPut(M,WD_BASE.knee,sb>=3?wdColD(w,'socks'):C.skin);
  // colours the old art fixed
  for(const [k,nat,list,how] of (wdFixFor(e)||[])){const v=wdCol(w,k);if(!v||v===nat)continue;if(list==='ramp'){wdRampPut(M,nat,v);continue;}const R=wdRamp(v);
    for(const [rgb,i] of list){if(how==='collar'){D.set(wdKey(rgb),['collar',R[i],rgb]);D.set(wdKey(outlineRGB(rgb)),['collar',outlineRGB(R[i]),outlineRGB(rgb)]);}else wdPut(M,rgb,R[i]);}}
  // the dynamic ones: the second hair colour, the second eye
  if(pos==='hair'&&w.it.dye&&wdItem('dye',w.it.dye)){const A=lookRamp(LOOK_BASE.hair),H=wdRamp(C.hair),H2=wdRamp(wdColD(w,'hair2'));for(let i=0;i<5;i++)D.set(wdKey(A[i]),['dye',i,H[i],H2[i]]);}
  // a new garment with a pattern: every pixel of its own colour takes the tile's shade (the tile hangs on the torso anchor, so it never swims)
  const pg={top:'top',bottom:'bottom',outer:'outer'}[pos],tile=pg&&e&&e.flags.includes('pattern')&&w.pat[pg]&&WD_TILE[w.pat[pg]];
  if(tile){const gk=pg==='top'?'top':pg==='bottom'?'bottom':'outer',R=wdRamp(wdColD(w,gk)),pk=wdCol(w,pg==='top'?'toppat':pg==='bottom'?'botpat':'outpat'),PR=pk?wdRamp(pk):shiftRamp(R,2);
    const bases=pg==='top'?SHIRT_BASES:[pg==='bottom'?LOOK_BASE.pants:LOOK_BASE.extra];for(const b of bases){const A=lookRamp(b);for(let i=0;i<5;i++)D.set(wdKey(A[i]),['tile',i,R,PR,tile.rows]);}}
  if(base){const e2=wdCol(w,'eye2');if(e2&&e2!==C.eye){const A=lookRamp(LOOK_BASE.eye),E1=wdRamp(C.eye),E2=wdRamp(e2);for(let i=0;i<5;i++)D.set(wdKey(A[i]),['eye2',E1[i],E2[i]]);}}
  r={M,D};if(ck.size>200)ck.clear();ck.set(sig,r);return r;}
// ---- the composer. A layer's rows are read once into a pixel buffer, recoloured and laid over the ones below; the fists over a tool's
// handle go into their own buffer (the game draws them after the tool)
const WD_FW=48,WD_FH=64;
let wdScr=null;
// small reads (a frame for a thumbnail, a row for the preview) are kept: the layers under a thumbnail are the same for every item on a tab
const WD_RAWC=new Map();let wdRawN=0;
function wdRaw(im,x,y,w,h,ov){let sx=x,sy=y;if(ov){im=ov.im;sx=ov.sx;sy=ov.sy;}else if(im.height<WD_FH*29)sy=y-12*WD_FH;if(sy<0||sy+h>im.height||sx+w>im.width)return null;
  const small=w*h<=432*64;let ck=null;if(small){if(!im.__wd)im.__wd=++wdRawN;ck=im.__wd+'|'+sx+'|'+sy+'|'+w+'|'+h;const c=WD_RAWC.get(ck);if(c)return c;}
  // a thumbnail atlas is small: it is read once whole and cut up here
  if(ov&&im.width*im.height<=1<<20){if(!im.__px){const c2=document.createElement('canvas');c2.width=im.width;c2.height=im.height;const g2=c2.getContext('2d',{willReadFrequently:true});g2.drawImage(im,0,0);im.__px=g2.getImageData(0,0,im.width,im.height).data;}
    const d=new Uint8ClampedArray(w*h*4),P=im.__px,IW=im.width;for(let r=0;r<h;r++)d.set(P.subarray(((sy+r)*IW+sx)*4,((sy+r)*IW+sx+w)*4),r*w*4);if(ck){if(WD_RAWC.size>240)WD_RAWC.clear();WD_RAWC.set(ck,d);}return d;}
  if(!wdScr){wdScr=document.createElement('canvas');}if(wdScr.width<w)wdScr.width=w;if(wdScr.height<h)wdScr.height=h;
  const g=wdScr.getContext('2d',{willReadFrequently:true});g.clearRect(0,0,w,h);g.drawImage(im,sx,sy,w,h,0,0,w,h);const d=g.getImageData(0,0,w,h).data;
  if(ck){if(WD_RAWC.size>240)WD_RAWC.clear();WD_RAWC.set(ck,d);}return d;}
// the second hair colour: where each mode puts it (k is the ramp step; top/bot the hair's extent in this column of this frame)
function wdDye(mode,k,fx,fy,A,dir,top,bot,up4){const cx=A?A[0]:23,hy=A?A[1]:30,len=bot-top+1;
  switch(mode){case 'tips':return fy>bot-(2+((fx*7)%5===0?1:0));
    case 'ombre':return fy>=top+Math.round(len*.5)+((fx>>1)&1);
    case 'roots':return fy<=top+Math.max(1,Math.round(len*.3))-((fx>>1)&1);
    case 'streak':return dir==='S'?fx>=cx-5&&fx<=cx-3:dir==='N'?fx>=cx+4&&fx<=cx+6:dir==='E'?fx>=cx+2&&fx<=cx+4:false;
    case 'highlights':return k===4||(k===3&&up4);
    case 'under':return k<=1;
    case 'split':return dir==='S'?fx>cx:dir==='N'?fx<=cx:dir==='W';
    case 'fringe':return dir==='N'?false:fy>=hy-5&&(dir==='S'?fx>=cx-6&&fx<=cx+7:dir==='E'?fx>=cx+2:fx<=cx-1);}
  return false;}
// compose rows [r0,r1) of one tool's sheet for look w into out (and the fists into fo); o.noFace leaves the face plain
function wdComposeRows(w,tool,r0,r1,out,fo,o){o=o||{};const W=o.w||432,X0=o.x0||0,H=(r1-r0)*WD_FH,y0=r0*WD_FH;const layers=wdLayers(w,tool);const t0=performance.now();const OV=o.src||{};
  // the hat's cut: old hats cut the hair above the hat's top row in each column; new ones mark the cut in #ff00ff
  let hatTop=null,cut=null;const hat=layers.find(L=>L.kind==='hat');
  if(hat){const hm=WD.legacyHatTop&&hat.e.flags.includes('hatTop')?SPR[hat.e.layer+(tool==='_can'?'_can':'')]||hat.m:hat.m;const im=IMG[hm.src],ov=OV[hm===hat.m?hat.name:''],a=(ov||(im&&im.width))&&wdRaw(im,X0,y0,W,H,ov);if(a){if(hat.e.flags.includes('hatTop')){hatTop=new Int16Array(W*(r1-r0)).fill(-1);
        for(let y=0;y<H;y++){const band=(y/WD_FH)|0;for(let x=0;x<W;x++){const i=band*W+x;if(hatTop[i]<0&&a[(y*W+x)*4+3])hatTop[i]=y;}}}
      else{for(let i=0;i<a.length;i+=4)if(a[i+3]&&a[i]===255&&a[i+1]===0&&a[i+2]===255){if(!cut)cut=new Uint8Array(W*H);cut[i>>2]=1;}}}}
  const dyeMode=w.it.dye&&wdItem('dye',w.it.dye)?w.it.dye:'';
  for(const L of layers){const im=IMG[L.m.src],ov=OV[L.name];if(!ov&&(!im||!im.width))continue;let a=wdRaw(im,X0,y0,W,H,ov);if(!a)continue;
    // a piece split by facing (underHairN) keeps only its own rows here: 1 the rows facing N, 0 the rest
    if(L.rows!==undefined){const keep=[];let any=0,all=1;for(let r=r0;r<r1;r++){const k=(WD_ROWDIR[r]==='N')===(L.rows===1);keep.push(k);if(k)any=1;else all=0;}
      if(!any)continue;if(!all){a=a.slice();for(let b=0;b<keep.length;b++)if(!keep[b])a.fill(0,b*WD_FH*W*4,(b+1)*WD_FH*W*4);}}
    const {M,D}=wdMaps(w,L);
    const isHair=L.kind==='hair',isBeard=L.kind==='beard',dst=L.kind==='toolf'?fo:out;if(!dst)continue;
    // the hair's extent per column of every frame, for the dye modes
    let ext=null;if(isHair&&dyeMode){ext=new Int16Array(W*(r1-r0)*2).fill(-1);const HB=new Set(lookRamp(LOOK_BASE.hair).map(wdKey));
      for(let y=0;y<H;y++){const band=(y/WD_FH)|0,fy=y%WD_FH;for(let x=0;x<W;x++){const i=(y*W+x)*4;if(!a[i+3]||!HB.has((a[i]<<16)|(a[i+1]<<8)|a[i+2]))continue;const j=(band*W+x)*2;if(ext[j]<0)ext[j]=fy;ext[j+1]=fy;}}}
    const HL=isHair&&dyeMode==='highlights'?wdKey(lookRamp(LOOK_BASE.hair)[4]):-1;
    for(let i=0,p=0;i<a.length;i+=4,p++){if(!a[i+3])continue;
      if((isHair||isBeard)&&(hatTop||cut)){if(cut&&cut[p])continue;if(hatTop&&isHair){const x=p%W,y=(p/W)|0,ht=hatTop[((y/WD_FH)|0)*W+x];if(ht>=0&&y<ht+2)continue;}}
      if(L.kind==='hat'&&cut&&cut[p])continue;
      const key=(a[i]<<16)|(a[i+1]<<8)|a[i+2];let c=null;const d=D.size?D.get(key):null;
      if(d){const x=p%W,y=(p/W)|0,ax=X0+x,row=r0+((y/WD_FH)|0),col=(ax/WD_FW)|0,fx=ax%WD_FW,fy=y%WD_FH,A=wdAnchor(tool,row,col),dir=WD_ROWDIR[row]||'S';
        if(d[0]==='dye'){const j=(((y/WD_FH)|0)*W+x)*2;const up4=HL>=0&&i>=W*4&&a[i-W*4+3]&&((a[i-W*4]<<16)|(a[i-W*4+1]<<8)|a[i-W*4+2])===HL;
          c=wdDye(dyeMode,d[1],fx,fy,A,dir,ext[j],ext[j+1],up4)?d[3]:d[2];}
        else if(d[0]==='eye2'){const A2=A||[23,30,0];c=(dir==='S'&&fx>A2[0])||dir==='W'?d[2]:d[1];}
        else if(d[0]==='collar'){c=A&&fy>A[1]+9?d[1]:d[2];}
        else if(d[0]==='tile'){const ux=A?A[0]:23,tp=A?A[3]:39,ch=d[4][((fy-tp)%16+16)%16][((fx-ux)%16+16)%16],k=d[1],R=d[2],P=d[3];
          c=ch==='+'?R[Math.min(4,k+1)]:ch==='-'?R[Math.max(0,k-1)]:ch==='2'?P[k]:ch==='3'?P[Math.max(0,k-1)]:R[k];}}
      else c=M.size?M.get(key):null;
      const r=c?c[0]:a[i],gg=c?c[1]:a[i+1],bb=c?c[2]:a[i+2],sa=a[i+3];
      if(sa===255){dst[i]=r;dst[i+1]=gg;dst[i+2]=bb;dst[i+3]=255;}
      // a see-through pixel (gauze, a brim's soft shadow) lies over what's below it
      else{const da=dst[i+3],k=da*(255-sa)/255,oa=sa+k;dst[i]=Math.round((r*sa+dst[i]*k)/oa);dst[i+1]=Math.round((gg*sa+dst[i+1]*k)/oa);dst[i+2]=Math.round((bb*sa+dst[i+2]*k)/oa);dst[i+3]=Math.round(oa);}}
    if(L.kind==='base'){if(L.e&&L.e.flags.includes('legacyBody'))wdSocksLegacy(w,a,dst,W,H);if(WD.facePass&&!o.noFace)WD.facePass(w,tool,r0,r1,a,dst,W,X0);}}
  WD.stat.ms+=performance.now()-t0;WD.stat.n++;}
// socks on the old bare-legged outfits: the skin straight above each shoe, one to three bands of two rows
function wdSocksLegacy(w,a,dst,W,H){const s=wdGet(w,'socks');if(!s)return;const n=s.flags.includes('bands3')?6:s.flags.includes('bands2')?4:2;
  const SKB=lookRamp(LOOK_BASE.skin).map(wdKey),SHB=new Set(lookRamp(LOOK_BASE.shoes).map(wdKey)),R=wdRamp(wdColD(w,'socks'));
  for(let band=0;band*WD_FH<H;band++)for(let x=0;x<W;x++){let y=band*WD_FH+WD_FH-1,seen=false;
    for(;y>=band*WD_FH+40;y--){const i=(y*W+x)*4;if(!a[i+3])continue;const k=(a[i]<<16)|(a[i+1]<<8)|a[i+2];if(SHB.has(k)){seen=true;continue;}if(seen)break;}
    if(!seen)continue;for(let m=0;m<n&&y>=band*WD_FH;m++,y--){const i=(y*W+x)*4;if(!a[i+3])break;const k=SKB.indexOf((a[i]<<16)|(a[i+1]<<8)|a[i+2]);if(k<0)break;dst[i]=R[k][0];dst[i+1]=R[k][1];dst[i+2]=R[k][2];}}}
// the full sheets of a look: the walking sheet once, then each tool's four swing rows over a copy of it
function wdCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function wdSheets(w,tools,o){const W=432,HF=WD_FH*29;const res={};const base=wdCanvas(W,HF);const bd=new ImageData(W,HF);wdComposeRows(w,'',0,29,bd.data,null,o);base.getContext('2d').putImageData(bd,0,0);
  for(const t of tools){if(!t){res['']={c:base,f:null};continue;}const c=wdCanvas(W,HF),g=c.getContext('2d');g.drawImage(base,0,0);const sd=new ImageData(W,WD_FH*4),fd=new ImageData(W,WD_FH*4);
    // a tool's own rows start clear (its body may move away from where the walk had it)
    wdComposeRows(w,t,12,16,sd.data,fd.data,o);g.clearRect(0,12*WD_FH,W,4*WD_FH);g.putImageData(sd,0,12*WD_FH);const f=wdCanvas(W,HF);f.getContext('2d').putImageData(fd,0,12*WD_FH);res[t]={c,f};}
  return res;}
// one frame of a look (the wardrobe's preview and thumbnails), with any layer read from somewhere else (a thumbnail atlas)
function wdFrame(w,tool,row,col,src,o){const d=new ImageData(WD_FW,WD_FH);wdComposeRows(w,tool,row,row+1,d.data,null,Object.assign({x0:col*WD_FW,w:WD_FW,src},o||{}));return d;}
// ---- your sheets: built when the look changes (each look's set is kept, the last two of them, so undo and back costs nothing)
// a layer that failed to load is left out for a while (a slow or lost connection), then asked for again
WD.tried={m:new Map(),add(s){this.m.set(s,performance.now());},has(s){const t=this.m.get(s);if(t==null)return false;if(performance.now()-t>12000){this.m.delete(s);return false;}return true;}};
WD.legacy={applyLook,composeSheet,lookMap,layersFor,lookMini,peerSprite};
const wdSig=w=>wdEnc(w)+(WD.legacyRamp?'L':'');
function wdInstall(set,tools){for(const t of tools){const tm=SPR['farmer'+t],s=set[t];if(!tm||!s)continue;if(!LOOK_ORIG[tm.src])LOOK_ORIG[tm.src]=IMG[tm.src];IMG[tm.src]=s.c;if(t&&s.f)FISTS['farmer'+t]=s.f;}
  if(typeof SILF!=='undefined')for(const k in SILF)if(k.startsWith('farmer'))delete SILF[k];WD.applied=wdSig(S.look.w);}
function wdBuild(w,tools){const sig=wdSig(w);let set=WD.sheets.get(sig);const miss=tools.filter(t=>!set||!set[t]);
  if(miss.length){const add=wdSheets(w,miss);set=Object.assign(set||{},add);WD.sheets.delete(sig);WD.sheets.set(sig,set);while(WD.sheets.size>2)WD.sheets.delete(WD.sheets.keys().next().value);}
  else{WD.sheets.delete(sig);WD.sheets.set(sig,set);}return set;}
// the layers load only when a look needs them: the first build waits for its files, the old sheets show meanwhile
applyLook=function(only){wdArt();if(!S.look.w)S.look.w=wdMigrate(S.look);wdSync();const tools=only||WD_TOOLS,w=S.look.w;
  const need=wdNeed(w,tools);if(need.length){const tok=WD.pend={};loadImages(need).then(()=>{let miss=0;for(const s of need)if(!(IMG[s]&&IMG[s].width)){WD.tried.add(s);miss++;}if(WD.pend===tok){applyLook(only);if(miss)setTimeout(()=>{if(WD.pend===tok)applyLook(only);},13000);}});return;}
  try{wdInstall(wdBuild(w,tools),tools);}catch(e){console.error&&console.error('wardrobe',e);}};
// the old entry point (another look into the shared farmer sheets), kept for anything that still calls it
composeSheet=function(look,tool){const w=look===S.look?S.look.w:wdFromLook(look);const s=wdSheets(w,[tool||'']);const tm=SPR['farmer'+(tool||'')];if(!tm||!s[tool||''])return;
  if(!LOOK_ORIG[tm.src])LOOK_ORIG[tm.src]=IMG[tm.src];IMG[tm.src]=s[tool||''].c;if(tool&&s[tool].f)FISTS['farmer'+tool]=s[tool].f;};
// ---- friends: the old keys (older builds draw the nearest look they know) and the full look in one short string
lookMini=function(){wdSync();const o={};for(const [k,v] of Object.entries(S.look))if(k!=='name'&&(typeof v==='string'||typeof v==='number'))o[k]=v;o.w=wdEnc(S.look.w);return o;};
peerSprite=async function(look){if(!look||typeof look!=='object')return null;const key=lookKey(look);if(CO.sprites[key])return CO.sprites[key];CO.sprites[key]='pending';
  try{wdArt();const w=wdSplit(wdFromLook(look));const need=wdNeed(w,PEER_TOOLS);if(need.length)await loadImages(need);
    const name='peer'+Object.keys(CO.sprites).length,set=wdSheets(w,PEER_TOOLS);
    for(const tl of PEER_TOOLS){const base=SPR['farmer'+tl],s=set[tl];if(!base||!s)continue;SPR[name+tl]=Object.assign({},base,{src:'mem:'+name+tl});IMG['mem:'+name+tl]=s.c;if(tl&&s.f)FISTS[name+tl]=s.f;}
    if(typeof SILF!=='undefined')for(const k in SILF)if(k.startsWith('peer'))delete SILF[k];
    if(!SPR[name]){CO.sprites[key]=null;return null;}CO.sprites[key]=name;return name;}catch(e){CO.sprites[key]=null;return null;}};
// ---- the town's hired hands and customers are built from the same parts
if(typeof st30Sheet==='function')st30Sheet=function(id){const key='st30p_'+id;if(SPR[key])return key;const look=ST30_LOOKS[id];if(!look||!SPR.farmer)return null;
  const w=wdMigrate(Object.assign({},LOOK_DEF,look));const need=wdNeed(w,['']);
  if(need.length){if(!ST30.ask[id]&&typeof loadImages==='function'){ST30.ask[id]=1;loadImages(need).then(()=>{ST30.ask[id]=0;for(const s of need)if(!(IMG[s]&&IMG[s].width))WD.tried.add(s);});}return null;}
  if(ST30.built===FRAME_NO)return null;ST30.built=FRAME_NO;IMG['mem:'+key]=wdSheets(w,[''])[''].c;SPR[key]=Object.assign({},SPR.farmer,{src:'mem:'+key});return key;};
if(typeof st50Sheet==='function')st50Sheet=function(id,tool){const key='st30p_'+id+tool;if(SPR[key])return key;const look=ST30_LOOKS[id],meta=SPR['farmer'+tool];if(!look||!meta)return null;
  const w=wdMigrate(Object.assign({},LOOK_DEF,look));const need=wdNeed(w,['',tool]);
  if(need.length){if(!ST50.built[key]&&typeof loadImages==='function'){ST50.built[key]=1;loadImages(need).then(()=>{ST50.built[key]=0;for(const s of need)if(!(IMG[s]&&IMG[s].width))WD.tried.add(s);});}return null;}
  if(ST30.built===FRAME_NO)return null;ST30.built=FRAME_NO;IMG['mem:'+key]=wdSheets(w,[tool])[tool].c;SPR[key]=Object.assign({},meta,{src:'mem:'+key});return key;};
// ---- dyeing: every garment you have on, its own colours included
if(typeof dyeClothes==='function')dyeClothes=function(){const w=S.look.w;const rows=[['top','Top'],['bottom','Bottoms']];
  const lb=wdLegacyBody(w),t=wdGet(w,'top');if(t&&t.slots.includes('top2'))rows.push(['top2','Collar & trim']);if(lb?t&&t.slots.includes('outer'):wdGet(w,'outer'))rows.push(['outer','Outerwear']);
  rows.push(['shoes','Shoes']);if(wdGet(w,'socks'))rows.push(['socks','Socks']);if(wdGet(w,'hat'))rows.push(['hat','Hat']);
  for(const p of ['neck','headacc','waist','back','hand']){const e=wdGet(w,p);if(e)rows.push([p,e.label]);}
  let h=`<p class="date">Dyeing · your clothes</p><p>Pick a colour for each thing you’re wearing. One bottle each.</p>`;
  for(const [k,label] of rows){h+=`<div style="display:flex;align-items:center;gap:8px;margin:6px 0"><span style="width:110px">${label}</span><span style="width:22px;height:22px;background:${wdColD(w,k)};box-shadow:inset 0 0 0 1px rgba(0,0,0,.5)"></span><span style="display:flex;gap:4px;flex-wrap:wrap">${dyeBtns('data-x').replace(/data-x/g,`data-g="${k}" data-c`)}</span></div>`;}
  openNote(h,'Done');$('noteText').querySelectorAll('button[data-g]').forEach(b=>b.onclick=()=>{const c=b.dataset.c,g=b.dataset.g;if(inv('dye_'+c)<1)return;takeInv('dye_'+c,1);S.look.w.c[g]=DYE[c].col[1];
    wdSave();applyLook();SFX.page&&SFX.page();toast(`Dyed ${DYE[c].name.toLowerCase()}.`,1.4);dyeClothes();});};
// the art can load after this file: pick its entries up once everything has loaded
setTimeout(()=>{const n=WD.art;wdArt();wdTiles();if(WD.art!==n&&S.mode!=='title')applyLook();},0);
window.WD=WD;
