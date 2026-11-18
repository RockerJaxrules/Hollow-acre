"""Places the lab's lining and flashlight as they are at a frame of the wake (from the dump), then shoots it through the
wake's eye and from the side. usage: lab_pose.py dump.jsonl out_prefix frame [frame ...]"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import labmath as M
rows = M.load(sys.argv[1])
pref = sys.argv[2]
LV = '/Game/HollowAcre/Wake/Anim/L_ArmLab.L_ArmLab:PersistentLevel.'


def call(ts, tool, a, img=None):
    env = dict(os.environ)
    if img:
        env['MCP_IMG'] = img
    r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'mcp_call.py'), 'call', 'call_tool',
                        json.dumps({'toolset_name': ts, 'tool_name': tool, 'arguments': a})], capture_output=True, text=True, env=env)
    return r.stdout.strip()


AT = 'editor_toolset.toolsets.actor.ActorTools'
SQ = 'animation_toolset.toolsets.sequencer.SequencerTools'
CAP = {'annotations': {'gridSpacing': 0, 'gridExtent': 0, 'gridHeight': 0, 'maxLabelDistance': 0}, 'bShowUI': False}
for f in [int(x) for x in sys.argv[3:]]:
    r = min(rows, key=lambda x: abs(x['frame'] - f))
    fl = M.xform(r['flash'])
    call(AT, 'set_actor_transform', {'actor': {'refPath': LV + 'StaticMeshActor_0'}, 'xform': fl, 'worldspace': True})
    n = r['liningN']; a = r['liningAt']
    q = M.quat_between((0.0, 0.0, 1.0), tuple(n))
    p, y, ro = M.quat_to_rot(*q)
    lin = {'location': {'x': a[0] - n[0] * 0.5, 'y': a[1] - n[1] * 0.5, 'z': a[2] - n[2] * 0.5}, 'rotation': {'pitch': p, 'yaw': y, 'roll': ro},
           'scale': {'x': 4, 'y': 4, 'z': 0.01}}
    call(AT, 'set_actor_transform', {'actor': {'refPath': LV + 'StaticMeshActor_2'}, 'xform': lin, 'worldspace': True})
    call(SQ, 'set_playhead_frame', {'frame': f})
    call(SQ, 'force_evaluate', {})
    eye = M.xform(r['eye'])
    o1 = call('EditorToolset.EditorAppToolset', 'CaptureViewport', dict(CAP, captureTransform=eye), img='%s_eye_%03d.png' % (pref, f))
    e = r['eye']
    side = {'location': {'x': e[0] - 70, 'y': e[1] + 70, 'z': e[2] + 25}, 'rotation': {'pitch': -20, 'yaw': -15, 'roll': 0}}
    o2 = call('EditorToolset.EditorAppToolset', 'CaptureViewport', dict(CAP, captureTransform=side), img='%s_side_%03d.png' % (pref, f))
    print(f, '%.2f' % r['w'], 'held' if r['held'] else '', o1[:40], o2[:40])
