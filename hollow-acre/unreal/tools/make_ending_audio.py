"""Sound for the new ending (our own synthesis, numpy only): the pixel drive up the mountain, the change into the
realistic first-person drive, and the end card.

  pixel  (0-15.5 s)  Part 1's own sound recipes (2d/src/audio.js): its wind (band-passed noise round 420 Hz, a slow
                     wander), its engine (a 46 Hz sawtooth and a 92.6 Hz square through a 240 Hz low-pass), its horror
                     drone, and its triangle "note" with the long reverb, here a few slow notes as the car climbs.
  change (15-20.5 s) through the black the pixel engine's tone glides up to the real engine's firing note and hands over
                     to it; the pixel wind widens into the real wind; the cabin's sound opens up from muffled to full as
                     the picture fades in, like coming to.
  real   (15.5-60.5) inside the car: a four-cylinder at about 2,070 rpm under the firewall, tyre rumble and the crunch
                     of packed snow (bumps in time with the drive's), the blizzard outside with gusts and a whistle at
                     the mirror, the heater fan, the odd creak, and the wipers (motor, blade swish, the thunk as they
                     park) in time with the game's wiper clock. Just before the fade out, far away up the mountain,
                     something howls.
  card   (54-60.5)   Part 1's drone and one of its notes under "To be continued": still the same game.

Writes HollowAcre/SourceArt/Audio/Ending_Drive.wav (from the realistic scene's first frame; Unreal plays it) and
HollowAcre/Saved/Generated/Ending_Full.wav (the whole cutscene, for the preview video). 48 kHz, 16-bit stereo.
Run: python hollow-acre/unreal/tools/make_ending_audio.py
"""
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.join(HERE, '..', 'HollowAcre')
SR = 48000
PIX = 15.5                                   # the pixel cutscene's length (2d/src/ending_drive.js ENDING_DRIVE.LEN)
HOLD, FADE_IN, DRIVE, FADE_OUT, CARD_DELAY, CARD_IN = 1.5, 3.5, 30.0, 3.0, 1.0, 2.5   # EndingDirector
REAL = 45.0                                  # captured length of the realistic scene
WIPER_PERIOD, WIPER_REST, WIPER_PHASE = 1.35, 0.25, 0.4                               # EndingDirector wipers
TOTAL = PIX + REAL
N = int(TOTAL * SR)
T = np.arange(N) / SR
TR = T - PIX                                 # the realistic scene's own clock (its Time)
rng = np.random.default_rng(1746)


# ---------------- tools ----------------
def noise(seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    return r.standard_normal(N)


def freqs(n):
    return np.fft.rfftfreq(n, 1 / SR)


def fft_filter(x, mask_fn):
    n = len(x)
    m = 1 << int(np.ceil(np.log2(n)))
    X = np.fft.rfft(x, m)
    return np.fft.irfft(X * mask_fn(freqs(m)), m)[:n]


def lp(fc, order=2):
    return lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order))


def hp(fc, order=2):
    return lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order))


def bp(fc, q):
    return lambda f: 1 / np.sqrt(1 + q * q * (np.maximum(f, 1e-3) / fc - fc / np.maximum(f, 1e-3)) ** 2)


def stft_filter(x, gain_fn, block=4096):
    """A filter that changes over time: Hann-windowed blocks at 50% overlap, each shaped by gain_fn(t, freqs)."""
    hop = block // 2
    w = np.hanning(block + 1)[:-1]
    pad = np.concatenate([np.zeros(hop), x, np.zeros(block)])
    out = np.zeros(len(pad))
    f = freqs(block)
    for s in range(0, len(pad) - block, hop):
        tc = (s - hop + block / 2) / SR
        seg = np.fft.rfft(pad[s:s + block] * w)
        out[s:s + block] += np.fft.irfft(seg * gain_fn(tc, f), block)
    return out[hop:hop + len(x)]


def smooth(rate, seed, lo=0.0, hi=1.0):
    """A slow random curve between lo and hi (cosine-interpolated points, rate per second)."""
    r = np.random.default_rng(seed)
    k = int(TOTAL * rate) + 3
    pts = r.random(k)
    x = T * rate
    i = np.floor(x).astype(int)
    u = (1 - np.cos(np.pi * (x - i))) / 2
    return lo + (hi - lo) * (pts[i] * (1 - u) + pts[i + 1] * u)


def env(points):
    """Piecewise-linear envelope over the whole timeline: [(t, value), ...]."""
    ts, vs = zip(*points)
    return np.interp(T, ts, vs)


def phase_of(f):
    return 2 * np.pi * np.cumsum(f) / SR


def saw(ph, top=24):
    return sum(np.sin(k * ph) / k for k in range(1, top + 1)) * (2 / np.pi)


def square(ph, top=24):
    return sum(np.sin(k * ph) / k for k in range(1, top + 1, 2)) * (4 / np.pi)


def tri(ph, top=15):
    return sum(((-1) ** ((k - 1) // 2)) * np.sin(k * ph) / (k * k) for k in range(1, top + 1, 2)) * (8 / np.pi ** 2)


def reverb(x, secs=3.0, seed=5):
    """Part 1's reverb: a decaying noise impulse (cubic fall-off), one per ear."""
    n = int(secs * SR)
    out = []
    for ch in range(2):
        ir = np.random.default_rng(seed + ch).standard_normal(n) * (1 - np.arange(n) / n) ** 3
        ir /= np.sqrt(np.sum(ir ** 2))
        m = 1 << int(np.ceil(np.log2(len(x) + n)))
        out.append(np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)])
    return np.stack(out)


def st(x, p=0.0):
    """Mono to stereo, equal-power pan (-1 left .. 1 right)."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def events(times, make):
    """Sum one-shot sounds: make(n_samples) -> array, placed at each time."""
    out = np.zeros(N)
    for t0 in times:
        s = int(t0 * SR)
        if s >= N or s < 0:
            continue
        y = make()
        e = min(N, s + len(y))
        out[s:e] += y[:e - s]
    return out


def rms(x):
    return np.sqrt(np.mean(x ** 2) + 1e-12)


def norm(x, level):
    return x / rms(x) * level


# ---------------- the pixel drive (Part 1's sounds) ----------------
def pixel():
    # its wind: band-passed noise round 420 Hz (Q .7) that wanders +-220 Hz on a slow LFO; it rises with the blizzard
    # and widens into a roar as the white-out comes
    def wind_gain(tc, f):
        c = 420 + 220 * np.sin(2 * np.pi * 0.06 * tc)
        q = np.interp(tc, [0, 9, 14.5, 16.5], [0.7, 0.7, 0.35, 0.25])
        return bp(c, q)(f)
    wind = [stft_filter(noise(11 + ch), wind_gain) for ch in range(2)]
    wind_env = env([(0, 0), (1.0, 0.55), (6.5, 0.6), (7.0, 0.85), (13.5, 1.15), (15.2, 1.2), (17.5, 0.0), (TOTAL, 0)])
    wind = np.stack([norm(w, 0.05) * wind_env for w in wind])
    # its blowing snow ("rain": high-passed hiss), thickening in the close shot
    hiss = np.stack([norm(fft_filter(noise(21 + ch), lambda f: hp(2200)(f) * lp(7000)(f)), 0.006) for ch in range(2)])
    hiss *= env([(0, 0), (1, 0.4), (7, 0.5), (13.5, 1.3), (15.0, 1.0), (16.0, 0), (TOTAL, 0)])
    # its engine: a 46 Hz sawtooth and a 92.6 Hz square under a 240 Hz low-pass; far off in the wide shot, close
    # beside the car after the cut; through the black it glides up to the real engine's firing note (69 Hz)
    glide = np.where(T < 15.0, 1.0, np.where(T < 17.0, (69 / 46) ** ((T - 15.0) / 2.0), 69 / 46))
    eng = saw(phase_of(46 * glide), 20) + 0.3 * square(phase_of(92.6 * glide), 9)
    eng = fft_filter(eng, lp(240))
    eng_env = env([(0, 0), (1, 0.18), (6.9, 0.25), (7.0, 0.85), (12.3, 0.9), (13.6, 0.55), (15.0, 0.6), (16.2, 0.5), (17.6, 0.0), (TOTAL, 0)])
    eng = st(norm(eng, 0.06) * eng_env)
    # its horror drone underneath, growing toward the black
    drone = sum(g * w for g, w in ((0.35, saw(phase_of(np.full(N, 43.6)), 8)), (0.35, saw(phase_of(np.full(N, 44.1)), 8)),
                                   (0.5, np.sin(2 * np.pi * 65.4 * T)), (0.15, np.sin(2 * np.pi * 92.5 * T))))
    drone = stft_filter(drone, lambda tc, f: lp(190 + 60 * np.sin(2 * np.pi * 0.11 * tc))(f))
    drone = norm(drone, 0.03) * env([(0, 0), (3, 0.2), (10, 0.45), (14.5, 0.8), (15.6, 0.0), (TOTAL, 0)])
    # its "note" (a triangle and its octave in sine, long tails in the reverb): a few slow notes as the car climbs
    notes = np.zeros(N)
    for t0, fq, v in ((1.2, 329.6, 1.0), (2.6, 261.6, 0.9), (4.0, 293.7, 0.9), (5.6, 220.0, 1.0), (7.4, 261.6, 0.85),
                      (8.8, 246.9, 0.85), (10.4, 220.0, 0.95), (12.2, 164.8, 0.9), (13.9, 110.0, 1.0)):
        dur = 2.8
        n = int((dur + 0.1) * SR)
        tt = np.arange(n) / SR
        det = 2 ** (rng.uniform(-22, 22) / 1200)
        g = np.exp(np.interp(tt, [0, 0.01, dur], [np.log(1e-4), 0, np.log(1e-4)]))
        y = tri(2 * np.pi * fq * det * tt) * g + 0.3 * np.sin(2 * np.pi * 2 * fq * tt) * np.exp(np.interp(tt, [0, 0.01, 1.0, dur], [np.log(1e-4), 0, np.log(1e-4), np.log(1e-4)]))
        s = int(t0 * SR)
        notes[s:s + n] += v * y[:N - s]
    notes = norm(notes, 0.022)
    # a whoosh as the spruce close to the camera sweeps past (ending_drive.js: at 8.9 s)
    def whoosh():
        n = int(0.9 * SR)
        y = np.random.default_rng(3).standard_normal(n) * np.hanning(n) ** 1.5
        return fft_filter(y, bp(900, 1.2))
    sweep = norm(events([8.55], whoosh), 0.012) * 1.5
    dry = wind + hiss + eng + st(drone) + st(notes, -0.1) + st(sweep, 0.2)
    wet = reverb(drone * 0.6 + notes, 3.0) * 0.45
    return dry + wet


# ---------------- the real drive ----------------
def real():
    on = (TR >= 0).astype(float)
    # the engine: a four-cylinder's firing note (69 Hz, ~2,070 rpm) with its half order (the roughness of the crank),
    # harmonics thinned by the firewall, and the pulse of the intake and exhaust
    f_fire = 69 * (1 + 0.009 * np.sin(2 * np.pi * 0.13 * T + 1) + 0.006 * (smooth(0.7, 31) - 0.5))
    ph = phase_of(f_fire)
    r = np.random.default_rng(7)
    tone = sum(np.sin(k * ph + r.uniform(0, 6.3)) / k ** 1.15 for k in range(1, 15))
    tone += 0.45 * np.sin(0.5 * ph) + 0.2 * np.sin(1.5 * ph + 1.0)
    tone *= 1 + 0.08 * np.sin(0.5 * ph)
    tone = fft_filter(tone, lambda f: lp(650)(f) * hp(28)(f))
    pulse = fft_filter(noise(41), bp(190, 1.4)) * (0.45 + 0.55 * np.maximum(0, np.sin(ph)) ** 4)
    engine = norm(tone, 0.07) + norm(pulse, 0.025)
    # the road: rumble through the tyres and the floor, rising and falling with the drive's bumps (EndingDirector:
    # 0.8 sin 7.1t + 0.5 sin(11.3t + 1.7) cm), the crunch of packed snow, and a thump now and then at a rut
    vz = np.abs(0.8 * 7.1 * np.cos(7.1 * TR) + 0.5 * 11.3 * np.cos(11.3 * TR + 1.7))
    rumble = fft_filter(np.cumsum(noise(51)) * 0.02, lambda f: lp(160)(f) * hp(25)(f))
    rumble = norm(rumble - np.mean(rumble), 0.05) * (0.65 + 0.35 * vz / vz.max())
    grains = np.zeros(N)
    gt = np.cumsum(np.random.default_rng(61).exponential(1 / 70.0, int(TOTAL * 90)))
    gt = gt[gt < TOTAL]
    gl = int(0.006 * SR)
    shape = np.exp(-np.arange(gl) / (0.0015 * SR))
    for t0, a in zip(gt, np.random.default_rng(62).uniform(0.2, 1.0, len(gt))):
        s = int(t0 * SR)
        e = min(N, s + gl)
        grains[s:e] += a * shape[:e - s] * np.random.default_rng(int(t0 * 1000)).standard_normal(e - s)
    crunch = norm(fft_filter(grains, lambda f: bp(2200, 0.9)(f) * lp(3800)(f)), 0.008)
    tr_ = np.random.default_rng(71)
    thump_t = np.cumsum(tr_.uniform(2.0, 5.0, 30)) + PIX + 1.0

    def thump():
        n = int(0.25 * SR)
        tt = np.arange(n) / SR
        return (np.sin(2 * np.pi * (78 - 30 * tt) * tt) * np.exp(-tt / 0.05) + 0.3 * np.random.default_rng().standard_normal(n) * np.exp(-tt / 0.02)) * tr_.uniform(0.5, 1.0)
    thumps = norm(fft_filter(events(thump_t, thump), lp(400)), 0.02)
    # the blizzard outside, heard through the body: gusting, a moan round the car, a whistle at the driver's mirror
    gust = smooth(0.28, 81, 0.45, 1.0)
    wind = np.stack([fft_filter(noise(91 + ch), lambda f: lp(900)(f) * hp(60)(f)) for ch in range(2)])
    wind = np.stack([norm(w, 0.06) for w in wind]) * gust
    moan = norm(fft_filter(noise(95), bp(380, 2.0)), 0.025) * gust ** 2
    whistle = stft_filter(noise(97), lambda tc, f: bp(760 + 140 * (np.interp(tc, T[::4800], gust[::4800]) - 0.7), 30)(f))
    whistle = norm(whistle, 0.012) * gust ** 3
    # the heater fan, the odd creak of the dash
    fan = norm(fft_filter(noise(101), lambda f: lp(2200)(f) * hp(150)(f) / np.sqrt(np.maximum(f, 20) / 20)), 0.012) * (1 + 0.05 * np.sin(2 * np.pi * 2.3 * T))
    ct = np.cumsum(np.random.default_rng(111).uniform(5.0, 9.0, 10)) + PIX + 3

    def creak():
        n = int(np.random.default_rng().uniform(0.06, 0.12) * SR)
        return fft_filter(np.random.default_rng().standard_normal(n) * np.hanning(n), bp(1600, 12))
    creaks = norm(events(ct, creak), 0.004)
    # the wipers, on the game's clock: the motor whirring while they move, the blades swishing with their speed, a
    # tock where they turn at the top, a thunk as they park
    ph_w = np.mod(TR + WIPER_PHASE, WIPER_PERIOD + WIPER_REST)
    moving = (ph_w < WIPER_PERIOD).astype(float)
    moving = fft_filter(moving, lp(30))
    v = np.where(ph_w < WIPER_PERIOD, np.sin(2 * np.pi * ph_w / WIPER_PERIOD), 0.0)
    swish = fft_filter(noise(121), bp(2400, 1.0)) + 0.5 * fft_filter(noise(122), bp(900, 1.0))
    swish = norm(swish, 0.022) * np.abs(v) ** 1.2 * (1 + 0.25 * np.sin(2 * np.pi * 38 * T))
    motor = (np.sin(2 * np.pi * 96 * T) + 0.5 * np.sin(2 * np.pi * 192 * T) + 0.25 * np.sin(2 * np.pi * 288 * T)) * moving * (0.8 + 0.2 * np.abs(v))
    motor = norm(fft_filter(motor, lp(1200)), 0.012)
    cyc = WIPER_PERIOD + WIPER_REST
    k = np.arange(0, 40)
    tops = PIX + (WIPER_PERIOD / 2 - WIPER_PHASE) + cyc * k
    parks = PIX + (WIPER_PERIOD - WIPER_PHASE) + cyc * k

    def tock():
        n = int(0.08 * SR)
        tt = np.arange(n) / SR
        return np.sin(2 * np.pi * 1050 * tt) * np.exp(-tt / 0.006) * 0.5 + np.sin(2 * np.pi * 210 * tt) * np.exp(-tt / 0.02)

    def thunk():
        n = int(0.2 * SR)
        tt = np.arange(n) / SR
        return np.sin(2 * np.pi * (115 - 40 * tt) * tt) * np.exp(-tt / 0.035) + 0.15 * np.sin(2 * np.pi * (1800 - 2000 * tt) * tt) * np.exp(-tt / 0.03)
    wipe_ev = norm(events(tops, tock), 0.006) + norm(events(parks, thunk), 0.012)
    wipers = swish + motor + wipe_ev
    # far up the mountain, under the wind, something howls (just before the fade out)
    h0 = PIX + 31.0
    hl = 3.8
    ht = np.clip(T - h0, 0, hl)
    f0 = np.interp(ht, [0, 0.6, 2.2, hl], [95, 150, 128, 80]) * (1 + 0.03 * np.sin(2 * np.pi * 5.2 * ht))
    howl = saw(phase_of(f0), 25) * (1 + 0.35 * np.sin(2 * np.pi * 32 * T))
    howl *= np.interp(T, [h0, h0 + 0.5, h0 + 2.6, h0 + hl], [0, 1, 0.8, 0])
    howl = fft_filter(howl, lambda f: (bp(520, 4)(f) + 0.7 * bp(1150, 5)(f)) * lp(900)(f))
    howl = norm(howl, 1.0) * 0.004
    gust_swell = env([(0, 1), (h0 - 0.5, 1), (h0 + 1.0, 1.35), (h0 + 3.5, 1.0), (TOTAL, 1)])
    # the mix inside the car
    mono = engine + rumble + crunch + thumps + creaks
    bus = st(mono) + wind * gust_swell + st(moan, -0.2) + st(whistle, -0.6) + st(fan, 0.1) + st(wipers, 0.05)
    bus += st(howl, -0.6) * 0.5 + reverb(howl, 4.5, 41) * 1.2
    # coming to: muffled in the black, opening out as the picture fades in; gone with the fade out
    open_ = lambda tc: np.interp(tc, [PIX - 0.5, PIX + HOLD, PIX + HOLD + FADE_IN], [250, 500, 7000])   # a closed cabin keeps the top end down
    bus = np.stack([stft_filter(b, lambda tc, f: lp(open_(tc), 3)(f)) for b in bus])
    t_out = PIX + HOLD + FADE_IN + DRIVE
    bus *= env([(0, 0), (PIX - 0.6, 0), (PIX + 0.4, 0.55), (PIX + HOLD + FADE_IN, 1.0), (t_out, 1.0), (t_out + FADE_OUT, 0.0), (TOTAL, 0)])
    return bus * on


# ---------------- the end card ----------------
def card():
    t_card = PIX + HOLD + FADE_IN + DRIVE + FADE_OUT + CARD_DELAY
    drone = sum(g * w for g, w in ((0.35, saw(phase_of(np.full(N, 43.6)), 8)), (0.35, saw(phase_of(np.full(N, 44.1)), 8)),
                                   (0.5, np.sin(2 * np.pi * 65.4 * T)), (0.15, np.sin(2 * np.pi * 92.5 * T))))
    drone = stft_filter(drone, lambda tc, f: lp(190 + 60 * np.sin(2 * np.pi * 0.11 * tc))(f))
    drone = norm(drone, 0.05) * env([(0, 0), (t_card - 0.5, 0), (t_card + CARD_IN, 1.0), (TOTAL - 2.5, 0.9), (TOTAL - 0.2, 0), (TOTAL, 0)])
    n = int(3.0 * SR)
    tt = np.arange(n) / SR
    g = np.exp(np.interp(tt, [0, 0.01, 2.8], [np.log(1e-4), 0, np.log(1e-4)]))
    note = np.zeros(N)
    s = int((t_card + CARD_IN) * SR)
    y = tri(2 * np.pi * 110 * tt) * g + 0.3 * np.sin(2 * np.pi * 220 * tt) * g
    note[s:s + n] = y[:max(0, min(n, N - s))]
    note = norm(note, 0.014)
    return st(drone) + st(note) + reverb(drone * 0.5 + note, 3.0, 9) * 0.45


def write(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = (np.clip(x, -1, 1).T * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def main():
    mix = pixel() + real() + card()
    peak = np.max(np.abs(mix))
    mix = np.tanh(mix / peak * 1.15) / np.tanh(1.15) * 0.89          # -1 dBFS, a gentle soft limit
    write(os.path.join(PROJ, 'Saved', 'Generated', 'Ending_Full.wav'), mix)
    write(os.path.join(PROJ, 'SourceArt', 'Audio', 'Ending_Drive.wav'), mix[:, int(PIX * SR):])
    print('ending audio: %.1f s (pixel %.1f + real %.1f), peak before limit %.2f' % (TOTAL, PIX, REAL, peak))


if __name__ == '__main__':
    main()
