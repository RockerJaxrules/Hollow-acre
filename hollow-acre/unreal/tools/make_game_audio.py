"""The game's own sound clips for Part 2 played live (the owner: "sound needs alot of work"; until now the night's sound was
only mixed afterwards for the videos, make_play_audio.py). Cut and processed from the same CC0 recordings (SourceArt/
Audio/Recorded, SOURCES.md; decoded in Saved/AudioCache) by the same recipes, so the game sounds as the videos did, and
written as WAVs to Saved/GameAudio for Scripts/import_game_audio.py. P2Audio (C++) plays them.

Supermassive's way (WORLD_RESEARCH.md): ambience as a handful of looping layers blended live (wind, the forest, the
room), louder than film; the creature heard before it is seen; scare sounds with a hard front and the tail dropped;
silence as something cut.

Run: python make_game_audio.py"""
import os
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_crash_audio as C
import make_ending_audio as A
import make_play_audio as P
import make_wake_audio as W

SR = C.SR
OUT = os.path.join(HERE, '..', 'HollowAcre', 'Saved', 'GameAudio')


def write(name, x, mono=False):
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 1:
        x = np.stack([x, x])
    if mono:
        x = x.mean(0, keepdims=True)
    pk = np.abs(x).max() or 1.0
    x = x / max(pk, 1.0) * 0.98 if pk > 0.98 else x
    d = (np.clip(x.T, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(d.shape[1])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(d.tobytes())


def loop(x, xf=1.5):
    """A seamless loop: the tail crossfaded into the head."""
    n = int(xf * SR)
    head, tail = x[:, :n], x[:, -n:]
    r = np.linspace(0, 1, n)
    body = x[:, n:-n].copy()
    seam = tail * (1 - r) + head * r
    return np.concatenate([seam, body], 1)


def main():
    os.makedirs(OUT, exist_ok=True)
    # ---- ambience beds (loops): outdoors the mountain's wind and the winter forest; indoors the wind heard through boards
    write('amb_wind_out', loop(C.level(C.steady(W.WIND_OUT, 34.0, skip=4.0), 0.08)))
    write('amb_forest', loop(C.level(C.steady(W.FOREST, 34.0, skip=8.0), 0.05)))
    write('amb_wind_in', loop(C.level(C.filt(C.steady(W.WIND_IN, 30.0, skip=3.0), A.lp(700)), 0.06)))
    # (the stove: snaps and crackles over the draught's low roar)
    rng = np.random.default_rng(7)
    n = int(24 * SR)
    fire = np.zeros((2, n))
    snaps = P.onsets(P.SNAPS, 30, 0.12, 9)
    t = 0.3
    while t < 23.0:
        c = C.level(C.pitch(snaps[rng.integers(0, len(snaps))], rng.uniform(1.1, 1.6)), 0.02 + 0.015 * rng.random())
        s = int(t * SR)
        fire[:, s:s + c.shape[1]] += c[:, :max(0, n - s)]
        t += rng.uniform(0.08, 0.6)
    roar = C.level(C.filt(C.steady(W.WIND_IN, 24.0, skip=3.0), A.lp(400)), 0.02)
    write('amb_fire', loop(fire + roar[:, :n]), mono=True)
    write('amb_heart', loop(C.level(C.steady(P.HEART, 20.0, skip=1.0), 0.06)))
    write('amb_drone', loop(C.level(C.steady(P.DRONE, 30.0, skip=2.0), 0.05)))
    # ---- footsteps: the player's in deep snow (walk, run, crouched), the creature's heavy ones
    for i, c in enumerate(P.onsets(P.STEPS_WALK, 8, 0.35, 1)):
        write('step_walk_%02d' % i, C.level(c, 0.08), mono=True)
    for i, c in enumerate(P.onsets(P.STEPS_RUN, 8, 0.3, 2)):
        write('step_run_%02d' % i, C.level(c, 0.1), mono=True)
    for i, c in enumerate(P.onsets(P.STEPS_SLOW, 6, 0.5, 4)):
        write('step_crouch_%02d' % i, C.level(c, 0.04), mono=True)
    for i, c in enumerate(P.onsets(P.STEPS_HEAVY, 8, 0.45, 3)):
        write('husk_step_%02d' % i, C.level(C.pitch(c, 0.75), 0.1), mono=True)
    # ---- the creature: breath close by, the shriek (heard before it is seen), the growl through boards, the catch
    br = C.pitch(C.loudest(P.BREATH, 1.2, pre=0.05), 0.72)
    write('husk_breath', C.level(br, 0.05), mono=True)
    write('husk_shriek', C.level(P.shriek(), 0.14), mono=True)
    write('husk_scream_close', C.level(P.scream_close(), 0.16))
    write('husk_growl', C.level(C.pitch(C.loudest(P.GROWL, 1.1, pre=0.03), 0.72), 0.1), mono=True)
    # ---- story one-shots
    hit = C.sumc(C.level(C.loudest(P.WOOD_HIT, 0.9, pre=0.02), 0.16), C.level(C.loudest(P.WOOD_CRACK, 0.8, pre=0.02), 0.06),
                 C.level(C.loudest(P.DOWNER, 1.8, pre=0.02), 0.07))
    write('bang', C.verb(hit, 0.9, 0.2))
    cr = C.pitch(C.loudest(P.CREAK, 1.3, pre=0.05), 1.35)
    write('scrape', C.sumc(C.level(cr, 0.05), C.level(C.pitch(C.loudest(P.WOOD_CRACK, 0.5, pre=0.01), 1.6), 0.015)))
    write('sting_look', C.level(C.loudest(P.STING_LOOK, 2.5, pre=0.03), 0.05))
    write('sting_scare', C.level(C.loudest(P.STING_SCARE, 1.6, pre=0.03), 0.08))
    crack = C.level(C.pitch(C.loudest(P.CRACK, 0.3, pre=0.004), 0.6), 0.45)
    boom = C.level(C.pitch(C.loudest(P.BOOM, 1.6, pre=0.01), 0.8), 0.2)
    shot = C.sumc(crack, boom)
    tail = np.zeros((2, int(3.4 * SR)))
    for dt_, g in ((0.55, 0.22), (1.3, 0.12), (2.2, 0.06)):
        e = C.filt(C.verb(shot, 2.5, 0.6), A.lp(900)) * g
        s = int(dt_ * SR)
        tail[:, s:s + e.shape[1]] += e[:, :max(0, tail.shape[1] - s)]
    full = np.zeros((2, max(tail.shape[1], shot.shape[1] + int(2.2 * SR))))
    v = C.verb(shot, 2.2, 0.3)
    full[:, :v.shape[1]] += v[:, :full.shape[1]]
    full[:, :tail.shape[1]] += tail
    write('rifle_shot', full)
    write('body_fall', C.level(C.loudest(P.BODY_FALL, 1.4, pre=0.02), 0.16), mono=True)
    write('door_slam', C.verb(C.level(C.pitch(C.loudest(P.DOOR_SLAM, 1.1, pre=0.01), 0.85), 0.32), 0.8, 0.18), mono=True)
    write('metal_creak', C.level(C.pitch(C.loudest(P.METAL_CREAK, 1.6, pre=0.05), 1.25), 0.05), mono=True)
    write('match_hiss', C.level(C.loudest(P.HISS, 0.45, pre=0.01), 0.04), mono=True)
    write('clicks', C.level(C.loudest(P.CLICKS, 3.0, pre=0.1), 0.03), mono=True)
    # ---- the shed's foley (the owner: the cutscenes need "better sound effects"; recordings in Recorded/shed, CC0):
    # her boots on the boards, a board's creak, the stove's iron door and wood going into it, the journal's pages, her
    # coat, the lantern set down and its rattle as it's trimmed
    SH = 'shed/'
    for i, c in enumerate(P.onsets(SH + 'shed_boot_footsteps_wooden_surface_614291', 8, 0.4, 5)):
        write('ruth_step_%02d' % i, C.level(c, 0.09), mono=True)
    write('board_creak', C.level(C.loudest(SH + 'shed_creaking_floorboard_802582', 0.75, pre=0.02), 0.05), mono=True)
    write('stove_door', C.level(C.loudest(SH + 'shed_stove_door_open_close_213345', 1.3, pre=0.05), 0.12), mono=True)
    write('stove_wood_in', C.level(C.loudest(SH + 'shed_split_firewood_stacking_489885', 0.9, pre=0.03), 0.11), mono=True)
    write('stove_iron', C.level(C.loudest(SH + 'shed_wood_stove_cast_iron_operating_792006', 1.6, pre=0.05), 0.1), mono=True)
    write('pages', C.level(C.loudest(SH + 'shed_book_pages_turning_318615', 1.6, pre=0.05), 0.07), mono=True)
    write('cloth', C.level(C.loudest(SH + 'shed_cloth_rustle_435294', 1.1, pre=0.05), 0.05), mono=True)
    write('lantern_down', C.level(C.loudest(SH + 'shed_lantern_drop_on_wood_637099', 0.8, pre=0.01), 0.07), mono=True)
    write('lantern_rattle', C.level(C.loudest(SH + 'shed_oil_lantern_rattle_516739', 1.0, pre=0.03), 0.05), mono=True)
    print('game audio: %d clips in %s' % (len(os.listdir(OUT)), OUT))


if __name__ == '__main__':
    main()
