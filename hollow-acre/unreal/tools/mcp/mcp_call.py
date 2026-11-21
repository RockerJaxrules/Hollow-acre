"""Tiny MCP client for the Unreal editor's built-in server (streamable HTTP on localhost).

usage:
  mcp_call.py list [filter]                 -> tool names (+ descriptions with -v)
  mcp_call.py desc <tool>                   -> the tool's input schema
  mcp_call.py call <tool> '<json args>'     -> the tool's result
The session id is kept in mcp_session.txt next to this script.
"""
import json, os, sys, urllib.request

URL = 'http://127.0.0.1:8000/mcp'
HERE = os.path.dirname(os.path.abspath(__file__))
SESS = os.path.join(HERE, 'mcp_session.txt')
_id = [0]


def post(msg, sid=None):
    data = json.dumps(msg).encode()
    req = urllib.request.Request(URL, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json, text/event-stream')
    if sid:
        req.add_header('Mcp-Session-Id', sid)
    with urllib.request.urlopen(req, timeout=600) as r:
        body = r.read().decode('utf-8', 'replace')
        new_sid = r.headers.get('Mcp-Session-Id')
        ctype = r.headers.get('Content-Type', '')
    if 'text/event-stream' in ctype:
        out = None
        for line in body.splitlines():
            if line.startswith('data:'):
                try:
                    j = json.loads(line[5:].strip())
                except Exception:
                    continue
                if 'result' in j or 'error' in j:
                    out = j
        return out, new_sid
    return (json.loads(body) if body.strip() else None), new_sid


def rpc(method, params=None, sid=None):
    _id[0] += 1
    m = {'jsonrpc': '2.0', 'id': _id[0], 'method': method}
    if params is not None:
        m['params'] = params
    return post(m, sid)


def session():
    if os.path.exists(SESS):
        sid = open(SESS).read().strip()
        try:
            r, _ = rpc('tools/list', {}, sid)
            if r and 'result' in r:
                return sid
        except Exception:
            pass
    r, sid = rpc('initialize', {'protocolVersion': '2025-06-18', 'capabilities': {},
                                'clientInfo': {'name': 'claude-code-script', 'version': '1.0'}})
    if not r or 'result' not in r:
        raise SystemExit('initialize failed: %r' % (r,))
    post({'jsonrpc': '2.0', 'method': 'notifications/initialized'}, sid)
    open(SESS, 'w').write(sid or '')
    return sid


def all_tools(sid):
    tools, cursor = [], None
    while True:
        r, _ = rpc('tools/list', {'cursor': cursor} if cursor else {}, sid)
        res = r['result']
        tools += res.get('tools', [])
        cursor = res.get('nextCursor')
        if not cursor:
            return tools


if __name__ == '__main__':
    cmd = sys.argv[1]
    sid = session()
    if cmd == 'list':
        flt = sys.argv[2].lower() if len(sys.argv) > 2 and not sys.argv[2].startswith('-') else ''
        verbose = '-v' in sys.argv
        ts = all_tools(sid)
        print(len(ts), 'tools')
        for t in ts:
            if flt in t['name'].lower() or flt in (t.get('description') or '').lower():
                print(t['name'] + ((' :: ' + (t.get('description') or '').replace('\n', ' ')[:200]) if verbose else ''))
    elif cmd == 'desc':
        for t in all_tools(sid):
            if t['name'] == sys.argv[2]:
                print(json.dumps(t, indent=1)[:6000])
    elif cmd == 'call':
        args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        r, _ = rpc('tools/call', {'name': sys.argv[2], 'arguments': args}, sid)
        if r and 'result' in r:
            for c in r['result'].get('content', []):
                if c.get('type') == 'text':
                    t = c['text']
                    try:
                        j = json.loads(t)
                        rv = j.get('returnValue') if isinstance(j, dict) else None
                        if isinstance(rv, dict) and isinstance(rv.get('image'), dict):
                            rv = rv['image']
                        if isinstance(rv, dict) and 'data' in rv and 'mimeType' in rv:
                            import base64
                            out = os.environ.get('MCP_IMG') or os.path.join(HERE, 'mcp_img.' + rv['mimeType'].split('/')[-1])
                            open(out, 'wb').write(base64.b64decode(rv['data']))
                            print('[image saved to %s]' % out)
                            continue
                    except Exception:
                        pass
                    print(t)
                elif c.get('type') == 'image':
                    import base64
                    p = os.path.join(HERE, 'mcp_img.' + c.get('mimeType', 'image/png').split('/')[-1])
                    open(p, 'wb').write(base64.b64decode(c['data']))
                    print('[image saved to %s]' % p)
                else:
                    print(json.dumps(c)[:2000])
            if r['result'].get('isError'):
                print('(the tool reported an error)')
        else:
            print(json.dumps(r)[:4000])
