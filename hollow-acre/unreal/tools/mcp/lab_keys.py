"""Keys the right arm in LS_ArmLab from the wake dump: the hand's IK control and the elbow's pole control, exactly as the
game drives the rig, at the given frames. usage: lab_keys.py dump.jsonl 30:100:3 100:165:6"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import labmath as M

rows = M.load(sys.argv[1])
bridges = [tuple(int(x) for x in a[len('--bridge='):].split(':')) for a in sys.argv[2:] if a.startswith('--bridge=')]
frames = []
for part in [a for a in sys.argv[2:] if not a.startswith('--')]:
    f0, f1, st = [int(x) for x in part.split(':')]
    f = f0
    while f <= f1:
        if f not in frames:
            frames.append(f)
        f += st
    if f1 not in frames:
        frames.append(f1)
frames.sort()
byf = {r['frame']: r for r in rows}
import math
def slerp(q0, q1, t):
    d = sum(a * b for a, b in zip(q0, q1))
    if d < 0:
        q1 = [-x for x in q1]; d = -d
    if d > 0.9995:
        q = [a + (b - a) * t for a, b in zip(q0, q1)]
    else:
        th = math.acos(d); s0 = math.sin((1 - t) * th) / math.sin(th); s1 = math.sin(t * th) / math.sin(th)
        q = [a * s0 + b * s1 for a, b in zip(q0, q1)]
    n = math.sqrt(sum(x * x for x in q)); return [x / n for x in q]
def robust(f):
    # (a frame's value taken robustly from it and its neighbours: the location's median, the rotation that sits closest to
    # the others; one-frame spikes in the solver don't become keys)
    near = [byf[g] for g in range(f - 2, f + 3) if g in byf] or [min(rows, key=lambda x: abs(x['frame'] - f))]
    import statistics
    loc = [statistics.median(r['ctrl'][i] for r in near) for i in range(3)]
    def ang(a, b):
        d = abs(sum(x * y for x, y in zip(a, b))); return math.acos(min(1.0, d))
    qs = [r['ctrl'][3:7] for r in near]
    q = min(qs, key=lambda a: sum(ang(a, b) for b in qs))
    pv = [statistics.median(r['pv'][i] for r in near) for i in range(3)]
    return {'ctrl': loc + list(q), 'pv': pv}
def bridged(f):
    # (inside a bridge: eased between the frames at its ends, in the rig control's own space)
    for a, b in bridges:
        if a < f < b:
            ra = byf.get(a) or min(rows, key=lambda x: abs(x['frame'] - a)); rb = byf.get(b) or min(rows, key=lambda x: abs(x['frame'] - b))
            t = (f - a) / float(b - a); t = t * t * (3 - 2 * t)
            c = [ra['ctrl'][i] + (rb['ctrl'][i] - ra['ctrl'][i]) * t for i in range(3)] + slerp(ra['ctrl'][3:7], rb['ctrl'][3:7], t)
            pv = [ra['pv'][i] + (rb['pv'][i] - ra['pv'][i]) * t for i in range(3)]
            return {'ctrl': c, 'pv': pv}
    return None
keys = []
for f in frames:
    r = bridged(f) or robust(f)
    c = r['ctrl']
    p, y, ro = M.quat_to_rot(*c[3:7])
    keys.append({'f': f, 'c': [c[0], c[1], c[2], p, y, ro], 'pv': r['pv']})
# (the rotations unwrapped, so the keys don't spin the long way round)
for k in ('3', '4', '5'):
    j = int(k)
    for a, b in zip(keys, keys[1:]):
        while b['c'][j] - a['c'][j] > 180: b['c'][j] -= 360
        while b['c'][j] - a['c'][j] < -180: b['c'][j] += 360

script = r'''
import json
SEQ = {"refPath": "/Game/HollowAcre/Wake/Anim/LS_ArmLab.LS_ArmLab"}
RIG = "/MetaHumanCharacter/Common/MetaHuman_ControlRig"
KEYS = json.loads(%s)
def T(name, args):
    return execute_tool(name, json.dumps(args))
def run():
    T("animation_toolset.toolsets.sequencer.SequencerTools.open_sequence", {"sequence": SEQ})
    n = 0
    for k in KEYS:
        c = k["c"]
        T("animation_toolset.toolsets.controlrig_sequencer.SequencerControlRigTools.set_world_transform", {"sequence": SEQ,
            "control_rig_asset_path": RIG, "control_name": "hand_r_ik_ctrl", "frame": k["f"], "location_x": c[0], "location_y": c[1],
            "location_z": c[2], "rotation_pitch": c[3], "rotation_yaw": c[4], "rotation_roll": c[5]})
        pv = k["pv"]
        T("animation_toolset.toolsets.controlrig_sequencer.SequencerControlRigTools.set_world_transform", {"sequence": SEQ,
            "control_rig_asset_path": RIG, "control_name": "arm_r_pv_ik_ctrl", "frame": k["f"], "location_x": pv[0], "location_y": pv[1],
            "location_z": pv[2], "rotation_pitch": 0, "rotation_yaw": 0, "rotation_roll": 0})
        n += 1
    return {"keyed": n}
''' % (json.dumps(json.dumps(keys)),)
r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'mcp_call.py'), 'call', 'call_tool',
                    json.dumps({'toolset_name': 'editor_toolset.toolsets.programmatic.ProgrammaticToolset', 'tool_name': 'execute_tool_script',
                                'arguments': {'script': script}})], capture_output=True, text=True)
print(len(keys), 'keys at', frames[:6], '...', frames[-3:])
print(r.stdout[:2000], r.stderr[:2000])
