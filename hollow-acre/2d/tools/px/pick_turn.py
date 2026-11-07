"""The pickaxe for the front swing (facing down or up): the same pickaxe art as the side swing, turned partway toward the camera.
The handle is copied as it is; the head's colours are narrowed (cos of the turn) and tipped (sin of the turn, times how far depth
shows on screen), then the outline is drawn again around the result. Usage: python3 pick_turn.py [preview.png]
Reads TOOL_ART.pick from g2d/toolfx.js and prints the pick_f entry."""
import re, json, math, sys
from PIL import Image

SRC = 'g2d/toolfx.js'
s = open(SRC).read()
m = re.search(r'\bpick:\{px:(\d+),art:(\[[^\]]*\])\}', s)
PX = int(m.group(1)); A = json.loads(m.group(2)); H, W = len(A), len(A[0])
HW = 2  # half the handle's width

def turn(yaw_deg, depth=.62):
    yaw = math.radians(yaw_deg); sq = math.cos(yaw); sh = math.sin(yaw) * depth
    def fwd(dx):  # source offset from the handle's centre -> turned offset and how far it tips along the handle
        if abs(dx) <= HW: return dx, 0.0
        a = abs(dx) - HW; sg = 1 if dx > 0 else -1
        return sg * (HW + a * sq), sg * a * sh
    # the head is every row that reaches outside the handle
    head_rows = [y for y in range(H) if any(ch != '.' for x, ch in enumerate(A[y]) if abs(x + .5 - PX) > HW)]
    last_head = max(head_rows)
    up = down = 0; mx = 0
    for y in range(H):
        for x in range(W):
            if A[y][x] == '.': continue
            X, T = fwd(x + .5 - PX); mx = max(mx, abs(X)); up = max(up, T - y); down = max(down, (y - T) - (H - 1))
    C = math.ceil(mx) + 2; top = max(0, math.ceil(up)); Wd = 2 * C; Ht = H + top + max(0, math.ceil(down))
    grid = [['.'] * Wd for _ in range(Ht)]
    # the head's colours (no outline), sampled 4x4 per pixel
    for Y in range(Ht):
        for X in range(Wd):
            cnt = {}; empty = 0
            for i in range(4):
                for j in range(4):
                    xo = X + (i + .5) / 4 - C; yo = Y + (j + .5) / 4 - top
                    if abs(xo) <= HW: dx = xo
                    else: dx = (1 if xo > 0 else -1) * (HW + (abs(xo) - HW) / sq)
                    _, T = fwd(dx)
                    sx_, sy_ = math.floor(dx + PX), math.floor(yo + T)
                    ch = A[sy_][sx_] if 0 <= sy_ < H and 0 <= sx_ < W else '.'
                    if ch in '.K' or sy_ > last_head: empty += 1
                    else: cnt[ch] = cnt.get(ch, 0) + 1
            if empty <= 8 and cnt: grid[Y][X] = max(cnt, key=cnt.get)
    # the handle exactly as it was, under the head
    for y in range(H):
        for x in range(W):
            if abs(x + .5 - PX) <= HW and A[y][x] != '.' and (y > last_head or grid[y + top][x - PX + C] == '.'):
                ch = A[y][x]
                if y <= last_head and ch == 'K': continue
                grid[y + top][x - PX + C] = ch
    # outline again
    out = [r[:] for r in grid]
    for y in range(Ht):
        for x in range(Wd):
            if grid[y][x] != '.': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < Wd and 0 <= yy < Ht and grid[yy][xx] not in '.K':
                    out[y][x] = 'K'; break
    rows = [''.join(r) for r in out]
    # drop empty rows at the top
    while rows and set(rows[0]) == {'.'}: rows.pop(0)
    return {'px': C, 'art': rows}

PAL = {'K': (26, 16, 12), 'D': (84, 52, 28), 'M': (124, 82, 46), 'L': (176, 126, 76), 's': (60, 64, 76), 'b': (92, 98, 112),
       'm': (150, 156, 170), 'l': (204, 210, 222), 'e': (244, 248, 252)}
def img(rows, sc=8):
    im = Image.new('RGB', (len(rows[0]), len(rows)), (60, 120, 50))
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in PAL: im.putpixel((x, y), PAL[ch])
    return im.resize((im.width * sc, im.height * sc), Image.NEAREST)

if __name__ == '__main__':
    yaws = [40, 50, 60]
    ims = [img(A)] + [img(turn(y)['art']) for y in yaws]
    for y in yaws:
        t = turn(y); print(y, 'pick_f:' + json.dumps(t, separators=(',', ':')).replace('"px"', 'px').replace('"art"', 'art'))
    Wt = sum(i.width for i in ims) + 24 * len(ims); Hm = max(i.height for i in ims)
    sheet = Image.new('RGB', (Wt, Hm), (40, 40, 40)); x = 0
    for i in ims: sheet.paste(i, (x, 0)); x += i.width + 24
    sheet.save(sys.argv[1] if len(sys.argv) > 1 else 'pick_turn.png')
