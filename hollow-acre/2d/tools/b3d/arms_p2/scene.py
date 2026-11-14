# Shared scene maths for the t353 arms: the cab, the rim, the bind pose of the left arm, the contact grip.
# Car space, metres (three.js: y up, -z forward). Blender: B(p) = (x, -z, y).
import numpy as np, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib'))
import hands
from hands import nrm, perp, rot

EYE = np.array([-.36, 1.2, 0.]); WC = np.array([-.36, .9, -.47]); TILT = -.42
RR, RT = .185, .0165
A_GRIP = .83 * np.pi
SH = np.array([EYE[0] - .2, 1.0, .085]); L_UP, L_FORE = .30, .262
POLE = nrm([-.55, -1., .1])
c, s = np.cos(TILT), np.sin(TILT)
RX = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
AXIS = RX @ np.array([0, 0, 1.])
BM = np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0.]])          # car -> Blender
def B(p): return np.asarray(p) @ BM.T
def B4(M):
    T = np.eye(4); T[:3, :3] = BM; return T @ M @ np.linalg.inv(T)
def rimf(a):
    x = RX @ np.array([np.sin(a), -np.cos(a), 0]); y = RX @ np.array([np.cos(a), np.sin(a), 0]); return WC + RR * y, x, y, AXIS.copy()
def rim_dist(P):
    q = np.atleast_2d(P) - WC; h = q @ AXIS; rho = np.linalg.norm(q - np.outer(h, AXIS), axis=1); return np.sqrt((rho - RR) ** 2 + h ** 2)
def ik(S, Wp, a, b, pole):
    d = Wp - S; L = min(np.linalg.norm(d), a + b - 1e-3); d = nrm(d)
    x = (a * a - b * b + L * L) / (2 * L); h = np.sqrt(max(0, a * a - x * x)); p = nrm(pole - d * (pole @ d))
    return S + d * x + p * h

DELTA, BETA = np.radians(42), np.radians(33)
O, GX, GY, GZ = rimf(A_GRIP)
ND = np.cos(DELTA) * GY + np.sin(DELTA) * GZ
F0 = np.sin(DELTA) * GY - np.cos(DELTA) * GZ
FH = np.cos(BETA) * F0 + np.sin(BETA) * GX
XH = np.cos(BETA) * GX - np.sin(BETA) * F0
mid = np.array(hands.FINGERS['middle']['mcp']) * .01
M_MID = O + ND * (RT + .0128) + FH * .004
W = M_MID - (XH * mid[0] + FH * mid[1] + ND * mid[2])
E = ik(SH, W, L_UP, L_FORE, POLE)
DFC = nrm([(E - W) @ XH, (E - W) @ FH, (E - W) @ ND])        # wrist -> elbow in the hand frame
HM = np.eye(4); HM[:3, 0], HM[:3, 1], HM[:3, 2], HM[:3, 3] = XH * .01, FH * .01, ND * .01, W   # canonical cm -> car m
def to_car(Pc): return np.asarray(Pc) @ HM[:3, :3].T + HM[:3, 3]
def dir_car(v): return nrm(np.asarray(v) @ np.column_stack([XH, FH, ND]).T)

def rim_point(arc, phi, rad):
    o, x, y, z = rimf(A_GRIP - arc / RR); return o + rad * (np.cos(phi) * y + np.sin(phi) * z)
def to_can(Pc): return (np.asarray(Pc) - W) @ np.column_stack([XH, FH, ND]) * 100
def dir_can(v): return nrm(np.asarray(v) @ np.column_stack([XH, FH, ND]))
# thumb: keep its natural spread from the palm; turn the metacarpal only as far as it takes to bring the
# thumb's knuckle onto the inner/near face of the rim; the phalanges then flex until they touch the rim
T_REST = [nrm(hands.THUMB['d1'])]
_cm = to_car(np.array(hands.THUMB['cmc'])); _d1r = dir_car(T_REST[0])
def _solve_thumb_mcp():
    best = None; x_index = (to_car(hands.FINGERS['index']['mcp']) - O) @ GX
    for phi in np.radians(np.arange(40, 230, 2)):
        for a0 in np.arange(x_index - .06, x_index + .05, .001):
            T0 = rim_point(a0, phi, RT + .0125)
            if abs(np.linalg.norm(T0 - _cm) - hands.THUMB['L'][0] * .01) > .0012: continue
            tang = rimf(A_GRIP - a0 / RR)[1]
            cost = np.arccos(np.clip(nrm(T0 - _cm) @ _d1r, -1, 1)) * .5 + abs(np.arccos(np.clip(nrm(T0 - _cm) @ tang, -1, 1)) - np.radians(18)) * 1.2
            if best is None or cost < best[0]: best = (cost, T0, phi, a0)
    return best
_tb = _solve_thumb_mcp(); THUMB_MCP_T = _tb[1]
_d1 = nrm(THUMB_MCP_T - _cm); _ax = np.cross(_d1r, _d1)
_R1 = rot(_ax, np.arccos(np.clip(_d1r @ _d1, -1, 1))) if np.linalg.norm(_ax) > 1e-9 else np.eye(3)
_RC = np.column_stack([XH, FH, ND])
def _rc(v): return nrm(_RC.T @ (_R1 @ (_RC @ nrm(v))))          # rotate a canonical direction by _R1 (in car space)
_d1c = nrm(hands.THUMB['d1']); _d2c = nrm(_d1c + np.array([-.08, .22, .05])); _d3c = nrm(_d2c + np.array([-.05, .12, .06]))
_zc = perp(np.array([.75, -.15, .65]), _d1c)
_phi, _a0 = _tb[2], _tb[3]
_L = [x * .01 for x in hands.THUMB['L']]
_j1 = _cm + _d1 * _L[0]
def _ang(u, v): return np.degrees(np.arccos(np.clip(nrm(u) @ nrm(v), -1, 1)))
def _chain_from(j1, phi_ip, sink_ip, phi_rng, bend3, sink_tip):
    """proximal phalanx from the thumb knuckle j1 onto the rim at angle phi_ip (pad sunk sink_ip into the rim), then the
    distal phalanx bent bend3 degrees further round the rim with its pad sunk sink_tip: returns (ip, tip)"""
    best = None
    for arc in np.arange(_a0 - .01, _a0 + .05, .0004):
        ip = rim_point(arc, phi_ip, RT + .0102 - sink_ip); e = abs(np.linalg.norm(ip - j1) - _L[1])
        if best is None or e < best[0]: best = (e, ip, arc)
    ip, arc_ip = best[1], best[2]; d2 = nrm(ip - j1); best = None
    for arc in np.arange(arc_ip - .01, arc_ip + .035, .0005):
        for phi in np.radians(np.arange(phi_rng[0], phi_rng[1], 1.0)):
            tp = rim_point(arc, phi, RT + .0090 - sink_tip); e = abs(np.linalg.norm(tp - ip) - _L[2]) * 400 + abs(_ang(d2, tp - ip) - bend3)
            if best is None or e < best[0]: best = (e, tp)
    return ip, best[1]
# left: along the rim's inner/driver face toward twelve, IP joint bent ~30 deg, pad pressed 2.5 mm into the leather
_j2, _j3 = _chain_from(_j1, _phi + np.radians(4), .0025, (np.degrees(_phi) - 10, np.degrees(_phi) + 60), 30, .0022)
# right (posed on its own): hooked over the rim's inner edge, tip joint at 45 deg
_j2h, _j3h = _chain_from(_j1, _phi - np.radians(8), .0022, (np.degrees(_phi) - 25, np.degrees(_phi) + 30), 18, .0024)
def _away_at(p): o = rimf(A_GRIP - ((p - O) @ GX) / RR)[0]; return nrm(p - o)
_away = nrm(perp(_away_at(_j2), nrm(_j3 - _j1)))
THUMB_INFO = dict(mcp_bend=_ang(_d1, _j2 - _j1), ip_bend=_ang(_j2 - _j1, _j3 - _j2), hook_mcp=_ang(_d1, _j2h - _j1), hook_ip=_ang(_j2h - _j1, _j3h - _j2h))
_tax = nrm(_j3 - _j1); _out = perp(GY, _tax); _zt0 = perp(_away, _tax)
_ztw = nrm(_zt0 * np.cos(np.radians(35)) + _out * np.sin(np.radians(35)))     # nail turned toward the outside of the rim
H = hands.build_hand(DFC, thumb_dirs=[dir_can(_d1), dir_can(_j2 - _j1), dir_can(_j3 - _j2)], thumb_z=dir_can(_ztw))

# ------------------------------------------------------------------ bones (car space)
FORE_C = [to_car(p) for p in H['fore']]              # forearm centreline (car), t = 0, 2.2, 5, 8, 11, 14 cm
FORE_T = [0, .022, .05, .08, .11, .14]
def fore_at(t):
    if t <= FORE_T[-1]:
        i = max(0, np.searchsorted(FORE_T, t) - 1); i = min(i, len(FORE_T) - 2); u = (t - FORE_T[i]) / (FORE_T[i + 1] - FORE_T[i])
        return FORE_C[i] + (FORE_C[i + 1] - FORE_C[i]) * u
    return FORE_C[-1] + dir_car(DFC) * (t - FORE_T[-1])
ELB = fore_at(L_FORE)                                  # the elbow, on the forearm's own line
def bone_list():
    f = H['fingers']; t = H['thumb']
    MID = fore_at(.12)
    bl = [('upper', SH, ELB, .055), ('fore', ELB, MID, .036), ('twist', MID, W, .031), ('hand', W, to_car(f['middle']['joints'][0]), .028)]
    for n in hands.ORDER:
        J = [to_car(p) for p in f[n]['joints']]; r = f[n]['r']
        for k in range(3): bl.append((f'{n}{k+1}', J[k], J[k + 1], r[k] * .0088))
    J = [to_car(p) for p in t['joints']]
    for k in range(3): bl.append((f'thumb{k+1}', J[k], J[k + 1], t['r'][k] * .0095))
    return bl, ELB, MID
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

# ------------------------------------------------------------------ the grip: each joint closes until the finger meets the rim (finger cascade)
TILT_CONV = {'pinky': 3, 'ring': 1.5, 'middle': .5, 'index': 0}
MAXDEG = {'pinky': (70, 84, 72), 'ring': (62, 84, 70), 'middle': (58, 82, 70), 'index': (50, 80, 64)}
RELAX = {'pinky': (1, 2, 1), 'ring': (1.5, 2, 2), 'middle': (2, 3, 3), 'index': (3, 6, 12)}
def flex_axis(n):
    f = H['fingers'][n]; t = np.radians(TILT_CONV[n]); return dir_car(-np.cos(t) * f['L'] - np.sin(t) * f['d'])
def Rp(P, A, th):
    M = np.eye(4); R = rot(A, th); M[:3, :3] = R; M[:3, 3] = P - R @ P; return M
def finger_fk(n, th):
    f = H['fingers'][n]; J = [to_car(p) for p in f['joints']]; A = flex_axis(n)
    D = [np.eye(4)]; out = [J[0]]
    for k in range(3):
        D.append(D[-1] @ Rp(J[k], A, th[k]))
    pts = [J[0]] + [(D[k + 1] @ np.append(J[k + 1], 1))[:3] for k in range(3)]
    return pts, D[1:]
def finger_clear(n, th, from_seg):
    pts, _ = finger_fk(n, th); r = H['fingers'][n]['r']; worst = 1e9
    for k in range(from_seg, 3):
        for u in np.linspace(0, 1, 9):
            p = pts[k] + (pts[k + 1] - pts[k]) * u; rad = (r[k] + (r[k + 1] - r[k]) * u) * .0092
            worst = min(worst, rim_dist(p)[0] - RT - rad + .0012)        # pads press 1.2 mm into the leather
    return worst
def solve_grip():
    G = {}
    for n in hands.ORDER:
        th = [0., 0., 0.]
        for k in range(3):
            for deg in np.arange(0, MAXDEG[n][k] + .5, .5):
                tt = list(th); tt[k] = np.radians(deg)
                if finger_clear(n, tt, k) < 0: break
                th = tt
        th = [max(0, a - np.radians(rl)) for a, rl in zip(th, RELAX[n])]
        G[n] = th
    return G
GRIP = solve_grip()

def frame_rot(d0, z0, d1, z1):
    A = np.column_stack([d0, perp(z0, d0), np.cross(d0, perp(z0, d0))]); Bf = np.column_stack([d1, perp(z1, d1), np.cross(d1, perp(z1, d1))])
    return Bf @ A.T
def _bone_rigid(p0, d0, z0, p1, d1, z1):
    R = frame_rot(d0, z0, d1, z1); M = np.eye(4); M[:3, :3] = R; M[:3, 3] = p1 - R @ p0; return M
_zt = dir_car(H['thumb']['Z'])
THUMB_D = {'L': [np.eye(4)] * 3,
           'R': [np.eye(4),
                 _bone_rigid(_j1, nrm(_j2 - _j1), _zt, _j1, nrm(_j2h - _j1), perp(_away_at(_j2h), nrm(_j2h - _j1))),
                 _bone_rigid(_j2, nrm(_j3 - _j2), _zt, _j2h, nrm(_j3h - _j2h), perp(_away_at(_j3h), nrm(_j3h - _j2h)))]}

HAND = {'L': dict(phi=0.0, roll=0.0, less=(0, 0, 0)), 'R': dict(phi=.19, roll=np.radians(5), less=(np.radians(4), np.radians(5), np.radians(1)))}
GRIP_SIDE = {k: {n: [max(0., a - l) for a, l in zip(GRIP[n], v['less'])] for n in hands.ORDER} for k, v in HAND.items()}
def Rline(P, A, th): return Rp(P, nrm(A), th)
def pose_deltas(side='L', curl=1.0, theta=0.0):
    """world (car, or mirrored car for the right hand) delta per bone: hand on the rim (turned by theta, plus this hand's
    own place and roll), fingers closed by `curl` of the solved grip, thumb in this hand's pose, arm by two-bone IK"""
    hp = HAND[side]; D = {}
    Dh = Rline(WC, AXIS, theta + hp['phi']) @ Rline(O, GX, hp['roll'])
    D['hand'] = Dh
    for n in hands.ORDER:
        _, Df = finger_fk(n, [a * curl for a in GRIP_SIDE[side][n]])
        for k in range(3): D[f'{n}{k+1}'] = Dh @ Df[k]
    for k in range(3): D[f'thumb{k+1}'] = Dh @ THUMB_D[side][k]
    Wp = (Dh @ np.append(W, 1))[:3]; Ep = ik(SH, Wp, np.linalg.norm(ELB - SH), np.linalg.norm(W - ELB), POLE)
    def minarc(a, b):
        a, b = nrm(a), nrm(b); ax = np.cross(a, b); s_ = np.linalg.norm(ax)
        return np.eye(3) if s_ < 1e-9 else rot(ax, np.arctan2(s_, a @ b))
    Ru = minarc(ELB - SH, Ep - SH); M = np.eye(4); M[:3, :3] = Ru; M[:3, 3] = SH - Ru @ SH; D['upper'] = M
    Rf = minarc(W - ELB, Wp - Ep); d1 = nrm(Wp - Ep)
    xh = perp(Dh[:3, :3] @ XH, d1); xf = perp(Rf @ XH, d1); tau = np.arctan2(np.cross(xf, xh) @ d1, xf @ xh)
    for nm, k in (('fore', .2), ('twist', .7)):
        R = rot(d1, tau * k) @ Rf; M = np.eye(4); M[:3, :3] = R; M[:3, 3] = Ep - R @ ELB; D[nm] = M
    return D

if __name__ == '__main__':
    print('W', W.round(3), 'E', E.round(3), 'DFC', DFC.round(3))
    for n in hands.ORDER: print(n, np.degrees(GRIP[n]).round(1), 'clear', round(finger_clear(n, GRIP[n], 0) * 1000, 2), 'mm')
    print('thumb', {k: round(v, 1) for k, v in THUMB_INFO.items()})
    print('cage', len(H['V']), 'verts', len(H['F']), 'faces')
