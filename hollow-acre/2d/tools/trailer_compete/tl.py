"""The competitive-mode trailer's edit: one list the picture (edit.py) and the score (music.py) both read, so every cut and
   click lines up.  ('shot', name, first, last, crop)  ('card', lines, seconds[, colour])  ('black', s)  ('title', s)  ('end', s)
   crop: None (the middle of the world, 1:1) or (x0, y0, w, x1, y1) in CSS pixels of the 1280x720 page, panned from x0,y0 to x1,y1"""
FPS = 30
TL = [
    ('black', .5),
    ('title', 3.6),
    ('card', ['Play with friends.', 'Or against them.'], 2.6),
    ('shot', 'rules', 6, 112, (236, 0, 808, 236, 0)),
    ('card', ['One market for everybody.', 'Every crate you sell', 'pushes the price down.'], 3.4),
    ('shot', 'farm', 0, 107, None),
    ('shot', 'prices', 0, 105, (270, 40, 740, 270, 40)),
    ('card', ['The town posts orders.', 'First to deliver gets paid.', 'Nobody else does.'], 3.2),
    ('shot', 'deliver', 0, 99, (160, 70, 960, 160, 70)),
    ('card', ['Two rival farms', 'play the same market.'], 2.4),
    ('shot', 'stolen', 0, 125, (160, 70, 960, 160, 180)),
    ('card', ['Open a shop on the square.'], 2.2),
    ('shot', 'square', 0, 125, None),
    ('shot', 'ledger', 0, 143, (160, 0, 960, 160, 60)),
    ('card', ['Steal their staff.'], 1.7),
    ('shot', 'poach', 0, 104, (160, 0, 960, 160, 0)),
    ('card', ['Bid for the big orders.'], 1.8),
    ('shot', 'deal', 0, 104, (160, 60, 960, 160, 60)),
    ('card', ['Play it clean…'], 1.7),
    ('shot', 'clean', 0, 89, (160, 0, 960, 160, 0)),
    ('card', ['…or dirty.'], 1.7, 'blood'),
    ('shot', 'dirty', 0, 137, (90, 100, 1100, 90, 100)),
    ('card', ['Somebody always sees.'], 2.0, 'blood'),
    ('shot', 'night', 0, 'SCARE', None),
    ('black', .9),
    ('card', ['Every seventh day,', 'the Grange pays the top farm.'], 3.0),
    ('shot', 'purse', 0, 137, (160, 0, 960, 160, 0)),
    ('end', 6.0),
]
# what the score hits: (shot, frame, kind)
HITS = [('rules', 32, 'click'), ('deliver', 34, 'click'), ('deliver', 35, 'coin'), ('stolen', 30, 'click'), ('stolen', 31, 'deny'),
        ('ledger', 24, 'click'), ('ledger', 96, 'click'), ('poach', 30, 'click'), ('poach', 31, 'coin'), ('deal', 48, 'click'),
        ('clean', 28, 'click'), ('dirty', 26, 'click'), ('dirty', 50, 'click'), ('dirty', 51, 'caught'), ('purse', 34, 'coins')] + \
       [('prices', 10 + i * 9, 'tick%d' % i) for i in range(9)]
SCARE = None   # filled in by edit.py/music.py from the capture: the frame the face fills the screen


def scare_frame(d='full'):
    """the first frame of the night shot that is mostly the face: much brighter and redder than the dark field before it"""
    import os, numpy as np
    from PIL import Image
    fs = sorted(f for f in os.listdir(d) if f.startswith('night_'))
    for f in fs:
        a = np.asarray(Image.open(os.path.join(d, f)).convert('RGB').resize((160, 90))).astype(float)
        if a.mean() > 170 or (a[..., 0].mean() > 70 and a[..., 0].mean() > a[..., 2].mean() * 1.5): return int(f[6:10])   # the flash, or the face
    return int(fs[-1][6:10])


def timeline(scare=None):
    t = 0; out = []
    for seg in TL:
        if seg[0] == 'shot':
            last = (scare or 95) + 14 if seg[3] == 'SCARE' else seg[3]
            seg = seg[:3] + (last,) + seg[4:]; d = (last - seg[2] + 1) / FPS
        else:
            d = seg[2] if seg[0] == 'card' else seg[1]
        out.append((t, t + d, seg)); t += d
    return out, t


def at(name, scare=None):
    for (a, b, seg) in timeline(scare)[0]:
        if (seg[0] == 'shot' and seg[1] == name) or (seg[0] == 'card' and seg[1][0].startswith(name)) or seg[0] == name: return a, b
    raise KeyError(name)
