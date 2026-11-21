"""The lift cage that hangs on every fifth mine floor (the checkpoints): a timber shaft frame with a header beam and an iron
pulley wheel, a rope down to an iron-barred cage on a plank floor, a dim lantern inside. Drawn in 3/4 view with lit top
faces, hue-shifted ramps (warm lights, cool darks), a contact shadow and a dark outline. Writes spr/lpc/obj/mine_lift.png
and its entry in objects.json."""
import json, math
from PIL import Image
H = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1
W, HT = 52, 92
im = Image.new('RGBA', (W, HT), (0, 0, 0, 0)); px = im.load()
def put(x, y, c, a=255):
    if 0 <= x < W and 0 <= y < HT: px[x, y] = (*c, a)
def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)
# hue-shifted ramps: darks lean blue/purple, lights lean yellow
WOOD = [(34, 22, 26), (58, 36, 32), (88, 56, 40), (120, 80, 50), (156, 110, 66), (190, 146, 92)]
IRON = [(22, 22, 32), (40, 40, 54), (64, 64, 78), (96, 94, 104), (138, 134, 136), (184, 178, 168)]
ROPE = [(70, 54, 40), (126, 100, 66), (176, 148, 102)]
DARK = (14, 12, 20)
# --- contact shadow first (everything stands on it)
for y in range(84, 91):
    for x in range(W):
        d = ((x - 26) / 25) ** 2 + ((y - 87) / 3.6) ** 2
        if d < 1: put(x, y, (8, 8, 12), int(150 * (1 - d) + 40))
# --- the shaft posts, left and right, lit from the left: a lit left face, a darker front
for (x0, x1) in ((2, 7), (44, 49)):
    for y in range(6, 86):
        for x in range(x0, x1 + 1):
            u = (x - x0) / (x1 - x0)
            k = 4 if u < .2 else 3 if u < .55 else 2
            if H(x, y // 3, 2) > .86: k -= 1   # grain
            put(x, y, WOOD[k])
    # iron brackets bolted on
    for by in (30, 62):
        rect(x0, by, x1, by + 2, IRON[2]); rect(x0, by, x1, by, IRON[4]); put(x0 + 1, by + 1, IRON[5]); put(x1 - 1, by + 1, IRON[5])
# --- header beam across the top: a lit top face, a front face
rect(0, 4, W - 1, 6, WOOD[5]); rect(0, 7, W - 1, 12, WOOD[3]); rect(0, 12, W - 1, 13, WOOD[1])
for x in range(0, W, 7): put(x + int(H(x, 1) * 4), 9, WOOD[2])
# --- the pulley wheel: an iron rim, spokes, a hub, lit upper-left
cx, cy, r = 26, 18, 6
for y in range(cy - r - 1, cy + r + 2):
    for x in range(cx - r - 1, cx + r + 2):
        d = math.hypot(x - cx, y - cy)
        if r - 1.6 <= d <= r + .4:
            lit = (x - cx) + (y - cy) < -2
            put(x, y, IRON[4] if lit else IRON[2])
for a in range(0, 360, 60):
    for t in range(1, r - 1):
        put(round(cx + math.cos(math.radians(a + 15)) * t), round(cy + math.sin(math.radians(a + 15)) * t), IRON[3])
rect(cx - 1, cy - 1, cx + 1, cy + 1, IRON[1]); put(cx - 1, cy - 1, IRON[5])
rect(cx - 1, 12, cx + 1, cy - 2, IRON[2])   # the axle bracket hanging from the beam
# --- the rope: two strands twisted, from the wheel down to the cage's yoke
for y in range(cy + r - 1, 34):
    for i, x in enumerate((cx - 1, cx)):
        put(x, y, ROPE[2] if (y + i) % 3 == 0 else ROPE[1])
    put(cx + 1, y, ROPE[0])
# --- the cage. Back wall first (dark, through the bars), then the back bars, the lantern, then the front bars and frame
CX0, CX1, CTOP, CFLOOR = 10, 41, 38, 76
rect(CX0, CTOP + 4, CX1, CFLOOR, DARK)
for x in range(CX0 + 2, CX1, 4): rect(x, CTOP + 5, x, CFLOOR - 1, (30, 28, 40))   # back bars, in the dark
# the lantern hanging inside, and its warm light on the back wall
LX, LY = 26, 48
for y in range(CTOP + 4, CFLOOR):
    for x in range(CX0, CX1 + 1):
        d = math.hypot(x - LX, (y - LY) * 1.2)
        if d < 13 and px[x, y][:3] in (DARK, (30, 28, 40)):
            t = (1 - d / 13) ** 1.6; b = px[x, y]
            put(x, y, (int(b[0] + 120 * t), int(b[1] + 70 * t), int(b[2] + 22 * t)))
rect(LX, CTOP + 4, LX, LY - 3, IRON[2])
rect(LX - 2, LY - 2, LX + 2, LY - 2, IRON[3]); rect(LX - 2, LY - 1, LX + 2, LY + 3, (240, 190, 90)); rect(LX - 1, LY, LX + 1, LY + 2, (255, 236, 160))
rect(LX - 2, LY + 4, LX + 2, LY + 4, IRON[2]); put(LX - 2, LY - 1, IRON[2]); put(LX + 2, LY - 1, IRON[2])
# the roof: a lit iron top face in 3/4, the yoke the rope ties to, a front lip
for y in range(CTOP, CTOP + 4):
    inset = CTOP + 3 - y
    rect(CX0 + inset, y, CX1 - inset, y, IRON[4] if y < CTOP + 2 else IRON[3])
rect(CX0, CTOP + 4, CX1, CTOP + 5, IRON[2]); rect(CX0, CTOP + 6, CX1, CTOP + 6, IRON[1])
rect(cx - 4, CTOP - 4, cx + 4, CTOP - 3, IRON[3]); rect(cx - 4, CTOP - 2, cx + 4, CTOP - 1, IRON[1]); put(cx - 4, CTOP - 4, IRON[5])
for y in range(34, CTOP - 4): put(cx - 1, y, ROPE[1]); put(cx, y, ROPE[2] if y % 2 else ROPE[1])
# front bars: a lit left pixel, a dark right pixel, rivets where they meet the bands
for x in range(CX0, CX1 + 1, 4):
    rect(x, CTOP + 6, x, CFLOOR - 2, IRON[4]); rect(x + 1, CTOP + 6, x + 1, CFLOOR - 2, IRON[2])
for by in (CTOP + 18, CFLOOR - 6):
    rect(CX0, by, CX1 + 1, by, IRON[4]); rect(CX0, by + 1, CX1 + 1, by + 1, IRON[1])
    for x in range(CX0, CX1 + 1, 4): put(x, by, IRON[5])
# corner posts, heavier
for x in (CX0 - 1, CX1 + 1):
    rect(x, CTOP + 3, x, CFLOOR, IRON[3] if x < 20 else IRON[2])
# the plank floor: a lit top edge seen past the bars, a front face with plank ends
rect(CX0 - 2, CFLOOR - 1, CX1 + 2, CFLOOR, WOOD[4]); rect(CX0 - 2, CFLOOR + 1, CX1 + 2, CFLOOR + 5, WOOD[2])
for x in range(CX0 - 2, CX1 + 3, 6): rect(x, CFLOOR + 1, x, CFLOOR + 5, WOOD[1])
rect(CX0 - 2, CFLOOR + 6, CX1 + 2, CFLOOR + 6, WOOD[0])
for x in range(CX0, CX1, 9): put(x + 2, CFLOOR + 3, IRON[4])   # nail heads
# a chain hanging off the side with a hook, and a rust streak
for y in range(CTOP + 7, CTOP + 22): put(CX1 + 3, y, IRON[3] if y % 2 else IRON[1])
put(CX1 + 4, CTOP + 22, IRON[3]); put(CX1 + 4, CTOP + 23, IRON[2]); put(CX1 + 3, CTOP + 23, IRON[2])
for y in range(CTOP + 7, CTOP + 15): put(CX0 + 1, y, (120, 62, 34))
# --- outline: a dark hue-shifted rim round everything opaque (not the soft shadow)
a = [[px[x, y][3] > 200 for x in range(W)] for y in range(HT)]
for y in range(HT):
    for x in range(W):
        if a[y][x]: continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            X, Y = x + dx, y + dy
            if 0 <= X < W and 0 <= Y < HT and a[Y][X]:
                q = px[X, Y]; base = px[x, y]
                px[x, y] = (int(q[0] * .28), int(q[1] * .24), int(q[2] * .34) + 6, 255); break
im.save('spr/lpc/obj/mine_lift.png')
d = json.load(open('spr/lpc/objects.json'))
d['mine_lift'] = {'src': 'spr/lpc/obj/mine_lift.png', 'fw': W, 'fh': HT, 'ax': W / 2, 'ay': 86.0, 'foot': [-.7, -.4, .7, 0]}
json.dump(d, open('spr/lpc/objects.json', 'w')); print('ok')
