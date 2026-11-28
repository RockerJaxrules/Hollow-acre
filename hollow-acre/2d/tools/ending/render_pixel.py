"""Render the pixel half of the new ending (src/ending_drive.js) to video frames.

The cutscene runs in headless Chrome with the game's own code for the car (st37Sedan and its helpers are lifted from
src/story337.js, so the car is exactly the one in the game). Each 320 x 180 frame comes back as a PNG and is scaled
up by whole pixels (x6 to 1920 x 1080, nearest neighbour: the pixels stay hard).

Run (Python 3 + Pillow):  python hollow-acre/2d/tools/ending/render_pixel.py <out folder> [fps=30] [first,last seconds]
"""
import base64
import io
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', 'src')
CHROME = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
          r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']


def lift(js, start):
    """The source of one top-level definition, from its first line to its closing brace (brace matching)."""
    i = js.index(start)
    j = js.index('{', i)
    depth = 0
    for k in range(j, len(js)):
        if js[k] == '{':
            depth += 1
        elif js[k] == '}':
            depth -= 1
            if depth == 0:
                end = js.index(';', k) + 1 if js[k + 1:k + 2] == ';' else k + 1
                return js[i:end]
    raise ValueError(start)


def main():
    out = sys.argv[1]
    fps = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    os.makedirs(out, exist_ok=True)
    story = open(os.path.join(SRC, 'story337.js'), encoding='utf-8').read()
    car_js = '\n'.join([lift(story, 'function st37Cv('),
                        re.search(r'const st37H=.*?;\n', story).group(0),
                        lift(story, 'const ST37_CARPAL='),
                        lift(story, 'function st37Outline('),
                        lift(story, 'function st37Sedan(')])
    scene = open(os.path.join(SRC, 'ending_drive.js'), encoding='utf-8').read()
    html = '''<!doctype html><html><body><pre id="out"></pre><script>
%s
%s
const cv=st37Sedan({primer:1,ham:1,glass:'clear',dull:1,steel:1,rust:1});
const car=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);
const c=document.createElement('canvas');c.width=ENDING_DRIVE.W;c.height=ENDING_DRIVE.H;const g=c.getContext('2d');
const n=Math.round(ENDING_DRIVE.LEN*%d),lines=[];
for(let f=0;f<n;f++){const d=endingDriveFrame(f/%d,car);g.putImageData(new ImageData(d,ENDING_DRIVE.W,ENDING_DRIVE.H),0,0);lines.push(c.toDataURL('image/png'));}
document.getElementById('out').textContent=lines.join('\\n');
</script></body></html>''' % (car_js, scene, fps, fps)
    tmp = tempfile.mkdtemp(prefix='ending_px_')
    page = os.path.join(tmp, 'ending.html')
    open(page, 'w', encoding='utf-8').write(html)
    exe = next(p for p in CHROME if os.path.exists(p))
    res = subprocess.run([exe, '--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + os.path.join(tmp, 'profile'),
                          '--virtual-time-budget=600000', '--dump-dom', 'file:///' + page.replace('\\', '/')],
                         capture_output=True, timeout=900)
    dom = res.stdout.decode('utf-8', 'replace')
    urls = re.findall(r'data:image/png;base64,([A-Za-z0-9+/=]+)', dom)
    if not urls:
        print(res.stderr.decode('utf-8', 'replace')[-2000:])
        raise SystemExit('no frames came back')
    for i, u in enumerate(urls):
        im = Image.open(io.BytesIO(base64.b64decode(u))).convert('RGB')
        im.resize((im.width * 6, im.height * 6), Image.NEAREST).save(os.path.join(out, 'frame_%05d.png' % i))
    print('pixel ending: %d frames at %d fps' % (len(urls), fps))


if __name__ == '__main__':
    main()
