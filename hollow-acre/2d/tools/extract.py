"""find sprites in a sheet as connected alpha blobs (8-connected, with small gap bridging) and draw a labelled index."""
import sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
def blobs(path, gap=2, minpx=40):
    a = np.asarray(Image.open(path).convert('RGBA'))[..., 3] > 0
    H, W = a.shape
    # dilate to bridge tiny gaps
    d = a.copy()
    for _ in range(gap):
        e = d.copy(); e[1:] |= d[:-1]; e[:-1] |= d[1:]; e[:, 1:] |= d[:, :-1]; e[:, :-1] |= d[:, 1:]; d = e
    lab = np.zeros((H, W), np.int32); cur = 0; boxes = []
    for y in range(H):
        for x in range(W):
            if d[y, x] and not lab[y, x]:
                cur += 1; st = [(y, x)]; lab[y, x] = cur; x0 = x1 = x; y0 = y1 = y; n = 0
                while st:
                    yy, xx = st.pop(); n += a[yy, xx]
                    x0 = min(x0, xx); x1 = max(x1, xx); y0 = min(y0, yy); y1 = max(y1, yy)
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = yy + dy, xx + dx
                            if 0 <= ny < H and 0 <= nx < W and d[ny, nx] and not lab[ny, nx]: lab[ny, nx] = cur; st.append((ny, nx))
                if n >= minpx: boxes.append([int(x0 + gap), int(y0 + gap), int(x1 - gap + 1), int(y1 - gap + 1)])
    return boxes
if __name__ == '__main__':
    path, out = sys.argv[1], sys.argv[2]
    bx = blobs(path); im = Image.open(path).convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 0, 255, 255)); bg.alpha_composite(im)
    s = 2 if max(im.size) <= 700 else 1.4
    bg = bg.resize((int(im.width * s), int(im.height * s)), Image.NEAREST); d = ImageDraw.Draw(bg)
    for i, (x0, y0, x1, y1) in enumerate(bx):
        d.rectangle((x0 * s, y0 * s, x1 * s, y1 * s), outline=(0, 0, 0)); d.text((x0 * s + 1, y0 * s), str(i), fill=(255, 255, 255))
    bg.save(out); json.dump(bx, open(out + '.json', 'w')); print(len(bx))
