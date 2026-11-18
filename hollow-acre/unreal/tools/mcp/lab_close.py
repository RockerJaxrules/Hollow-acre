"""Close-up of the right hand at a frame: lab_close.py dump.jsonl out.png frame [dist]"""
import json, math, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import labmath as M
rows = M.load(sys.argv[1]); out = sys.argv[2]; f = int(sys.argv[3]); dist = float(sys.argv[4]) if len(sys.argv) > 4 else 28.0
r = min(rows, key=lambda x: abs(x['frame'] - f))
h = r['hand'][:3]; e = r['eye'][:3]
d = [e[i] - h[i] for i in range(3)]; n = math.sqrt(sum(x * x for x in d)); d = [x / n for x in d]
cam = [h[i] + d[i] * dist for i in range(3)]
look = [-x for x in d]
yaw = math.degrees(math.atan2(look[1], look[0])); pitch = math.degrees(math.asin(max(-1, min(1, look[2]))))
def call(ts, tool, a, img=None):
    env = dict(os.environ)
    if img: env['MCP_IMG'] = img
    return subprocess.run([sys.executable, '-I', os.path.join(HERE, 'mcp_call.py'), 'call', 'call_tool', json.dumps({'toolset_name': ts, 'tool_name': tool, 'arguments': a})], capture_output=True, text=True, env=env).stdout
SQ = 'animation_toolset.toolsets.sequencer.SequencerTools'
call(SQ, 'set_playhead_frame', {'frame': f}); call(SQ, 'force_evaluate', {})
print(call('EditorToolset.EditorAppToolset', 'CaptureViewport', {'captureTransform': {'location': {'x': cam[0], 'y': cam[1], 'z': cam[2]}, 'rotation': {'pitch': pitch, 'yaw': yaw, 'roll': 0}},
      'annotations': {'gridSpacing': 0, 'gridExtent': 0, 'gridHeight': 0, 'maxLabelDistance': 0}, 'bShowUI': False}, img=out)[:60])
