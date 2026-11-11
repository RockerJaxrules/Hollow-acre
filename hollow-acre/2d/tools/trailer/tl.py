"""The teaser's edit: one list both the picture (edit.py) and the score (music.py) read, so every cut and hit lines up.
   ('shot', name, first, last)  frames from the capture   ('card', text lines, seconds)   ('black', seconds)
   ('flash', seconds) a subliminal frame of the face   ('title', seconds)
   This cut is built on motion, not stills: a lamp alone in the dark, the valley's warm lie, then the Hollow
   coming down out of the black right over you, a pale thing standing up out of the well, it gaining behind you,
   a held breath, the face. Almost no words — the pictures and the sound do the work."""
FPS = 30
INTRO_T0 = 5.05            # (unused here; kept so music.py's helpers still import)
INTRO_LAST = 388
TL = [
    ('black', 1.4),
    # COLD OPEN — a lamp alone in the black; the quiet is wrong
    ('shot', 'lantern', 6, 96),            # ~3.0s, let it sit
    ('flash', 0.033),                      # one frame of the face, buried in the dark
    ('shot', 'lantern', 99, 150),          # ~1.7s
    ('black', 0.7),
    # THE LIE — the valley, warm, glad you came
    ('card', ['Marrow Hollow is so glad you came.'], 2.7),
    ('shot', 'farm_dawn', 10, 68),         # ~2.0s
    ('shot', 'town', 8, 62),               # ~1.8s
    ('shot', 'festival', 8, 64),           # ~1.9s
    ('shot', 'caitlyn', 10, 58),           # ~1.6s
    ('black', 0.4),
    # THE TURN — it comes down out of the dark, right over you. Hold on it as it arrives and looms.
    ('shot', 'approach', 28, 152),         # ~4.2s: descends, then looms huge and breathing right over you
    ('black', 0.22),
    # THE HAUNTINGS — faster now, a different wrongness each cut
    ('shot', 'well', 40, 108),             # ~2.3s  a pale thing stands up out of the well
    ('shot', 'corn', 50, 104),             # ~1.8s  a figure hung in the far row, its face coming round
    ('shot', 'chase', 12, 82),             # ~2.37s it is behind you and gaining
    ('shot', 'approach', 152, 179),        # ~0.93s snap back: the mass, right on top of you
    # THE HELD BREATH — everything stops, the sound drops out
    ('black', 2.0),
    # THE BUTTON — the face
    ('shot', 'scare', 4, 54),              # ~1.7s
    ('black', 1.1),
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
    a, _ = at('lantern'); return a + (T - INTRO_T0)


if __name__ == '__main__':
    segs, tot = timeline()
    for a, b, s in segs:
        print(f'{a:6.2f} {b:6.2f}  {s[0]:6s} {s[1] if len(s) > 2 else ""}')
    print('total', round(tot, 2))
