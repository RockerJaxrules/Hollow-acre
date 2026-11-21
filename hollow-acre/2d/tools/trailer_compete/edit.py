"""Cut the competitive-mode trailer: captured frames + cards in the game's own pixel font + the score -> hollow_acre_compete.mp4
   python3 edit.py [preview]     preview: 640x360, faster"""
import sys, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from tl import TL, FPS, timeline, scare_frame

PREV = len(sys.argv) > 1 and sys.argv[1] == 'preview'
W, H = (640, 360) if PREV else (1920, 1080)
FONT = ImageFont.truetype('hollowpixel.ttf', 10)
PARCH = (232, 220, 192); EMBER = (214, 84, 40); BLOOD = (176, 34, 30); DIM = (150, 140, 120)
D = 'full'; K = 2          # captured at 2x: 1 CSS pixel = 2 image pixels
SC = scare_frame(D)


def pixtext(text, k, col, glow=None):
    bb = FONT.getbbox(text); w, h = bb[2] - bb[0] + 2, bb[3] - bb[1] + 2
    m = Image.new('L', (w, h)); ImageDraw.Draw(m).text((1 - bb[0], 1 - bb[1]), text, font=FONT, fill=255)
    m = m.resize((w * k, h * k), Image.NEAREST)
    im = Image.new('RGBA', m.size, col + (0,)); im.putalpha(m)
    if glow:
        g = Image.new('RGBA', (m.width + 8 * k, m.height + 8 * k), glow + (0,)); ga = Image.new('L', g.size); ga.paste(m, (4 * k, 4 * k))
        g.putalpha(ga.filter(ImageFilter.GaussianBlur(k * 2.2))); g.alpha_composite(im, (4 * k, 4 * k)); return g
    return im


def lay(im, img, y, a, x=None):
    if a <= 0: return
    i2 = img.copy(); i2.putalpha(img.getchannel('A').point(lambda v: int(v * min(1, a))))
    im.alpha_composite(i2, ((1920 - img.width) // 2 if x is None else x, y))


def card(lines, u, dur, col=PARCH):
    im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 255)); k = 6; t = u * dur
    hs = [pixtext(l, k, col) for l in lines]; tot = sum(h.height for h in hs) + (len(hs) - 1) * 26; y = (1080 - tot) // 2
    for i, h in enumerate(hs):
        lay(im, h, y, min(1, max(0, (t - .12 - i * .45) / .35)) * min(1, max(0, (dur - t) / .3))); y += h.height + 26
    return im


_BG = {}
def bgframe(name, k, dim):
    key = (name, k)
    if key not in _BG:
        a = np.asarray(Image.open(f'{D}/{name}_{k:04d}.png').convert('RGB').resize((1920, 1080), Image.LANCZOS)).astype(np.float32)
        _BG[key] = a
    return _BG[key] * dim


def title(u, dur, end=False):
    t = u * dur
    fade = min(1, t / .8) * min(1, (dur - t) / .7)
    bg = bgframe('square', 60, .22 * fade) if not end else bgframe('purse', 120, .0)
    if end: bg = bgframe('square', 120, .2 * fade)
    im = Image.fromarray(bg.clip(0, 255).astype(np.uint8)).convert('RGBA')
    lay(im, pixtext('HOLLOW ACRE', 13, PARCH, glow=EMBER), 300 if not end else 250, min(1, max(0, (t - .3) / .7)) * min(1, (dur - t) / .6))
    lay(im, pixtext('COMPETITIVE MODE', 6, BLOOD if not end else PARCH), 560 if not end else 500, min(1, max(0, (t - 1.0) / .6)) * min(1, (dur - t) / .6))
    if end:
        lay(im, pixtext('Up to four players. One town. One purse.', 3, DIM), 640, min(1, max(0, (t - 1.8) / .6)) * min(1, (dur - t) / .6))
        lay(im, pixtext('Play with friends  >  Make a world  >  Against each other', 3, DIM), 720, min(1, max(0, (t - 2.6) / .6)) * min(1, (dur - t) / .6))
    return im


def shotframe(name, k, crop, u):
    p = f'{D}/{name}_{k:04d}.png'
    im = Image.open(p).convert('RGB')
    if crop is None:                               # the middle of the world, pixel for pixel
        w, h = im.size; x0 = (w - 1920) // 2; y0 = (h - 1080) // 2 + 30
        return im.crop((x0, y0, x0 + 1920, y0 + 1080))
    x0, y0, cw, x1, y1 = crop; e = u * u * (3 - 2 * u)
    x = (x0 + (x1 - x0) * e) * K; y = (y0 + (y1 - y0) * e) * K; ch = cw * 9 / 16
    box = (int(x), int(y), int(x + cw * K), int(y + ch * K))
    im = im.crop(box)
    return im if im.size == (1920, 1080) else im.resize((1920, 1080), Image.LANCZOS)


def frames():
    segs, tot = timeline(SC)
    for (a, b, seg) in segs:
        n = int(round((b - a) * FPS))
        if seg[0] == 'black':
            for i in range(n): yield Image.new('RGB', (1920, 1080))
        elif seg[0] == 'card':
            col = BLOOD if len(seg) > 3 and seg[3] == 'blood' else PARCH
            for i in range(n): yield card(seg[1], i / n, seg[2], col).convert('RGB')
        elif seg[0] in ('title', 'end'):
            for i in range(n): yield title(i / n, seg[1], seg[0] == 'end').convert('RGB')
        else:
            name, f0, f1, crop = seg[1], seg[2], seg[3], seg[4]
            for i, k in enumerate(range(f0, f1 + 1)):
                im = shotframe(name, k, crop, i / max(1, f1 - f0))
                e = min(1, (i + 1) / 4, (f1 - k + 1) / 4) if name != 'night' else min(1, (i + 1) / 6)
                if e < 1: im = Image.fromarray((np.asarray(im) * e).astype(np.uint8))
                yield im


if __name__ == '__main__':
    out = 'hollow_acre_compete_preview.mp4' if PREV else 'hollow_acre_compete.mp4'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-i', 'score.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22' if PREV else '18', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE); n = 0
    for im in frames():
        if im.size != (W, H): im = im.resize((W, H), Image.BILINEAR)
        pr.stdin.write(im.tobytes()); n += 1
    pr.stdin.close(); pr.wait(); print(out, n, 'frames', round(n / FPS, 2), 's', 'scare', SC)
