"""Screenshots of the arm lab through the wake's own eye: lab_shot.py dump.jsonl out_prefix frame [frame ...]
(or 'side' as the first frame to look from the side instead). Sets the playhead, evaluates, captures."""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import labmath as M

rows = M.load(sys.argv[1])
pref = sys.argv[2]
args = sys.argv[3:]
side = False
if args and args[0] == 'side':
    side = True
    args = args[1:]


def call(ts, tool, a, img=None):
    env = dict(os.environ)
    if img:
        env['MCP_IMG'] = img
    r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'mcp_call.py'), 'call', 'call_tool',
                        json.dumps({'toolset_name': ts, 'tool_name': tool, 'arguments': a})], capture_output=True, text=True, env=env)
    return r.stdout.strip()


SQ = 'animation_toolset.toolsets.sequencer.SequencerTools'
for f in args:
    f = int(f)
    r = min(rows, key=lambda x: abs(x['frame'] - f))
    call(SQ, 'set_playhead_frame', {'frame': f})
    call(SQ, 'force_evaluate', {})
    if side:
        # (from the body's right side and a little in front, looking at the hand's way)
        cam = {'location': {'x': -110.0, 'y': 60.0, 'z': 200.0}, 'rotation': {'pitch': -18.0, 'yaw': -20.0, 'roll': 0.0}}
    else:
        cam = M.xform(r['eye'])
    out = '%s_%03d.png' % (pref, f)
    res = call('EditorToolset.EditorAppToolset', 'CaptureViewport', {'captureTransform': cam,
               'annotations': {'gridSpacing': 0, 'gridExtent': 0, 'gridHeight': 0, 'maxLabelDistance': 0}, 'bShowUI': False}, img=out)
    print(f, '%.2f' % r['w'], res[:120])
