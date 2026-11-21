"""The letter on the passenger seat in Part 2's opening: Kessler's letter from Part 1's ending (2d/src/ending_story.js,
word for word), typed on cheap company paper, folded in three and opened again, a little crumpled from the drive.
Typeset in Droid Sans Mono (Apache 2.0, shipped with Unreal at Engine/Content/Slate/Fonts). Writes
SourceArt/T_Letter.png (21.6 x 27.9 cm at about 1024 x 1322).
Run: python hollow-acre/unreal/tools/make_letter_tex.py
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'HollowAcre', 'SourceArt', 'T_Letter.png')
FONT = 'C:/UE_5.8/Engine/Content/Slate/Fonts/DroidSansMono.ttf'
W, H = 1024, 1322
LINES = [
    'HOLLOW MINING COMPANY',
    'Office of the Foreman',
    '',
    'To the family,',
    '',
    'I am writing because you are the only',
    'family she put down.',
    '',
    'Your grandmother went up to the old',
    'workings nine days ago, alone, and she',
    'has not come back down. We searched',
    'until the weather turned on us. The',
    'pass is closing.',
    '',
    'Her papers say the company goes to you',
    'if anything happens to her. Something',
    'has.',
    '',
    'If you are coming, come now, before the',
    'road shuts for the winter.',
    '',
    '                     R. Kessler, foreman',
]


def main():
    rng = np.random.default_rng(9)
    paper = np.ones((H, W, 3), np.float32) * np.array([0.86, 0.83, 0.74])
    grain = np.asarray(Image.fromarray((rng.random((H, W)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), np.float32) / 255
    blot = np.asarray(Image.fromarray((rng.random((H // 32, W // 32)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    paper *= (0.94 + 0.06 * grain[..., None]) * (0.95 + 0.05 * blot[..., None])
    # the folds (in three) and a crumple or two: darker creases
    y = np.arange(H)[:, None]
    for fy in (H / 3, 2 * H / 3):
        paper *= (1 - 0.18 * np.exp(-((y - fy) / 3.0) ** 2))[..., None]
    img = Image.fromarray((np.clip(paper, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    f_head = ImageFont.truetype(FONT, 34)
    f_body = ImageFont.truetype(FONT, 30)
    yy = 110
    for i, line in enumerate(LINES):
        f = f_head if i < 2 else f_body
        # typewriter ink: a little uneven
        ink = int(30 + rng.integers(0, 25))
        d.text((88 + int(rng.integers(-2, 3)), yy), line, font=f, fill=(ink, ink, ink + 10))
        yy += 44 if i < 2 else 42
    img.save(OUT)
    print('wrote', OUT)


if __name__ == '__main__':
    main()
