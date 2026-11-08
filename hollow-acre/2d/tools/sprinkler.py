"""The brass sprinkler as it stands in the field: an iron foot plate pushed into the soil, a brass riser, a two-armed
spray head with bent nozzles and a domed cap. 3/4 view: lit top faces, cylinder shading on the riser (lit left, cool
right), hue-shifted ramps, a contact shadow and a dark outline. Writes spr/lpc/obj/sprinkler_w.png and objects.json."""
import json, math
from PIL import Image
W, H = 24, 26
im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = im.load()
def put(x, y, c, a=255):
    if 0 <= x < W and 0 <= y < H: px[x, y] = (*c, a)
BR = [(58, 34, 22), (102, 62, 26), (150, 100, 34), (196, 146, 52), (232, 194, 92), (255, 236, 168)]   # brass, warm lights / cool-brown darks
IR = [(26, 26, 36), (46, 46, 60), (74, 72, 84), (110, 106, 112), (150, 146, 142)]
cx = 12
# contact shadow
for y in range(19, 25):
    for x in range(W):
        d = ((x + .5 - cx) / 9.5) ** 2 + ((y + .5 - 21.6) / 2.6) ** 2
        if d < 1: put(x, y, (10, 12, 8), int(170 * (1 - d) + 30))
# the iron foot: a squat disc, lit top face, darker rim
for y in range(16, 23):
    for x in range(W):
        dx = (x + .5 - cx) / 7.5
        top = ((x + .5 - cx) / 7.5) ** 2 + ((y + .5 - 18) / 2.3) ** 2
        if top <= 1: put(x, y, IR[3] if (x - cx) + (y - 18) * 2 < -1 else IR[2])
        elif abs(dx) <= 1 and 18 <= y <= 20 and ((x + .5 - cx) / 7.5) ** 2 + ((y + .5 - 20) / 2.3) ** 2 <= 1:
            put(x, y, IR[1] if dx > 0 else IR[2])
for x in (cx - 5, cx + 5): put(x, 18, IR[4]); put(x, 19, IR[1])   # bolt heads
# the riser: a brass pipe, round shading across it
for y in range(8, 19):
    for i, x in enumerate(range(cx - 2, cx + 2)):
        put(x, y, BR[[4, 3, 2, 1][i]])
    if y in (12, 13):   # a collar
        for i, x in enumerate(range(cx - 3, cx + 3)): put(x, y, BR[[3, 5, 4, 3, 2, 1][i]] if y == 12 else BR[[2, 3, 3, 2, 1, 0][i]])
# the spray head: arms out both sides, nozzles bent down at the tips
for x in range(cx - 8, cx + 8):
    put(x, 7, BR[4] if x < cx else BR[3]); put(x, 8, BR[2] if x < cx else BR[1])
for x in (cx - 9, cx + 8):
    put(x, 7, BR[3]); put(x, 8, BR[2]); put(x, 9, BR[1]); put(x, 10, (150, 200, 230))   # a bead of water on each nozzle
# the domed cap, lit upper-left
for y in range(2, 7):
    for x in range(cx - 3, cx + 3):
        d = ((x + .5 - cx) / 3.2) ** 2 + ((y + .5 - 6.4) / 4) ** 2
        if d <= 1: put(x, y, BR[5] if (x - cx) + (y - 4) < -2 else BR[4] if x < cx else BR[2])
put(cx - 1, 1, BR[3]); put(cx, 1, BR[2])
# outline
a = [[px[x, y][3] > 200 for x in range(W)] for y in range(H)]
for y in range(H):
    for x in range(W):
        if a[y][x]: continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            X, Y = x + dx, y + dy
            if 0 <= X < W and 0 <= Y < H and a[Y][X] and Y < 19:
                q = px[X, Y]; px[x, y] = (int(q[0] * .3), int(q[1] * .24), int(q[2] * .3) + 8, 255); break
im.save('spr/lpc/obj/sprinkler_w.png')
d = json.load(open('spr/lpc/objects.json'))
d['sprinkler_w'] = {'src': 'spr/lpc/obj/sprinkler_w.png', 'fw': W, 'fh': H, 'ax': W / 2, 'ay': 21.0, 'foot': [0, 0, 0, 0]}
json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok')
