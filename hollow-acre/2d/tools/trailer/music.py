"""The teaser's score, made from nothing but numpy: no samples, nobody else's sounds.
   Cold open: rain, the engine, thunder, the stinger, tyres, the oak. Then a music-box waltz for the farm and the town, warm
   and a little sad, with one wrong note near the end. It stops dead on the drawing. The nights: a drone with a minor second
   rubbing in it, a heartbeat that quickens, a bowed screech climbing, a breath in, the face, then nothing. The title: a deep
   boom and the first bar of the waltz again, slow and out of tune.     python3 music.py -> score.wav"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import wave
from tl import timeline, at, intro_t, FPS

SR = 44100
segs, TOT = timeline()
N = int((TOT + 1.0) * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)


def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a, r, sus=1.0):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)) * sus
    rel = np.clip((d - t) / max(r, 1e-4), 0, 1); return e * rel
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[:max(0, N - i)]
    if i < 0: x = x[-i:]; i = 0
    L[i:i + len(x)] += x * g * (1 - max(0, pan)); R[i:i + len(x)] += x * g * (1 + min(0, pan))
def hz(n): return 440 * 2 ** ((n - 69) / 12)        # midi note -> Hz
def saw(f, d):
    t = tt(d); return 2 * ((t * f) % 1) - 1
def sine(f, d, ph=0): return np.sin(2 * np.pi * f * tt(d) + ph)
def M(*xs):
    n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)


# ---------- instruments
def musicbox(n, d=2.2, g=1.0):
    f = hz(n); t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + .35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 6) + .18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 11)
    x[:40] *= np.linspace(0, 1, 40); return x * g
def pluck(n, d=1.4):                                   # Karplus-Strong: a soft nylon pluck
    f = hz(n); p = int(SR / f); buf = rng.uniform(-1, 1, p) * .6; out = np.zeros(int(d * SR))
    for i in range(len(out)):
        out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return lp(out, 2600)
def pad(ns, d, g=1.0):
    x = sum(lp(saw(hz(n) * (1 + .003 * k), d) + saw(hz(n) * (1 - .004 * k), d), 900) for k, n in enumerate(ns))
    return x * env(d, .6, .9) * g / len(ns)
def boom(d=3.0, f0=70, f1=28):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 3); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 1.4) + lp(rng.normal(0, 1, len(t)), 180) * np.exp(-t * 6) * .9
def noiseburst(d, lo, hi, dec): t = tt(d); return bp(rng.normal(0, 1, len(t)), lo, hi) * np.exp(-t * dec)
def thunder(d=4.0):
    t = tt(d); x = lp(rng.normal(0, 1, len(t)), 220) * (np.exp(-t * 1.1) * (1 + .6 * np.sin(t * 9) ** 2)); x[:2000] *= np.linspace(0, 1, 2000); return x * 3
def reverb(x, sec=2.6, wet=.35):
    t = tt(sec); ir = rng.normal(0, 1, len(t)) * np.exp(-t * 3.2); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - wet) + fftconvolve(x, ir)[:len(x)] * wet * 2.2


# ---------- cold open: rain, engine, the voicemail's hush, thunder, the figure, tyres, the oak
a, b = at('intro'); TC, TH = 15.2, 17.5
rain = hp(lp(rng.normal(0, 1, int((b + .4) * SR)), 6000), 900) * .03
rain *= np.minimum(1, tt((b + .4)) / 1.2)
put(rain, 0, 1); put(rain[::-1] * .6, 0, .7, .3)
eng = lp(saw(41, b - a) + .6 * saw(82.3, b - a) + .3 * saw(123.7, b - a), 300) * .11 * env(b - a, .8, .2)
put(eng, a)
put(pad([38, 45, 50], intro_t(TC) - 0.3, .5), 0.2)                      # a low cold chord under the drive
for T, g in ((9.4, 1.0), (10.2, .6)):
    put(thunder(), intro_t(T), .55 * g, -.2)
put(M(saw(hz(74), .9) * env(.9, .005, .8) * .06, noiseburst(1.2, 2000, 7000, 3) * .15), intro_t(12.8))   # the figure: a scrape
put(np.concatenate([saw(hz(n), .5) * env(.5, .01, .3) for n in (86, 87)]) * .05, intro_t(12.8) + .1, 1, .2)
tyre = bp(rng.normal(0, 1, int((TH - TC) * SR)), 1800, 3400) * env(TH - TC, .08, .2) * (1 + .5 * np.sin(tt(TH - TC) * 38))
put(tyre * .28, intro_t(TC + .15), 1, -.15)
put(lp(saw(hz(36), TH - TC) * env(TH - TC, .3, .05), 200) * .35, intro_t(TC))    # the swell before the hit
imp = intro_t(TH)
put(boom(4.0, 90, 26) * 2.2, imp)
put(noiseburst(1.4, 2500, 12000, 4.5) * .55, imp, 1, .25)                         # glass
put(noiseburst(.9, 300, 1800, 7) * 1.8, imp)                                       # metal
put(sine(3150, 3.0) * np.exp(-tt(3.0) * .9) * .035, imp + .25)                   # the ringing in your ears

# ---------- the farm and the town: a music-box waltz in D, 3/4 at 96 bpm, warm and slightly sad, one wrong note
ma, _ = at('Grandpa left you'); mb, _ = at('Every October')
beat = 60 / 96
MEL = [(74, 1), (78, 1), (81, 1), (79, 2), (78, 1), (76, 2), (74, 1), (76, 1), (78, 1), (73, 3),
       (71, 1), (74, 1), (79, 1), (78, 2), (76, 1), (74, 2), (76, 1), (72, 1), (69, 1), (74, 3)]     # (72: the wrong note, C natural)
CH = [[50, 57, 62], [55, 59, 62], [50, 57, 62], [45, 52, 57], [55, 59, 62], [50, 57, 62], [45, 52, 57], [50, 57, 62]]
t = ma + .3; bar = 3 * beat; mel_t = t
k = 0
while mel_t < mb - .2 and k < 200:
    n, ln = MEL[k % len(MEL)]
    put(musicbox(n + (12 if k >= len(MEL) else 0) * 0, 2.4) * .22, mel_t, 1, .15)
    mel_t += ln * beat; k += 1
bt = t; bi = 0
while bt < mb - .2:
    c = CH[bi % len(CH)]
    put(pad(c, bar + .5, .55) * .5, bt)
    for j in range(3):
        put(pluck(c[0] - 12 if j == 0 else c[j] , 1.2) * (.22 if j == 0 else .12), bt + j * beat, 1, -.2 + .2 * j)
    bt += bar; bi += 1
# it stops dead: a reversed swell into silence, then one low struck note
sw = (np.exp(tt(.9) * 4) - 1) / (np.exp(3.6) - 1)
put(lp(rng.normal(0, 1, len(sw)), 3000) * sw * .25, mb - .9)
put(reverb(pluck(38, 4.0) * .9 + sine(hz(38), 4.0) * np.exp(-tt(4.0) * .8) * .3, 3.2, .5), mb + .15)

# ---------- the nights: drone with a minor second, a heartbeat quickening, a bowed screech climbing
na, _ = at('tithe_night'); sa, sb = at('scare'); slam = sa + 14 / FPS
hush = slam - .42                                                  # everything drops out here: a held-breath gap, then the hit
dd = hush - na + .2
drone = lp(saw(hz(38), dd) + saw(hz(38) * 1.006, dd) + .7 * saw(hz(39), dd) + .5 * saw(hz(45), dd), 420) * env(dd, 2.0, .16) * .14
put(drone, na - .4)
sub = (sine(27, dd) + .3 * sine(40.5, dd)) * env(dd, 2.6, .2) * .17                       # a sub-bass rumble of dread under it
put(sub, na - .4)
hb_t = at('This year')[0] + .4; per = 1.05
while hb_t < hush - .1:
    for off, gg in ((0, 1.0), (.17, .7)):
        put(lp(sine(52, .25) * np.exp(-tt(.25) * 18), 150) * .6 * gg, hb_t + off)        # a heartbeat, quickening
    hb_t += per; per = max(.40, per * .92)
scr_d = hush - (na + 2.0)
f = np.linspace(1200, 2900, int(scr_d * SR))
scr = bp(rng.normal(0, 1, len(f)), 1100, 3600) * (np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + .5) * np.linspace(0, 1, len(f)) ** 2
put(scr * .14, na + 2.0, 1, .25)
for T in (na + 1.2, at('lake_night')[0] + .8, at('graves_night')[0] + 1.0, at('corn_watch')[0] + 1.6):
    put(M(saw(hz(93), .6) * env(.6, .002, .5) * .04, noiseburst(.4, 4000, 9000, 9) * .08), T, 1, rng.uniform(-.5, .5))   # a tick, a creak
put(M(noiseburst(.18, 2000, 9000, 20) * .5, sine(1500, .12) * np.exp(-tt(.12) * 20) * .3), at('corn_watch')[0] - .03)    # the subliminal face flash: a stab
put(np.linspace(0, 1, int(.8 * SR)) ** 3 * lp(rng.normal(0, 1, int(.8 * SR)), 5000) * .5, slam - .8)              # the breath in
stg = M(sum(saw(hz(n), 1.8) for n in (49, 61, 62, 68, 73, 74, 85, 86)) / 8 * env(1.8, .002, 1.5) * .5,            # a wider, more dissonant cluster
        noiseburst(1.1, 700, 11000, 3) * .8, boom(2.2, 120, 32) * .9,
        bp(rng.normal(0, 1, int(.5 * SR)), 3000, 8000) * np.exp(-tt(.5) * 7) * .5)                                 # + a high shriek on the hit
put(stg * 2.6, slam)

# ---------- the title: a deep boom, then the waltz's first bar again, slow and out of tune
ta, tb = at('title')
put(boom(5.0, 60, 24) * .9, ta + .05)
tm = ta + 1.3
for i, (n, ln) in enumerate(MEL[:5]):
    x = musicbox(n, 3.2); wob = 1 + .012 * np.sin(tt(3.2) * 5.5 + i)
    idx = np.clip((np.arange(len(x)) * wob * .97).astype(int), 0, len(x) - 1); put(reverb(x[idx], 2.8, .45) * .22, tm, 1, .1)
    tm += ln * beat * 1.5

# ---------- mix and write
mix = np.stack([L, R], 1)
mix = reverb(mix[:, 0], 1.6, .12)[:, None] * [1, 0] + reverb(mix[:, 1], 1.6, .12)[:, None] * [0, 1]
pk = np.abs(mix).max(); mix = np.tanh(mix / pk * 1.4) * .89
with wave.open('score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('score.wav', round(len(mix) / SR, 2), 's')
