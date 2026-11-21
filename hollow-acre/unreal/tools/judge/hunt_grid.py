import sys
from PIL import Image, ImageDraw
d, times, out, cols = sys.argv[1], [float(x) for x in sys.argv[2].split(',')], sys.argv[3], int(sys.argv[4])
W, H = 480, 270
rows = (len(times) + cols - 1) // cols
img = Image.new('RGB', (W * cols, H * rows)); dr = ImageDraw.Draw(img)
for i, t in enumerate(times):
    f = round(t * 30)
    try:
        import os as _o
        fp = '%s/frame_%05d.png' % (d, f)
        fp = fp if _o.path.exists(fp) else fp[:-4] + '.jpg'
        im = Image.open(fp).convert('RGB').resize((W, H))
        img.paste(im, ((i % cols) * W, (i // cols) * H))
    except Exception as e:
        pass
    dr.text(((i % cols) * W + 5, (i // cols) * H + 5), '%.1f s' % t, fill='yellow')
img.save(out, quality=88)
