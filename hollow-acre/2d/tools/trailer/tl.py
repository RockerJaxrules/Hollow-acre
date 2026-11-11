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
    ('shot', 'town', 0, 95),
    ('shot', 'caitlyn', 0, 95),
    ('shot', 'festival', 0, 95),
    ('card', ['Every October,', 'the valley draws one name.'], 3.0),
    ('card', ['This year, it drew yours.'], 2.4),
    # --- the hauntings: fast cuts, one horror after another ---
    ('shot', 'tithe_night', 0, 58),                       # the standing stones at dark
    ('shot', 'hs_june', 16, 72),                          # a back at every lit window
    ('card', ['A back at every window.'], 1.9),
    ('shot', 'hs_agnes', 26, 82),                         # the drowned girl at the well, pointing in
    ('shot', 'lake_night', 0, 52),                        # the black water
    ('card', ['The valley keeps what it takes.'], 2.0),
    ('shot', 'hs_ada', 22, 80),                           # the Hollow, stood at your back
    ('card', ['He is always just behind you.'], 2.0),
    ('shot', 'hs_silas', 22, 78),                         # a fresh grave, cut in the rain
    ('card', ['They dug it to your size.'], 2.0),
    ('shot', 'graves_night', 12, 70),                     # the headstones
    ('flash', 0.067),                                     # a frame of the face, buried in the cut
    ('shot', 'corn_watch', 24, 138),                      # it comes through the corn
    ('card', ["You've done all this before."], 2.3),
    ('black', 0.4),
    ('shot', 'scare', 4, 58),
    ('black', 1.3),
    ('title', 6.5),
]


def timeline():
    """start/end seconds of every segment"""
    t = 0; out = []
    for seg in TL:
        d = seg[-1] if seg[0] in ('black', 'card', 'title', 'flash') else (seg[3] - seg[2] + 1) / FPS
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
