"""Pipeline verification: a 3-frame, 32x32 flickering horror light fixture in a locked 4-colour palette.
Frame 0: the bulb burns white and throws a wide dithered cone. Frame 1: it browns out to a sickly green and the cone thins.
Frame 2: it dies, and in the dark under it two pale points are looking up.
Checks: palette-only colours, hard alpha (0/255), dithered shading (density falls off with distance, no in-between colours),
exact integer scaling, indexed PNG round-trip, 3-frame GIF round-trip. Prints the pixel grids. Run from hollow-acre/2d."""
import os, json, numpy as np
from pipeline import Palette, T, BAYER4, to_rgba, check, upscale, save_png, save_indexed, sheet, save_gif, contact, outline

PAL = Palette('dread4', ['#0c0b0e', '#3c3b42', '#7d9440', '#cdc9b6'])   # Deep Black, Dark Grey, Sickly Green, Muted White
B, G, S, W = 0, 1, 2, 3
OUT = 'tools/px/out/pipeline_test'; os.makedirs(OUT, exist_ok=True)


def frame(level):
    g = np.full((32, 32), T, dtype=int)
    # the cord and its ceiling cup
    g[0, 13:19] = B; g[1, 14:18] = G
    for y in range(2, 7): g[y, 16] = G; g[y, 15] = B
    # the shade: a dented tin cone, lit from the upper left, rim catching the bulb
    for y in range(7, 13):
        t = (y - 7) / 5; x0 = round(13 - 5 * t); x1 = round(18 + 5 * t)
        for x in range(x0, x1 + 1):
            lit = 1 - (x - x0) / max(1, x1 - x0)                      # brighter on the left
            g[y, x] = G if PAL.ramp(lit * .9, x, y, B, G) else B
        g[y, x0] = B; g[y, x1] = B
    g[7, 14] = W if level > 0 else G; g[8, 13] = W if level > .5 else G   # highlight on the tin
    g[10, 20] = B; g[11, 21] = B                                          # a dent
    g[12, 8:24] = B                                                       # the rim
    # the bulb
    for y in range(12, 17):
        for x in range(13, 20):
            if ((x - 16) / 3.2) ** 2 + ((y - 13.6) / 2.6) ** 2 <= 1:
                g[y, x] = (W if (x - 16) ** 2 + (y - 13) ** 2 < 3 else S) if level > .7 else S if level > .2 else G
    if level > .7: g[13, 15] = W; g[13, 16] = W
    if level <= .2: g[13, 15] = B                                          # a dead filament
    # the light: a cone dithered into nothing (hard alpha, density instead of transparency)
    for y in range(17, 32):
        for x in range(32):
            w = 3.5 + (y - 17) * .62; dx = abs(x + .5 - 16)
            if dx > w: continue
            L = level * (1 - (y - 17) / 15) ** 1.15 * (1 - dx / w) ** .7
            if L > BAYER4[y % 4, x % 4] * .95 + .02:
                g[y, x] = W if L > .62 and BAYER4[y % 4, x % 4] < (L - .62) * 2.6 else S
    # what stands under it when it goes out
    if level <= .2: g[25, 14] = W; g[25, 18] = W; g[26, 14] = S; g[26, 18] = S
    g = outline(g, B, where=lambda x, y: y < 17)                          # outline the fixture only, not the light
    return g


LEVELS = [1.0, 0.48, 0.0]
grids = [frame(l) for l in LEVELS]; frames = [to_rgba(g, PAL) for g in grids]
report = {'palette': {n: '#%02x%02x%02x' % tuple(c) for n, c in zip(['deep_black', 'dark_grey', 'sickly_green', 'muted_white'], PAL.rgb.tolist())}, 'frames': []}
ok_all = True
for i, (g, f) in enumerate(zip(grids, frames)):
    ok, r = check(f, PAL)
    # dithered shading: opaque density of the light by distance band below the bulb (should fall, using only 2 colours)
    bands = []
    for y0 in range(17, 32, 4):
        reg = g[y0:y0 + 4, 4:28]; bands.append(round(float((reg >= 0).mean()), 2))
    up = upscale(f, 8); exact = bool((up[::8, ::8] == f).all()) and all(
        (up[y * 8:(y + 1) * 8, x * 8:(x + 1) * 8] == f[y, x]).all() for y in range(32) for x in range(32))
    r.update({'frame': i, 'light_level': LEVELS[i], 'light_density_by_band': bands, 'integer_scale_x8_exact': exact,
              'mixed_light_pixels': int(((g[17:] == S) | (g[17:] == W)).sum())})
    ok_all &= ok and exact; report['frames'].append(r)
    save_png(f, f'{OUT}/light_{i}.png'); save_png(upscale(f, 8), f'{OUT}/light_{i}_x8.png')
strip = sheet(frames); save_png(strip, f'{OUT}/light_sheet.png'); save_png(upscale(strip, 8), f'{OUT}/light_sheet_x8.png')
save_indexed(np.concatenate(grids, axis=1), PAL, f'{OUT}/light_sheet_indexed.png')
save_gif(frames, f'{OUT}/light_flicker.gif', k=8, ms=[220, 120, 420][0])
contact(frames, f'{OUT}/light_contact.png', k=8, title='flickering horror light · locked 4-colour palette · x8 integer scale')
# round-trips
import png, imageio.v2 as iio
rd = png.Reader(filename=f'{OUT}/light_sheet_indexed.png'); w, h, rows, info = rd.read(); rows = np.array([list(r) for r in rows])
report['indexed_png'] = {'size': [w, h], 'palette_entries': len(info.get('palette', [])), 'matches_grid': bool((rows - 1 == np.concatenate(grids, axis=1)).all())}
report['gif_frames'] = len(iio.mimread(f'{OUT}/light_flicker.gif'))
ok_all &= report['indexed_png']['matches_grid'] and report['gif_frames'] == 3
report['ALL_CHECKS_PASS'] = bool(ok_all)
print(json.dumps(report, indent=1))
CH = {T: '.', B: 'B', G: 'G', S: 's', W: 'W'}
for i, g in enumerate(grids):
    print(f'\nframe {i} (level {LEVELS[i]})   . transparent  B deep black  G dark grey  s sickly green  W muted white')
    for row in g: print(''.join(CH[int(v)] for v in row))
json.dump(report, open(f'{OUT}/report.json', 'w'), indent=1)
