"""Car components modelled one at a time, each in its own local frame with its own detail, then placed on the car.

This is how a detailed car model is built: every component is its own piece (a mirror is a shell, a recessed glass, an
arm and a base; a lamp is a housing, a reflector, a bulb and a lens), and the car is the assembly of those pieces.
References: _references/w201/ (study only).

Each part is placed by a frame: origin O and three axes (out, up, fwd) in the car frame (cm, X forward, Y right, Z up).
"""
import math

from mathutils import Vector

import car_exterior as ce


def rrect_ring(cu, cv, a, b, r, n_corner=6):
    """A rounded rectangle in a part's local (u, v) plane, centred at (cu, cv), half sizes a and b, corner radius r.
    Always 4 * (n_corner + 1) points, so rings of different sizes can be lofted together."""
    r = max(0.05, min(r, a - 0.05, b - 0.05))
    pts = []
    for (sx, sy), a0 in (((1, -1), -90), ((1, 1), 0), ((-1, 1), 90), ((-1, -1), 180)):
        cx, cy = cu + sx * (a - r), cv + sy * (b - r)
        for i in range(n_corner + 1):
            t = math.radians(a0 + 90 * i / n_corner)
            pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return pts


class Frame:
    def __init__(self, origin, out, up, fwd):
        self.o, self.out, self.up, self.fwd = Vector(origin), Vector(out).normalized(), Vector(up).normalized(), Vector(fwd).normalized()

    def p(self, u, v, w):
        return self.o + self.out * u + self.up * v + self.fwd * w


def door_mirror(sgn):
    """The 190's door mirror: a rounded black shell that domes toward the front, a slightly convex glass set into a
    rim, an arm out from a triangular base that fills the front corner of the door window."""
    ci = ce._ext()
    toe = math.radians(12.0)                                   # the glass looks back and a little in, at the driver
    fwd = Vector((math.cos(toe), sgn * math.sin(toe), 0.0))
    out = Vector((-math.sin(toe), sgn * math.cos(toe), 0.0))
    f = Frame((86.5, ce.YC + sgn * 90.5, 106.0), out, (0, 0, 1), fwd)
    A, B = 10.0, 6.4                                           # half width and half height of the shell
    # shell: from the recess behind the glass, out over the rim, back to a dome at the front
    rings = []
    for w, da, db in ((1.2, -0.9, -0.9), (0.0, -0.9, -0.9), (0.0, 0.0, 0.0), (1.0, 0.15, 0.1), (3.0, 0.1, 0.0),
                      (5.0, -0.5, -0.4), (6.6, -1.6, -1.2), (7.8, -3.2, -2.4), (8.5, -5.0, -3.8)):
        a, b = A + da, B + db
        cu = -0.25 * w                                         # the shell sweeps in a little toward the front
        rings.append([(f.p(u, v, w), None) for u, v in rrect_ring(cu, 0.0, a, b, min(3.2, b - 0.3))])
    ci.finish(ce.loft('mirror_shell', rings, ['blackplastic'], cap_bulge=(0.0, 0.6)))
    # the glass: a shallow dome sitting in the recess
    rings = []
    for w, k in ((0.62, 1.0), (0.5, 0.75), (0.42, 0.5), (0.38, 0.25), (0.36, 0.05)):
        a, b = (A - 1.1) * k, (B - 1.1) * k
        rings.append([(f.p(u, v, w), None) for u, v in rrect_ring(0.0, 0.0, a, b, 2.4 * k)])
    ce.loft('mirror_glass', rings, ['mirror'])
    # base: the triangle in the corner of the window, through the door's thickness, rounded
    ce.lean_prism('mirror_base', 'blackplastic', [(83.5, 98.6), (99.5, 98.6), (99.5, 111.0)], -3.5, 1.4, sgn, bevel=1.0)
    # arm: an oval stalk from the base out into the shell's inboard end
    s = Vector((93.0, ce.YC + sgn * (ce.glass_u(103.0) + 0.8), 103.0))
    h = f.p(-(A - 2.0), -1.0, 4.0)
    d = (h - s).normalized()
    side = d.cross(Vector((0, 0, 1))).normalized()
    upv = side.cross(d).normalized()
    rings = []
    for k in range(7):
        t = -0.1 + 1.2 * k / 6
        c = s + (h - s) * t
        sc = 1.0 - 0.15 * t
        rings.append([(c + side * math.cos(2 * math.pi * i / 16) * 2.6 * sc + upv * math.sin(2 * math.pi * i / 16) * 1.4 * sc, None)
                      for i in range(16)])
    ci.finish(ce.loft('mirror_arm', rings, ['blackplastic']))
