"""Drive headless Chrome over the DevTools protocol with nothing but the Python standard library (no Node or Playwright
on the owner's PC): a minimal WebSocket client, a CDP session, and helpers to boot the game and capture frames.

Also a deterministic clock for capturing video: the page's requestAnimationFrame, timers, performance.now and Date.now
run on a virtual clock that advances exactly one frame per capture, and every CSS animation and transition is held to
the same clock (Web Animations), so the video plays at true speed however slow each screenshot is.
"""
import base64
import json
import os
import socket
import struct
import subprocess
import tempfile
import time
import urllib.request

CHROME = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
          r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']


class WebSocket:
    def __init__(self, url):
        assert url.startswith('ws://')
        hostport, path = url[5:].split('/', 1)
        host, port = hostport.split(':')
        self.s = socket.create_connection((host, int(port)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall(('GET /%s HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
                        'Sec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n' % (path, hostport, key)).encode())
        buf = b''
        while b'\r\n\r\n' not in buf:
            buf += self.s.recv(4096)
        if b' 101 ' not in buf.split(b'\r\n')[0]:
            raise RuntimeError(buf[:200])
        self.rest = buf.split(b'\r\n\r\n', 1)[1]

    def _read(self, n):
        while len(self.rest) < n:
            chunk = self.s.recv(1 << 20)
            if not chunk:
                raise ConnectionError('closed')
            self.rest += chunk
        out, self.rest = self.rest[:n], self.rest[n:]
        return out

    def send(self, text):
        data = text.encode()
        head = bytearray([0x81])
        n = len(data)
        if n < 126:
            head.append(0x80 | n)
        elif n < 65536:
            head.append(0x80 | 126)
            head += struct.pack('>H', n)
        else:
            head.append(0x80 | 127)
            head += struct.pack('>Q', n)
        mask = os.urandom(4)
        head += mask
        self.s.sendall(bytes(head) + _mask(data, mask))

    def recv(self):
        parts = []
        while True:
            b0, b1 = self._read(2)
            op, n = b0 & 0x0F, b1 & 0x7F
            if n == 126:
                n = struct.unpack('>H', self._read(2))[0]
            elif n == 127:
                n = struct.unpack('>Q', self._read(8))[0]
            if b1 & 0x80:
                m = self._read(4)
                payload = _mask(self._read(n), m)
            else:
                payload = self._read(n)
            if op == 9:                                  # ping: answer and keep reading
                self.s.sendall(bytes([0x8A, 0x80]) + os.urandom(4))
                continue
            if op == 8:
                raise ConnectionError('closed by peer')
            parts.append(payload)
            if b0 & 0x80:
                return b''.join(parts).decode('utf-8', 'replace')


def _mask(data, mask):
    n = len(data)
    if n == 0:
        return b''
    m = (mask * (n // 4 + 1))[:n]
    return (int.from_bytes(data, 'big') ^ int.from_bytes(m, 'big')).to_bytes(n, 'big')


class Chrome:
    def __init__(self, width=1920, height=1080, port=9333):
        exe = next(p for p in CHROME if os.path.exists(p))
        self.tmp = tempfile.mkdtemp(prefix='cdp_')
        self.proc = subprocess.Popen([exe, '--headless=new', '--remote-debugging-port=%d' % port, '--user-data-dir=' + self.tmp,
                                      '--window-size=%d,%d' % (width, height), '--hide-scrollbars', '--mute-audio',
                                      '--no-first-run', '--no-default-browser-check', '--force-device-scale-factor=1', 'about:blank'],
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen('http://127.0.0.1:%d/json/list' % port, timeout=2))
                page = next(t for t in tabs if t.get('type') == 'page')
                break
            except Exception:
                time.sleep(0.2)
        self.ws = WebSocket(page['webSocketDebuggerUrl'])
        self.n = 0
        self.events = []
        self.call('Page.enable')
        self.call('Runtime.enable')
        self.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': False})

    def call(self, method, params=None, timeout=120):
        self.n += 1
        mid = self.n
        self.ws.send(json.dumps({'id': mid, 'method': method, 'params': params or {}}))
        t0 = time.time()
        while time.time() - t0 < timeout:
            msg = json.loads(self.ws.recv())
            if msg.get('id') == mid:
                if 'error' in msg:
                    raise RuntimeError('%s: %s' % (method, msg['error']))
                return msg.get('result', {})
            if msg.get('method') in ('Runtime.exceptionThrown', 'Runtime.consoleAPICalled'):
                self.events.append(msg)
        raise TimeoutError(method)

    def js(self, expr, await_promise=False):
        r = self.call('Runtime.evaluate', {'expression': expr, 'returnByValue': True, 'awaitPromise': await_promise})
        if 'exceptionDetails' in r:
            raise RuntimeError('JS: %s' % json.dumps(r['exceptionDetails'])[:600])
        return r.get('result', {}).get('value')

    def goto(self, url):
        self.call('Page.navigate', {'url': url})

    def wait(self, expr, timeout=120, every=0.25):
        t0 = time.time()
        while time.time() - t0 < timeout:
            try:
                if self.js(expr):
                    return True
            except RuntimeError:
                pass
            time.sleep(every)
        raise TimeoutError(expr)

    def shot(self, path, fmt='png', quality=92):
        p = {'format': fmt}
        if fmt == 'jpeg':
            p['quality'] = quality
        data = self.call('Page.captureScreenshot', p)['data']
        with open(path, 'wb') as fh:
            fh.write(base64.b64decode(data))

    def close(self):
        try:
            self.call('Browser.close', timeout=5)
        except Exception:
            pass
        self.proc.terminate()


# the virtual clock: install once, then step(dt) per frame
VCLOCK_JS = r'''
(()=>{if(window.__vc)return 'already';
 const real={raf:window.requestAnimationFrame,now:performance.now.bind(performance),dnow:Date.now,st:window.setTimeout,si:window.setInterval,ct:window.clearTimeout,ci:window.clearInterval};
 const vc=window.__vc={t:real.now(),d0:real.dnow()-real.now(),rafs:[],timers:new Map(),id:1e6,anim0:new WeakMap()};
 window.requestAnimationFrame=f=>{vc.rafs.push(f);return vc.rafs.length;};
 performance.now=()=>vc.t;Date.now=()=>Math.round(vc.d0+vc.t);
 window.setTimeout=(f,ms,...a)=>{const id=++vc.id;vc.timers.set(id,{f,a,at:vc.t+Math.max(0,+ms||0)});return id;};
 window.setInterval=(f,ms,...a)=>{const id=++vc.id;vc.timers.set(id,{f,a,at:vc.t+Math.max(1,+ms||0),every:Math.max(1,+ms||0)});return id;};
 window.clearTimeout=window.clearInterval=id=>{vc.timers.delete(id);};
 window.__step=ms=>{const end=vc.t+ms;
   for(let guard=0;guard<1000;guard++){let next=null,nid=null;for(const [id,tm] of vc.timers)if(tm.at<=end&&(!next||tm.at<next.at)){next=tm;nid=id;}
     if(!next)break;vc.t=Math.max(vc.t,next.at);if(next.every)next.at+=next.every;else vc.timers.delete(nid);try{typeof next.f==='function'?next.f(...next.a):eval(next.f);}catch(e){console.error(e);}}
   vc.t=end;const fs=vc.rafs;vc.rafs=[];for(const f of fs){try{f(vc.t);}catch(e){console.error(e);}}
   for(const a of document.getAnimations()){if(!vc.anim0.has(a)){vc.anim0.set(a,vc.t-ms);a.pause();}try{a.currentTime=Math.max(0,vc.t-vc.anim0.get(a));}catch(e){}}
   return vc.t;};
 return 'ok';})()
'''
