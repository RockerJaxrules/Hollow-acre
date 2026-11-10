"""Cut the teaser: captured frames + title cards in the game's own pixel font + the score -> hollow_acre_teaser.mp4
   python3 edit.py [preview]   preview: 640x360, faster"""
import sys, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from tl import TL, FPS, timeline

PREV = len(sys.argv) > 1 and sys.argv[1] == 'preview'
W, H = (640, 360) if PREV else (1920, 1080)
FONT = ImageFont.truetype('hollowpixel.ttf', 10)          # its native size: every glyph pixel is one pixel
PARCH = (232, 220, 192); EMBER = (214, 84, 40); BLOOD = (176, 34, 30)
SRC = {'intro': 'intro2' if os.path.isdir('intro2') else 'full'}


def pixtext(text, k, col, glow=None):
    """text drawn at the font's native size, then scaled up k times with hard edges; an optional soft glow behind"""
    bb = FONT.getbbox(text); w, h = bb[2] - bb[0] + 2, bb[3] - bb[1] + 2
    m = Image.new('L', (w, h)); ImageDraw.Draw(m).text((1 - bb[0], 1 - bb[1]), text, font=FONT, fill=255)
    m = m.resize((w * k, h * k), Image.NEAREST)
    im = Image.new('RGBA', m.size, col + (0,)); im.putalpha(m)
    if glow:
        g = Image.new('RGBA', (m.width + 8 * k, m.height + 8 * k), glow + (0,)); ga = Image.new('L', g.size); ga.paste(m, (4 * k, 4 * k))
        g.putalpha(ga.filter(ImageFilter.GaussianBlur(k * 2.2))); g.alpha_composite(im, (4 * k, 4 * k)); return g
    return im


def card(lines, u, dur, col=PARCH):
    """black card, lines fading in one after another, all fading out at the end"""
    im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 255)); k = 6
    t = u * dur
    hs = [pixtext(l, k, col) for l in lines]; tot = sum(h.height for h in hs) + (len(hs) - 1) * 26; y = (1080 - tot) // 2
    for i, h in enumerate(hs):
        a = min(1, max(0, (t - .15 - i * .55) / .45)) * min(1, max(0, (dur - t) / .4))
        if a > 0:
            h2 = h.copy(); h2.putalpha(h.getchannel('A').point(lambda v: int(v * a))); im.alpha_composite(h2, ((1920 - h.width) // 2, y))
        y += h.height + 26
    return im


_TBG = None
def title(u, dur):
    global _TBG
    t = u * dur
    if _TBG is None:   # the face from the jump scare, sunk almost to black behind the name
        f = sorted(x for x in os.listdir('full') if x.startswith('scare_'))[14]
        bg = Image.open('full/' + f).convert('RGB'); _TBG = np.asarray(bg).astype(np.float32)
    flick = .14 + .05 * np.sin(t * 7.3) * np.sin(t * 2.1) + (.06 if int(t * 10) in (21, 22, 37) else 0)
    fade = min(1, t / 1.2) * min(1, (dur - t) / .8)
    im = Image.fromarray((_TBG * flick * fade).clip(0, 255).astype(np.uint8)).convert('RGBA')
    T = pixtext('HOLLOW ACRE', 14, PARCH, glow=EMBER)
    a = min(1, max(0, (t - .5) / .9)) * min(1, (dur - t) / .8)
    def lay(img, y, a):
        if a <= 0: return
        i2 = img.copy(); i2.putalpha(img.getchannel('A').point(lambda v: int(v * a))); im.alpha_composite(i2, ((1920 - img.width) // 2, y))
    lay(T, 330, a)
    lay(pixtext('Attendance is kind.', 5, PARCH), 600, min(1, max(0, (t - 2.0) / .8)) * min(1, (dur - t) / .8))
    lay(pixtext('COMING SOON', 3, (150, 140, 120)), 900, min(1, max(0, (t - 3.6) / .8)) * min(1, (dur - t) / .8))
    return im


def frames():
    segs, tot = timeline()
    cozy = {'farm_morning', 'farm_work', 'green_noon', 'market', 'festival', 'caitlyn', 'orchard'}
    for (a, b, seg) in segs:
        n = int(round((b - a) * FPS))
        if seg[0] == 'black':
            for i in range(n): yield Image.new('RGB', (1920, 1080))
        elif seg[0] == 'card':
            col = BLOOD if 'drew yours' in seg[1][0] else PARCH
            for i in range(n): yield card(seg[1], i / n, seg[2], col).convert('RGB')
        elif seg[0] == 'title':
            for i in range(n): yield title(i / n, seg[1]).convert('RGB')
        else:
            name, f0, f1 = seg[1], seg[2], seg[3]; d = SRC.get(name, 'full'); last = None
            for i, k in enumerate(range(f0, f1 + 1)):
                p = f'{d}/{name}_{k:04d}.png'
                im = Image.open(p).convert('RGB') if os.path.exists(p) else last; last = im
                if name in cozy:                                  # soft dips at the cozy cuts; the nights cut hard
                    e = min(1, (i + 1) / 4, (f1 - k + 1) / 4)
                    if e < 1: im = Image.fromarray((np.asarray(im) * e).astype(np.uint8))
                yield im


if __name__ == '__main__':
    out = 'hollow_acre_teaser_preview.mp4' if PREV else 'hollow_acre_teaser.mp4'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-i', 'score.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20' if PREV else '17', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE); n = 0
    for im in frames():
        if im.size != (W, H): im = im.resize((W, H), Image.NEAREST if not PREV else Image.BILINEAR)
        pr.stdin.write(im.tobytes()); n += 1
    pr.stdin.close(); pr.wait(); print(out, n, 'frames', round(n / FPS, 2), 's')
