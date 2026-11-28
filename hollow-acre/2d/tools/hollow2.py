"""The Hollow, redrawn and given real animations: a tall, starved thing in a tattered black coat, grey corpse hands with long
fingers, legs like sticks, a rotting pumpkin for a head with ember eyes and a torn, carved mouth.
Every part is a rounded shape lit from the upper left (hue-shifted: shadows violet, highlights warm), edged dark, grounded with
a darker band at the feet. A sickly rim of light catches its far edges so it reads against the dark.
Animations (rows of the sheet): walk (a jerky stalk, the head lagging and snapping), idle (still, breathing, the head twitching),
crawl (on all fours like a spider, knees and elbows high), scream (arms flung up and out, the mouth tearing open), lunge (it
reaches for you), hurt (it recoils from the light), each facing N, W, S, E (W is E mirrored).
Writes spr/lpc/hollow.png + hollow.json (same clip names as before for walk/idle/hurt, plus crawl, scream and lunge)."""
import json, math
from PIL import Image
FW, FH = 96, 176; G = 171
def hx(c): return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
RAMPS = {
  'coat': ['#040306', '#09070c', '#110d15', '#1a151f', '#251e2c', '#352c3e'],
  'leg':  ['#0a0808', '#151012', '#211a1c', '#30262a', '#42363a', '#5a4c50'],
  'skin': ['#141a16', '#262e28', '#3c463e', '#56625a', '#7a867c', '#a6b0a6'],
  'pump': ['#2c0e04', '#561e08', '#863410', '#b4521a', '#d8782a', '#f0a64e'],
  'rot':  ['#121008', '#1e1c0e', '#2c2a16', '#3c3a20', '#4e4c2c', '#62603a'],
  'stem': ['#100c06', '#1e1810', '#302618', '#443622', '#5a4a30', '#726040'],
  'void': ['#030102', '#060203', '#0a0304', '#0e0405', '#120506', '#160607'],
  'tooth': ['#4a4436', '#6e6650', '#948a6e', '#b8ae8e', '#d6ceb0', '#ece6cc'],
}
RAMPS = {k: [hx(c) for c in v] for k, v in RAMPS.items()}
EMBER = [(255, 64, 16), (255, 140, 40), (255, 210, 110), (255, 246, 200)]
OUTC = (8, 4, 10)
L = (-.5, -.62, .6); _n = math.sqrt(sum(v * v for v in L)); L = tuple(v / _n for v in L)
H_ = lambda x, y, s=0: (math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453) % 1

class Frame:
    def __init__(s):
        s.mat = [[None] * FW for _ in range(FH)]; s.lit = [[0.0] * FW for _ in range(FH)]; s.pid = [[-1] * FW for _ in range(FH)]; s.n = 0; s.glow = []
    def put(s, x, y, mat, lit, pid):
        if 0 <= x < FW and 0 <= y < FH: s.mat[y][x] = mat; s.lit[y][x] = lit; s.pid[y][x] = pid
    def shade(s, nx, ny, nz, amb=.18, rim=.0):
        l = max(0, nx * L[0] + ny * L[1] + nz * L[2]); r = max(0, (nx * .7 + ny * .2) - .35) * rim   # a cold rim on the far side
        return min(1, amb + l * .9 + r)
    def capsule(s, a, b, ra, rb, mat, rim=.5, seam=True):
        """a limb: a tapered rounded segment, its normal from the nearest point on its axis"""
        pid = s.n; s.n += 1; (ax, ay), (bx, by) = a, b; dx, dy = bx - ax, by - ay; L2 = dx * dx + dy * dy or 1
        x0, x1 = int(min(ax, bx) - max(ra, rb) - 1), int(max(ax, bx) + max(ra, rb) + 2)
        y0, y1 = int(min(ay, by) - max(ra, rb) - 1), int(max(ay, by) + max(ra, rb) + 2)
        for y in range(max(0, y0), min(FH, y1)):
            for x in range(max(0, x0), min(FW, x1)):
                px, py = x + .5, y + .5; t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L2))
                cx, cy = ax + dx * t, ay + dy * t; r = ra + (rb - ra) * t; d = math.hypot(px - cx, py - cy)
                if d > r: continue
                nx, ny = (px - cx) / r, (py - cy) / r; nz = math.sqrt(max(0, 1 - nx * nx - ny * ny))
                lit = s.shade(nx, ny, nz, rim=rim)
                if seam and d > r - 1.1: lit *= .6
                s.put(x, y, mat, lit, pid)
        return pid
    def blob(s, cx, cy, rx, ry, mat, rim=.4, fn=None):
        """an ellipsoid (the pumpkin, palms, the hump of the back); fn may adjust (lit, mat) per point"""
        pid = s.n; s.n += 1
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                u, v = (x + .5 - cx) / rx, (y + .5 - cy) / ry; d = u * u + v * v
                if d > 1: continue
                nz = math.sqrt(1 - d); lit = s.shade(u, v, nz, rim=rim); m = mat
                if d > .86: lit *= .62
                if fn:
                    r = fn(u, v, nz, lit)
                    if r is None: continue
                    lit, m = r
                s.put(x, y, m, lit, pid)
        return pid
    def coat(s, top_l, top_r, hem_l, hem_r, hem_y, sway, phase, mat='coat'):
        """the coat: from the shoulders it hangs and flares, in folds, its hem torn into strips that move"""
        pid = s.n; s.n += 1; (tlx, tly), (trx, try_) = top_l, top_r
        for y in range(int(min(tly, try_)), int(hem_y) + 14):
            t = (y - min(tly, try_)) / max(1, hem_y - min(tly, try_)); tt = min(1, t)
            lx = tlx + (hem_l - tlx) * tt + sway * tt * tt; rx = trx + (hem_r - trx) * tt + sway * tt * tt
            for x in range(int(lx), int(rx) + 1):
                if y > hem_y:   # the torn hem: strips of different lengths
                    strip = int((x - lx) / 3); ln = 3 + int(H_(strip, 7, phase) * 11)
                    if y - hem_y > ln or ((x - lx) % 3 == 2 and y - hem_y > 1): continue
                u = ((x + .5) - (lx + rx) / 2) / max(1, (rx - lx) / 2); u = max(-1, min(1, u))
                fold = math.sin((x - lx) * .55 + phase * 1.3 + y * .02) * .45
                nx = max(-1, min(1, u * .8 + fold * .4)); nz = math.sqrt(max(0, 1 - nx * nx))
                lit = s.shade(nx, -.15, nz, amb=.1, rim=.55) * (1 - .2 * tt)
                if abs(x - lx) < 1 or abs(x - rx) < 1: lit *= .55
                if tt > .35 and H_(int(x / 2), int(y / 3), 11) < .045: continue   # rips you can see through
                s.put(x, y, mat, lit, pid)
        return pid
    def hand(s, wrist, ang, spread=1, curl=0, big=1.0):
        """a long grey hand: a narrow palm and four long jointed fingers and a thumb"""
        wx, wy = wrist; ca, sa = math.cos(ang), math.sin(ang)
        palm = (wx + ca * 4 * big, wy + sa * 4 * big); s.capsule(wrist, palm, 2.2 * big, 2.6 * big, 'skin', seam=True)
        for k in range(4):
            a = ang + (k - 1.5) * .22 * spread; l1 = (6 + (k in (1, 2)) * 2) * big; l2 = (5 + (k in (1, 2))) * big
            base = (palm[0] + math.cos(a) * 2 * big, palm[1] + math.sin(a) * 2 * big)
            j = (base[0] + math.cos(a) * l1, base[1] + math.sin(a) * l1); a2 = a + curl
            tip = (j[0] + math.cos(a2) * l2, j[1] + math.sin(a2) * l2)
            s.capsule(base, j, .9 * big, .8 * big, 'skin', rim=.6, seam=False); s.capsule(j, tip, .8 * big, .45 * big, 'skin', rim=.6, seam=False)
        ta = ang - 1.0 * spread; s.capsule(palm, (palm[0] + math.cos(ta) * 5 * big, palm[1] + math.sin(ta) * 5 * big), .9 * big, .6 * big, 'skin', seam=False)
    def head(s, cx, cy, view, tilt=0, jaw=0, r=1.0):
        """the pumpkin: ribbed and rotting, stem crooked; facing you, carved eyes burning and a torn mouth that can open"""
        rx, ry = 16 * r, 13.5 * r; ct, st = math.cos(tilt), math.sin(tilt)
        def fn(u, v, nz, lit):
            # turn the point into the head's own frame (the tilt), for the ribs and the carving
            uu, vv = u * ct + v * st * (ry / rx), -u * st * (rx / ry) + v * ct
            side = 1 if view == 'E' else 0
            ang = math.atan2(uu, nz) + (.9 if side else 0)
            rib = math.cos(ang * 7); lit2 = lit * (1 - .22 * max(0, -rib)) + .05 * max(0, rib)
            m = 'pump'
            if H_(int(uu * 9), int(vv * 9), 3) < .16 and vv > -.2: m = 'rot'
            if view == 'S' or view == 'E':
                fx = uu - (.55 if view == 'E' else 0)
                # eyes: slanted triangles, deep, burning
                for ex in ((-.38,) if view == 'E' else (-.38, .38)):
                    ex2 = ex + (.55 if view == 'E' else 0) - (.55 if view == 'E' else 0)
                    du, dv = fx - ex2, vv + .18
                    if -.22 < dv < .14 and abs(du) < (.14 - dv) * 1.05 * (1 if view == 'S' else .7):
                        core = abs(du) < .06 and -.08 < dv < .06
                        return (1.0 if core else .8 if abs(du) < .1 else .55), 'eye'
                # the mouth: a torn jagged band, wider when the jaw drops
                mh = .16 + jaw * .5; my = .38 + jaw * .12
                jag = .06 * math.sin(fx * 26) + .04 * math.sin(fx * 13 + 1)
                if abs(fx) < .62 - jaw * .05 * 0 and my - mh * .5 + jag < vv < my + mh * .5 - jag:
                    if abs(math.sin(fx * 24)) > .55 and (vv < my - mh * .5 + .07 + jag or vv > my + mh * .5 - .07 - jag): return .8, 'tooth'
                    return (.9 if vv > my + mh * .2 else .2), 'mouth'
            return lit2, m
        s.blob(cx, cy, rx, ry, 'pump', rim=.3, fn=fn)
        # the stem, crooked, and a curl of dead vine
        sx, sy = cx + st * ry * .9 + 1, cy - ct * ry * .95
        s.capsule((sx, sy + 2), (sx + 2 + st * 4, sy - 5), 2.4 * r, 1.6 * r, 'stem')
        s.capsule((sx + 2 + st * 4, sy - 5), (sx + 7, sy - 6), 1.0, .7, 'stem', seam=False)

def legs_front(F, hipx, hipy, lift_l, lift_r, spread=6, knee_out=2):
    for sgn, lift in ((-1, lift_l), (1, lift_r)):
        h = (hipx + sgn * spread * .7, hipy); k = (hipx + sgn * (spread + knee_out), hipy + 30 - lift * .6); f = (hipx + sgn * spread, G - 4 - lift)
        F.capsule(h, k, 3.4, 2.8, 'leg'); F.capsule(k, f, 2.8, 2.0, 'leg')
        F.capsule((f[0], f[1] - 1), (f[0] + sgn * 1.5, f[1] + 3), 2.0, 2.4, 'skin')   # a bare bony foot
def arm(F, sh, el, wr, sleeve=True, hand_ang=None, spread=1, curl=.35, big=1.0):
    F.capsule(sh, el, 4.0, 3.4, 'coat' if sleeve else 'skin', rim=.6)
    mid = ((el[0] + wr[0]) / 2, (el[1] + wr[1]) / 2)
    F.capsule(el, mid, 3.2, 2.8, 'coat' if sleeve else 'skin', rim=.6); F.capsule(mid, wr, 2.4, 2.0, 'skin', rim=.6)
    ang = hand_ang if hand_ang is not None else math.atan2(wr[1] - el[1], wr[0] - el[0])
    F.hand(wr, ang, spread, curl, big)

# ---------------------------------------------------------------- poses
def pose_upright(F, view, p):
    """standing/walking/screaming/lunging upright. p: bob, sway, tilt, jaw, la/ra (arm targets), legs lift, lean, headr"""
    cx = 48 + p.get('dx', 0); bob = p.get('bob', 0); sh_y = G - 112 + bob; hip_y = G - 62 + bob; hr = p.get('headr', 1.0)
    if view in ('S', 'N'):
        legs_front(F, cx, hip_y, p.get('ll', 0), p.get('rl', 0))
        back = view == 'N'
        def armset():
            for sgn, key in ((-1, 'la'), (1, 'ra')):
                el, wr = p[key]; sh = (cx + sgn * 14, sh_y + 3)
                arm(F, sh, (cx + sgn * el[0], sh_y + el[1]), (cx + sgn * wr[0], sh_y + wr[1]), spread=p.get('spread', 1), curl=p.get('curl', .35), big=p.get('hbig', 1.0))
        if p.get('arms_behind') or back is False and p.get('arms_back'): armset()
        F.coat((cx - 12, sh_y), (cx + 12, sh_y), cx - 18, cx + 18, G - 44 + bob, p.get('sway', 0), p.get('ph', 0))
        if back: F.blob(cx, sh_y + 8, 13, 10, 'coat', rim=.6)   # the hunched back
        if not p.get('arms_behind'): armset()
        F.capsule((cx, sh_y - 2), (cx + p.get('tilt', 0) * 10, sh_y - 12), 3.0, 2.6, 'skin')   # the neck, a stalk
        F.capsule((cx - 9, sh_y - 1), (cx + 9, sh_y - 1), 3.2, 3.2, 'coat', rim=.6)        # the collar
        if not p.get('arms_over'): F.head(cx + p.get('tilt', 0) * 12, sh_y - 25 + p.get('hdy', 0), 'N' if back else 'S', p.get('tilt', 0), p.get('jaw', 0), hr * 1.12)
        else:
            F.head(cx + p.get('tilt', 0) * 12, sh_y - 25 + p.get('hdy', 0), 'N' if back else 'S', p.get('tilt', 0), p.get('jaw', 0), hr * 1.12)
            for sgn, key in ((-1, 'la'), (1, 'ra')):
                el, wr = p[key]; arm(F, (cx + sgn * 14, sh_y + 3), (cx + sgn * el[0], sh_y + el[1]), (cx + sgn * wr[0], sh_y + wr[1]), curl=p.get('curl', .35))
    else:   # E (W is the mirror)
        lean = p.get('lean', .12); hip = (cx - 2, hip_y); sh = (cx + lean * 50, sh_y)
        for key, far in (('fl', True), ('nl', False)):
            if far:
                th, sn = p[key]; k = (hip[0] + math.sin(th) * 30, hip[1] + math.cos(th) * 30); f = (k[0] + math.sin(sn) * 28, k[1] + math.cos(sn) * 28)
                f = (f[0], min(f[1], G - 4)); F.capsule(hip, k, 3.2, 2.7, 'leg'); F.capsule(k, f, 2.6, 2.0, 'leg'); F.capsule(f, (f[0] + 4, f[1] + 1), 2.0, 2.0, 'skin')
        if 'fa' in p:
            el, wr = p['fa']; arm(F, (sh[0] - 2, sh[1] + 3), (sh[0] + el[0], sh[1] + el[1]), (sh[0] + wr[0], sh[1] + wr[1]), curl=p.get('curl', .35), big=p.get('hbig', 1.0))
        F.coat((sh[0] - 10, sh[1]), (sh[0] + 9, sh[1]), hip[0] - 15, hip[0] + 14, G - 40 + bob, p.get('sway', 0) - 3, p.get('ph', 0))
        th, sn = p['nl']; k = (hip[0] + math.sin(th) * 30, hip[1] + math.cos(th) * 30); f = (k[0] + math.sin(sn) * 28, k[1] + math.cos(sn) * 28); f = (f[0], min(f[1], G - 4))
        F.capsule(hip, k, 3.4, 2.8, 'leg'); F.capsule(k, f, 2.8, 2.0, 'leg'); F.capsule(f, (f[0] + 4, f[1] + 1), 2.0, 2.2, 'skin')
        F.capsule((sh[0], sh[1] - 2), (sh[0] + 6 + p.get('tilt', 0) * 6, sh[1] - 12), 3.0, 2.6, 'skin')
        F.head(sh[0] + 8 + p.get('tilt', 0) * 8, sh[1] - 25 + p.get('hdy', 0), 'E', p.get('tilt', 0) * .6, p.get('jaw', 0), hr * 1.12)
        el, wr = p['na']; arm(F, (sh[0] + 1, sh[1] + 3), (sh[0] + el[0], sh[1] + el[1]), (sh[0] + wr[0], sh[1] + wr[1]), curl=p.get('curl', .35), big=p.get('hbig', 1.0))
def pose_crawl(F, view, k):
    """on all fours, like something that learned to walk from spiders"""
    ph = k * math.pi * 2 / 6; s1, s2 = math.sin(ph), math.sin(ph + math.pi)
    if view in ('S', 'N'):
        cx = 48; back = view == 'N'
        for sgn, sv in ((-1, s1), (1, s2)):   # legs: knees up high behind the body
            hip = (cx + sgn * 8, G - 46); kn = (cx + sgn * (22 + sv * 2), G - 74 - sv * 3); ft = (cx + sgn * 28, G - 4 - max(0, sv) * 4)
            F.capsule(hip, kn, 3.2, 2.7, 'leg'); F.capsule(kn, ft, 2.7, 2.0, 'leg')
        F.blob(cx, G - 44, 17, 12, 'coat', rim=.6)    # the back, hunched
        for y0 in range(4):   # rags hanging from it
            F.capsule((cx - 12 + y0 * 8, G - 36), (cx - 13 + y0 * 8 + s1, G - 22 + y0 % 2 * 4), 2.2, 1.2, 'coat', rim=.5, seam=False)
        for sgn, sv in ((-1, s2), (1, s1)):   # arms: elbows up and out, hands far out on the ground
            sh = (cx + sgn * 12, G - 40); el = (cx + sgn * (30 + sv * 3), G - 62 - sv * 4); wr = (cx + sgn * (40 + sv * 2), G - 8 - max(0, sv) * 5)
            F.capsule(sh, el, 3.6, 3.0, 'coat', rim=.6); F.capsule(el, wr, 2.6, 2.0, 'skin', rim=.6); F.hand(wr, math.pi / 2 + sgn * .5, 1.2, .2)
        F.head(cx + s1 * 1.5, G - 28 + abs(s1), 'N' if back else 'S', s1 * .12, .35 if not back else 0)
    else:
        cx = 46
        hip = (cx - 16, G - 40); sh = (cx + 14, G - 36)
        for far in (True, False):
            sv = s1 if far else s2; o = -2 if far else 0
            kn = (hip[0] - 4 + sv * 4 + o, G - 74 - abs(sv) * 2); ft = (hip[0] - 18 + sv * 6, G - 4)
            F.capsule(hip, kn, 3.2, 2.7, 'leg'); F.capsule(kn, ft, 2.7, 2.0, 'leg')
            if not far:
                F.blob(cx - 1, G - 42, 19, 9, 'coat', rim=.6)   # the body, low and horizontal
                for i in range(5): F.capsule((cx - 14 + i * 7, G - 36), (cx - 15 + i * 7 + s1, G - 18 - (i % 2) * 5), 2.2, 1.1, 'coat', rim=.5, seam=False)
            el = (sh[0] + 6 + sv * 5 + o, G - 64 - abs(sv) * 3); wr = (sh[0] + 20 + sv * 6, G - 6)
            F.capsule(sh, el, 3.4, 2.9, 'coat', rim=.6); F.capsule(el, wr, 2.6, 2.0, 'skin', rim=.6); F.hand(wr, .3, 1, .25)
        F.head(sh[0] + 16, G - 44 + abs(s1), 'E', -.25, .3)

def frames():
    """every animation as a list of (pose function, params) per view"""
    A = {}
    # walk: 8 frames, jerky; the head lags and snaps on 3 and 7
    tilt = [0, .08, .22, -.12, 0, -.08, -.26, .12]
    walk = {v: [] for v in 'NSE'}
    for i in range(8):
        ph = i / 8 * math.pi * 2; s = math.sin(ph)
        common = dict(bob=-abs(math.sin(ph)) * 2, sway=-s * 3, ph=i, tilt=tilt[i], hdy=1 if i in (3, 7) else 0)
        for v in 'NS':
            walk[v].append((pose_upright, dict(common, ll=max(0, s) * 6, rl=max(0, -s) * 6,
                la=((20, 26 + s * 2), (21 - s * 3, 58 + s * 5)), ra=((20, 26 - s * 2), (21 + s * 3, 58 - s * 5)))))
        walk['E'].append((pose_upright, dict(common, lean=.16, nl=(s * .5, s * .5 - .25), fl=(-s * .5, -s * .5 - .25),
            na=((s * 10 + 3, 24), (s * 18 + 8, 52)), fa=((-s * 10 + 1, 24), (-s * 18 + 6, 52)))))
    A['walk'] = walk
    # idle: 4 frames, breathing, a twitch of the head on the last
    idle = {v: [] for v in 'NSE'}
    for i in range(4):
        b = [0, -1, -1, 0][i]; t = [0, .05, .05, .32][i]
        for v in 'NS': idle[v].append((pose_upright, dict(bob=b, tilt=t, ph=i * .3, la=((20, 26), (22, 60)), ra=((20, 26), (22, 60)), ll=0, rl=0)))
        idle['E'].append((pose_upright, dict(bob=b, tilt=t, ph=i * .3, lean=.12, nl=(.05, -.05), fl=(-.05, .05), na=((3, 26), (6, 56)), fa=((1, 26), (4, 56)))))
    A['idle'] = idle
    A['crawl'] = {v: [(pose_crawl, i) for i in range(6)] for v in 'NSE'}
    # scream: arms flung up and out, head back, the mouth tearing open, the body shaking
    scr = {v: [] for v in 'NSE'}
    for i in range(6):
        u = min(1, i / 2); j = [0, .3, .8, 1, .9, 1][i]; sh = [0, 0, 1, -1, 1, -1][i]
        for v in 'NS':
            scr[v].append((pose_upright, dict(dx=sh, bob=-2 * u, tilt=-.15 * u + sh * .04, jaw=j, ph=i, spread=1.5, curl=-.2,
                la=((28 * u + 18 * (1 - u), 6 - 18 * u + 22 * (1 - u)), (36 * u + 20 * (1 - u), -30 * u + 56 * (1 - u))),
                ra=((28 * u + 18 * (1 - u), 6 - 18 * u + 22 * (1 - u)), (36 * u + 20 * (1 - u), -30 * u + 56 * (1 - u))))))
        scr['E'].append((pose_upright, dict(dx=sh, bob=-2 * u, tilt=-.3 * u, jaw=j, ph=i, lean=-.05, curl=-.2, nl=(.1, -.1), fl=(-.15, .05),
            na=((8 - 4 * u, -14 * u + 24 * (1 - u)), (14 * u + 6, -36 * u + 52 * (1 - u))), fa=((-6 * u + 2, -12 * u + 24 * (1 - u)), (-10 * u + 4, -34 * u + 52 * (1 - u))))))
    A['scream'] = scr
    # lunge: it pitches toward you, arms out, the hands huge, the head dropping at you
    lun = {v: [] for v in 'NSE'}
    for i in range(4):
        u = [.3, .8, 1, .6][i]
        for v in 'NS':
            lun[v].append((pose_upright, dict(bob=6 * u, hdy=10 * u, headr=1 + .18 * u, jaw=.6 * u, tilt=.08 * (i % 2), ph=i, spread=1.6, curl=-.1, hbig=1 + .5 * u,
                la=((26, 16 + 4 * (1 - u)), (24 - 6 * u, 40 + 26 * u)), ra=((26, 16 + 4 * (1 - u)), (24 - 6 * u, 40 + 26 * u)))))
        lun['E'].append((pose_upright, dict(bob=4 * u, lean=.12 + .3 * u, jaw=.6 * u, ph=i, curl=-.1, hbig=1 + .3 * u, nl=(.25 * u, -.2), fl=(-.45 * u, .2),
            na=((14 + 10 * u, 12), (30 + 16 * u, 18 - 4 * u)), fa=((12 + 8 * u, 14), (26 + 14 * u, 22 - 4 * u)))))
    A['lunge'] = lun
    # hurt: it recoils, arms up across the face
    hurt = []
    for i in range(4):
        sh = [0, 2, -2, 1][i]
        hurt.append((pose_upright, dict(dx=sh, bob=3, tilt=.2 * (1 if i % 2 else -1), hdy=3, ph=i, curl=.6, arms_over=True, arms_behind=True,
            la=((22, -6), (6, -26 - i % 2 * 2)), ra=((22, -4), (8, -22)), ll=0, rl=2)))
    A['hurt'] = {'S': hurt}
    return A

def render(fn, view, params):
    F = Frame(); mirror = view == 'W'; v = 'E' if mirror else view
    if fn is pose_crawl: pose_crawl(F, v, params)
    else: fn(F, v, params)
    im = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); px = im.load()
    for y in range(FH):
        for x in range(FW):
            m = F.mat[y][x]
            if m is None: continue
            lit = F.lit[y][x]
            if m == 'eye':
                col = EMBER[min(3, int(lit * 3.99))]
            elif m == 'mouth':
                col = (255, 92, 26) if lit > .8 else (70, 10, 4) if lit > .5 else RAMPS['void'][1]
            else:
                R = RAMPS[m]; col = R[max(0, min(5, int(lit * 5.99)))]
            if y >= G - 3 and m in ('leg', 'skin', 'coat'): col = tuple(int(c * .7) for c in col)   # grounded
            px[x, y] = col + (255,)
    # a dark edge round the whole figure
    a = [[px[x, y][3] > 0 for x in range(FW)] for y in range(FH)]
    for y in range(FH):
        for x in range(FW):
            if a[y][x]: continue
            if (x > 0 and a[y][x - 1]) or (x < FW - 1 and a[y][x + 1]) or (y > 0 and a[y - 1][x]) or (y < FH - 1 and a[y + 1][x]): px[x, y] = OUTC + (255,)
    if mirror: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im

if __name__ == '__main__':
    A = frames(); D4 = ['N', 'W', 'S', 'E']; rows = []
    for clip in ('walk', 'idle', 'crawl', 'scream', 'lunge'):
        for d in D4: rows.append((clip, d))
    rows.append(('hurt', 'S'))
    maxf = 8; sheet = Image.new('RGBA', (FW * maxf, FH * len(rows)), (0, 0, 0, 0)); clips = {}
    for r, (clip, d) in enumerate(rows):
        src = A[clip]['E' if d == 'W' else d]
        for i, (fn, p) in enumerate(src): sheet.paste(render(fn, d, p), (i * FW, r * FH))
        clips.setdefault(clip, {})[d] = [r, len(src)]
        print(clip, d, len(src), flush=True)
    # the old clip names other code asks for: thrust/slash/spellcast/sit fall back to the closest new ones
    clips['spellcast'] = clips['scream']; clips['thrust'] = clips['lunge']; clips['slash'] = clips['lunge']; clips['sit'] = clips['crawl']
    sheet.save('spr/lpc/hollow.png'); json.dump({'fw': FW, 'fh': FH, 'ax': FW / 2, 'ay': G, 'clips': clips}, open('spr/lpc/hollow.json', 'w'))
