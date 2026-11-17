"""Sound for Part 2's opening, the crash (unreal/CUTSCENE_CRASH.md), laid on the moments the game logs as it runs
(EndingDirector -crash prints "CrashEvent <time> <kind> <force>", on the capture's clock).

Built the way Supermassive's Until Dawn and The Quarry are (their audio teams' accounts: a score of real strings and
unusual sources, often unrecognisable; a "cine layer" of booms, impacts, risers, downers and stingers; ambience pushed
louder than a film's; silence made by cutting what was there; creature voices of animals and human performances
layered and pitched past naming; the mix big and immediate). Every sound is a real recording (SourceArt/Audio/Recorded,
all Creative Commons 0 from Freesound, each one's source in its SOURCES.md; decoded to WAV by
tools/blender/decode_audio.py). The driver makes no sound: their lines are captions.

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


CV = 'creature_voice/creature_voice_'


def rasp(x, drive=2.6, fry=52.0, depth=0.38, grit=0.18, seed=3):
    """A torn throat (the husks were men): the voice driven into saturation (its harmonics torn up), rattled at a
    vocal-fry rate (wavering, as a wrecked voice creaks), with breath noise riding on its loudness."""
    pk = max(1e-6, float(np.abs(x).max()))
    y = np.tanh(x / pk * drive) / np.tanh(drive) * pk
    n = x.shape[1]
    t = np.arange(n) / SR
    wob = np.sin(2 * np.pi * 6.3 * t) * 0.6 + np.sin(2 * np.pi * 2.1 * t + 1.0) * 0.4
    am = 1.0 - depth + depth * (0.5 + 0.5 * np.sin(2 * np.pi * fry * t + 1.7 * wob)) ** 3 * 2.0
    env = np.abs(x).mean(axis=0)
    k = max(1, int(0.012 * SR))
    env = np.convolve(env, np.ones(k) / k, mode='same')
    nz = np.random.RandomState(seed).randn(2, n).astype(np.float32)
    nz = filt(nz, A.hp(1800)) * env * grit / max(1e-6, float(env.max())) * pk * 3.0
    return (y * am + nz).astype(np.float32)


def crowd(c, f, spread=(0.955, 1.0, 1.05, 0.985), lag=(0.0, 0.013, 0.027, 0.041)):
    """Several throats at once: copies pitched a few per cent apart and a few ms late, so no clean note is left (a clean
    shriek's note is what reads as a squeal)."""
    out = np.zeros_like(c)
    for p_, l_ in zip(spread, lag):
        k = pitch(c, f * p_)
        d = int(l_ * SR)
        k = k[:, :max(0, c.shape[1] - d)]
        out[:, d:d + k.shape[1]] += k
    return out / len(spread) ** 0.5


def detone(x, lo=500.0, hi=3200.0, over=3.0, keep=1.4, n=2048, hop=512):
    """Takes the squeal out of a shriek (a de-whine): in short slices, any narrow note standing well above the sound around
    it (over x the local median, between lo and hi Hz) is pulled down to keep x that median; the rest (the rasp, the
    breath, the body) is left as it was."""
    if x.shape[1] < n:
        return x
    win = np.hanning(n).astype(np.float32)
    f = np.fft.rfftfreq(n, 1.0 / SR)
    band = (f >= lo) & (f <= hi)
    out = np.zeros_like(x)
    norm = np.zeros(x.shape[1], dtype=np.float32)
    k = 13
    for ch in range(x.shape[0]):
        for i in range(0, x.shape[1] - n, hop):
            Z = np.fft.rfft(x[ch, i:i + n] * win)
            mag = np.abs(Z)
            pad = np.pad(mag, k, mode='edge')
            med = np.median(np.lib.stride_tricks.sliding_window_view(pad, 2 * k + 1), axis=1)[:mag.shape[0]]
            g = np.ones_like(mag)
            loud = band & (mag > over * med)
            g[loud] = (keep * med[loud]) / np.maximum(mag[loud], 1e-9)
            out[ch, i:i + n] += np.fft.irfft(Z * g, n).astype(np.float32) * win
            if ch == 0:
                norm[i:i + n] += win ** 2
    norm[norm < 1e-3] = 1.0
    return out / norm


def voice(name, dur, f, pre=0.05, at=None, many=False, **kw):
    """A stretch of one recording (its loudest, or from at s), pitched by f (as several throats if many), through the
    torn throat."""
    c = seg(name, at, dur) if at is not None else loudest(name, dur, pre=pre)
    return rasp(crowd(c, f) if many else pitch(c, f), **kw)


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


# ---- the recordings the cut is scored and designed with (SourceArt/Audio/Recorded/<category>, all CC0) ----------------
STR_CELLOS = 'score_strings/score_strings_cellos_droning_509535'
STR_BASS = 'score_strings/score_strings_double_bass_bowed_harmonics_47429'
STR_SCRAPE = 'score_strings/score_strings_concrete_cello_low_scrapes_571173'
STR_ALEA = 'score_strings/score_strings_aleatoric_cello_extended_loop_469998'
STR_VLN = 'score_strings/score_strings_violins_harmonics_glissandi_378457'
EXT_CYMBAL = 'score_extended/score_extended_bowed_suspended_cymbal_532741'
EXT_WATER = 'score_extended/score_extended_bowed_waterphone_drone_322975'
EXT_RAIL = 'score_extended/score_extended_bowed_stairwell_railing_197302'
EXT_GLASS = 'score_extended/score_extended_bowed_wine_glass_662231'
HIT_BRAAM = 'cine_hits/cine_hits_braam_low_brass_647712'
HIT_BOOM = 'cine_hits/cine_hits_cinematic_boom_255111'
HIT_DOWNER = 'cine_hits/cine_hits_impact_downer_535554'
HIT_TRAILER = 'cine_hits/cine_hits_trailer_super_hits_382689'
RIS_SHEPARD = 'cine_risers/cine_risers_shepard_tone_rising_60s_130502'
RIS_REVCYM = 'cine_risers/cine_risers_reverse_crash_cymbal_383903'
RIS_REVPIANO = 'cine_risers/cine_risers_reversed_piano_strings_riser_832474'
ST_CLUSTER = 'stingers/stingers_scary_cluster_hit_396161'
ST_JUMP = 'stingers/stingers_violin_cymbal_jump_scare_436883'
ST_PLUCK = 'stingers/stingers_plucked_string_horror_725225'
ST_CRESC_NAME = 'stingers/stingers_string_crescendo_fast_684802'
AMB_BLIZ = 'night_ambience/night_ambience_blizzard_forest_720876'
AMB_TREES = 'night_ambience/night_ambience_two_trees_creaking_storm_415317'
AMB_WOLF = 'night_ambience/night_ambience_distant_solitary_wolf_howl_500646'
AMB_ELK = 'night_ambience/night_ambience_elk_mating_cry_banff_263489'
CR_SCREAMS = 'creature_extra/creature_extra_human_monster_screams_391552'
CR_GROWLS = 'creature_extra/creature_extra_human_aggressive_growls_257358'
CR_CHIMP = 'creature_extra/creature_extra_chimpanzee_loud_screams_675430'
CR_PIG = 'creature_extra/creature_extra_pig_squealing_260640'
CR_BREATH = 'creature_extra/creature_extra_pug_close_breaths_snarls_377001'
F_CREAK = 'foley_car/foley_car_creaking_metal_slow_stress_172411'
F_LEATHER = 'foley_car/foley_car_leather_stress_creak_559079'
F_STATIC = 'foley_car/foley_car_radio_static_no_station_625095'
F_CHIME = 'foley_car/foley_car_seatbelt_warning_chime_218315'
F_DRIP = 'foley_car/foley_car_water_dripping_on_metal_166324'
B_HEART = 'body/body_heartbeat_deep_subtle_492334'
B_TINNITUS = 'body/body_tinnitus_inside_body_450620'


def seg(name, t0, dur):
    """A stretch of a recording from t0 (s) for dur (s)."""
    x = load(name)
    return x[:, int(t0 * SR):int((t0 + dur) * SR)]


def one_beat():
    """One lub-dub out of the real heartbeat recording (its strongest), low-passed to the chest."""
    x = filt(load(B_HEART), A.lp(160))
    e = np.abs(x.mean(0))
    k = int(0.02 * SR)
    e = np.convolve(e, np.ones(k) / k, 'same')
    i = int(np.argmax(e[int(1 * SR):-int(1 * SR)])) + int(1 * SR)
    return fade(x[:, max(0, i - int(0.12 * SR)):i + int(0.55 * SR)], 0.01, 0.15)


def crash(ev, total):
    first = lambda k, d=None: next((t for t, kk, v in ev if kk == k), d)
    t_letter, t_gap, t_eyes, t_cre = first('letter', 8.5), first('gap', 17.0), first('eyes', 24.0), first('creature', 30.2)
    t_sight, t_brake, t_stop = first('sight', 31.0), first('brake', 31.4), first('stopped', 34.0)
    t_roar, t_scream, t_bolt = first('roar', 36.0), first('scream', 36.5), first('bolt', 39.0)
    t_creep, t_growl, t_imp = first('creep', 40.6), first('growl', 48.8), first('impact', 49.8)
    t_charge = first('charge', t_growl + 0.4)
    t_hand, t_hand2, t_rise, t_leap = first('hand'), first('hand2'), first('rise'), first('leap')
    t_land, t_jaw, t_overtake = first('land'), first('jaw'), first('overtake')
    perched = t_land is not None
    t_hang, t_slam, t_claw = first('hang'), first('slam'), first('claw')
    roof = t_hang is not None                             # on the roof: its face drops in and it attacks the windshield
    # on the bonnet as the car drives on (the owner's choice, after Dying Light: The Beast): it lands, clings through the
    # swerves, shrieks at the glass, slams its head into it, and is flung off by the brakes; scored as the roof attack is,
    # its landing for the moment its face appears
    hoodatk = t_hang is None and t_slam is not None
    if hoodatk:
        t_hang, roof = t_land, True
    dropped = first('drop') is not None                   # it drops onto the bonnet with no warning (nothing ran across)
    if perched:
        t_hand = t_land                                   # (its claws, from when it lands)
        t_hand2 = t_land + 0.6
        t_roar, t_scream = t_jaw - 0.3, t_jaw              # the draw-away before its jaw opens (no scream)
        if roof:
            t_roar, t_scream = t_hang - 0.35, t_hang       # (the draw-away before its face drops in)
        t_stop = first('stopped', t_land + 2.0)
    roofs = [t for t, k, v in ev if k == 'roof']
    t_gone, t_halt, t_face = first('gone'), first('halt2'), first('face')
    hood = t_hand is not None
    if hood:
        t_bolt = t_gone                                   # (the old beats keyed on its going)
    t_speed, t_edge, t_crack = first('speed', t_imp + 1.6), first('edge', t_imp + 1.2), first('crack', t_imp + 2.0)
    t_lunge = first('lunge', t_imp)
    # the stall (the owner's choice): the engine dies out of nowhere, the car rolls to a stop, the key won't start it, and
    # it hits the driver's door out of the dark; nothing of it seen or heard before (no steps, no bolt, no growl, no creep)
    t_stall = first('stall')
    stall = t_stall is not None
    cranks = [t for t, k, v in ev if k == 'crank']
    t_smash = first('smash')
    if stall:
        t_sight = t_brake = t_stall
        t_roar, t_scream, t_bolt = t_imp, t_imp + 0.1, t_imp
        if t_smash:
            t_roar, t_scream = t_smash + 0.2, t_smash + 0.1    # (the drop-out: 0.2 s before the glass goes)
        t_creep, t_growl = t_imp + 1.0, t_imp + 7.0
    t_black, t_upside, t_wake = first('black', t_imp + 16), first('upside'), first('wake', (first('black', t_imp + 16) or 0) + 3)
    t_sil, t_close, t_title = first('silhouette'), first('close'), first('title')
    hits = [(t, v) for t, k, v in ev if k == 'hit']
    M = Mix(total)
    tt = np.arange(M.n) / SR

    # ---- the cabin and the night outside, louder than a film would (it is how alone you are) -------------------------
    eng = steady('engine/engine_volvo240_interior_journey_130135', t_brake + 1.0, skip=60)
    M.bed(level(fade(eng, 2.0, 1.0), 0.045), 0.0, t_brake + 1.0, [(0, 0), (4.8, 0.5), (7.8, 1.0), (t_brake, 1.0), (t_brake + 1.0, 0.0)])
    idle = steady('engine/engine_idle_interior_loop_522223', total, skip=0.5)
    M.bed(level(idle, 0.0 if stall else 0.035), t_brake, t_black, [(t_brake, 0), (t_brake + 1.0, 1.0), (t_stop + 1.0, 0.7), (t_creep, 0.7),
                                                 (t_creep + 1.0, 0.9), (t_imp, 0.9), (t_imp + 0.3, 1.3), (t_black - 0.2, 1.0), (t_black, 0)])
    tyres = steady('snow_tyres/snow_tyres_car_motion_on_snow_468178', t_imp + 1.0, skip=5)
    M.bed(level(filt(tyres, A.lp(2200)), 0.022), 0.0, t_imp, [(0, 0), (6, 1), (t_brake, 1), (t_stop, 0), (t_creep, 0), (t_creep + 1, 0.5), (t_imp, 0.5)])
    wind_in = steady('wind/wind_heavy_wind_inside_car_82267', total, skip=10)
    M.bed(level(wind_in, 0.042), 0.0, t_imp + 0.5, [(0, 0.6), (5, 1.0), (t_stop, 1.0), (t_stop + 1, 0.6), (t_imp, 0.6), (t_imp + 0.5, 0)])
    outside = steady(AMB_BLIZ, total, skip=1)
    M.bed(level(filt(outside, A.lp(1300)), 0.02), 0.0, t_imp + 0.5, [(0, 0.5), (5, 1.0), (t_stop, 1.0), (t_imp, 1.0), (t_imp + 0.5, 0)]
          if stall else [(0, 0.5), (5, 1.0), (t_stop, 1.0), (t_scream - 0.6, 1.0), (t_scream + 1.0, 1.0), (t_imp, 1.0), (t_imp + 0.5, 0)])
    wipers = steady('cabin/cabin_wipers_snow_ice_jeep_869005', total, skip=1)
    M.bed(level(wipers, 0.012), 4.8, t_imp, [(4.8, 0), (7, 1), (t_stop, 1), (t_stop + 1, 0.45), (t_imp, 0.45)])

    # ---- the score: real low strings under the drive, swelling with the threat; cut dead before each scare --------------
    cellos = steady(STR_CELLOS, total, skip=2)
    cello_keys = [
        (0, 0), (2.5, 0.0), (6.0, 0.35), (t_gap - 2, 0.4), (t_gap + 1, 0.8), (t_eyes, 0.8), (t_eyes + 1.5, 1.1), (t_sight, 1.1),
        (t_stop + 0.5, 1.0), (t_stop + 3.0, 0.6), (t_roar - 0.6, 1.8), (t_roar - 0.45, 0.0), (t_bolt + 2.5, 0.0), (t_creep + 2, 0.55),
        (t_growl - 3.4, 0.7), (t_growl - 3.0, 0.0), (t_wake + 1.0, 0.0), (t_wake + 4.0, 0.35), (total, 0.3)]
    if stall:
        # (the stall has no creep or growl: after the scare the strings stay silent until the waking; the old keys came out
        # of order here and swelled the cellos back in during the fall)
        cello_keys = [(0, 0), (2.5, 0.0), (6.0, 0.35), (t_gap - 2, 0.4), (t_gap + 1, 0.8), (t_eyes, 0.8), (t_eyes + 1.5, 1.1),
                      (t_sight, 1.1), (t_stop + 0.5, 1.0), (t_stop + 3.0, 0.6), (t_roar - 0.6, 1.8), (t_roar - 0.45, 0.0),
                      (t_wake + 1.0, 0.0), (t_wake + 4.0, 0.35), (total, 0.3)]
    cello_keys = sorted(cello_keys)
    M.bed(level(filt(cellos, A.lp(2600)), 0.03), 0.0, total, cello_keys)
    # the grandmother's note: a bowed glass and harmonics, faint, as the eyes go to the letter
    M.at(t_letter + 0.3, pan(fade(level(seg(EXT_GLASS, 10.0, 5.0), 0.012), 1.2, 2.5), 0.15))
    M.at(t_letter + 0.9, pan(fade(level(filt(seg(STR_VLN, 1.0, 5.0), A.lp(5000)), 0.008), 1.0, 2.5), -0.15))
    # the gap: a low downer as it goes by, the bass's harmonics creeping in
    M.at(t_gap - 0.4, pan(peak(filt(load(HIT_DOWNER), A.lp(900)), 0.22), 0.3))
    M.at(t_gap - 0.5, pan(fade(level(seg(STR_BASS, 2.0, 7.0), 0.012), 1.5, 3.0), 0.2))
    # the eyes: a bowed cymbal shimmer, a plucked sting, and far off, after they are gone, a call across the valley
    M.at(t_eyes - 0.3, pan(fade(peak(filt(seg(EXT_CYMBAL, 6.0, 4.0), A.hp(500)), 0.16), 0.6, 1.8), -0.4))
    M.at(t_eyes + 0.05, pan(peak(load(ST_PLUCK), 0.32), -0.3))
    call = verb(filt(pitch(seg(AMB_ELK, 5.6, 3.5), 0.72), A.lp(1400)), 3.0, 0.6)
    M.at(t_eyes + 2.2, pan(fade(peak(call, 0.09), 0.3, 1.5), -0.6))

    # ---- something darts across the edge of the headlights: a quick string swell, its feet on the snow; the brakes ------
    # (when it drops onto the bonnet out of nowhere there is no warning at all: no swell, no steps, no flinch)
    if not dropped and not stall:
        M.at(t_sight - 0.55, pan(fade(peak(seg(ST_CRESC_NAME, 2.6, 0.85), 0.42), 0.02, 0.15), 0.3))
        M.at(t_sight - 0.03, pan(peak(filt(seg(HIT_BOOM, 0.0, 3.0), A.lp(300)), 0.35), 0.0))
        dart = loudest('footsteps/footsteps_horse_gallop_close_479799', 1.4, pre=0.2)
        M.at(t_cre + 0.2, pan(peak(filt(pitch(dart, 0.85), A.lp(1600)), 0.12), 0.5))
    skid = filt(fade(load('snow_tyres/snow_tyres_brake_skid_gravel_short_637161'), 0.01, 0.3), A.lp(2800))
    t_skid = t_land + 0.25 if perched else t_brake
    if hoodatk:
        t_skid = t_brake                                  # (it drives on with it on the bonnet: the skid is the brakes)
        # the swerves: the tyres breaking loose on the snow, one way then the other
        for dt, pn, g in ((1.05, -0.35, 0.16), (1.85, 0.35, 0.2), (2.6, -0.2, 0.12)):
            M.at(t_land + dt, pan(peak(fade(skid[:, :int(0.75 * SR)], 0.04, 0.3), g), pn))
    if perched and not dropped:
        M.at(t_brake, pan(peak(skid[:, :int(0.5 * SR)], 0.09), 0.0))       # the flinch
    if not stall:
        M.at(t_skid, pan(peak(skid, 0.2), 0.0))
    else:
        # the engine dies: a cough, a sputter, gone (an old engine running down); the car rolls on in the quiet
        die = seg('engine_die/engine_die_old_truck_sputter_to_stop_438085', 41.4, 3.2)
        M.at(t_stall - 0.08, pan(peak(filt(fade(die, 0.03, 0.9), A.lp(3500)), 0.32), 0.0))
        M.at(t_stall + 0.1, pan(peak(seg(F_CREAK, 1.0, 1.5), 0.06), 0.0))
        # the keys on their ring knocking as the hand gets there; each turn the starter grinding (a 1983 Volvo 245's
        # own failing starter), weaker each time, the last ones short and frantic
        t_reach = t_stop + 0.7
        M.at(t_reach + 0.4, pan(peak(filt(seg(F_LEATHER, 0.8, 0.6), A.hp(1500)), 0.05), 0.2))
        grind = [(41.30, 1.15), (43.45, 1.35), (45.30, 0.35), (45.70, 0.40), (46.20, 0.50)]
        for i, t0 in enumerate(cranks):
            a, d = grind[min(i, len(grind) - 1)]
            if t_smash:
                if t0 >= t_smash - 0.05:
                    continue                              # (the hand torn off the key by the burst glass)
                d = min(d, t_smash - t0 + 0.03)
            g = seg('engine_die/engine_die_volvo245_1983_starter_failure_322974', a, d)
            M.at(t0 - 0.02, pan(peak(filt(fade(g, 0.01, 0.08), A.lp(5000)), 0.36 - 0.03 * i), 0.12))
            # the key snapped round to start each try (the lock's click and the bunch knocking: a real car's key, from the
            # Geo Prizm interior recording)
            pace = (1.0, 1.0, 0.6, 0.6, 0.6)[min(i, 4)]
            clk = seg('engine/engine_geoprizm_interior_drive_193780', 2.42, 0.24)
            M.at(t0 - 0.10 * pace, pan(peak(filt(fade(clk, 0.003, 0.1), A.hp(700)), 0.17), 0.15))
        # the keys jingling as the hand takes them
        jing = seg('engine/engine_geoprizm_interior_drive_193780', 1.22, 0.7)
        M.at(t_reach + 0.45, pan(peak(filt(fade(jing, 0.01, 0.3), A.hp(1200)), 0.12), 0.15))
    crunch = steady('snow_tyres/snow_tyres_tires_snow_ice_slow_71099', max(0.5, t_stop - t_skid), skip=0.5)
    M.at(t_skid + 0.2, peak(filt(fade(crunch, 0.1, 0.6), A.lp(2400)), 0.14))

    beat = peak(one_beat(), 0.4)
    beats = []
    if hood:
        # ---- the bonnet: claws on the metal, the car creaking down under it, a low pluck; then its face rising -----------
        claws = loudest('metal_scrape/metal_scrape_rusted_car_dashboard_scrape_674024', 0.9, pre=0.05)
        if perched:
            hit = loudest('metal_impact/metal_impact_car_hood_slam_big_329516', 1.2, pre=0.02)
            M.at(t_land - 0.03, pan(peak(filt(fade(hit, 0.003, 0.5), A.lp(3500)), 0.6), 0.0))
            M.at(t_land - 0.03, pan(peak(load(ST_JUMP), 0.55), 0.0))
            M.at(t_land - 0.03, pan(peak(filt(seg(HIT_BOOM, 0.0, 3.0), A.lp(220)), 0.45), 0.0))
            M.at(t_land + 0.4, pan(peak(filt(claws, A.hp(400)), 0.3), -0.15))
            M.at(t_land + 1.1, pan(peak(filt(pitch(claws, 1.1), A.hp(400)), 0.22), 0.2))
            M.at(t_land + 0.1, pan(peak(seg(F_CREAK, 1.0, 2.5), 0.18), 0.0))
        else:
            M.at(t_hand - 0.05, pan(peak(filt(claws, A.hp(400)), 0.3), -0.15))
            M.at(t_hand2 - 0.05, pan(peak(filt(pitch(claws, 1.1), A.hp(400)), 0.22), 0.2))
            M.at(t_hand, pan(peak(seg(F_CREAK, 1.0, 2.5), 0.16), 0.0))
            M.at(t_hand - 0.02, pan(peak(load(ST_PLUCK), 0.42), -0.1))
            M.at(t_hand - 0.02, pan(peak(filt(seg(HIT_BOOM, 0.0, 3.0), A.lp(200)), 0.3), 0.0))
        stare = max(1.0, t_roar - 0.45 - t_hand)
        M.bed(level(filt(steady(STR_BASS, stare + 0.5, skip=1), A.lp(5000)), 0.012), t_hand, t_roar - 0.45,
              [(t_hand, 0), (t_rise, 0.6), (t_roar - 0.6, 1.3), (t_roar - 0.45, 0)])
        M.bed(level(filt(steady(STR_SCRAPE, stare + 0.5, skip=5), A.lp(4000)), 0.011), t_rise, t_roar - 0.45,
              [(t_rise, 0), (t_rise + 1.5, 1.0), (t_roar - 0.45, 1.0)])
        breath = filt(pitch(seg(CR_BREATH, 2.0, stare * 0.55 + 1.0), 0.55), A.lp(1600))[:, :int((t_roar - 0.5 - t_rise) * SR)]
        M.at(t_rise, pan(fade(level(breath, 0.05), 0.6, 0.3), 0.0))
        tb = t_rise + 0.2
        while tb < t_roar - 0.5:
            beats.append(tb)
            tb += 0.7 - 0.25 * np.clip((tb - t_rise) / stare, 0, 1)
    else:
        if not stall:
            steps = loudest('footsteps/footsteps_heavy_steps_snow_543385', 2.0, pre=0.2)
            M.at(t_cre + 0.6, pan(peak(filt(pitch(steps, 0.8), A.lp(1200)), 0.08), -0.1))
        stare = max(1.0, t_roar - 0.45 - t_stop)
        M.bed(level(filt(steady(STR_SCRAPE, stare + 0.5, skip=5), A.lp(4000)), 0.01), t_stop, t_roar - 0.45,
              [(t_stop, 0), (t_stop + 1.5, 1.0), (t_roar - 0.45, 1.0)])
        tb = t_stop - 0.3
        while tb < t_roar - 0.5:
            beats.append(tb)
            tb += 0.78 - 0.3 * np.clip((tb - t_stop) / stare, 0, 1)
    # the suck-out: everything drawn away into a reversed cymbal, then the scream hits
    M.x *= np.interp(tt, [0, t_roar - 0.5, t_roar - 0.3, t_scream - 0.12, t_scream - 0.05, total], [1, 1, 0.08, 0.08, 1, 1])
    if not perched:
        if not stall:                 # (the stall: its ringing swell, ~3.2 kHz, read as a squeal rising into the burst)
            rc = seg(RIS_REVCYM, 6.9, 1.5)
            M.at(t_scream - 0.1 - rc.shape[1] / SR, pan(peak(filt(rc, A.hp(300)), 0.35), 0.0))

    # ---- the scream: a human performance and animals, pitched and layered past naming, on a brass hit and a boom ---------
    # (on the bonnet it does not roar: its jaw opens wide in silence, a wet hiss at the glass, a bowed-metal whine)
    if perched and not roof:
        hiss = filt(pitch(seg(CR_BREATH, 12.0, 2.4), 0.5), A.bp(1400, 0.6))
        M.at(t_jaw + 0.15, pan(fade(peak(hiss, 0.2), 0.3, 0.8), 0.0))
        M.at(t_jaw, pan(fade(level(seg(EXT_RAIL, 14.0, 2.5), 0.012), 0.6, 1.0), 0.1))
    n = int(2.6 * SR) if not perched else int(0.1 * SR)
    sc = np.zeros((2, n))
    for name, f, g, pre in () if perched else ((CR_SCREAMS, 0.74, 1.0, 0.1), (CR_PIG, 0.62, 0.45, 0.05), (CR_CHIMP, 0.55, 0.25, 0.05),
                            ('creature/creature_gorilla_alpha_roar_zoo_397054', 0.55, 0.9, 0.1),
                            ('creature/creature_bear_roaring_479825', 0.52, 0.75, 0.1)):
        c = pitch(loudest(name, 2.4, pre=pre), f)[:, :n]
        sc[:, :c.shape[1]] += level(fade(c, 0.03, 0.5), 0.1) * g
    sc = verb(sc, 2.6, 0.32)
    if hood:
        sc = filt(sc, A.lp(6500)) * 1.0 + filt(sc, A.lp(220)) * 0.6          # through the glass: duller on top, the glass
                                                                                # and the car's shell booming with it
    if stall:
        n = int(1.25 * SR)
        sh = np.zeros((2, n))
        # the owner: like Until Dawn's wendigos and The Quarry's werewolves; human, a creature, raspy, loud, a high scream.
        # A man's throat torn into a shriek: a demon shriek and a woman's horror shriek (high, pitched down a little) and a
        # man's scream (its body), all through the torn throat (rasp); a man's growl and a bear's under them for weight
        for c, g in ((voice(CV + 'demon_shriek_433735', 1.3, 0.92, drive=3.0, fry=58.0, grit=0.3, many=True), 1.0),
                     (voice(CV + 'male_screams_556976', 1.3, 0.95, drive=3.0, fry=46.0, depth=0.42), 0.8),
                     (pitch(loudest(CR_GROWLS, 1.3, pre=0.05), 0.8), 0.5),
                     (pitch(loudest('creature/creature_black_bear_angry_growl_763026', 1.3, pre=0.08), 0.75), 0.32)):
            c = c[:, :n]
            sh[:, :c.shape[1]] += level(fade(c, 0.015, 0.35), 0.1) * g
        sh = verb(detone(sh), 1.2, 0.18)        # (no squeal: the shriek's clean notes pulled down)
        t_hit = t_smash or t_imp
        if t_smash:
            # the driver's window bursting in, its arm through it: the glass, the door's skin boomed, a sting
            # (the glass de-whined across its ring: its shatter without the ping at ~4.8 kHz that read as a squeak)
            gl = detone(loudest('glass/glass_broken_car_window_587928', 1.2, pre=0.02), lo=2000.0, hi=8000.0, over=2.5, keep=1.2)
            M.at(t_smash - 0.015, pan(peak(fade(gl, 0.002, 0.6), 0.62), -0.75))
            M.at(t_smash - 0.01, pan(peak(filt(fade(loudest('glass/glass_hard_glass_impact_crack_418194', 0.8, pre=0.01), 0.002, 0.4), A.lp(9000)), 0.55), -0.6))
            M.at(t_smash - 0.02, pan(peak(filt(seg(HIT_BOOM, 0.0, 3.0), A.lp(220)), 0.5), -0.3))
            # (no violin sting: the low brass and the boom carry it)
            # dropping back off the window: its breath, wet and close, a snarl through it
            M.at(t_smash + 0.62, pan(peak(filt(pitch(loudest(CR_BREATH, 0.8, pre=0.05), 0.62), A.lp(3000)), 0.3), -0.75))
            # the coil: a low rumble in its chest, held (as Until Dawn's do before they go)
            rumble = filt(pitch(loudest('creature/creature_lion_growl_roar_breath_488348', 0.6, pre=0.05), 0.85), A.lp(900))
            M.at(t_smash + 0.72, pan(peak(fade(rumble, 0.08, 0.15), 0.42), -0.7))
            # the ram: a roar from the throat as it springs (the blow's own crash follows at t_imp)
            t_launch = first('launch')
            if t_launch:
                ro = sumc(level(voice(CV + 'ghost_monster_scream_546507', 0.6, 0.9, drive=3.0, fry=44.0), 0.1),
                          level(voice(CV + 'male_screams_556976', 0.6, 0.86, at=4.1, drive=3.2, fry=40.0), 0.08),
                          level(pitch(loudest(CR_GROWLS, 0.6, pre=0.03), 0.78), 0.07))
                M.at(t_launch - 0.05, pan(peak(fade(filt(ro, A.lp(4500)), 0.01, 0.2), 0.7), -0.7))
        M.at(t_hit + 0.02, pan(peak(fade(sh, 0.02, 0.4), 0.85), -0.75))    # (at the driver's door, the left, in the cabin)
        M.at(t_hit - 0.03, pan(peak(load(HIT_BRAAM), 0.5), 0.0))
    elif not perched:
        M.at(t_scream - 0.08, pan(peak(fade(sc, 0.03, 0.8), 0.92), -0.05))
        M.at(t_scream - 0.08, pan(peak(load(HIT_BRAAM), 0.55), 0.0))
        M.at(t_scream - 0.08, pan(peak(seg(HIT_BOOM, 0.0, 5.0), 0.6), 0.0))
        M.at(t_scream - 0.1, pan(peak(fade(seg(ST_CLUSTER, 4.6, 3.0), 0.01, 1.5), 0.45), 0.0))

    # ---- the roof: its face drops into the windshield (a sting out of the silence); its head slams the glass (it cracks:
    # laminated glass, it holds); it shrieks at the driver through it (the owner asked for a shriek, not a roar); its claw
    # strikes the glass and drags down it
    if roof:
        M.at(t_hang - 0.02, pan(peak(fade(seg(ST_CLUSTER, 4.6, 2.5), 0.005, 1.2), 0.5), 0.0))
        M.at(t_hang - 0.02, pan(peak(filt(seg(HIT_BOOM, 0.0, 3.0), A.lp(250)), 0.45), 0.0))
        if t_slam:
            M.at(t_slam - 0.01, pan(peak(filt(fade(loudest('glass/glass_hard_glass_impact_crack_418194', 1.0, pre=0.01), 0.002, 0.5), A.lp(9000)), 0.62), 0.0))
            M.at(t_slam, pan(peak(fade(loudest('glass/glass_windshield_crack_mirror_806423', 1.4, pre=0.01), 0.002, 0.8), 0.42), 0.05))
            M.at(t_slam - 0.01, pan(peak(filt(fade(loudest('metal_impact/metal_impact_car_hood_slam_big_329516', 0.8, pre=0.02), 0.003, 0.4), A.lp(900)), 0.4), 0.0))
            M.at(t_slam - 0.01, pan(peak(filt(seg(HIT_BOOM, 0.0, 3.0), A.lp(200)), 0.4), 0.0))
        # the shriek: a human monster scream, a fox, a pig, a chimp, high and layered, at the glass and through it
        n = int(1.25 * SR)
        sh = np.zeros((2, n))
        for name, f, g, pre in ((CR_SCREAMS, 0.95, 1.0, 0.08), ('creature_extra/creature_extra_fox_screaming_night_832436', 0.9, 0.7, 0.05),
                                (CR_PIG, 0.8, 0.35, 0.05), (CR_CHIMP, 0.92, 0.3, 0.05)):
            c = pitch(loudest(name, 1.3, pre=pre), f)[:, :n]
            sh[:, :c.shape[1]] += level(fade(c, 0.02, 0.35), 0.1) * g
        sh = verb(sh, 1.8, 0.25)
        sh = filt(sh, A.lp(7000)) + filt(sh, A.lp(250)) * 0.5          # through the glass: duller on top, the car booming with it
        M.at(t_jaw - 0.03, pan(peak(fade(sh, 0.02, 0.4), 0.9), 0.0))
        M.at(t_jaw + 1.15, pan(peak(filt(loudest('creature_extra/creature_extra_tiger_hiss_growl_437978', 1.0, pre=0.05), A.lp(5000)), 0.3), 0.0))
        if t_claw:
            M.at(t_claw - 0.01, pan(peak(filt(pitch(fade(loudest('glass/glass_hard_glass_impact_crack_418194', 0.8, pre=0.01), 0.002, 0.4), 1.12), A.lp(9000)), 0.45), 0.2))
            scr = filt(pitch(loudest('metal_scrape/metal_scrape_rusted_car_dashboard_scrape_674024', 0.5, pre=0.02), 1.35), A.hp(1500))
            M.at(t_claw + 0.04, pan(peak(fade(scr, 0.01, 0.12), 0.32), 0.2))

    # ---- gone: silence but the wind and the idle; far down the valley, something answers -----------------------------
    if hood:
        M.at(t_leap, pan(peak(filt(pitch(claws, 0.8), A.hp(300)), 0.3), 0.0))
        if perched and t_gone:
            M.at(t_gone - 0.02, pan(peak(filt(loudest('snow_impact/snow_impact_hard_impact_snow_683789', 0.7, pre=0.03), A.lp(1500)), 0.25), 0.0))
        for i, t0 in enumerate(roofs):
            if hoodatk:
                # (flung off: its body hitting the snow out ahead, tumbling)
                thud = loudest('snow_impact/snow_impact_hard_impact_snow_683789', 0.7, pre=0.03)
                M.at(t0 - 0.02, pan(peak(filt(fade(thud, 0.003, 0.4), A.lp(1400)), 0.3 - 0.08 * i), 0.0))
                continue
            thud = loudest(['metal_impact/metal_impact_car_hood_slam_big_329516', 'metal_impact/metal_impact_sheet_metal_drop_587442'][i % 2], 0.9, pre=0.02)
            M.at(t0 - 0.02, pan(peak(filt(fade(thud, 0.003, 0.4), A.lp(1800)), 0.55 - 0.1 * i), 0.0))
            M.at(t0, pan(peak(seg(F_CREAK, 3.0 + i, 1.5), 0.12), 0.0))
    elif not stall:
        away = loudest('footsteps/footsteps_horse_gallop_close_479799', 2.5, pre=0.3)
        M.at(t_bolt, pan(level(filt(pitch(fade(away, 0.05, 1.5), 0.8), A.lp(1000)), 0.02), 0.2))
    if not stall:
        howl = verb(filt(pitch(loudest(AMB_WOLF, 6.0, pre=1.0), 0.62), A.lp(1100)), 3.5, 0.65)
        M.at(t_bolt + 3.2, pan(fade(peak(howl, 0.07), 0.5, 2.5), 0.5))

    # ---- the creep: scratching strings, a tree groaning on the right, the wheel creaking in the hands; the heart ---------
    if not stall:
      M.bed(level(filt(steady(STR_ALEA, max(1.0, t_growl - t_creep), skip=3), A.lp(5000)), 0.016), t_creep, t_growl - 3.4,
          [(t_creep, 0), (t_creep + 2.0, 1.0), (t_growl - 3.6, 1.0), (t_growl - 3.4, 0)])
      M.at(t_creep + 2.6, pan(fade(peak(seg(AMB_TREES, 25.0, 4.0), 0.12), 0.3, 1.0), 0.7))
      M.at(t_creep + 0.8, pan(peak(seg(F_LEATHER, 0.8, 1.2), 0.05), -0.2))
      tb = t_creep + 0.5
      while tb < t_lunge - 0.1:
          beats.append(tb)
          tb += 0.62 - 0.24 * np.clip((tb - t_creep) / max(t_imp - t_creep, 1), 0, 1)
      # the mirror: everything but the heart drops away
      duck = np.interp(tt, [0, t_growl - 3.4, t_growl - 2.6, t_growl - 0.05, t_growl, total], [1, 1, 0.2, 0.2, 1, 1])
      M.x *= duck
    for t0 in beats:
        M.at(t0, beat, 0.75)
    if t_face and not stall:                              # (the stall: it is at the window unseen; nothing gives it away)
        M.at(t_face - 0.02, pan(peak(load(ST_JUMP), 0.6), -0.6))
        M.at(t_face - 0.02, pan(peak(seg(HIT_BOOM, 0.0, 4.0), 0.5), -0.3))
        M.at(t_face + 0.05, pan(peak(filt(pitch(seg(CR_BREATH, 30.0, 1.4), 0.6), A.lp(2500)), 0.22), -0.85))
    # the growl, right outside the driver's window
    if t_overtake:
        run = loudest('footsteps/footsteps_horse_gallop_close_479799', 1.5, pre=0.1)
        M.at(t_overtake + 0.2, pan(peak(filt(pitch(run, 0.8), A.lp(1300)), 0.2), -0.8))
    g1 = pitch(loudest(CR_GROWLS, 1.3, pre=0.15), 0.72)
    if perched:
        g1 = pitch(seg(CR_BREATH, 30.0, 1.3), 0.55)
    g2 = pitch(loudest('creature/creature_black_bear_angry_growl_763026', 1.4, pre=0.15), 0.62)
    if not stall:
      M.at(t_growl, pan(peak(verb(level(g1, 0.1) if perched else sumc(level(g1, 0.1), level(g2, 0.08)), 1.0, 0.2), 0.3 if perched else 0.42 if hood else 0.72), -0.9))
    steps_in = loudest('footsteps/footsteps_horse_gallop_close_479799', 1.0, pre=0.2)
    if not stall:
        M.at(t_charge, pan(peak(filt(pitch(steps_in, 0.75), A.lp(1400)), 0.25), -0.8))

    # ---- the lunge, slowed: the heart stops, everything drawn in, a reversed piano into the blow ----------------------
    slow_dur = max(0.3, t_speed - t_imp)
    blow = loudest('metal_impact/metal_impact_real_crash_interior_346300', 2.5, pre=0.05)
    glass = loudest('glass/glass_broken_car_window_587928', 1.2, pre=0.02)
    snarl = loudest('creature/creature_tiger_cage_growl_snarl_439280', 1.4, pre=0.3)
    if t_imp - t_lunge > 0.2:
        M.x *= np.interp(tt, [0, t_lunge, t_lunge + 0.15, t_imp - 0.03, t_imp, total], [1, 1, 0.25, 0.25, 1, 1])
        rp = load(RIS_REVPIANO)
        e = min(rp.shape[1], int(6.95 * SR))
        rp = rp[:, max(0, e - int((t_imp - t_lunge) * SR)):e]
        M.at(t_imp - rp.shape[1] / SR, pan(peak(rp, 0.3), 0.0))
        M.at(t_lunge, pan(peak(filt(pitch(fade(snarl, 0.05, 0.3), 0.5), A.lp(900)), 0.45), -0.6))
    if stall:
        # (scanned for squeaks, 40 ms at a time: the outside crash recording rang at 575 Hz; the crushed bus doesn't)
        ext = loudest('metal_impact/metal_impact_bus_destroy_crush_window_metal_451665', 1.6, pre=0.03)
        hit = sumc(level(blow, 0.1), level(filt(ext, A.lp(5000)), 0.07), level(filt(glass, A.hp(800)), 0.035))
        M.at(t_imp - 0.02, pan(peak(fade(hit, 0.003, 0.8), 0.95), -0.4))
        M.at(t_imp - 0.02, pan(peak(seg(HIT_BOOM, 0.0, 4.0), 0.75), -0.2))
        M.at(t_imp - 0.01, pan(peak(filt(loudest('metal_impact/metal_impact_car_hood_slam_big_329516', 0.6, pre=0.02), A.lp(1500)), 0.6), -0.6))
        # the tyres scrubbed sideways through the snow under the shove, all the way to the edge
        scrub = steady('snow_tyres/snow_tyres_car_motion_on_snow_468178', max(0.6, t_edge - t_imp + 0.2), skip=0.5)   # (no squeaking snow)
        M.bed(level(filt(scrub, A.lp(3000)), 0.05), t_imp, t_edge + 0.1, [(t_imp, 0), (t_imp + 0.05, 1.0), (t_edge - 0.1, 1.0), (t_edge + 0.1, 0)])
    # the blow: a trailer hit and a boom under the crash and the glass, pitched down and muffled; back to speed
    slowed = sumc(level(filt(pitch(blow, 0.4), A.lp(900)), 0.1), level(filt(pitch(glass, 0.45), A.lp(1600)), 0.056),
                  level(filt(pitch(snarl, 0.45), A.lp(800)), 0.08))
    if not stall:
        M.at(t_imp - 0.02, pan(peak(fade(slowed[:, :int((slow_dur + 0.6) * SR)], 0.005, 0.5), 0.75), -0.4))
        M.at(t_imp - 0.02, pan(peak(seg(HIT_TRAILER, 0.0, 3.0), 0.8), 0.0))
        M.at(t_imp - 0.02, pan(peak(pitch(seg(HIT_BOOM, 0.0, 5.0), 0.85), 0.9), 0.0))
        M.at(t_speed - 0.05, pan(peak(fade(blow[:, int(0.3 * SR):], 0.05, 0.6), 0.6), -0.2))
    M.at(t_speed, pan(peak(load('glass/glass_glass_shatter_shards_444134'), 0.35), -0.4))
    t_letgo = first('letgo')
    if stall and t_letgo:
        after = sumc(level(voice(CV + 'demon_shriek_433735', 1.6, 0.88, at=6.5, drive=2.8, fry=56.0, grit=0.3, seed=11, many=True), 0.1),
                     level(voice(CV + 'male_screams_556976', 1.6, 0.9, at=7.95, drive=2.8, fry=48.0, seed=13), 0.07))
        M.at(t_letgo + 0.05, pan(peak(verb(fade(filt(detone(after), A.lp(7000)), 0.03, 0.6), 2.4, 0.35), 0.7), -0.6))
    # the shove, in heaves (the stall): the door's skin buckling under it and the car groaning, its strain at each
    for i, t0 in enumerate([t for t, k, v in ev if k == 'heave']):
        dent = loudest('metal_impact/metal_impact_car_hood_slam_big_329516', 0.7, pre=0.02)
        M.at(t0 - 0.03, pan(peak(filt(fade(pitch(dent, 0.7), 0.003, 0.4), A.lp(700)), 0.42 - 0.05 * i), -0.5))
        # (the car's body bending under it: real crushed metal, not a creak, whose held tone read as a squeal)
        bend = loudest('metal_impact/metal_impact_bus_destroy_crush_window_metal_451665', 0.7, pre=0.03)
        M.at(t0 + 0.02, pan(peak(filt(fade(bend, 0.01, 0.3), A.lp(2200)), 0.28 - 0.04 * i), -0.4))
        strain = sumc(level(voice(CV + 'mutant_scream_396797', 0.7, 0.8 + 0.05 * i, drive=3.2, fry=40.0, seed=7 + i), 0.09),
                      level(pitch(loudest('creature/creature_black_bear_angry_growl_763026', 0.7, pre=0.1), 0.7), 0.07))
        M.at(t0 - 0.1, pan(peak(filt(fade(strain, 0.03, 0.25), A.lp(3000)), 0.4), -0.75))
        thud = loudest('snow_impact/snow_impact_body_falls_hard_snow_675895', 0.5, pre=0.02)   # (its weight driven into the door)
        M.at(t0 - 0.02, pan(peak(filt(fade(thud, 0.003, 0.3), A.lp(1800)), 0.34), -0.55))

    # ---- the fall: clear when the eyes are open, muffled and far off in the blackouts --------------------------------
    R = Mix(total)
    scrape = loudest('metal_scrape/metal_scrape_gate_bar_drag_scrape_450356', 1.4, pre=0.2)
    R.at(t_edge - 0.15, pan(peak(filt(fade(scrape, 0.02, 0.4), A.lp(1100)), 0.45), 0.3))   # (below its 1.5 kHz ring)
    R.at(t_crack, pan(peak(load('glass/glass_windshield_crack_mirror_806423'), 0.5), 0.0))
    rush = steady('wind/wind_mountain_wind_alps_gusts_454092', total, skip=20)
    R.bed(level(rush, 0.06), t_edge, t_black, [(t_edge, 0.4), (t_edge + 1, 1.4), (t_black - 1, 1.2), (t_black, 0)])
    # (scanned for squeaks: the sheet metal rang at 1225 Hz, the outside crash at 575 Hz, the hard snow impact squeaked at
    # 975 Hz; the ones here don't)
    bangs = ['metal_impact/metal_impact_car_hood_slam_big_329516', 'metal_impact/metal_impact_bus_destroy_crush_window_metal_451665',
             'metal_impact/metal_impact_real_crash_interior_346300', 'metal_impact/metal_impact_rally_car_off_track_crash_209965']
    thuds = ['snow_impact/snow_impact_snow_block_crunch_450848', 'snow_impact/snow_impact_body_falls_hard_snow_675895']
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
    # ---- the black, then waking upside down ---------------------------------------------------------------------------
    after = np.interp(tt, [0, t_black - 0.05, t_black + 0.05, total], [1, 1, 0, 0])
    M.x *= after
    # the ears ringing from the blow, on through the blackouts, dying away after waking
    tin = steady(B_TINNITUS, total - t_imp, skip=0.5)
    M.bed(level(filt(tin, A.hp(1500)), 0.008), t_imp + 0.2, total, [(t_imp + 0.2, 0), (t_imp + 0.8, 1.0), (t_black, 1.2),
                                                                     (t_wake + 1.0, 1.0), (t_wake + 6.0, 0.0), (total, 0.0)])

    for t0 in np.arange(t_black + 0.4, t_wake + 1.5, 1.0):
        M.at(t0, beat, 0.55)
    storm = steady('wind/wind_snowstorm_wind_mountain_473815', total, skip=10)
    M.bed(level(storm, 0.03), t_black, total, [(t_black, 0), (t_wake - 0.5, 0.25), (t_wake + 1.5, 1.0), (total, 1.0)])
    trees = steady(AMB_BLIZ, total, skip=12)
    M.bed(level(filt(trees, A.lp(4500)), 0.022), t_wake, total, [(t_wake, 0), (t_wake + 2.0, 1.0), (total, 1.0)])
    static = steady(F_STATIC, total, skip=2)
    M.bed(pan(level(filt(static, A.bp(1800, 0.7)), 0.014), 0.35), t_wake, total, [(t_wake, 0), (t_wake + 1.0, 1.0), (total, 0.8)])
    chime = steady(F_CHIME, total, skip=0.2)
    M.bed(pan(level(chime, 0.008), 0.2), t_wake + 1.6, total, [(t_wake + 1.6, 0), (t_wake + 2.0, 1.0), (total, 1.0)])
    drip = steady(F_DRIP, total, skip=0.0)
    M.bed(pan(level(drip, 0.012), -0.3), t_wake, total, [(t_wake, 0), (t_wake + 1.5, 1.0), (total, 1.0)])
    M.at(t_wake + 2.4, pan(peak(seg(F_CREAK, 1.0, 4.0), 0.08), 0.1))
    tick = steady('aftermath/aftermath_engine_cooldown_clicking_539514', total, skip=5)
    M.bed(level(tick, 0.016), t_wake, total, [(t_wake, 0), (t_wake + 1.5, 1.0), (total, 1.0)])
    hissing = steady('aftermath/aftermath_steam_radiator_hiss_265013', total, skip=2)
    M.bed(level(hissing, 0.012), t_wake, total, [(t_wake, 0), (t_wake + 2, 1.0), (total, 0.7)])
    if t_sil:
        # its slow steps in the snow (a stride each 0.75 s; it stops in the light a moment, listening), its breath, the
        # waterphone and the bowed metal under it
        snow_steps = load('footsteps/footsteps_deep_snow_heavy_slow_480621')
        step_len = int(0.45 * SR)
        for i in range(16):
            w = 0.3 + i * 0.75
            w = w if w < 3.6 else w + 2.4
            s0 = int((3 + i * 3.7) * SR) % max(1, snow_steps.shape[1] - step_len)
            st = fade(snow_steps[:, s0:s0 + step_len], 0.005, 0.2)
            M.at(t_sil + w, pan(peak(filt(pitch(st, 0.8), A.lp(1400)), 0.09), -0.3 + 0.04 * i))
        M.at(t_sil + 3.8, pan(fade(level(filt(pitch(seg(CR_BREATH, 20.0, 3.0), 0.5), A.lp(1500)), 0.04), 0.4, 0.8), 0.0))
        M.at(t_sil, pan(fade(level(steady(EXT_WATER, 9.0, skip=5), 0.016), 2.0, 2.5), 0.0))
        M.at(t_sil + 3.4, pan(fade(level(seg(EXT_RAIL, 8.0, 4.0), 0.01), 0.6, 1.5), 0.2))
    if t_close:
        out = np.interp(tt, [0, t_close, t_close + 2.0, total], [1, 1, 0.12, 0.12])
        M.x *= out
    if t_title:
        M.at(t_title - 0.1, pan(peak(load(HIT_BRAAM), 0.55), 0.0))
        M.at(t_title - 0.1, pan(peak(seg(HIT_BOOM, 0.0, 6.0), 0.5), 0.0))
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
