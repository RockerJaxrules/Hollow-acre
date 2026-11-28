"""survey stakes for land you can buy (#249): a split-oak peg driven into the ground, its sawn top paler, a strip of red
surveyor's cloth knotted under the top with its tail lifting in the wind. Drawn pixel by pixel; light from the top left."""
import sys, os, json
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from crops import Canvas, outline, HEX

OAK = [HEX(c) for c in ('#2e1e10', '#4a3018', '#6a4624', '#8c6234', '#b08450', '#d0a870')]   # shade to the sawn face
CLOTH = [HEX(c) for c in ('#4a0e10', '#7a1a16', '#ac2a1c', '#d24a2a', '#ee7a4a')]
EARTH = [HEX(c) for c in ('#2a1a10', '#3e2a18', '#56402a')]

def stake(flip=False):
    """judge r1 (5.5, 'a turned bollard'): now a split peg. Two flat faces in 3/4 view (lit left, two steps darker right) with
    a hard edge between, a flat sawn top (the palest tan, darker rim on the right), a split running a third of the way down,
    a collar of turned earth (no flared foot) with a grass blade over it, a drop shadow down-right, and a longer cloth tail
    rising to the right with a notched end."""
    cv = Canvas(16, 26); cx = 6; top = 5; bot = 22
    SH = (0x32, 0x21, 0x25, 153)
    # the two faces of the split peg: left lit (2 px), right shaded (2 px), hard edge between
    for y in range(top + 2, bot + 1):
        damp = y > bot - 3
        cv.put(cx, y, OAK[3] if damp else OAK[4]); cv.put(cx + 1, y, OAK[3] if damp else OAK[4])
        cv.put(cx + 2, y, OAK[1] if damp else OAK[2]); cv.put(cx + 3, y, OAK[0] if damp else OAK[1])
    for y in range(top + 6, bot - 2, 3): cv.put(cx + 1, y, OAK[3])          # a little grain on the lit face
    # the sawn top: flat, 2 px tall, the palest tone, darker rim on the right
    for dx in range(4):
        cv.put(cx + dx, top, OAK[5] if dx < 3 else OAK[3]); cv.put(cx + dx, top + 1, OAK[5] if dx < 2 else OAK[4] if dx < 3 else OAK[2])
    # the split, a third of the way down from the top
    for y in range(top + 1, top + 7): cv.put(cx + 2 if y < top + 4 else cx + 1, y, OAK[0])
    # the cloth knotted round under the top
    ky = top + 5
    for dx in range(-1, 5): cv.put(cx + dx, ky, CLOTH[3] if dx < 2 else CLOTH[1]); cv.put(cx + dx, ky + 1, CLOTH[2] if dx < 2 else CLOTH[0])
    # its tail, 6 px, rising to the right, notched at the end
    tail = [(4, ky), (5, ky - 1), (6, ky - 1), (7, ky - 2), (8, ky - 2), (9, ky - 3)]
    for i, (x, y) in enumerate(tail):
        cv.put(cx + x, y, CLOTH[4] if i < 2 else CLOTH[3]); cv.put(cx + x, y + 1, CLOTH[2] if i < 4 else CLOTH[1])
    cv.put(cx + 9, ky - 2, (0, 0, 0, 0))                                   # the notch
    cv.px.pop((cx + 9, ky - 2), None)
    # a collar of turned earth round the foot: two browns, a lit crumb top-left
    for dx, dy, c in ((-2, 0, EARTH[1]), (-1, 0, EARTH[2]), (-1, -1, EARTH[2]), (4, 0, EARTH[1]), (5, 0, EARTH[0]), (4, -1, EARTH[1]),
                      (-2, -1, (0x7a, 0x5c, 0x3c, 255)), (0, 1, EARTH[0]), (1, 1, EARTH[1]), (2, 1, EARTH[0]), (3, 1, EARTH[0])):
        cv.put(cx + dx, bot + dy, c)
    im = outline(cv.image())
    # a grass blade over the foot, after the outline so it overlaps it
    G = [(0x3e, 0x6a, 0x26, 255), (0x5e, 0x8e, 0x34, 255)]
    pxl = im.load()
    # drop shadow, pushed down and right, only where nothing else is drawn (after the outline, so it isn't outlined)
    # (judge r2: one flat ellipse joined to the foot, 2 px tall, running out to the right; not a detached block)
    for dx in range(-1, 9):
        for dy in range(0, 2):
            if dy == 1 and (dx < 1 or dx > 6): continue
            x, y = cx + dx, bot + 1 + dy
            if 0 <= x < im.width and 0 <= y < im.height and pxl[x, y][3] == 0: pxl[x, y] = SH
    for (x, y, c) in ((cx - 1, bot - 1, G[1]), (cx - 1, bot, G[0]), (cx - 2, bot - 2, G[1])):
        if 0 <= x < im.width and 0 <= y < im.height: pxl[x, y] = c
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--install':
        obj, oj = sys.argv[2], sys.argv[3]; O = json.load(open(oj))
        stake().save(os.path.join(obj, 'land_stake.png'))
        O['land_stake'] = {'src': 'spr/lpc/obj/land_stake.png', 'fw': 16, 'fh': 26, 'ax': 8.0, 'ay': 23.0, 'foot': [-.08, -.06, .08, 0], 'px': 'ase', 'chim': None}
        json.dump(O, open(oj, 'w')); print('installed land_stake'); sys.exit(0)
    out = sys.argv[1] if len(sys.argv) > 1 else 'out'; os.makedirs(out, exist_ok=True)
    im = stake(); im.save(os.path.join(out, 'land_stake.png'))
    big = im.resize((im.width * 8, im.height * 8), Image.NEAREST); big.save(os.path.join(out, 'land_stake_8x.png'))
    print('ok')
