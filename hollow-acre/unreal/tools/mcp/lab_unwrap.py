"""Unwraps the rotation channels of rig controls keyed in LS_ArmLab, so each key turns the short way from the one before
(Sequencer interpolates Euler values literally: -47 to 284 spins 331 degrees). usage: lab_unwrap.py [control ...]"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ctrls = sys.argv[1:] or ['hand_r_ik_ctrl']
script = r'''
import json
SEC = {"refPath": "/Game/HollowAcre/Wake/Anim/LS_ArmLab.LS_ArmLab:MovieScene_0.MovieSceneControlRigParameterTrack_0.MovieSceneControlRigParameterSection_0"}
CTRLS = json.loads(%s)
def T(name, args):
    return execute_tool(name, json.dumps(args))
def run():
    fixed = {}
    for c in CTRLS:
        for ax in ("X", "Y", "Z"):
            ch = c + ".Rotation." + ax
            v = T("animation_toolset.toolsets.keyframing.SequencerKeyframingTools.get_keys", {"section": SEC, "channel_name": ch})["returnValue"]
            keys = json.loads(v) if isinstance(v, str) else v
            prev = None
            n = 0
            for k in keys:
                val = k["value"]
                if prev is not None:
                    while val - prev > 180.0:
                        val -= 360.0
                    while val - prev < -180.0:
                        val += 360.0
                if abs(val - k["value"]) > 1e-3:
                    T("animation_toolset.toolsets.keyframing.SequencerKeyframingTools.add_key_float", {"section": SEC, "channel_name": ch,
                        "frame": k["frame"], "value": val, "interpolation": ""})
                    n += 1
                prev = val
            fixed[ch] = n
    return fixed
''' % (json.dumps(json.dumps(ctrls)),)
r = subprocess.run([sys.executable, '-I', os.path.join(HERE, 'mcp_call.py'), 'call', 'call_tool',
                    json.dumps({'toolset_name': 'editor_toolset.toolsets.programmatic.ProgrammaticToolset', 'tool_name': 'execute_tool_script',
                                'arguments': {'script': script}})], capture_output=True, text=True)
print(r.stdout[:2000], r.stderr[:1000])
