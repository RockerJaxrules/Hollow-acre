"""Write one .pxg per frame (for grid.py view / validate / lint). Run from this folder."""
from frames import PAL, FRAMES
for n, r, a in FRAMES:
    with open('crow_%s.pxg' % n, 'w') as f:
        f.write('name crow_%s\nanchor %d %d\n' % (n, a[0], a[1]))
        for k, v in PAL.items(): f.write('pal %s %s\n' % (k, v))
        f.write('grid\n' + '\n'.join(r) + '\nend\n')
