"""Sound for Part 2's opening, the crash: real recordings (SourceArt/Audio/Recorded, all Creative Commons 0 from
Freesound, each one's source in its SOURCES.md; decoded to WAV by tools/blender/decode_audio.py), cut, levelled,
filtered and laid on the moments the game logs as it runs (EndingDirector -crash prints "CrashEvent <time> <kind>
<force>").

  the drive      inside an old car at night: the engine, the tyres on packed snow, the blizzard on the body, the wipers
  the creature   far ahead in the headlights: a gallop and a growl, muffled by the glass
  the sighting   a gasp; the brakes, the tyres skidding and crunching to a stop, the engine down to idle
  the scream     it rears up in the road and screams (gorilla, tiger and bear roars, pitched down, layered); breathing
  the charge     the car creeps on; a gallop comes at the door from the left, a snarl, a gasp
  the blow       a real car crash from inside, the driver's window bursting, the snarl right there
  the roll       the rail scraping, the windshield cracking, every landing (as hard as the game says it was), the wind
                 rushing; the slam into deep snow
  after          the engine chokes and dies, steam hisses, hot metal ticks, the blizzard through the broken window, the
                 driver's breath; the ears ring; into the black, all but the wind and the breath fade

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


def load(name):
    """A decoded recording (category/name, no extension) as float stereo at 48 kHz."""
    if name in _loaded:
        return _loaded[name]
    path = os.path.join(CACHE, name + '.wav')
    with wave.open(path, 'rb') as w:
        ch, sw, rate, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    x = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768.0
    x = x.reshape(-1, ch).T
    if ch == 1:
        x = np.vstack([x, x])
    if rate != SR:
        t_out = np.arange(int(x.shape[1] * SR / rate)) * rate / SR
        x = np.stack([np.interp(t_out, np.arange(x.shape[1]), c) for c in x])
    _loaded[name] = x
    return x


def env_db(x, win=0.25):
    """The level (RMS, per window of win seconds) along a recording."""
    m = x.mean(0)
    k = int(win * SR)
    n = len(m) // k
    return np.sqrt((m[:n * k].reshape(n, k) ** 2).mean(1) + 1e-12)


def loudest(name, dur, pre=0.1):
    """The stretch of a recording around its loudest moment (for a one-shot: the blow, the roar)."""
    x = load(name)
    i = int(np.argmax(np.abs(x).max(0)))
    s = max(0, i - int(pre * SR))
    return x[:, s:s + int(dur * SR)]


def steady(name, dur, skip=2.0):
    """The steadiest stretch of a recording (for a bed: no knocks, no silences)."""
    x = load(name)
    e = env_db(x, 0.5)
    k = max(1, int(dur / 0.5))
    lo = int(skip / 0.5)
    best, at = None, lo
    for i in range(lo, max(lo + 1, len(e) - k)):
        w = e[i:i + k]
        if w.mean() < 1e-3:
            continue
        cv = w.std() / w.mean()
        if best is None or cv < best:
            best, at = cv, i
    s = int(at * 0.5 * SR)
    seg = x[:, s:s + int(dur * SR)]
    if seg.shape[1] < int(dur * SR):            # too short: looped, crossfaded
        seg = loop(x, dur)
    return seg


def loop(x, dur, xf=0.5):
    n = int(dur * SR)
    f = int(xf * SR)
    out = np.zeros((2, n))
    pos = 0
    ramp = np.linspace(0, 1, f)
    while pos < n:
        piece = x[:, :min(x.shape[1], n - pos + f)].copy()
        if pos > 0 and piece.shape[1] > f:
            piece[:, :f] *= ramp
            out[:, pos - f:pos] *= 1 - ramp[:min(f, pos)]
            out[:, pos - f:pos - f + piece.shape[1]] += piece[:, :n - (pos - f)]
            pos = pos - f + piece.shape[1]
        else:
            out[:, pos:pos + piece.shape[1]] += piece[:, :n - pos]
            pos += piece.shape[1]
    return out


def fade(x, fin=0.01, fout=0.05):
    x = x.copy()
    n = x.shape[1]
    a, b = min(n, int(fin * SR)), min(n, int(fout * SR))
    if a:
        x[:, :a] *= np.linspace(0, 1, a)
    if b:
        x[:, n - b:] *= np.linspace(1, 0, b)
    return x


def pitch(x, factor):
    """Played slower (factor < 1: deeper and longer), as a tape would."""
    n = int(x.shape[1] / factor)
    t = np.arange(n) * factor
    return np.stack([np.interp(t, np.arange(x.shape[1]), c) for c in x])


def filt(x, mask):
    return np.stack([A.fft_filter(c, mask) for c in x])


def peak(x, level):
    m = np.max(np.abs(x))
    return x / m * level if m > 0 else x


def level(x, rms):
    r = np.sqrt(np.mean(x ** 2) + 1e-12)
    return x / r * rms


def pan(x, p):
    """Stereo balance: -1 left .. 1 right (equal power, on the mix of both channels)."""
    m = x.mean(0)
    a = (p + 1) * np.pi / 4
    return np.stack([m * np.cos(a), m * np.sin(a)]) * np.sqrt(2)


class Mix:
    def __init__(self, total):
        self.n = int(total * SR)
        self.x = np.zeros((2, self.n))

    def at(self, t, clip, gain=1.0):
        s = int(t * SR)
        if s >= self.n:
            return
        c = clip[:, max(0, -s):]
        s = max(0, s)
        e = min(self.n, s + c.shape[1])
        self.x[:, s:e] += c[:, :e - s] * gain

    def bed(self, clip, t0, t1, curve):
        """A bed from t0 to t1, its gain along the way from curve [(t, gain), ...]."""
        s, e = int(t0 * SR), min(self.n, int(t1 * SR))
        c = clip[:, :e - s]
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
    t_cre, t_sight, t_brake = first('creature', 10.2), first('sight', 11.0), first('brake', 11.4)
    t_roar, t_stop, t_bolt = first('roar', 12.9), first('stopped', 13.8), first('bolt', 16.3)
    t_creep, t_charge, t_imp = first('creep', 17.2), first('charge', 20.4), first('impact', 21.0)
    t_edge, t_crack = first('edge', t_imp + 0.8), first('crack', t_imp + 0.8)
    t_deep, t_rest = first('deep'), first('rest', t_imp + 8.0)
    t_black = first('black', t_rest + 1.0)
    hits = [(t, v) for t, k, v in ev if k == 'hit']
    M = Mix(total)
    muffle = A.lp(1800)                       # heard from outside, through the glass and the body
    r = np.random.default_rng(11)

    # ---- the drive: the cabin, the tyres, the blizzard, the wipers -------------------------------------------------
    eng = steady('engine/engine_volvo240_interior_journey_130135', t_brake + 1.0, skip=60)
    M.bed(level(fade(eng, 1.0, 1.0), 0.055), 0.0, t_brake + 1.0, [(0, 0.0), (1.0, 1.0), (t_brake, 1.0), (t_brake + 1.0, 0.0)])
    idle = steady('engine/engine_idle_interior_loop_522223', t_rest - t_brake + 2.0, skip=0.5)
    M.bed(level(idle, 0.05), t_brake, t_rest + 0.1,
          [(t_brake, 0.0), (t_brake + 0.9, 1.0), (t_creep, 1.0), (t_creep + 0.6, 1.25), (t_imp, 1.25), (t_imp + 0.3, 1.6), (t_rest, 1.2), (t_rest + 0.1, 0.0)])
    tyres = steady('snow_tyres/snow_tyres_car_motion_on_snow_468178', t_imp + 1.0, skip=5)
    M.bed(level(filt(tyres, A.lp(2500)), 0.035), 0.0, t_imp + 0.5,
          [(0, 0), (1, 1), (t_brake, 1), (t_stop, 0.0), (t_creep, 0.0), (t_creep + 0.8, 0.6), (t_imp, 0.6), (t_imp + 0.5, 0)])
    wind_in = steady('wind/wind_heavy_wind_inside_car_82267', t_imp + 1.0, skip=10)
    M.bed(level(wind_in, 0.04), 0.0, t_imp + 0.6, [(0, 0), (1.5, 1), (t_imp, 1), (t_imp + 0.6, 0)])
    wipers = steady('cabin/cabin_wipers_snow_ice_jeep_869005', t_imp + 1.0, skip=1)
    M.bed(level(wipers, 0.018), 0.0, t_imp + 0.2, [(0, 0), (1.5, 1), (t_imp, 1), (t_imp + 0.2, 0)])
    vent = steady('cabin/cabin_car_air_vent_on_50901', t_imp + 1.0, skip=3)
    M.bed(level(vent, 0.008), 0.0, t_imp, [(0, 0), (2, 1), (t_imp, 1)])

    # ---- the creature far ahead, crossing in the headlights -----------------------------------------------------------
    gal = loudest('footsteps/footsteps_horse_gallop_close_479799', 2.4, pre=1.2)
    M.at(t_cre, pan(level(filt(fade(gal, 0.3, 0.6), A.lp(900)), 0.012), 0.2))
    growl = loudest('creature/creature_lion_growl_roar_breath_488348', 1.6, pre=0.5)
    M.at(t_cre + 0.6, pan(level(filt(fade(pitch(growl, 0.8), 0.2, 0.5), A.lp(700)), 0.010), 0.1))

    # ---- the sighting: a gasp, the brakes -------------------------------------------------------------------------------
    M.at(t_sight + 0.05, pan(peak(load('human/human_male_gasp_344416'), 0.35), 0.0))
    skid = load('snow_tyres/snow_tyres_brake_skid_gravel_short_637161')
    M.at(t_brake, pan(peak(filt(fade(skid, 0.01, 0.3), A.lp(3000)), 0.22), 0.0))
    crunch = steady('snow_tyres/snow_tyres_tires_snow_ice_slow_71099', t_stop - t_brake, skip=0.5)
    M.at(t_brake + 0.2, peak(filt(fade(crunch, 0.1, 0.6), A.lp(2500)), 0.16))
    steps = load('footsteps/footsteps_heavy_steps_snow_543385')
    M.at(t_sight + 0.3, pan(peak(filt(fade(steps, 0.05, 0.3), muffle), 0.10), -0.2))

    # ---- the scream: rearing up in the road ---------------------------------------------------------------------------
    huff = loudest('creature/creature_horse_snort_538697', 0.8, pre=0.2)
    M.at(t_roar - 0.5, pan(peak(filt(pitch(huff, 0.75), muffle), 0.12), -0.15))
    layers = [('creature/creature_gorilla_alpha_roar_zoo_397054', 0.82, 1.0),
              ('creature/creature_tiger_roar_zoo_263115', 0.78, 0.7),
              ('creature/creature_bear_roaring_479825', 0.85, 0.6)]
    scream = np.zeros((2, int(2.2 * SR)))
    for name, f, g in layers:
        c = pitch(loudest(name, 2.0, pre=0.15), f)[:, :scream.shape[1]]
        scream[:, :c.shape[1]] += level(fade(c, 0.05, 0.4), 0.1) * g
    M.at(t_roar + 0.35, pan(peak(filt(fade(scream, 0.08, 0.5), A.lp(3200)), 0.98), -0.1))
    breath = steady('human/human_scared_male_heavy_breathing_554307', total, skip=1)
    M.bed(level(breath, 0.03), t_roar + 1.0, total,
          [(t_roar + 1.0, 0.0), (t_roar + 2.5, 0.8), (t_charge, 1.0), (t_imp, 0.0), (t_rest + 0.6, 0.0), (t_rest + 2.0, 1.4), (total, 1.2)])

    # ---- it bolts; the car creeps on -----------------------------------------------------------------------------------
    away = loudest('footsteps/footsteps_horse_gallop_close_479799', 2.5, pre=0.3)
    M.at(t_bolt, pan(level(filt(fade(away, 0.05, 1.5), A.lp(1200)), 0.03), 0.4))

    # ---- the charge: a gallop at the door from the left, a snarl, a gasp ------------------------------------------------
    rush = load('footsteps/footsteps_running_on_frozen_snow_712022')
    rush = rush[:, int(5 * SR):int(5 * SR) + int((t_imp - t_charge + 0.2) * SR)]
    ramp = np.linspace(0.15, 1.0, rush.shape[1]) ** 2
    M.at(t_charge, pan(level(rush, 0.06) * ramp, -0.85))
    gal2 = loudest('footsteps/footsteps_horse_gallop_close_479799', t_imp - t_charge + 0.1, pre=0.4)
    ramp = np.linspace(0.2, 1.0, gal2.shape[1]) ** 2
    M.at(t_charge, pan(level(filt(gal2, A.lp(2200)), 0.06) * ramp, -0.8))
    snarl = loudest('creature/creature_tiger_cage_growl_snarl_439280', 1.4, pre=0.4)
    M.at(t_imp - 0.75, pan(peak(fade(pitch(snarl, 0.85), 0.1, 0.3), 0.45), -0.8))
    M.at(t_imp - 0.45, pan(peak(load('human/human_male_fright_gasp_536757'), 0.4), 0.0))

    # ---- the blow --------------------------------------------------------------------------------------------------------
    blow = loudest('metal_impact/metal_impact_real_crash_interior_346300', 2.5, pre=0.06)
    M.at(t_imp - 0.06, pan(peak(fade(blow, 0.005, 0.8), 0.95), -0.3))
    M.at(t_imp, pan(peak(load('glass/glass_broken_car_window_587928'), 0.8), -0.75))
    M.at(t_imp + 0.05, pan(peak(load('glass/glass_glass_shatter_shards_444134'), 0.45), -0.5))
    close = loudest('creature/creature_black_bear_angry_growl_763026', 1.4, pre=0.1)
    M.at(t_imp + 0.12, pan(peak(fade(pitch(close, 0.8), 0.02, 0.4), 0.6), -0.9))

    # ---- the roll -----------------------------------------------------------------------------------------------------------
    scrape = loudest('metal_scrape/metal_scrape_gate_bar_drag_scrape_450356', 1.4, pre=0.2)
    M.at(t_edge - 0.15, pan(peak(fade(scrape, 0.02, 0.4), 0.5), 0.3))
    M.at(t_crack, pan(peak(load('glass/glass_windshield_crack_mirror_806423'), 0.55), 0.0))
    rush_w = steady('wind/wind_mountain_wind_alps_gusts_454092', total, skip=20)
    end_roll = (t_deep or t_rest)
    M.bed(level(rush_w, 0.06), t_imp, total,
          [(t_imp, 0), (t_edge, 0.6), (t_edge + 1.0, 1.4), (end_roll, 1.4), (t_rest, 0.5), (t_rest + 1.0, 0.0)])
    bangs = [('metal_impact/metal_impact_car_hood_slam_big_329516', 0.9), ('metal_impact/metal_impact_sheet_metal_drop_587442', 1.2),
             ('metal_impact/metal_impact_real_crash_exterior_346299', 1.4), ('metal_impact/metal_impact_rally_car_off_track_crash_209965', 1.6)]
    thuds = ['snow_impact/snow_impact_hard_impact_snow_683789', 'snow_impact/snow_impact_body_falls_hard_snow_675895']
    forces = [v for _, v in hits] or [1.0]
    fmax = max(forces)
    for i, (t, v) in enumerate(hits):
        k = np.log1p(v) / np.log1p(fmax)                    # 0..1, by how hard the game says the landing was
        name, dur = bangs[i % len(bangs)]
        b = loudest(name, dur, pre=0.03)
        M.at(t - 0.03, pan(peak(fade(b, 0.003, 0.3), 0.25 + 0.6 * k), float(r.uniform(-0.4, 0.4))))
        d = loudest(thuds[i % 2], 0.7, pre=0.03)
        M.at(t, pan(peak(filt(fade(d, 0.003, 0.2), A.lp(1500)), 0.2 + 0.4 * k), 0.0))
        if k > 0.7 and i % 2 == 0:
            M.at(t + 0.02, pan(peak(load('glass/glass_glass_shatter_falling_336425'), 0.3), float(r.uniform(-0.6, 0.6))))
    if t_deep:
        deep = loudest('snow_impact/snow_impact_body_falls_hard_snow_675895', 1.2, pre=0.05)
        M.at(t_deep, peak(filt(fade(deep, 0.005, 0.5), A.lp(800)), 0.7))

    # ---- after ------------------------------------------------------------------------------------------------------------
    die = load('engine_die/engine_die_fiat_engine_choking_dies_676827')
    die = die[:, max(0, die.shape[1] - int(4.0 * SR)):]
    M.at(t_rest - 0.1, peak(filt(fade(die, 0.2, 0.6), A.lp(3000)), 0.3))
    hiss = steady('aftermath/aftermath_steam_radiator_hiss_265013', total - t_rest + 1, skip=2)
    M.bed(level(hiss, 0.025), t_rest + 0.5, total, [(t_rest + 0.5, 0), (t_rest + 1.5, 1), (total, 0.8)])
    tick = steady('aftermath/aftermath_engine_cooldown_clicking_539514', total - t_rest + 1, skip=5)
    M.bed(level(tick, 0.02), t_rest + 1.0, total, [(t_rest + 1.0, 0), (t_rest + 2.0, 1), (total, 1)])
    storm = steady('wind/wind_snowstorm_wind_mountain_473815', total - t_rest + 2, skip=10)
    M.bed(level(storm, 0.045), t_rest, total, [(t_rest, 0.0), (t_rest + 1.5, 1.0), (total, 1.0)])
    # the ears ring after the blow, high and thin, dying away
    n = int((total - t_imp) * SR)
    tt = np.arange(n) / SR
    ring = np.sin(2 * np.pi * 4100 * tt) * 0.012 * np.exp(-tt / 5.0) * np.clip(tt / 0.2, 0, 1)
    M.at(t_imp + 0.1, np.stack([ring, ring]))
    # into the black: everything but the wind and the breath goes down
    tt = np.arange(M.n) / SR
    g = np.interp(tt, [0, t_black, t_black + 2.0, total], [1, 1, 0.35, 0.35])
    M.x *= g
    M.bed(level(storm, 0.03), t_black, total, [(t_black, 0.0), (t_black + 1.0, 1.0), (total, 1.0)])
    M.bed(level(breath, 0.025), t_black, total, [(t_black, 0.0), (t_black + 1.0, 1.0), (total, 1.0)])
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
    mix = 0.95 * np.tanh(mix / 0.95)          # a soft limit: the quiet cabin stays as it is, the blows are squashed a little
    A.write(out, mix)
    print('crash sound: %.1f s, %d events (%d landings), peak before the limit %.2f' % (total, len(ev), sum(1 for e in ev if e[1] == 'hit'), top))


if __name__ == '__main__':
    main()
