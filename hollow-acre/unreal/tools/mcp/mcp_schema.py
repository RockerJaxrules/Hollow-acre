import json, subprocess, sys
S, ts = sys.argv[1], sys.argv[2]
out = subprocess.run([sys.executable, '-I', S + '/mcp_call.py', 'call', 'describe_toolset', json.dumps({'toolset_name': ts})], capture_output=True, text=True).stdout
d = json.loads(out)
for t in d['tools']:
    if t['name'].split('.')[-1] in sys.argv[3:]:
        print(t['name'].split('.')[-1], json.dumps(t['inputSchema'])[:700])
        print('   ', (t.get('description') or '')[:500].replace('\n', ' '))
