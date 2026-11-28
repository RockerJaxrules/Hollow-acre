"""Unreal-convention helpers for the arm lab: quaternions to rotators (FQuat::Rotator), and the dump."""
import json, math


def quat_to_rot(x, y, z, w):
    # (FQuat::Rotator, degrees: pitch, yaw, roll)
    sing = z * x - w * y
    yaw = math.degrees(math.atan2(2.0 * (w * z + x * y), 1.0 - 2.0 * (y * y + z * z)))
    if sing < -0.4999995:
        pitch = -90.0
        roll = norm(-yaw - 2.0 * math.degrees(math.atan2(x, w)))
    elif sing > 0.4999995:
        pitch = 90.0
        roll = norm(yaw - 2.0 * math.degrees(math.atan2(x, w)))
    else:
        pitch = math.degrees(math.asin(2.0 * sing))
        roll = math.degrees(math.atan2(-2.0 * (w * x + y * z), 1.0 - 2.0 * (x * x + y * y)))
    return pitch, yaw, roll


def norm(a):
    a = math.fmod(a + 180.0, 360.0)
    if a < 0:
        a += 360.0
    return a - 180.0


def quat_between(a, b):
    # (FQuat::FindBetweenNormals)
    d = sum(i * j for i, j in zip(a, b))
    if d < -0.999999:
        return (1.0, 0.0, 0.0, 0.0)
    c = (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
    w = 1.0 + d
    n = math.sqrt(c[0] ** 2 + c[1] ** 2 + c[2] ** 2 + w * w)
    return (c[0] / n, c[1] / n, c[2] / n, w / n)


def qrot(q, v):
    x, y, z, w = q
    # v' = v + 2w(q x v) + 2 q x (q x v)
    cx = y * v[2] - z * v[1]; cy = z * v[0] - x * v[2]; cz = x * v[1] - y * v[0]
    ccx = y * cz - z * cy; ccy = z * cx - x * cz; ccz = x * cy - y * cx
    return (v[0] + 2 * (w * cx + ccx), v[1] + 2 * (w * cy + ccy), v[2] + 2 * (w * cz + ccz))


def load(path):
    rows = [json.loads(l) for l in open(path)]
    for r in rows:
        r['frame'] = int(round((r['w'] - 9.3) * 30.0))
    return rows


def xform(t):
    p, y, r = quat_to_rot(*t[3:7])
    return {'location': {'x': t[0], 'y': t[1], 'z': t[2]}, 'rotation': {'pitch': p, 'yaw': y, 'roll': r}}
