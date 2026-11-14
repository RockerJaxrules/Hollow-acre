# Shared scene maths for the t353 arms (r4): the cab, the rim, the bind pose, each hand's own place on the rim,
# the finger contact cascade and the thumb IK, per side.
# Car space, metres (three.js: y up, -z forward). Blender: B(p) = (x, -z, y).
# The bind is the anatomical rest hand (straight fingers, rest thumb) set at the left hand's place; each side then has
# its own rigid hand placement (HD), finger curls (contact cascade, joint limits) and thumb pose (IK, joint limits).
# The right arm is the same mesh mirrored, so its place is worked out in left-hand space (the mirror of the clock).
import numpy as np, sys, os
sys.path.insert(0, os.environ.get('B3D_LIB', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib')))
import hands
from hands import nrm, perp, rot
from scipy.optimize import minimize

EYE = np.array([-.36, 1.2, 0.]); WC = np.array([-.36, .9, -.47]); TILT = -.42
RR, RT = .185, .0165
# shoulder and arm: an adult man's upper arm (shoulder joint to elbow) ~.34 and forearm (elbow to wrist) ~.27; leaning a
# little toward the windscreen in the blizzard, so the elbows bend and drop and the forearms rise to the wheel
_sh = [float(x) for x in os.environ.get('ARM_SH', '-.2,.97,.06').split(',')]
SH = np.array([EYE[0] + _sh[0], _sh[1], _sh[2]]); L_UP, L_FORE = (float(x) for x in os.environ.get('ARM_L', '.34,.27').split(','))
POLE = nrm([-1., -.55, .05])                                  # elbows low and out: the forearms come in from below and outside
c, s = np.cos(TILT), np.sin(TILT)
RX = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
AXIS = RX @ np.array([0, 0, 1.])
BM = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0.]])          # car -> Blender
UP = np.array([0, 1., 0])
def B(p): return np.asarray(p) @ BM.T
def B4(M):
    T = np.eye(4); T[:3, :3] = BM; return T @ M @ np.linalg.inv(T)
def rimf(a):
    """rim frame at clock angle a (pi/2 = twelve, pi = nine): origin on the rim's centre line, x along the rim toward
    twelve (left half), y outward, z toward the driver"""
    x = RX @ np.array([np.sin(a), -np.cos(a), 0]); y = RX @ np.array([np.cos(a), np.sin(a), 0]); return WC + RR * y, x, y, AXIS.copy()
def rim_angle(p):
    q = RX.T @ (np.asarray(p) - WC); return np.arctan2(q[1], q[0])
def rim_dist(P):
    q = np.atleast_2d(P) - WC; h = q @ AXIS; rho = np.linalg.norm(q - np.outer(h, AXIS), axis=1); return np.sqrt((rho - RR) ** 2 + h ** 2)
def wheel_local(P):
    return (np.atleast_2d(P) - WC) @ RX                     # x right, y up (in the wheel plane), z toward the driver
def hub_clear(P, r):
    """clearance (m) from the boss (r .064, front face z .022) and the three spokes (z -.014..-.002)"""
    q = wheel_local(P); rho = np.linalg.norm(q[:, :2], axis=1)
    out = np.maximum(rho - .064, q[:, 2] - .022)
    for ax in (0, np.pi, -np.pi / 2):
        u = q[:, 0] * np.cos(ax) + q[:, 1] * np.sin(ax); v = -q[:, 0] * np.sin(ax) + q[:, 1] * np.cos(ax)
        sp = np.maximum.reduce([abs(v) - .014, abs(q[:, 2] + .008) - .006, np.where(u < .055, .055 - u, u - (RR - .005))])
        out = np.minimum(out, sp)
    return out - r
def ik(S, Wp, a, b, pole):
    d = Wp - S; L = min(np.linalg.norm(d), a + b - 1e-3); d = nrm(d)
    x = (a * a - b * b + L * L) / (2 * L); h = np.sqrt(max(0, a * a - x * x)); p = nrm(pole - d * (pole @ d))
    return S + d * x + p * h
def Rp(P, A, th):
    M = np.eye(4); R = rot(A, th); M[:3, :3] = R; M[:3, 3] = P - R @ P; return M
def Rm(P, R):
    M = np.eye(4); M[:3, :3] = R; M[:3, 3] = P - R @ P; return M
def ang(u, v): return np.degrees(np.arccos(np.clip(nrm(u) @ nrm(v), -1, 1)))

# ------------------------------------------------------------------ each hand's place (studied from driver's-seat photos)
MID = np.array(hands.FINGERS['middle']['mcp']) * .01
def place(a, nd, fh, h, s_, t=0.0):
    """hand frame from rim-frame directions: nd = back of the hand, fh = wrist -> knuckles (both given as (x, y, z) in
    the rim frame at a); the middle knuckle sits h above the rim's surface along nd, s_ along fh, t along the rim"""
    o, gx, gy, gz = rimf(a); R = np.column_stack([gx, gy, gz])
    ND = nrm(R @ np.asarray(nd, float)); FH = perp(R @ np.asarray(fh, float), ND); XH = np.cross(FH, ND)
    M = o + ND * (RT + h) + FH * s_ + gx * t
    W = M - (XH * MID[0] + FH * MID[1] + ND * MID[2])
    HM = np.eye(4); HM[:3, 0], HM[:3, 1], HM[:3, 2], HM[:3, 3] = XH * .01, FH * .01, ND * .01, W
    return HM
def hooked(a, delta, beta, h, s_, t=0., roll=0.):
    """over the top: back of the hand delta from outward toward the driver, fingers yawed beta toward twelve, the
    hand rolled about its own axis"""
    d, b = np.radians(delta), np.radians(beta)
    nd = np.array([0, np.cos(d), np.sin(d)]); f0 = np.array([0, np.sin(d), -np.cos(d)]); fh = np.cos(b) * f0 + np.sin(b) * np.array([1., 0, 0])
    nd = rot(nrm(fh - nd * (fh @ nd)), np.radians(roll)) @ nd
    return place(a, nd, fh, h, s_, t)
def draped(a, yaw, pitch, roll, h, s_, t=0.):
    """relaxed: from back of the hand to the driver and fingers to the hub, the fingers yawed toward twelve, pitched
    (- = drooping toward the dash) and the hand rolled about its own axis"""
    nd, fh = np.array([0, 0, 1.]), np.array([0, -1., 0]); xh = np.cross(fh, nd)
    R = rot(nd, np.radians(yaw)); fh, xh = R @ fh, R @ xh
    R = rot(xh, np.radians(pitch)); fh, nd = R @ fh, R @ nd
    R = rot(fh, np.radians(roll)); nd = R @ nd
    return place(a, nd, fh, h, s_, t)
# 10 and 2 (owner: "look up 10 and 2"): each hand a relaxed fist round the rim, the rim running diagonally through it
# (in at the pinky side, out between thumb and index), the back of the hand to the driver, the wrist a little extended
# and tilted toward the pinky. The right is worked out mirrored (2 o'clock -> 10 in left-hand space) and set a little
# differently: lower on the rim, rolled further, a touch tighter.
# r5: placed by screen-space measures against the reference photo (knuckle row along the rim on screen, the wrist
# straight on screen, the left forearm rising at a slant and the right nearly upright, the left hand a little lower)
PL = dict(L=dict(kind='hooked', a=.90 * np.pi, delta=40, beta=45, roll=0, h=.0128, s=.022, t=0., pole=(-.3, -1, .15)),
          R=dict(kind='hooked', a=.87 * np.pi, delta=50, beta=40, roll=-15, h=.0128, s=.022, t=0., pole=(.3, -1, .2)))
import json as _json
for _k in ('L', 'R'):
    if os.environ.get('PL_' + _k): PL[_k].update(_json.loads(os.environ['PL_' + _k]))
def hand_matrix(p):
    if p['kind'] == 'draped': return draped(p['a'], p['yaw'], p['pitch'], p['roll'], p['h'], p['s'], p['t'])
    return hooked(p['a'], p['delta'], p['beta'], p['h'], p['s'], p['t'], p.get('roll', 0.))
def seat(M, press=.0008, iters=6):
    """slide the hand along the back-of-hand normal until the palm and finger bases just rest on the rim (pressed
    `press` into the leather)"""
    Hc = hands.build_hand(np.array([0, -1., 0])); tg = Hc['tags']
    pick = np.array([t == 'palm' or t.endswith(':p') for t in tg]) & (Hc['V'][:, 1] > 2.0)
    P = Hc['V'][pick]; M = M.copy(); nd = nrm(M[:3, 2])
    for _ in range(iters):
        cl = (rim_dist(P @ M[:3, :3].T + M[:3, 3]) - RT).min()
        M[:3, 3] += nd * (-cl - press)
    return M
HMS = {k: seat(hand_matrix(v), v.get('press', .0008)) for k, v in PL.items()}
HM = HMS['L']                                                  # the bind: the rest hand at the left hand's place
POLES = {k: nrm(v.get('pole', POLE)) for k, v in PL.items()}; POLE = POLES['L']
XH, FH, ND = (nrm(HM[:3, k]) for k in range(3)); W = HM[:3, 3].copy()
A_GRIP = PL['L']['a']; O, GX, GY, GZ = rimf(A_GRIP)
M_MID = W + XH * MID[0] + FH * MID[1] + ND * MID[2]
E = ik(SH, W, L_UP, L_FORE, POLE)
def to_car(Pc, M=None): M = HM if M is None else M; return np.asarray(Pc) @ M[:3, :3].T + M[:3, 3]
def dir_car(v, M=None): M = HM if M is None else M; return nrm(np.asarray(v) @ M[:3, :3].T)
def to_can(Pc, M=None):
    if M is not None: return (np.asarray(Pc) - M[:3, 3]) @ np.linalg.inv(M[:3, :3]).T
    return (np.asarray(Pc) - W) @ np.column_stack([XH, FH, ND]) * 100
def dir_can(v): return nrm(np.asarray(v) @ np.column_stack([XH, FH, ND]))
DFC = dir_can(E - W)                                           # wrist -> elbow in the hand frame (bind wrist bend)
H = hands.build_hand(DFC)
HD = {k: v @ np.linalg.inv(HM) for k, v in HMS.items()}       # bind -> each side's place (car, rigid)

# ------------------------------------------------------------------ bones (car space)
FORE_C = [to_car(p) for p in H['fore']]
FORE_T = [0, .022, .05, .08, .11, .14]
def fore_at(t):
    if t <= FORE_T[-1]:
        i = max(0, np.searchsorted(FORE_T, t) - 1); i = min(i, len(FORE_T) - 2); u = (t - FORE_T[i]) / (FORE_T[i + 1] - FORE_T[i])
        return FORE_C[i] + (FORE_C[i + 1] - FORE_C[i]) * u
    return FORE_C[-1] + dir_car(DFC) * (t - FORE_T[-1])
ELB = fore_at(L_FORE)
def bone_list():
    f = H['fingers']; t = H['thumb']
    MIDF = fore_at(.12)
    bl = [('upper', SH, ELB, .055), ('fore', ELB, MIDF, .036), ('twist', MIDF, W, .031), ('hand', W, to_car(f['middle']['joints'][0]), .028)]
    for n in hands.ORDER:
        J = [to_car(p) for p in f[n]['joints']]; r = f[n]['r']
        for k in range(3): bl.append((f'{n}{k+1}', J[k], J[k + 1], r[k] * .0088))
    J = [to_car(p) for p in t['joints']]
    for k in range(3): bl.append((f'thumb{k+1}', J[k], J[k + 1], t['r'][k] * .0095))
    return bl, ELB, MIDF
BONES, ELBOW, MIDF = bone_list()
PARENT = {'upper': None, 'fore': 'upper', 'twist': 'fore', 'hand': 'twist', 'thumb1': 'hand', 'thumb2': 'thumb1', 'thumb3': 'thumb2'}
for n in hands.ORDER: PARENT.update({f'{n}1': 'hand', f'{n}2': f'{n}1', f'{n}3': f'{n}2'})
def joint_planes():
    f = H['fingers']; t = H['thumb']; J = []
    for n in hands.ORDER:
        jj = [to_car(p) for p in f[n]['joints']]; d = dir_car(f[n]['d'])
        J += [('hand', f'{n}1', jj[0] + d * .003, d, .0055), (f'{n}1', f'{n}2', jj[1], d, .0045), (f'{n}2', f'{n}3', jj[2], d, .0032)]
    tj = [to_car(p) for p in t['joints']]; td = [dir_car(v) for v in t['d']]
    J += [('hand', 'thumb1', tj[0] + td[0] * .012, td[0], .012), ('thumb1', 'thumb2', tj[1], nrm(td[0] + td[1]), .0045), ('thumb2', 'thumb3', tj[2], nrm(td[1] + td[2]), .0032)]
    J += [('twist', 'hand', W - FH * .004, nrm(FH - dir_car(DFC)), .016), ('fore', 'twist', MIDF, -dir_car(DFC), .045), ('upper', 'fore', ELBOW, nrm(dir_car(DFC) * -1 + nrm(SH - ELBOW) * -1) * -1, .045)]
    return J

# ------------------------------------------------------------------ fingers: each joint closes until the finger meets the rim
TILT_CONV = {'pinky': 3, 'ring': 1.5, 'middle': .5, 'index': 0}
def flex_axis(n):
    f = H['fingers'][n]; t = np.radians(TILT_CONV[n]); return dir_car(-np.cos(t) * f['L'] - np.sin(t) * f['d'])
SPREAD_AX = -dir_car([0, 0, 1.])                               # + spread = toward the thumb, about the back-of-hand normal
def finger_fk(n, th, spread=0.0):
    f = H['fingers'][n]; J = [to_car(p) for p in f['joints']]; A = flex_axis(n)
    D = [Rp(J[0], SPREAD_AX, spread)]
    for k in range(3): D.append(D[-1] @ Rp(J[k], A, th[k]))
    pts = [J[0]] + [(D[k + 1] @ np.append(J[k + 1], 1))[:3] for k in range(3)]
    return pts, D[1:]
def finger_clear(n, th, from_seg, side, spread=0.0, press=.0012):
    pts, _ = finger_fk(n, th, spread); hd = HD[side]; r = H['fingers'][n]['r']; worst = 1e9
    for k in range(from_seg, 3):
        for u in np.linspace(0, 1, 9):
            p = pts[k] + (pts[k + 1] - pts[k]) * u; rad = (r[k] + (r[k + 1] - r[k]) * u) * .0092
            q = (hd @ np.append(p, 1))[:3]
            worst = min(worst, rim_dist(q)[0] - RT - rad + press, hub_clear(q, rad)[0] + .001)
    return worst
# per side: the most each joint may close (deg; joint limits, and for the draped hand the relaxed curve it settles
# into), how far it eases off the contact, and a little spread. Not clenched; the left is the looser hand.
FING = {'L': dict(cap={'pinky': (80, 90, 70), 'ring': (78, 90, 70), 'middle': (75, 90, 70), 'index': (70, 90, 70)},
                  ease={'pinky': (3, 4, 3), 'ring': (3, 4, 4), 'middle': (3, 4, 4), 'index': (2, 5, 6)},
                  spread={'pinky': -2.5, 'ring': -1., 'middle': 0., 'index': 3.}, press=.0012),
        'R': dict(cap={'pinky': (80, 90, 70), 'ring': (78, 90, 70), 'middle': (75, 90, 70), 'index': (70, 90, 70)},
                  ease={'pinky': (2, 3, 2), 'ring': (2, 3, 3), 'middle': (2, 3, 3), 'index': (1, 4, 5)},
                  spread={'pinky': -2., 'ring': -1., 'middle': 0., 'index': 2.5}, press=.0012)}
# a fist closes all three joints together (MCP : PIP : DIP about 1 : 1.4 : .5), then the distal joints settle
CLOSE = {'index': (55, 75, 28), 'middle': (60, 80, 32), 'ring': (64, 84, 36), 'pinky': (68, 86, 40)}
def solve_fingers(side):
    P = FING[side]; G = {}
    for n in hands.ORDER:
        sp = np.radians(P['spread'][n]); th = [0., 0., 0.]
        if P.get('coupled', True):
            prof = np.radians(CLOSE[n])
            for t_ in np.arange(0, 1.0001, .01):
                tt = list(prof * t_)
                if finger_clear(n, tt, 0, side, sp, P['press']) < 0: break
                th = tt
            for k in (1, 2):
                for deg in np.arange(np.degrees(th[k]), P['cap'][n][k] + .5, .5):
                    tt = list(th); tt[k] = np.radians(deg)
                    if finger_clear(n, tt, k, side, sp, P['press']) < 0: break
                    th = tt
            G[n] = [max(0., a - np.radians(e)) for a, e in zip(th, P['ease'][n])]
            continue
        for deg in np.arange(0, -25.5, -.5):                   # a finger lying along the rim lifts off it first
            th[0] = np.radians(deg)
            if finger_clear(n, th, 0, side, sp, P['press']) >= 0: break
        k0 = 1 if th[0] < 0 else 0
        for k in range(k0, 3):
            for deg in np.arange(0, P['cap'][n][k] + .5, .5):
                tt = list(th); tt[k] = np.radians(deg)
                if finger_clear(n, tt, k, side, sp, P['press']) < 0: break
                th = tt
        G[n] = [a if a < 0 else max(0., a - np.radians(e)) for a, e in zip(th, P['ease'][n])]
    return G
GRIP_SIDE = {k: solve_fingers(k) for k in ('L', 'R')}
SPREAD = {k: {n: float(np.radians(FING[k]['spread'][n])) for n in hands.ORDER} for k in FING}

# ------------------------------------------------------------------ thumb: IK within joint limits, per side
# canonical cm; the CMC turns (abduction, flexion = palmar abduction, pronation), MCP and IP are hinges.
_T = H['thumb']; TJ = [np.array(p, float) for p in _T['joints']]; TD = [nrm(v) for v in _T['d']]; TZ = nrm(_T['Z'])
_KH = nrm(np.cross(TZ, TD[0]))                                 # MCP/IP hinge: bends toward the pad
_ZC = np.array([0, 0, 1.])
LIM = dict(abd=(-30, 32), flex=(-8, 38), pron=(-30, 25), mcp=(-10, 55), ip=(-3, 75))
QN = ('abd', 'flex', 'pron', 'mcp', 'ip')
def thumb_fk(q):
    abd, fl, pr, m, i = np.radians(q)
    R1 = rot(_ZC, -abd) @ rot(nrm(np.cross(_ZC, TD[0])), fl) @ rot(TD[0], pr)
    D1 = Rm(TJ[0], R1); D2 = D1 @ Rp(TJ[1], _KH, m); D3 = D2 @ Rp(TJ[2], _KH, i)
    pts = [TJ[0], (D1 @ np.append(TJ[1], 1))[:3], (D2 @ np.append(TJ[2], 1))[:3], (D3 @ np.append(TJ[3], 1))[:3]]
    return pts, (D1, D2, D3)
T_RAD = (1.05, 1.0, .88)
def thumb_samples(pts):
    out = []
    for k in range(3):
        for u in np.linspace(0, 1, 7)[(2 if k == 0 else 0):]:
            out.append((pts[k] + (pts[k + 1] - pts[k]) * u, T_RAD[k]))
    return out
def palm_inside(p):
    """> 0 when a canonical point is inside the palm/finger slab (so the thumb cannot pass through the hand)"""
    x, y, z = p
    return min(x + 4.2, 3.0 - x, y - 2.5, 9.5 - y, z + 1.4, 1.6 - z)        # the palm and finger bases (not the thenar)
def thumb_cost(q, side, tgt, aim, w_aim):
    pts, Ds = thumb_fk(q); M = HMS[side]; c = 0.
    nail = dir_car(Ds[2][:3, :3] @ TZ, M); c += 1.0 * (1 - nail @ nrm(EYE - to_car(pts[3], M)))      # its nail shows to the driver
    c += .003 * (q[4] - 10) ** 2 + .004 * max(0., q[3] - 6) ** 2                                                             # nearly straight (IP only a little bent)
    if True:                                                   # never hooked round the rim: it stays on the driver side
        for p, r in thumb_samples(pts):
            ql = wheel_local(to_car(p, M))[0]; rho = np.hypot(ql[0], ql[1])
            if abs(rho - RR) < RT + r * .01 + .004 and ql[2] < RT * .6: c += 2e4 * (RT * .6 - ql[2]) ** 2
    tip_car = to_car(pts[3], M); c += (np.linalg.norm(tip_car - tgt) * 100) ** 2
    if aim is not None: c += w_aim * (1 - nrm(dir_car(pts[3] - pts[2], M)) @ aim) * 10
    for p, r in thumb_samples(pts):
        pc = to_car(p, M); cl = (rim_dist(pc)[0] - RT) * 100 - r + .12; cl = min(cl, hub_clear(pc, r * .01)[0] * 100)
        if cl < 0: c += 40 * cl * cl
        pin = palm_inside(p) + r * .6
        if pin > 0: c += 20 * pin * pin
    c += 2e-4 * np.sum(np.asarray(q) ** 2)
    return c
def solve_thumb(side, tgt, aim=None, w_aim=0.):
    best = None; bnds = [LIM[k] for k in QN]
    for x0 in ([0, 0, 0, 0, 0], [-10, 30, 10, 20, 20], [10, 15, 0, 10, 30], [-20, 45, 20, 30, 40], [0, 20, -10, 5, 10]):
        r = minimize(thumb_cost, x0, args=(side, tgt, aim, w_aim), method='L-BFGS-B', bounds=bnds)
        if best is None or r.fun < best.fun: best = r
    return best
def thumb_targets():
    out = {}
    # left: low, toward the spoke at nine, tucked behind (dash side of) the fingers, in front of the spoke
    M = HMS['L']; nd, xh = nrm(M[:3, 2]), nrm(M[:3, 0])
    pts, _ = finger_fk('index', GRIP_SIDE['L']['index'], SPREAD['L']['index']); pts = [(HD['L'] @ np.append(p, 1))[:3] for p in pts]
    # 10 and 2: the thumb lies along the top and driver face of the rim pointing up toward 12, its tip at the side of the
    # index finger's middle segment, so thumb and index close the loop round the rim
    for side in ('L', 'R'):
        M = HMS[side]; xh = nrm(M[:3, 0])
        pts, _ = finger_fk('index', GRIP_SIDE[side]['index'], SPREAD[side]['index']); pts = [(HD[side] @ np.append(p, 1))[:3] for p in pts]
        # flat along the rim: the thumb's knuckle onto the rim's driver face, and its tip a phalanx-length further along
        # the rim toward 12 (so it lies within a few degrees of the tangent), on the driver face
        am = rim_angle(to_car(TJ[1], M)); o, gx, gy, gz = rimf(am - float(os.environ.get('TH_AHEAD', '.05')) / RR)
        ph = np.radians(70 if side == 'L' else 80)
        out[side] = (o + (np.cos(ph) * gy + np.sin(ph) * gz) * (RT + .0082), gx)
    return out
TGT = thumb_targets()
THUMB_Q = {}
for _side in ('L', 'R'):
    THUMB_Q[_side] = solve_thumb(_side, TGT[_side][0], TGT[_side][1], float(os.environ.get('TH_AIM', '6')) if TGT[_side][1] is not None else 0.).x
# The bind thumb sits between the two working poses (skinning then only moves it half as far, and the web between
# thumb and index never folds); each side's bone deltas take it from there. Canonical cm rigid -> car: D_car = HM D HM^-1
THUMB_QB = (THUMB_Q['L'] + THUMB_Q['R']) / 2
_, _DB = thumb_fk(THUMB_QB)
H = hands.build_hand(DFC, thumb_dirs=[_DB[k][:3, :3] @ TD[k] for k in range(3)], thumb_z=_DB[0][:3, :3] @ TZ)
BONES, ELBOW, MIDF = bone_list()
THUMB_D = {k: [HM @ D @ np.linalg.inv(DB) @ np.linalg.inv(HM) for D, DB in zip(thumb_fk(THUMB_Q[k])[1], _DB)] for k in THUMB_Q}

# ------------------------------------------------------------------ pose
HAND = {k: dict(HD=HD[k]) for k in HD}
def pose_deltas(side='L', curl=1.0, theta=0.0):
    """world (car, or mirrored car for the right hand) delta per bone: hand in its own place on the rim, turned by
    theta, fingers closed by `curl` of the solved grip, thumb in this hand's pose, arm by two-bone IK"""
    D = {}
    Dh = Rp(WC, AXIS, theta) @ HD[side]
    D['hand'] = Dh
    for n in hands.ORDER:
        _, Df = finger_fk(n, [a * curl for a in GRIP_SIDE[side][n]], SPREAD[side][n])
        for k in range(3): D[f'{n}{k+1}'] = Dh @ Df[k]
    for k in range(3): D[f'thumb{k+1}'] = Dh @ THUMB_D[side][k]
    Wp = (Dh @ np.append(W, 1))[:3]; Ep = ik(SH, Wp, np.linalg.norm(ELB - SH), np.linalg.norm(W - ELB), POLES[side])
    def minarc(a, b):
        a, b = nrm(a), nrm(b); ax = np.cross(a, b); s_ = np.linalg.norm(ax)
        return np.eye(3) if s_ < 1e-9 else rot(ax, np.arctan2(s_, a @ b))
    Ru = minarc(ELB - SH, Ep - SH); M = np.eye(4); M[:3, :3] = Ru; M[:3, 3] = SH - Ru @ SH; D['upper'] = M
    Rf = minarc(W - ELB, Wp - Ep); d1 = nrm(Wp - Ep)
    xh = perp(Dh[:3, :3] @ XH, d1); xf = perp(Rf @ XH, d1); tau = np.arctan2(np.cross(xf, xh) @ d1, xf @ xh)
    for nm, k in (('fore', .2), ('twist', .7)):
        R = rot(d1, tau * k) @ Rf; M = np.eye(4); M[:3, :3] = R; M[:3, 3] = Ep - R @ ELB; D[nm] = M
    return D

def report():
    out = []
    for side in ('L', 'R'):
        M = HMS[side]; xh, fh, nd = (nrm(M[:3, k]) for k in range(3)); w = M[:3, 3]; e = ik(SH, w, L_UP, L_FORE, POLES[side])
        fore = nrm(w - e); bend = ang(fore, fh)
        flex = np.degrees(np.arcsin(np.clip(-(fore @ nd), -1, 1))); dev = np.degrees(np.arcsin(np.clip(fore @ xh, -1, 1)))
        out.append(f'{side}: clock {12 - (np.degrees(PL[side]["a"]) - 90) / 30:.2f} (left half), wrist bend {bend:.0f} deg (ext {flex:.0f}, toward thumb {dev:.0f}), back of hand .up {nd @ UP:.2f} .driver {nd @ np.array([0, 0, 1.]):.2f}')
        for n in hands.ORDER:
            g = np.degrees(GRIP_SIDE[side][n]); out.append(f'   {n:6s} mcp {g[0]:5.1f} pip {g[1]:5.1f} dip {g[2]:5.1f}  clear {finger_clear(n, GRIP_SIDE[side][n], 0, side, SPREAD[side][n], 0) * 1000:5.1f} mm')
        q = THUMB_Q[side]; pts, _ = thumb_fk(q); tip = to_car(pts[3], M)
        out.append(f'   thumb abd {q[0]:.0f} flex {q[1]:.0f} pron {q[2]:.0f} mcp {q[3]:.0f} ip {q[4]:.0f}; tip off target {np.linalg.norm(tip - TGT[side][0]) * 100:.1f} cm; '
                   f'min clear {min((rim_dist(to_car(p, M))[0] - RT) * 100 - r for p, r in thumb_samples(pts)):.2f} cm, in palm {max(palm_inside(p) + r * .6 for p, r in thumb_samples(pts)):.2f}')
        hv = np.array([to_car(p, M) for p in H['V']]); keep = (H['V'][:, 1] > -1) & np.array([not t.startswith(('thumb', 'pinky', 'ring', 'middle', 'index')) for t in H['tags']])
        out.append(f'   palm cage vs rim: min {((rim_dist(hv[keep]) - RT) * 100).min():.2f} cm')
    return '\n'.join(out)
if __name__ == '__main__':
    print('bind W', W.round(3), 'E', E.round(3), 'DFC', DFC.round(3))
    print(report())
