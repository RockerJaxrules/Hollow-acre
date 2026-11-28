#!/bin/bash
# r4 judge set: rest sheet, shape + look sheets for each hand, the zoomed game-camera thumb check, four in-cab frames
cd "$(dirname "$0")"
OUT=judge/r4
python3 rest4.py $OUT/shape_rest.png > logs/r4_rest.txt 2>&1
SIDE=L python3 build2.py $OUT/shape --shape > logs/r4_shape.txt 2>&1 &
SIDE=R python3 build2.py $OUT/shape_R --shape > logs/r4_shapeR.txt 2>&1 &
wait
SIDE=L python3 build2.py $OUT/look --look --high > logs/r4_look.txt 2>&1
SIDE=R python3 build2.py $OUT/look_R --look --high > logs/r4_lookR.txt 2>&1
AIM=-.36,.93,-.47 FOV=30 SKIN=d49a70 python3 build2.py $OUT/thumb --game --high > logs/r4_thumb.txt 2>&1
echo T
SKIN=d49a70 python3 build2.py $OUT/game_desk_mid --game --high > logs/r4_g1.txt 2>&1
SKIN=d49a70 VIEW=phone python3 build2.py $OUT/game_phone_mid --game --high > logs/r4_g2.txt 2>&1
SKIN=5e3a26 MARRIED=0 SHIRT=3e4636 python3 build2.py $OUT/game_desk_dark --game --high > logs/r4_g3.txt 2>&1
SKIN=f6d8c0 SHIRT=2c4a8a python3 build2.py $OUT/game_desk_light --game --high > logs/r4_g4.txt 2>&1
echo ALLDONE
