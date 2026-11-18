"""Writes an IES light profile (IESNA LM-63-2002) for the wake's flashlight: an old two-D-cell incandescent flashlight with
a smooth parabolic reflector, focused. How such a beam measures (published beam shots and beam profiles of reflector
incandescent flashlights): a hot centre a few degrees wide, a darker gap, a faint ring from the reflector's edge, then the
bulb's direct spill fading out where the head cuts it off (about 35 degrees). Values are relative (the game sets the
brightness; Unreal's "Use IES Intensity" stays off), symmetric about the beam's axis.

usage: python make_flashlight_ies.py <out.ies>"""
import sys

# (vertical angle from the beam's axis in degrees, relative candela)
PROFILE = [
    # (the hot centre softened (it whited out a wall at arm's length): wider and gentler, falling off over 8 degrees)
    (0, 1.00), (1, 0.99), (2, 0.97), (3, 0.93), (4, 0.86), (5, 0.75), (6, 0.60), (7, 0.45), (8, 0.32), (9, 0.24),
    (10, 0.20), (11, 0.19), (12, 0.17), (13, 0.14), (15, 0.10), (18, 0.075), (22, 0.05), (26, 0.035), (30, 0.02),
    (33, 0.008), (36, 0.0), (45, 0.0), (90, 0.0),
]

out = sys.argv[1]
angles = [a for a, _ in PROFILE]
cd = [round(v * 1000.0, 1) for _, v in PROFILE]
with open(out, 'w', newline='\r\n') as f:
    f.write('IESNA:LM-63-2002\n')
    f.write('[TEST] Hollow Acre, procedural from beam profiles of reflector incandescent flashlights\n')
    f.write('[MANUFAC] Hollow Acre\n')
    f.write('[LUMCAT] WAKE-FLASHLIGHT\n')
    f.write('[LUMINAIRE] two D-cell incandescent flashlight, smooth reflector, focused\n')
    f.write('TILT=NONE\n')
    f.write('1 -1 1 %d 1 1 2 0 0 0\n' % len(angles))
    f.write('1.0 1.0 3.0\n')
    f.write(' '.join('%g' % a for a in angles) + '\n')
    f.write('0\n')
    f.write(' '.join('%g' % c for c in cd) + '\n')
print('wrote', out, len(angles), 'angles')
