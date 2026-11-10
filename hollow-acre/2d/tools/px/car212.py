"""The player's car for the intro and the crash site (#212, owner: "redesign the car"). A boxy late-80s sedan in faded oxblood paint,
built from flat faces lit from the top-left (no 3D renderer, no smoothing): each face gets one flat tone from its ramp by how it
faces the light, then the parts that make it a car are placed by hand on the faces (lights, grille, chrome, seams, handles, mirror,
mud on the sills), and a hue-shifted outline goes round it.

    python3 car212.py            -> out/car212.png        15 yaw frames, -0.6 .. +1.5 rad (0 = facing east, + turns toward the camera)
    python3 car212.py wreck      -> out/car212_wreck.png  the same car wrapped round the oak: front crushed, glass starred, a light out
"""
import math, sys
from PIL import Image, ImageDraw

FW, FH, AX, AY = 192, 176, 96, 112
PPM, KZ, KH = 32, 0.8, 0.95
YAWS = [round(-0.6 + 0.15 * i, 2) for i in range(15)]


def hexr(a):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in a]


PAINT = hexr(['#1a0a0e', '#301218', '#4a1a20', '#642228', '#7c2e2e', '#963e38', '#ac5446'])   # faded oxblood, not orange
GLASS = hexr(['#10161e', '#1a2430', '#26364a', '#3a5266', '#5e7a8e', '#8ea6b4'])
CHROME = hexr(['#24242a', '#44444c', '#6c6c74', '#9a9aa2', '#c8c8cc', '#e8e8ea'])
TYRE = hexr(['#0e0e10', '#1a1a1c', '#2a2826', '#3a3632'])
MUD = hexr(['#24180e', '#3a2a18', '#54402a'])
HEAD, HEADD = (244, 236, 200), (170, 160, 130)
TAIL, TAILD = (196, 34, 30), (110, 18, 18)

LIGHT = (-0.55, 0.78, -0.30)   # toward the light: from the west (screen left), above, a little north (screen top)
_l = math.sqrt(sum(c * c for c in LIGHT)); LIGHT = tuple(c / _l for c in LIGHT)
CAM = (0.0, 0.6, 0.8)          # toward the viewer: above and south


def rot(p, yaw):
    """local (f forward, r right/south at yaw 0, h up) -> world (x, h, z)"""
    f, r, h = p
    c, s = math.cos(yaw), math.sin(yaw)
    return (f * c - r * s, h, f * s + r * c)


def proj(w):
    x, h, z = w
    return (AX + x * PPM, AY + (z * KZ - h * KH) * PPM)


def normal(ws):
    a, b, c = ws[0], ws[1], ws[2]
    u = [b[i] - a[i] for i in range(3)]; v = [c[i] - a[i] for i in range(3)]
    n = (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])
    l = math.sqrt(sum(k * k for k in n)) or 1
    return tuple(k / l for k in n)


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


class Car:
    def __init__(self, yaw, wreck=False, beaten=False):
        self.yaw, self.wreck, self.beaten = yaw, wreck, beaten
        self.im = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def face(self, pts, ramp, base=None, cull=True, flat=None, center=None):
        """a flat face; its normal turned outward from the part's centre; painted with one tone of the ramp chosen by the light"""
        ws = [rot(p, self.yaw) for p in pts]
        n = normal(ws)
        if center is not None:
            cw = rot(center, self.yaw); fc = [sum(w[i] for w in ws) / len(ws) for i in range(3)]
            if dot(n, [fc[i] - cw[i] for i in range(3)]) < 0:
                n = tuple(-k for k in n)
        if cull and dot(n, CAM) <= 0.02:
            return False
        if flat is not None:
            col = flat
        else:
            v = dot(n, LIGHT)
            k = 0 if v < -0.55 else 1 if v < -0.2 else 2 if v < 0.15 else 3 if v < 0.45 else 4 if v < 0.75 else 5
            if base is not None:
                k = max(0, min(len(ramp) - 1, k + base))
            k = min(k, len(ramp) - 1)
            col = ramp[k]
        self.d.polygon([proj(w) for w in ws], fill=col + (255,))
        return True

    def quad_on(self, a, b, c, d_, ramp=None, col=None):
        """a detail quad lying on a face (no cull test of its own: call it only when the face was drawn)"""
        ws = [rot(p, self.yaw) for p in (a, b, c, d_)]
        self.d.polygon([proj(w) for w in ws], fill=(col or ramp) + (255,))

    def line_on(self, a, b, col, w=1):
        pa, pb = proj(rot(a, self.yaw)), proj(rot(b, self.yaw))
        self.d.line([pa, pb], fill=col + (255,), width=w)

    def px(self, p, col):
        x, y = proj(rot(p, self.yaw))
        x, y = int(round(x)), int(round(y))
        if 0 <= x < FW and 0 <= y < FH:
            self.im.putpixel((x, y), col + (255,))

    # ------------------------------------------------------------------ parts
    def shadow(self):
        pts = [(2.5, -0.95, 0), (2.5, 0.95, 0), (-2.5, 0.95, 0), (-2.5, -0.95, 0)]
        sh = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
        P = [proj(rot(p, self.yaw)) for p in pts]
        sd.polygon([(x + 3, y + 2) for x, y in P], fill=(8, 6, 10, 120))
        self.im.alpha_composite(sh)

    def wheel(self, f0, r0, near):
        R, th = 0.34, 0.22
        rr = r0 + (th / 2 if near else -th / 2)
        ring = [(f0 + R * math.cos(t), rr, 0.34 + R * math.sin(t)) for t in [i * math.pi / 8 for i in range(16)]]
        ws = [rot(p, self.yaw) for p in ring]
        self.d.polygon([proj(w) for w in ws], fill=TYRE[1] + (255,))
        if not near:
            return
        # the tread: the same ring pushed inward, so its thickness shows; then the hubcap, lit top-left
        inner = [(f0 + R * math.cos(t), r0 - th / 2, 0.34 + R * math.sin(t)) for t in [i * math.pi / 8 for i in range(16)]]
        for i in range(16):
            a, b = ring[i], ring[(i + 1) % 16]; c, d = inner[(i + 1) % 16], inner[i]
            self.face([a, b, c, d], TYRE, cull=True, center=(f0, r0, 0.34))
        self.d.polygon([proj(w) for w in ws], fill=TYRE[1] + (255,))
        hub = [(f0 + 0.19 * math.cos(t), rr + 0.01, 0.34 + 0.19 * math.sin(t)) for t in [i * math.pi / 6 for i in range(12)]]
        self.d.polygon([proj(rot(p, self.yaw)) for p in hub], fill=CHROME[2] + (255,))
        hub2 = [(f0 + 0.11 * math.cos(t) - 0.02, rr + 0.02, 0.36 + 0.11 * math.sin(t)) for t in [i * math.pi / 5 for i in range(10)]]
        self.d.polygon([proj(rot(p, self.yaw)) for p in hub2], fill=CHROME[4] + (255,))
        self.px((f0, rr + 0.02, 0.34), CHROME[1])

    def body(self):
        W = self.wreck
        fF = 1.75 if W else 2.3          # the wreck's front is pushed in
        plan = [(fF, -0.74), (fF, 0.74), (fF - 0.12, 0.86), (-2.2, 0.86), (-2.3, 0.76), (-2.3, -0.76), (-2.2, -0.86), (fF - 0.12, -0.86)]
        h0, h1 = 0.28, 0.82
        drawn = {}
        for i in range(len(plan)):
            a, b = plan[i], plan[(i + 1) % len(plan)]
            q = [(a[0], a[1], h0), (b[0], b[1], h0), (b[0], b[1], h1), (a[0], a[1], h1)]
            drawn[i] = self.face(q, PAINT, center=(0, 0, 0.55)) and q
        top = [(p[0], p[1], h1) for p in plan]
        self.face(top, PAINT, base=-1, center=(0, 0, 0.55))
        return plan, drawn, fF

    def cabin(self, fF):
        W = self.wreck
        b0, b1, t0, t1 = 0.85, -1.25, 0.32, -0.9
        if W:
            b0 = 0.62
        rb, rt = 0.80, 0.70
        hb, ht = 0.82, 1.36 if not W else 1.30
        B = [(b0, -rb, hb), (b0, rb, hb), (b1, rb, hb), (b1, -rb, hb)]
        T = [(t0, -rt, ht), (t0, rt, ht), (t1, rt, ht), (t1, -rt, ht)]
        faces = {
            'wind': [B[0], B[1], T[1], T[0]],
            'rside': [B[1], B[2], T[2], T[1]],
            'rear': [B[2], B[3], T[3], T[2]],
            'lside': [B[3], B[0], T[0], T[3]],
            'roof': [T[3], T[2], T[1], T[0]],
        }
        seen = {}
        for k, q in faces.items():
            ramp = PAINT if k == 'roof' else GLASS
            seen[k] = self.face(q, ramp, base=(0 if k == 'roof' else -1), center=(-0.3, 0, 1.0)) and q
        # pillars: the glass framed in paint, a lit streak across each pane
        for k in ('rside', 'lside'):
            q = seen.get(k)
            if not q:
                continue
            a, b, c, d = q
            m0 = [(a[i] * 0.55 + b[i] * 0.45) for i in range(3)]; m1 = [(d[i] * 0.55 + c[i] * 0.45) for i in range(3)]
            self.line_on(tuple(m0), tuple(m1), PAINT[2], 2)                      # the B pillar
            self.line_on(a, d, PAINT[3], 2); self.line_on(b, c, PAINT[2], 2)       # A and C pillars
            s0 = [(a[i] * 0.8 + b[i] * 0.2) for i in range(3)]; s1 = [(d[i] * 0.55 + c[i] * 0.45) for i in range(3)]
            self.line_on(tuple(s0), tuple(s1), GLASS[4], 1)                      # a streak of sky in the glass
        if seen.get('wind'):
            a, b, c, d = seen['wind']
            self.line_on(a, b, PAINT[3], 1)
            s0 = [(a[i] * 0.25 + b[i] * 0.75) for i in range(3)]; s1 = [(d[i] * 0.6 + c[i] * 0.4) for i in range(3)]
            self.line_on(tuple(s0), tuple(s1), GLASS[5] if not self.wreck else (230, 236, 240), 1)
            if self.wreck:                                                        # the windscreen starred where a head hit it
                cx = [(a[i] + b[i] + c[i] + d[i]) / 4 for i in range(3)]
                for t in range(7):
                    ang = t * 0.9
                    e = (cx[0] + 0.18 * math.cos(ang), cx[1] + 0.45 * math.sin(ang), cx[2] + 0.12 * math.sin(ang * 1.3))
                    self.line_on(tuple(cx), e, (210, 220, 226), 1)
        if seen.get('rear'):
            a, b, c, d = seen['rear']
            s0 = [(a[i] * 0.7 + b[i] * 0.3) for i in range(3)]; s1 = [(d[i] * 0.4 + c[i] * 0.6) for i in range(3)]
            self.line_on(tuple(s0), tuple(s1), GLASS[4], 1)
        if seen.get('roof'):
            a, b, c, d = seen['roof']
            self.line_on(d, c, PAINT[5], 1)                                       # the roof's lit front edge

    def details(self, plan, drawn, fF):
        W = self.wreck
        # the right (south at yaw 0) side: the one the camera sees for every frame we draw
        side = drawn.get(3)
        if side:
            # mud on the sill, ragged along its top
            for i in range(24):
                f = -2.15 + i * 0.18
                if f > fF - 0.2:
                    break
                top = 0.36 + 0.06 * math.sin(i * 1.7) + 0.04 * ((i * 7) % 3)
                self.quad_on((f, 0.861, 0.28), (f + 0.18, 0.861, 0.28), (f + 0.18, 0.861, top), (f, 0.861, top), col=MUD[1])
            # the chrome strip, door seams, handles
            self.line_on((fF - 0.25, 0.862, 0.56), (-2.2, 0.862, 0.56), CHROME[2], 1)
            for f in (0.82, -0.36, -1.24):
                self.line_on((f, 0.862, 0.32), (f, 0.862, 0.8), PAINT[1], 1)
            for f in (0.55, -0.62):
                self.line_on((f, 0.863, 0.69), (f - 0.16, 0.863, 0.69), CHROME[4], 1)
            # the side mirror on its stalk
            self.quad_on((0.78, 0.86, 0.86), (0.6, 0.86, 0.86), (0.6, 1.0, 0.96), (0.78, 1.0, 0.96), col=PAINT[2])
            self.quad_on((0.78, 1.0, 0.96), (0.6, 1.0, 0.96), (0.6, 1.0, 1.04), (0.78, 1.0, 1.04), col=PAINT[4])
        # the front face: headlights, grille, bumper
        front = drawn.get(0)
        if front:
            for s in (-1, 1):
                broken = W and s < 0
                self.quad_on((fF + 0.005, s * 0.46, 0.56), (fF + 0.005, s * 0.72, 0.56), (fF + 0.005, s * 0.72, 0.7), (fF + 0.005, s * 0.46, 0.7),
                             col=(HEADD if broken else HEAD))
            self.quad_on((fF + 0.005, -0.36, 0.52), (fF + 0.005, 0.36, 0.52), (fF + 0.005, 0.36, 0.72), (fF + 0.005, -0.36, 0.72), col=TYRE[2])
            for h in (0.57, 0.63, 0.69):
                self.line_on((fF + 0.006, -0.34, h), (fF + 0.006, 0.34, h), CHROME[2], 1)
        rear = drawn.get(4)
        if rear:
            for s in (-1, 1):
                self.quad_on((-2.305, s * 0.44, 0.56), (-2.305, s * 0.78, 0.56), (-2.305, s * 0.78, 0.72), (-2.305, s * 0.44, 0.72), col=TAIL)
                self.line_on((-2.306, s * 0.44, 0.6), (-2.306, s * 0.78, 0.6), TAILD, 1)
            self.line_on((-2.306, -0.25, 0.66), (-2.306, 0.25, 0.66), CHROME[3], 1)   # the trunk lip
        # bumpers: chrome bands wrapping the ends, lit along the top
        for f0, f1 in ((fF, fF + 0.1), (-2.3, -2.4)):
            q = [(f0, -0.84, 0.30), (f1, -0.84, 0.30), (f1, 0.84, 0.30), (f0, 0.84, 0.30)]
            for (a, b) in ((0, 1), (1, 2), (2, 3), (3, 0)):
                pa, pb = q[a], q[b]
                self.face([pa, pb, (pb[0], pb[1], 0.46), (pa[0], pa[1], 0.46)], CHROME, center=((f0 + f1) / 2, 0, 0.38))
            self.face([(f0, -0.84, 0.46), (f1, -0.84, 0.46), (f1, 0.84, 0.46), (f0, 0.84, 0.46)], CHROME, base=-2, center=((f0 + f1) / 2, 0, 0.38))
        # the hood line, the hood's crease and lit nose, the trunk lid, rust round the arches, and the wreck's buckled hood
        hood = 0.86 if not W else 0.62
        self.line_on((hood, -0.8, 0.821), (hood, 0.8, 0.821), PAINT[2], 1)
        self.line_on((fF - 0.02, -0.72, 0.822), (fF - 0.02, 0.72, 0.822), PAINT[5], 1)
        self.line_on((fF - 0.1, 0.0, 0.822), (hood + 0.05, 0.0, 0.822), PAINT[4], 1)
        self.line_on((-1.3, -0.78, 0.821), (-1.3, 0.78, 0.821), PAINT[2], 1)
        self.line_on((-2.25, -0.7, 0.822), (-2.25, 0.7, 0.822), PAINT[4], 1)
        if drawn.get(3):
            for f0 in (1.42, -1.42):
                for k, (df, dh) in enumerate(((-0.48, 0.5), (-0.44, 0.58), (0.46, 0.52), (0.5, 0.46), (-0.5, 0.44))):
                    self.px((f0 + df, 0.863, dh), (110, 54, 30) if k % 2 else (84, 40, 24))
        if W:
            # the hood buckled up into a ridge across its middle, one face catching the light, one in shadow
            fm = (hood + fF) / 2
            self.face([(hood, -0.8, 0.83), (hood, 0.8, 0.83), (fm, 0.8, 1.0), (fm, -0.8, 1.0)], PAINT, center=(fm, 0, 0.5))
            self.face([(fm, -0.8, 1.0), (fm, 0.8, 1.0), (fF, 0.74, 0.8), (fF, -0.74, 0.8)], PAINT, center=(fm, 0, 0.5))
            self.line_on((fm, -0.8, 1.0), (fm, 0.8, 1.0), PAINT[6], 1)
            for i, f in enumerate((hood + 0.12, fm + 0.2)):
                self.line_on((f, -0.6, 0.9), (f + 0.08, 0.5, 0.92), PAINT[1], 1)
            # leaves fallen on the roof and the trunk
            for k, (f, r) in enumerate(((-0.4, -0.3), (-0.1, 0.2), (-0.7, 0.4), (-1.8, -0.2), (-1.6, 0.5), (0.1, -0.5))):
                h = 1.37 if -0.9 < f < 0.3 else 0.83
                self.px((f, r, h), ((176, 106, 40), (138, 58, 28), (200, 144, 46))[k % 3])

    def arches(self):
        for f0 in (1.42, -1.42):
            pts = [(f0 + 0.42 * math.cos(t), 0.862, 0.30 + 0.42 * math.sin(t)) for t in [i * math.pi / 10 for i in range(11)]]
            self.d.polygon([proj(rot(p, self.yaw)) for p in pts], fill=PAINT[0] + (255,))

    def door_open(self):
        """the near front door hanging open on its hinge, swung out about 40 degrees: its inside face and the window frame"""
        hf, hr = 0.8, 0.87
        a = math.radians(42); L = 1.05
        ef, er = hf - L * math.cos(a), hr + L * math.sin(a)
        q = [(hf, hr, 0.32), (ef, er, 0.32), (ef, er, 0.82), (hf, hr, 0.82)]
        self.face(q, PAINT, center=(hf - 0.5, hr - 0.5, 0.55))
        self.line_on((hf, hr, 0.5), (ef, er, 0.5), PAINT[1], 1)
        top = [(hf, hr, 0.82), (ef + 0.25 * math.cos(a), er - 0.25 * math.sin(a), 0.82), (ef + 0.3 * math.cos(a), er - 0.3 * math.sin(a), 1.25), (hf - 0.1, hr, 1.3)]
        ws = [proj(rot(p, self.yaw)) for p in top]
        self.d.line(ws + [ws[0]], fill=PAINT[3] + (255,), width=1)
        self.line_on(top[1], top[3], (200, 214, 222), 1)                         # what is left of its glass

    def draw(self):
        self.shadow()
        for f0 in (1.42, -1.42):
            self.wheel(f0, -0.80, False)                  # far wheels first, only their bottoms show
        plan, drawn, fF = self.body()
        if drawn.get(3):
            self.arches()
        self.cabin(fF)
        self.details(plan, drawn, fF)
        if self.wreck:
            self.door_open()
        if self.beaten:   # patched up to run: a primer-grey door off another car, the windscreen cracked, the hood dented
            PR = hexr(['#3a3a3a', '#555452', '#6e6c68'])
            self.quad_on((0.8, 0.864, 0.3), (-0.34, 0.864, 0.3), (-0.34, 0.864, 0.8), (0.8, 0.864, 0.8), col=PR[1])
            self.line_on((0.8, 0.865, 0.79), (-0.34, 0.865, 0.79), PR[2], 1)
            self.line_on((0.55, 0.866, 0.69), (0.39, 0.866, 0.69), CHROME[3], 1)
            self.line_on((0.85, -0.5, 0.86), (0.4, 0.3, 1.2), (220, 228, 232), 1)
            for f in (1.3, 1.7):
                self.line_on((f, -0.3, 0.822), (f + 0.12, 0.2, 0.822), PAINT[1], 1)
        if math.cos(self.yaw) > 0.05:
            for f0 in (1.42, -1.42):
                if self.wreck and f0 > 0:
                    self.wheel(f0 - 0.15, 0.80, True)      # the front wheel shoved back into its arch
                else:
                    self.wheel(f0, 0.80, True)
        return outline(self.im)


def outline(im):
    W, H = im.size
    src = im.load(); out = im.copy(); o = out.load()
    for y in range(H):
        for x in range(W):
            if src[x, y][3] > 200:
                continue
            for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and src[X, Y][3] > 200 and src[X, Y][:3] != (8, 6, 10):
                    r, g, b, _ = src[X, Y]
                    o[x, y] = (max(10, int(r * .3)), max(8, int(g * .26)), max(14, int(b * .34)), 255)
                    break
    return out


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'beaten':
        im = Car(0.0, beaten=True).draw()
        im.save('out/car212_beaten.png'); print('out/car212_beaten.png', im.size)
    elif len(sys.argv) > 1 and sys.argv[1] == 'wreck':
        im = Car(0.95, wreck=True).draw()
        im.save('out/car212_wreck.png'); print('out/car212_wreck.png', im.size)
    else:
        strip = Image.new('RGBA', (FW * len(YAWS), FH), (0, 0, 0, 0))
        for i, y in enumerate(YAWS):
            strip.alpha_composite(Car(y).draw(), (i * FW, 0))
        strip.save('out/car212.png'); print('out/car212.png', strip.size, len(YAWS), 'frames')
