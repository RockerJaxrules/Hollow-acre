"""Sound for Part 2's opening, the crash (unreal/CUTSCENE_CRASH.md), laid on the moments the game logs as it runs
(EndingDirector -crash prints "CrashEvent <time> <kind> <force>", on the capture's clock).

Horror, not noise: a low drone of our own that builds; stings at the scares; a heartbeat through the stare and the
creep; real silence before the face turns, after it leaves, and in the mirror before the blow. Real recordings
(SourceArt/Audio/Recorded, all Creative Commons 0 from Freesound, each one's source in its SOURCES.md; decoded to WAV by
tools/blender/decode_audio.py) for everything physical: the cabin, the brakes, the blow, the glass, the fall, the
aftermath, footsteps in snow, breath. The creature's voice is recordings changed past recognising (pitched far down,
layered, reverberant, with a screech of our own through it), never a zoo animal you can name. No words.

Run: python hollow-acre/unreal/tools/make_crash_audio.py <unreal log with the CrashEvent lines> <length s> <out.wav>
     [<decoded recordings: HollowAcre/Saved/AudioCache>]
"""
import os
import re
import sys
import wave

import numpy as np

import make_ending_audio as A

SR = A.SR
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'HollowAcre', 'Saved', 'AudioCache')
_loaded = {}


# ---- recordings ------------------------------------------------------------------------------------------------------
def load(name):
    """A decoded recording (category/name, no extension) as float stereo at 48 kHz."""
    if name in _loaded:
        return _loaded[name]
    with wave.open(os.path.join(CACHE, name + '.wav'), 'rb') as w:
        ch, rate, n = w.getnchannels(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    x = np.frombuffer(raw, dtype='<i2').astype(np.float32).reshape(-1, ch).T / 32768.0
    if ch == 1:
        x = np.vstack([x, x])
    if rate != SR:
        t_out = np.arange(int(x.shape[1] * SR / rate)) * rate / SR
        x = np.stack([np.interp(t_out, np.arange(x.shape[1]), c) for c in x])
    _loaded[name] = x
    return x


def loudest(name, dur, pre=0.1):
    x = load(name)
    i = int(np.argmax(np.abs(x).max(0)))
    s = max(0, i - int(pre * SR))
    return x[:, s:s + int(dur * SR)]


def steady(name, dur, skip=2.0):
    """The steadiest stretch of a recording (for a bed), looped if it is too short."""
    x = load(name)
    m = x.mean(0)
    k = int(0.5 * SR)
    n = len(m) // k
    e = np.sqrt((m[:n * k].reshape(n, k) ** 2).mean(1) + 1e-12)
    w = max(1, int(dur / 0.5))
    best, at = None, int(skip / 0.5)
    for i in range(int(skip / 0.5), max(int(skip / 0.5) + 1, len(e) - w)):
        seg = e[i:i + w]
        if seg.mean() < 1e-3:
            continue
        cv = seg.std() / seg.mean()
        if best is None or cv < best:
            best, at = cv, i
    s = int(at * 0.5 * SR)
    out = x[:, s:s + int(dur * SR)]
    while out.shape[1] < int(dur * SR):
        out = np.concatenate([out, x[:, s:s + int(dur * SR) - out.shape[1]]], 1)
    return out


def fade(x, fin=0.01, fout=0.05):
    x = x.copy()
    n = x.shape[-1]
    a, b = min(n, int(fin * SR)), min(n, int(fout * SR))
    if a:
        x[..., :a] *= np.linspace(0, 1, a)
    if b:
        x[..., n - b:] *= np.linspace(1, 0, b)
    return x


def pitch(x, f):
    n = int(x.shape[1] / f)
    t = np.arange(n) * f
    return np.stack([np.interp(t, np.arange(x.shape[1]), c) for c in x])


def sumc(*clips):
    """Clips of different lengths, summed from their starts."""
    n = max(c.shape[-1] for c in clips)
    out = np.zeros((2, n))
    for c in clips:
        out[:, :c.shape[-1]] += c if c.ndim == 2 else np.stack([c, c])
    return out


def filt(x, mask):
    return np.stack([A.fft_filter(c, mask) for c in x])


def peak(x, lv):
    m = np.max(np.abs(x))
    return x / m * lv if m > 0 else x


def level(x, rms):
    return x / np.sqrt(np.mean(x ** 2) + 1e-12) * rms


def pan(x, p):
    m = x.mean(0) if x.ndim == 2 else x
    a = (p + 1) * np.pi / 4
    return np.stack([m * np.cos(a), m * np.sin(a)]) * np.sqrt(2)


def verb(x, secs=2.5, wet=0.35, seed=5):
    """Out in the mountains: a long, dark tail."""
    m = x.mean(0)
    r = A.reverb(A.fft_filter(m, A.lp(3000)), secs, seed)
    return x * (1 - wet) + r[:, :x.shape[1]] * wet * 1.6


# ---- our own sounds ------------------------------------------------------------------------------------------------
def tone(dur, freqs, amps=None, seed=1, vib=0.0):
    """Sustained sine partials (slightly unsteady), mono."""
    t = np.arange(int(dur * SR)) / SR
    r = np.random.default_rng(seed)
    out = np.zeros_like(t)
    for i, f in enumerate(freqs):
        a = amps[i] if amps else 1.0 / (i + 1)
        drift = 1 + 0.002 * np.sin(2 * np.pi * r.uniform(0.05, 0.2) * t + r.uniform(0, 6)) + vib * np.sin(2 * np.pi * 5.5 * t)
        out += a * np.sin(2 * np.pi * f * np.cumsum(drift) / SR + r.uniform(0, 6))
    return out


def drone(dur, base=41.2, seed=3):
    """The low dread under the scene: a detuned cluster on a low E with a breathing filtered-noise layer."""
    x = tone(dur, [base, base * 1.007, base * 1.498, base * 2.01, base * 2.83], [1, 0.8, 0.45, 0.25, 0.12], seed)
    n = A.fft_filter(np.random.default_rng(seed).standard_normal(len(x)), A.bp(180, 0.8))
    t = np.arange(len(x)) / SR
    x = x + 0.35 * n / (np.std(n) + 1e-9) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t))
    return x / (np.max(np.abs(x)) + 1e-9)


def screech(dur, seed=7):
    """A thin, dissonant, rising screech (a bowed-metal string), for the stare and through the scream."""
    t = np.arange(int(dur * SR)) / SR
    f = 880 * (1 + 0.35 * np.clip(t / dur, 0, 1))
    x = sum(np.sin(2 * np.pi * np.cumsum(f * k * (1 + 0.004 * np.sin(2 * np.pi * 7.3 * t))) / SR + k) / k for k in (1, 1.06, 2.01, 3.03))
    x *= 0.6 + 0.4 * np.random.default_rng(seed).random(len(t)) ** 4
    return A.fft_filter(x, A.hp(500)) / 3


def boom(dur=3.0, f0=48.0):
    """A sub hit: a low thump falling in pitch with a long dark tail."""
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 1.5 * np.exp(-t * 18))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    n = A.fft_filter(np.random.default_rng(2).standard_normal(len(t)), A.lp(400)) * np.exp(-t * 9)
    return x + 0.4 * n / (np.std(n) + 1e-9) * 0.2


def heartbeat(times, gain=1.0):
    """Lub-dub thumps at the given times (mono, for the Mix)."""
    out = []
    for t0 in times:
        for dt, a in ((0.0, 1.0), (0.18, 0.6)):
            out.append((t0 + dt, a * gain))
    return out


def thump(a):
    t = np.arange(int(0.25 * SR)) / SR
    return a * np.sin(2 * np.pi * 52 * t * (1 + 0.6 * np.exp(-t * 30))) * np.exp(-t * 22)


def hiss(dur, seed=4):
    """A car radio between stations: hiss and crackle, in and out."""
    r = np.random.default_rng(seed)
    t = np.arange(int(dur * SR)) / SR
    n = A.fft_filter(r.standard_normal(len(t)), A.bp(2500, 0.6))
    crack = (r.random(len(t)) > 0.9995) * r.standard_normal(len(t)) * 6
    wob = 0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t + 1) * np.sin(2 * np.pi * 0.07 * t)
    return (n / (np.std(n) + 1e-9) * (0.4 + 0.6 * wob) + crack) * 0.2


class Mix:
    def __init__(self, total):
        self.n = int(total * SR)
        self.x = np.zeros((2, self.n))

    def at(self, t, clip, gain=1.0):
        if clip.ndim == 1:
            clip = np.stack([clip, clip])
        s = int(t * SR)
        if s >= self.n:
            return
        c = clip[:, max(0, -s):]
        s = max(0, s)
        e = min(self.n, s + c.shape[1])
        self.x[:, s:e] += c[:, :e - s] * gain

    def bed(self, clip, t0, t1, curve):
        if clip.ndim == 1:
            clip = np.stack([clip, clip])
        s, e = int(t0 * SR), min(self.n, int(t1 * SR))
        c = clip[:, :max(0, e - s)]
        tt = (s + np.arange(c.shape[1])) / SR
        ts, gs = zip(*curve)
        self.x[:, s:s + c.shape[1]] += c * np.interp(tt, ts, gs)


def parse(log):
    ev = []
    for line in open(log, encoding='utf-8', errors='replace'):
        m = re.search(r'CrashEvent ([\d.]+) (\w+) ([\d.]+)', line)
        if m:
            ev.append((float(m.group(1)), m.group(2), float(m.group(3))))
    return ev


def crash(ev, total):
    first = lambda k, d=None: next((t for t, kk, v in ev if kk == k), d)
    t_gap, t_eyes, t_cre = first('gap', 17.0), first('eyes', 24.0), first('creature', 30.2)
    t_sight, t_brake, t_stop = first('sight', 31.0), first('brake', 31.4), first('stopped', 34.0)
    t_roar, t_scream, t_bolt = first('roar', 36.0), first('scream', 36.5), first('bolt', 39.0)
    t_creep, t_growl, t_imp = first('creep', 40.6), first('growl', 48.8), first('impact', 49.8)
    t_speed, t_edge, t_crack = first('speed', t_imp + 1.6), first('edge', t_imp + 1.2), first('crack', t_imp + 2.0)
    t_black, t_upside, t_wake = first('black', t_imp + 16), first('upside'), first('wake', (first('black', t_imp + 16) or 0) + 3)
    t_sil, t_close, t_title = first('silhouette'), first('close'), first('title')
    hits = [(t, v) for t, k, v in ev if k == 'hit']
    M = Mix(total)
    tt = np.arange(M.n) / SR

    # ---- the opening black and the drive: the cabin, quiet; wind outside; the drone creeping in -------------------
    eng = steady('engine/engine_volvo240_interior_journey_130135', t_brake + 1.0, skip=60)
    M.bed(level(fade(eng, 2.0, 1.0), 0.045), 0.0, t_brake + 1.0, [(0, 0), (4.8, 0.5), (7.8, 1.0), (t_brake, 1.0), (t_brake + 1.0, 0.0)])
    idle = steady('engine/engine_idle_interior_loop_522223', total, skip=0.5)
    M.bed(level(idle, 0.035), t_brake, t_black, [(t_brake, 0), (t_brake + 1.0, 1.0), (t_stop + 1.0, 0.7), (t_creep, 0.7),
                                                 (t_creep + 1.0, 0.9), (t_imp, 0.9), (t_imp + 0.3, 1.3), (t_black - 0.2, 1.0), (t_black, 0)])
    tyres = steady('snow_tyres/snow_tyres_car_motion_on_snow_468178', t_imp + 1.0, skip=5)
    M.bed(level(filt(tyres, A.lp(2200)), 0.022), 0.0, t_imp, [(0, 0), (6, 1), (t_brake, 1), (t_stop, 0), (t_creep, 0), (t_creep + 1, 0.5), (t_imp, 0.5)])
    wind_in = steady('wind/wind_heavy_wind_inside_car_82267', total, skip=10)
    M.bed(level(wind_in, 0.03), 0.0, t_imp + 0.5, [(0, 0.6), (5, 1.0), (t_stop, 1.0), (t_stop + 1, 0.55), (t_imp, 0.55), (t_imp + 0.5, 0)])
    wipers = steady('cabin/cabin_wipers_snow_ice_jeep_869005', total, skip=1)
    M.bed(level(wipers, 0.012), 4.8, t_imp, [(4.8, 0), (7, 1), (t_stop, 1), (t_stop + 1, 0.45), (t_imp, 0.45)])
    # the drone: under everything from the opening black, swelling at the gap, the eyes, the stare
    dr = drone(total)
    M.bed(pan(dr, 0.0) * 0.06, 0.0, total, [(0, 0), (2.5, 0.35), (t_gap - 2, 0.35), (t_gap + 1, 0.8), (t_eyes, 0.8), (t_eyes + 1, 1.1),
                                           (t_sight, 1.1), (t_stop + 0.5, 1.4), (t_scream, 1.8), (t_scream + 0.2, 0.0), (t_bolt + 1.5, 0.0),
                                           (t_creep + 1, 0.7), (t_growl - 0.4, 1.0), (t_growl - 0.05, 0.0), (t_black, 0.0), (t_wake + 2, 0.5),
                                           (total, 0.3)])
    # the eyes: a soft high shimmer
    M.at(t_eyes, pan(fade(screech(2.2) * 0.25, 0.4, 1.4), 0.4))

    # ---- the sighting: a sharp breath, the brakes, the skid on the snow ---------------------------------------------
    M.at(t_sight + 0.05, pan(peak(load('human/human_male_gasp_344416'), 0.3), 0.0))
    M.at(t_brake, pan(peak(filt(fade(load('snow_tyres/snow_tyres_brake_skid_gravel_short_637161'), 0.01, 0.3), A.lp(2800)), 0.2), 0.0))
    crunch = steady('snow_tyres/snow_tyres_tires_snow_ice_slow_71099', max(0.5, t_stop - t_brake), skip=0.5)
    M.at(t_brake + 0.2, peak(filt(fade(crunch, 0.1, 0.6), A.lp(2400)), 0.14))
    # heavy steps outside as it comes into the road, through the glass
    steps = loudest('footsteps/footsteps_heavy_steps_snow_543385', 2.0, pre=0.2)
    M.at(t_cre + 0.6, pan(peak(filt(pitch(steps, 0.8), A.lp(1200)), 0.08), -0.1))

    # ---- the stare: silence but the idle, the wipers, the heartbeat and its breath; a screech rising to the scream -
    beats = []
    t_hb = t_stop - 0.5
    while t_hb < t_scream:
        beats.append(t_hb)
        t_hb += 0.62 - 0.12 * np.clip((t_hb - t_stop) / max(t_scream - t_stop, 1), 0, 1)
    breath = loudest('creature/creature_grizzly_growl_eating_519599', 4.0, pre=1.0)
    huff = verb(filt(pitch(breath, 0.55), A.lp(900)), 1.6, 0.4)
    M.at(t_stop + 0.6, pan(peak(fade(huff, 0.5, 1.0), 0.07), -0.1))
    M.at(t_stop + 0.8, pan(fade(screech(max(1.0, t_scream - t_stop - 0.8)) * 0.18, 1.0, 0.05), 0.0))
    # the scream: gorilla, bear and elephant, pitched far down and layered, reverberant, a screech through it; a hit
    layers = [('creature/creature_gorilla_alpha_roar_zoo_397054', 0.62, 1.0), ('creature/creature_bear_roaring_479825', 0.58, 0.8),
              ('creature/creature_elephant_trumpet_growl_527845', 0.74, 0.55), ('creature/creature_sea_lion_growl_849186', 0.6, 0.5)]
    n = int(2.6 * SR)
    sc = np.zeros((2, n))
    for name, f, g in layers:
        c = pitch(loudest(name, 2.0, pre=0.1), f)[:, :n]
        sc[:, :c.shape[1]] += level(fade(c, 0.04, 0.5), 0.1) * g
    sc += pan(screech(2.6) * 0.06, 0.0)
    sc = verb(sc, 3.0, 0.35)
    M.at(t_scream - 0.08, pan(peak(fade(sc, 0.05, 0.8), 0.9), -0.05))
    M.at(t_scream - 0.08, pan(peak(boom(3.5, 44), 0.6), 0.0))
    # then near silence: wind, the idle, the driver's breath shaking
    drv = steady('human/human_scared_male_heavy_breathing_554307', total, skip=1)
    M.bed(level(drv, 0.03), t_scream + 1.2, t_imp, [(t_scream + 1.2, 0), (t_bolt + 0.5, 1.0), (t_creep + 3, 0.8), (t_growl - 1.5, 0.15), (t_imp, 0.0)])

    # ---- it goes; the creep; the mirror; the growl ------------------------------------------------------------------
    away = loudest('footsteps/footsteps_horse_gallop_close_479799', 2.5, pre=0.3)
    M.at(t_bolt, pan(level(filt(pitch(fade(away, 0.05, 1.5), 0.8), A.lp(1000)), 0.02), 0.2))
    t_hb = t_creep + 0.5
    while t_hb < t_imp:
        beats.append(t_hb)
        t_hb += 0.55 - 0.2 * np.clip((t_hb - t_creep) / max(t_imp - t_creep, 1), 0, 1)
    for t0, a in heartbeat(beats, 1.0):
        M.at(t0, thump(a) * 0.32)
    # the mirror: everything but the heart drops away (a duck over the last seconds before the growl)
    duck = np.interp(tt, [0, t_growl - 3.4, t_growl - 2.6, t_growl - 0.05, t_growl, total], [1, 1, 0.25, 0.25, 1, 1])
    M.x *= duck
    growl = loudest('creature/creature_black_bear_angry_growl_763026', 1.4, pre=0.15)
    M.at(t_growl, pan(peak(verb(pitch(growl, 0.62), 1.2, 0.25), 0.7), -0.9))

    # ---- the blow, slowed: a huge low hit; the crash and the glass pitched down and muffled; back to speed --------
    slow_dur = max(0.3, t_speed - t_imp)
    blow = loudest('metal_impact/metal_impact_real_crash_interior_346300', 2.5, pre=0.05)
    glass = loudest('glass/glass_broken_car_window_587928', 1.2, pre=0.02)
    snarl = loudest('creature/creature_tiger_cage_growl_snarl_439280', 1.4, pre=0.3)
    slowed = sumc(level(filt(pitch(blow, 0.4), A.lp(900)), 0.1), level(filt(pitch(glass, 0.45), A.lp(1600)), 0.056),
                  level(filt(pitch(snarl, 0.45), A.lp(800)), 0.08))
    M.at(t_imp - 0.02, pan(peak(fade(slowed[:, :int((slow_dur + 0.6) * SR)], 0.005, 0.5), 0.75), -0.4))
    M.at(t_imp - 0.02, pan(peak(boom(4.0, 38), 0.95), 0.0))
    # back to speed: the rest of the crash, real time
    M.at(t_speed - 0.05, pan(peak(fade(blow[:, int(0.3 * SR):], 0.05, 0.6), 0.6), -0.2))
    M.at(t_speed, pan(peak(load('glass/glass_glass_shatter_shards_444134'), 0.35), -0.4))

    # ---- the fall: clear when the eyes are open, muffled and far off in the blackouts --------------------------------
    R = Mix(total)
    scrape = loudest('metal_scrape/metal_scrape_gate_bar_drag_scrape_450356', 1.4, pre=0.2)
    R.at(t_edge - 0.15, pan(peak(fade(scrape, 0.02, 0.4), 0.45), 0.3))
    R.at(t_crack, pan(peak(load('glass/glass_windshield_crack_mirror_806423'), 0.5), 0.0))
    rush = steady('wind/wind_mountain_wind_alps_gusts_454092', total, skip=20)
    R.bed(level(rush, 0.06), t_edge, t_black, [(t_edge, 0.4), (t_edge + 1, 1.4), (t_black - 1, 1.2), (t_black, 0)])
    bangs = ['metal_impact/metal_impact_car_hood_slam_big_329516', 'metal_impact/metal_impact_sheet_metal_drop_587442',
             'metal_impact/metal_impact_real_crash_exterior_346299', 'metal_impact/metal_impact_rally_car_off_track_crash_209965']
    thuds = ['snow_impact/snow_impact_hard_impact_snow_683789', 'snow_impact/snow_impact_body_falls_hard_snow_675895']
    fmax = max([v for _, v in hits] or [1.0])
    rr = np.random.default_rng(11)
    for i, (t, v) in enumerate(hits):
        k = np.log1p(v) / np.log1p(fmax)
        R.at(t - 0.03, pan(peak(fade(loudest(bangs[i % 4], 1.2, pre=0.03), 0.003, 0.3), 0.25 + 0.55 * k), float(rr.uniform(-0.4, 0.4))))
        R.at(t, pan(peak(filt(fade(loudest(thuds[i % 2], 0.7, pre=0.03), 0.003, 0.2), A.lp(1500)), 0.2 + 0.35 * k), 0.0))
    seen = np.zeros(M.n)
    for a0, a1 in ((0.0, 1.6), (3.0, 3.9), (5.3, 6.1), (7.6, 8.2)):
        seen = np.maximum(seen, np.clip((tt - t_edge - a0) / 0.08, 0, 1) * np.clip(1 - (tt - t_edge - a1) / 0.12, 0, 1))
    seen = np.where(tt < t_edge, 1.0, seen)
    muffled = filt(R.x, A.lp(350)) * 0.55
    M.x += R.x * seen + muffled * (1 - seen)
    # ringing ears from the blow, through the blackouts, dying away after the black
    t_ring = np.arange(int((total - t_imp) * SR)) / SR
    ring = np.sin(2 * np.pi * 4100 * t_ring) * np.clip(t_ring / 0.4, 0, 1) * np.exp(-np.maximum(0, t_ring - (t_black - t_imp)) / 4.0)
    M.at(t_imp + 0.2, ring * 0.012)

    # ---- after: the black, then waking upside down -------------------------------------------------------------------
    # everything stops at the black but the ringing and a slow heart
    after = np.interp(tt, [0, t_black - 0.05, t_black + 0.05, total], [1, 1, 0, 0])
    M.x *= after
    for t0, a in heartbeat(list(np.arange(t_black + 0.4, t_wake + 1.0, 0.95)), 0.8):
        M.at(t0, thump(a) * 0.3)
    storm = steady('wind/wind_snowstorm_wind_mountain_473815', total, skip=10)
    M.bed(level(storm, 0.028), t_black, total, [(t_black, 0), (t_wake - 0.5, 0.25), (t_wake + 1.5, 1.0), (total, 1.0)])
    M.bed(pan(hiss(total), 0.35) * 0.2, t_wake, total, [(t_wake, 0), (t_wake + 1.0, 1.0), (total, 0.8)])
    tick = steady('aftermath/aftermath_engine_cooldown_clicking_539514', total, skip=5)
    M.bed(level(tick, 0.016), t_wake, total, [(t_wake, 0), (t_wake + 1.5, 1.0), (total, 1.0)])
    hissing = steady('aftermath/aftermath_steam_radiator_hiss_265013', total, skip=2)
    M.bed(level(hissing, 0.012), t_wake, total, [(t_wake, 0), (t_wake + 2, 1.0), (total, 0.7)])
    M.bed(level(drv, 0.03), t_wake, total, [(t_wake, 0), (t_wake + 0.8, 1.2), ((t_sil or t_wake + 3.4) + 0.5, 1.0),
                                             ((t_sil or t_wake + 3.4) + 1.5, 0.15), (total, 0.15)])   # holding their breath as it passes
    if t_sil:
        # slow heavy steps in the snow, one every 0.56 s, and its breath, low and close outside
        snow_steps = load('footsteps/footsteps_deep_snow_heavy_slow_480621')
        step_len = int(0.45 * SR)
        for i in range(16):
            s0 = int((3 + i * 3.7) * SR) % max(1, snow_steps.shape[1] - step_len)
            st = fade(snow_steps[:, s0:s0 + step_len], 0.005, 0.2)
            M.at(t_sil + 0.3 + i * 0.556, pan(peak(filt(pitch(st, 0.8), A.lp(1400)), 0.09), -0.3 + 0.04 * i))
        M.at(t_sil + 1.0, pan(peak(fade(huff, 0.5, 1.5), 0.06), 0.0))
        M.at(t_sil, pan(fade(drone(6.0, 32.7) * 0.12, 1.5, 2.0), 0.0))
    if t_close:
        out = np.interp(tt, [0, t_close, t_close + 2.0, total], [1, 1, 0.12, 0.12])
        M.x *= out
    if t_title:
        M.at(t_title - 0.1, pan(peak(boom(5.0, 36), 0.5), 0.0))
        M.at(t_title - 0.1, pan(fade(tone(5.0, [55, 82.5, 110.6], [1, 0.5, 0.3], 9) * 0.05, 0.05, 3.5), 0.0))
    return M.x


def main():
    global CACHE
    ev = parse(sys.argv[1])
    total = float(sys.argv[2])
    out = sys.argv[3]
    if len(sys.argv) > 4:
        CACHE = sys.argv[4]
    mix = crash(ev, total)
    top = np.max(np.abs(mix))
    mix = 0.95 * np.tanh(mix / 0.95)
    A.write(out, mix)
    print('crash sound: %.1f s, %d events (%d landings), peak before the limit %.2f' % (total, len(ev), sum(1 for e in ev if e[1] == 'hit'), top))


if __name__ == '__main__':
    main()
