"""Sound for Part 2 in play (after the wake): the wake's own mix up to the handover (make_wake_audio.py), then the night at
the bottom, laid on the moments the game logs ("CrashEvent <time> <kind> <value>"):
- the mountain's wind and the winter forest at night under everything;
- the player's own steps in the deep snow (walking, running, crouched), close and dry;
- the husk hunting (HuskHunter.cpp): its heavy steps in the snow, quieter with distance (value: cm); its gallop when it
  charges; its breath when it stalks near; the shriek as it charges (the crash's torn human shriek: a demon shriek, a man's
  scream through a torn throat, growls under it, de-squealed); at the catch a scream at the ear, then nothing;
- a heartbeat felt more than heard, rising with the director's menace gauge (value: 0-100).
No voices from the player (captions only). Every sound a real recording (SourceArt/Audio/Recorded, CC0, SOURCES.md).

Run: python make_play_audio.py <unreal log> <length s> <out.wav> [<decoded recordings>]
"""
import sys

import numpy as np

import make_crash_audio as C
import make_ending_audio as A
import make_wake_audio as W

SR = C.SR
STEPS_WALK = 'footsteps/footsteps_deep_snow_steps_speeds_719624'
STEPS_RUN = 'footsteps/footsteps_running_on_frozen_snow_712022'
STEPS_HEAVY = 'footsteps/footsteps_heavy_steps_snow_543385'
STEPS_SLOW = 'footsteps/footsteps_deep_snow_heavy_slow_480621'
HEART = 'body/body_heartbeat_racing_after_exercise_455440'
BREATH = 'creature_extra/creature_extra_pug_close_breaths_snarls_377001'
CV = 'creature_voice/creature_voice_'


def onsets(name, n, dur=0.35, seed=1):
    """n short footfalls cut from a recording of steps: each a slice around a loud transient."""
    x = C.load(name)
    m = x.mean(0) if x.ndim == 2 else x
    env = np.convolve(np.abs(m), np.ones(256) / 256, mode='same')
    rng = np.random.default_rng(seed)
    out = []
    hop = int(0.12 * SR)
    peaks = [i for i in range(hop, len(env) - int(dur * SR), hop) if env[i] == env[i - hop // 2:i + hop // 2].max() and env[i] > env.mean() * 1.5]
    if not peaks:
        peaks = list(range(SR, len(env) - SR, SR))
    for k in range(n):
        p = peaks[rng.integers(0, len(peaks))]
        s = max(0, p - int(0.04 * SR))
        c = m[s:s + int(dur * SR)].copy()
        out.append(C.fade(np.stack([c, c]), 0.004, 0.08))
    return out


def shriek(seed=3):
    n = int(1.3 * SR)
    sh = np.zeros((2, n))
    for c, g in ((C.voice(CV + 'demon_shriek_433735', 1.35, 0.9, drive=3.0, fry=58.0, grit=0.3, many=True), 1.0),
                 (C.voice(CV + 'male_screams_556976', 1.35, 0.94, drive=3.0, fry=46.0, depth=0.42), 0.8),
                 (C.pitch(C.loudest('creature/creature_black_bear_angry_growl_763026', 1.3, pre=0.08), 0.75), 0.35)):
        c = c[:, :n]
        sh[:, :c.shape[1]] += C.level(C.fade(c, 0.015, 0.35), 0.1) * g
    return C.detone(sh)


def scream_close():
    """The catch: at the ear, the shriek and a man's scream torn, dry (no room: it is right there)."""
    n = int(1.6 * SR)
    x = np.zeros((2, n))
    for c, g in ((C.voice(CV + 'demon_shriek_433735', 1.6, 0.86, at=6.5, drive=3.2, fry=56.0, grit=0.32, seed=11, many=True), 1.0),
                 (C.voice('creature_extra/creature_extra_human_monster_screams_391552', 1.6, 0.92, drive=2.8, fry=50.0), 0.75)):
        c = c[:, :n]
        x[:, :c.shape[1]] += C.level(C.fade(c, 0.005, 0.5), 0.12) * g
    return C.detone(x)


def play(ev, total):
    first = lambda k, d=None: next((t for t, kk, v in ev if kk == k), d)
    t_play = first('play', None)
    wake_ev = [e for e in ev if t_play is None or e[0] < t_play + 0.5]
    mix = W.wake(wake_ev, total)
    if t_play is None:
        return mix
    M = C.Mix(total)
    M.x = mix
    # the night: wind and the forest, under everything from the handover on
    wind = C.steady(W.WIND_OUT, total - t_play + 1.0, skip=4.0)
    forest = C.steady(W.FOREST, total - t_play + 1.0, skip=8.0)
    M.bed(C.level(wind, 0.03), t_play, total, [(t_play, 0.0), (t_play + 1.5, 1.0), (total, 1.0)])
    M.bed(C.level(forest, 0.02), t_play, total, [(t_play, 0.0), (t_play + 2.0, 1.0), (total, 1.0)])
    walk = onsets(STEPS_WALK, 24, 0.35, 1)
    run = onsets(STEPS_RUN, 24, 0.3, 2)
    heavy = onsets(STEPS_HEAVY, 24, 0.45, 3)
    slow = onsets(STEPS_SLOW, 16, 0.5, 4)
    rng = np.random.default_rng(7)
    sh = shriek()
    sc = scream_close()
    breath = C.loudest(BREATH, 1.2, pre=0.05)
    breath = C.pitch(breath, 0.72)
    heart = C.steady(HEART, total - t_play + 1.0, skip=1.0)
    menace = [(t, v) for t, k, v in ev if k == 'menace']
    t_kill = [t for t, k, v in ev if k == 'husk_kill']
    for t, k, v in ev:
        if t < t_play:
            continue
        if k == 'step_walk':
            M.at(t, C.level(walk[rng.integers(0, len(walk))], 0.05), 1.0)
        elif k == 'step_run':
            M.at(t, C.level(run[rng.integers(0, len(run))], 0.07), 1.0)
        elif k == 'step_crouch':
            M.at(t, C.level(slow[rng.integers(0, len(slow))], 0.02), 1.0)
        elif k in ('husk_step', 'husk_gallop'):
            d = max(150.0, v)
            g = min(1.0, (400.0 / d) ** 1.2)
            c = heavy[rng.integers(0, len(heavy))]
            c = C.pitch(c, 0.78 if k == 'husk_step' else 0.7)
            M.at(t, C.level(c, 0.06 if k == 'husk_step' else 0.09), g)
        elif k == 'husk_breath':
            d = max(150.0, v)
            M.at(t, C.level(breath[:, :int(0.5 * SR)], 0.03), min(1.0, (500.0 / d) ** 1.3))
        elif k == 'husk_shriek':
            M.at(t, C.verb(sh, 1.4, 0.28), 1.0)
        elif k == 'husk_kill':
            M.at(t + 0.1, sc, 1.3)
    if menace:
        ts = [t for t, v in menace]
        gs = [0.05 + 0.95 * (v / 100.0) ** 1.5 for t, v in menace]
        M.bed(C.level(heart, 0.035), t_play, total, list(zip(ts, gs)))
    # (after the catch: the black is silent but for the wind)
    for tk in t_kill:
        s, e = int((tk + 0.75) * SR), int((tk + 3.0) * SR)
        if s < M.n:
            M.x[:, s:min(e, M.n)] *= 0.15
    return M.x


def main():
    ev = C.parse(sys.argv[1])
    total = float(sys.argv[2])
    out = sys.argv[3]
    if len(sys.argv) > 4:
        C.CACHE = sys.argv[4]
    mix = play(ev, total)
    top = np.max(np.abs(mix))
    mix = 0.95 * np.tanh(mix / 0.95)
    A.write(out, mix)
    print('play sound: %.1f s, %d events, peak before the limit %.2f' % (total, len(ev), top))


if __name__ == '__main__':
    main()
