import sys; sys.path.insert(0,'tools/px')
from buildkit import build
from PIL import Image
specs=[
 dict(name='t_cottage',w=6,d=3.3,wall='white',roof='gable',roof_mat='slate',trim='green',door_col='red',chimneys=[{'x':.22}],shutters=True,shutter_col='green',boxes=True,porch={'rail':True},moss=1,wear=.5,seed=3,lamp=True),
 dict(name='t_brickshop',w=10,d=3.3,wall='brick_red',roof='hip',roof_mat='shingle_brown',trim='cream',door_col='green',door={'kind':'glass','w':14},awning=('#a83a32','#e8dcc0'),sign='GENERAL STORE',chimneys=[{'x':.8}],wear=.3,seed=5),
 dict(name='t_twostorey',w=7,d=3.4,storeys=2,wall='blue',roof='gable',roof_mat='shingle_grey',trim='white',door_col='black',porch={'full':True,'rail':True},dormers=[],chimneys=[{'x':.75}],moss=.6,ivy='left',seed=7,watcher=2),
 dict(name='t_frontgable',w=5,d=3.3,wall='mustard',roof='frontgable',roof_mat='shingle_red',trim='white',door_col='blue',boxes=True,seed=9,wear=.6),
 dict(name='t_stonehouse',w=6,d=3.3,wall='stone_grey',roof='gable',roof_mat='slate',trim='black',door_col='oak',chimneys=[{'x':.15,'mat':'stone_grey'},{'x':.85,'mat':'stone_grey'}],moss=1.4,seed=11,windows=[{'x':1.2},{'x':4.8,'boarded':True}],scratches=True,ribbon=True),
 dict(name='t_church',w=10,d=4.2,wall='white',roof='gable',roof_mat='slate',trim='white',door_col='oak',door={'dx':0,'w':1,'h':1},wall_h=90,tower={'w':30,'above':34,'spire':70},seed=13,windows=[{'x':1.4,'h':30},{'x':3.0,'h':30},{'x':7.0,'h':30},{'x':8.6,'h':30}],moss=.5),
 dict(name='t_barn',w=7,d=3.4,wall='oxblood',roof='frontgambrel',roof_mat='tin_rust',trim='white',door_col='red',door={'kind':'barn','w':30,'h':40},wall_h=56,seed=15,windows=[{'x':1.1,'curtain':False},{'x':5.9,'curtain':False,'broken':True}],wear=.8),
 dict(name='t_logcabin',w=6,d=3.3,wall='log',roof='gable',roof_mat='shingle_brown',trim='brown',door_col='oak',chimneys=[{'x':.85,'mat':'stone_honey'}],porch={'rail':False},moss=1.2,seed=17,wear=.9),
]
day=[];night=[]
for s in specs:
  d,n,m=build(s);d.save(f'tools/px/out/kit/{s["name"]}.png');n.save(f'tools/px/out/kit/{s["name"]}_n.png');day.append(d);night.append(n)
def sheet(ims,path,bg):
  W=sum(i.width for i in ims)+10*len(ims)+10;H=max(i.height for i in ims)+10
  c=Image.new('RGBA',(W,H),bg);x=5
  for i in ims: c.alpha_composite(i,(x,H-5-i.height));x+=i.width+10
  c.resize((W*2,H*2),Image.NEAREST).save(path)
sheet(day[:4],'tools/px/out/kit/sheet_day_a.png',(74,96,54,255));sheet(day[4:],'tools/px/out/kit/sheet_day_b.png',(74,96,54,255));sheet(night[:4],'tools/px/out/kit/sheet_night_a.png',(18,22,36,255))
print('ok')
