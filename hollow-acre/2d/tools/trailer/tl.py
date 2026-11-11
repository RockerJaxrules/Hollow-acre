"""The teaser's edit: one list both the picture (edit.py) and the score (music.py) read, so every cut and hit lines up.
   ('shot', name, first, last)  frames from the capture   ('card', text lines, seconds)   ('black', seconds)   ('title', seconds)"""
FPS = 30
INTRO_T0 = 5.05            # cutscene time of the first intro frame
INTRO_LAST = 388           # the impact flash (T=17.5) and half a second on the wreck
TL = [
    ('black', 1.4),
    ('shot', 'intro', 0, INTRO_LAST),
    ('black', 1.5),
    ('card', ['Grandpa left you the farm.'], 2.4),
    ('shot', 'farm_dawn', 0, 107),
    ('shot', 'field_work', 0, 149),
    ('shot', 'chop', 0, 131),
    ('card', ['Marrow Hollow is glad you came.'], 2.4),
    ('shot', 'town', 0, 107),
    ('shot', 'caitlyn', 0, 107),
    ('shot', 'festival', 0, 101),
    ('card', ['Every October,', 'the valley draws one name.'], 3.2),
    ('card', ['This year, it drew yours.'], 2.6),
    ('shot', 'tithe_night', 0, 101),
    ('shot', 'lake_night', 0, 89),
    ('shot', 'graves_night', 12, 89),
    ('shot', 'corn_watch', 0, 137),
    ('shot', 'scare', 4, 58),
    ('black', 1.3),
    ('title', 6.5),
]


def timeline():
    """start/end seconds of every segment"""
    t = 0; out = []
    for seg in TL:
        d = seg[-1] if seg[0] in ('black', 'card', 'title') else (seg[3] - seg[2] + 1) / FPS
        out.append((t, t + d, seg)); t += d
    return out, t


def at(name):
    for (a, b, seg) in timeline()[0]:
        if seg[0] == 'shot' and seg[1] == name or seg[0] == 'card' and name in ' '.join(seg[1]) or seg[0] == name:
            return a, b
    raise KeyError(name)


def intro_t(T):
    """timeline seconds of cutscene time T"""
    a, _ = at('intro'); return a + (T - INTRO_T0)


if __name__ == '__main__':
    segs, tot = timeline()
    for a, b, s in segs:
        print(f'{a:6.2f} {b:6.2f}  {s[0]:5s} {s[1] if len(s) > 2 else ""}')
    print('total', round(tot, 2))
