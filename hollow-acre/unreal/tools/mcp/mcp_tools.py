import json, subprocess, sys
S = sys.argv[1]
for ts in sys.argv[2:]:
    out = subprocess.run([sys.executable, '-I', S + '/mcp_call.py', 'call', 'describe_toolset', json.dumps({'toolset_name': ts})], capture_output=True, text=True).stdout
    try:
        d = json.loads(out)
    except Exception:
        print(ts, 'ERR', out[:300]); continue
    print('==', ts)
    for t in d['tools']:
        print('  ' + t['name'].split('.')[-1] + ' :: ' + (t.get('description') or '').strip().split('\n')[0][:110])
