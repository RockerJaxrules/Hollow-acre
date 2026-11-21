"""The competitive trailer's score, made from nothing but numpy (no samples, nobody else's sounds).
   A brisk oom-pah market tune in A minor over a ticking clock while everybody races to sell; every click, coin and falling
   price has its own little sound. It stops dead on '...or dirty': a drone, a heartbeat, the corn, the face. Then the tune
   comes back for the purse, and a last chord under the title.     python3 music.py -> score.wav"""
import numpy as np, wave
from scipy.signal import butter, sosfilt, fftconvolve
from tl import timeline, at, FPS, HITS, scare_frame

SR = 44100
SC = scare_frame()
segs, TOT = timeline(SC)
N = int((TOT + 1.0) * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a, r, sus=1.0):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4)) * sus; return e * np.clip((d - t) / max(r, 1e-4), 0, 1)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[:max(0, N - i)]
    if i < 0: x = x[-i:]; i = 0
    L[i:i + len(x)] += x * g * (1 - max(0, pan)); R[i:i + len(x)] += x * g * (1 + min(0, pan))
def hz(n): return 440 * 2 ** ((n - 69) / 12)
def saw(f, d): t = tt(d); return 2 * ((t * f) % 1) - 1
def sine(f, d, ph=0): return np.sin(2 * np.pi * f * tt(d) + ph)
def M(*xs):
    n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def musicbox(n, d=1.6, g=1.0):
    f = hz(n); t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.6) + .35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 7) + .18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12)
    x[:40] *= np.linspace(0, 1, 40); return x * g
def pluck(n, d=.9):
    f = hz(n); p = int(SR / f); buf = rng.uniform(-1, 1, p) * .6; out = np.zeros(int(d * SR))
    for i in range(len(out)):
        out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .994
    return lp(out, 2400)
def pad(ns, d, g=1.0):
    x = sum(lp(saw(hz(n) * (1 + .003 * k), d) + saw(hz(n) * (1 - .004 * k), d), 900) for k, n in enumerate(ns)); return x * env(d, .5, .8) * g / len(ns)
def boom(d=3.0, f0=70, f1=28):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 3); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 1.4) + lp(rng.normal(0, 1, len(t)), 180) * np.exp(-t * 6) * .9
def noiseburst(d, lo, hi, dec): t = tt(d); return bp(rng.normal(0, 1, len(t)), lo, hi) * np.exp(-t * dec)
def reverb(x, sec=2.0, wet=.3):
    t = tt(sec); ir = rng.normal(0, 1, len(t)) * np.exp(-t * 3.4); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - wet) + fftconvolve(x, ir)[:len(x)] * wet * 2.2
def tick(g=1.0): return noiseburst(.05, 3500, 9000, 70) * g
def tock(g=1.0): return noiseburst(.07, 1200, 3000, 50) * g
def click(): return M(noiseburst(.04, 2000, 7000, 90) * .5, sine(1900, .03) * np.exp(-tt(.03) * 140) * .25)
def coin(): return M(*[np.pad(musicbox(n, .9, .5), (int(i * .06 * SR), 0)) for i, n in enumerate((88, 95))])
def coins(): return M(*[np.pad(musicbox(n, 1.0, .4), (int(i * .07 * SR), 0)) for i, n in enumerate((84, 88, 91, 96, 100, 103))])
def deny(): return lp(saw(hz(40), .35) + saw(hz(41), .35), 600) * env(.35, .01, .2) * .35
def caught():   # a whistle and a hit: Constable Pruitt
    w = np.sin(2 * np.pi * np.cumsum(np.full(int(.5 * SR), 2600) + 400 * np.sin(tt(.5) * 60)) / SR) * env(.5, .01, .1) * .12
    return M(w, np.pad(boom(1.4, 110, 40) * .7, (int(.05 * SR), 0)), np.pad(sum(saw(hz(n), 1.0) for n in (57, 58, 63)) / 3 * env(1.0, .005, .8) * .25, (int(.05 * SR), 0)))
def drop(i):    # a price falling: each crate a little lower
    n = 81 - i; return M(musicbox(n, .5, .35), noiseburst(.06, 300, 1200, 40) * .4)

# ---------- the market tune: A minor, 4/4 at 116 bpm, oom-pah under a music-box line, a clock ticking on top
beat = 60 / 116
MEL = [(76, .5), (77, .5), (76, .5), (72, .5), (69, 1), (72, .5), (76, .5), (79, 1), (77, .5), (76, .5), (74, 2),
       (74, .5), (76, .5), (74, .5), (71, .5), (68, 1), (71, .5), (74, .5), (77, 1), (76, .5), (74, .5), (72, 1), (69, 1),
       (72, .5), (74, .5), (76, .5), (79, .5), (81, 1), (79, .5), (77, .5), (76, 1), (74, .5), (72, .5), (71, 1), (68, 1),
       (69, .5), (71, .5), (72, .5), (74, .5), (76, 1), (75, .5), (76, .5), (69, 3)]
CH = [[45, 57, 60, 64], [45, 57, 60, 64], [50, 57, 62, 65], [52, 56, 59, 64], [45, 57, 60, 64], [50, 57, 62, 65], [52, 56, 59, 62], [45, 57, 60, 64]]
def tune(t0, t1, g=1.0, bright=False):
    t = t0; k = 0
    while t < t1 - .05:
        n, ln = MEL[k % len(MEL)]; put(musicbox(n + (12 if bright else 0), 1.4, .2 * g), t, 1, .18); t += ln * beat; k += 1
    t = t0; b = 0
    while t < t1 - .05:
        c = CH[b % len(CH)]
        for j in range(4):
            tb = t + j * beat
            if tb >= t1 - .05: break
            if j % 2 == 0: put(pluck(c[0] - 12 * (j == 0) + 7 * (j == 2), .7) * .3 * g, tb, 1, -.15)
            else: put(sum(pluck(n, .35) for n in c[1:]) * .07 * g, tb, 1, .1)
            put(tick(.12 * g) if j % 2 == 0 else tock(.1 * g), tb, 1, .35)
        t += 4 * beat; b += 1

ta, tb = at('title', SC)
put(boom(4.0, 64, 26) * .8, ta + .1)
for i, n in enumerate((69, 72, 76, 75)):
    put(reverb(musicbox(n, 2.4, .25), 2.2, .4), ta + .6 + i * .55, 1, .1)
m0 = at('Play with friends', SC)[0]; m1 = at('…or dirty', SC)[0]
tune(m0, m1 - .05)
# '...or dirty': it stops dead
d0, d1 = at('…or dirty', SC)
put(M(sum(saw(hz(n), 1.4) for n in (56, 57, 63)) / 3 * env(1.4, .004, 1.2) * .4, boom(2.0, 90, 30) * .7), d0 + .05)
n0, n1 = at('night', SC)
dd = n1 - d1 + 1.2
put(lp(saw(hz(33), dd) + saw(hz(33) * 1.006, dd) + .7 * saw(hz(34), dd), 380) * env(dd, 1.2, .05) * .12, d1)
hb = at('Somebody always sees', SC)[0] + .2; per = .95
slam = n0 + SC / FPS
while hb < slam - .2:
    for off, gg in ((0, 1.0), (.16, .7)): put(lp(sine(52, .25) * np.exp(-tt(.25) * 18), 150) * .55 * gg, hb + off)
    hb += per; per = max(.4, per * .9)
put(np.linspace(0, 1, int(.7 * SR)) ** 3 * lp(rng.normal(0, 1, int(.7 * SR)), 5000) * .4, slam - .7)
put(M(sum(saw(hz(n), 1.6) for n in (61, 62, 68, 73, 74)) / 5 * env(1.6, .003, 1.4) * .5, noiseburst(1.0, 800, 9000, 3) * .7, boom(2.0, 120, 35) * .8) * 1.8, slam)
# the purse: the tune again, an octave up and warmer, into the title
p0 = at('Every seventh day', SC)[0]; e0, e1 = at('end', SC)
tune(p0 + .2, e0, .9, bright=True)
put(boom(5.0, 60, 24) * .8, e0 + .05)
put(reverb(pad([45, 52, 57, 60, 64], e1 - e0 - .3, .6), 2.6, .4), e0 + .1)
for i, n in enumerate((81, 84, 88, 81 + 12)):
    put(reverb(musicbox(n, 2.6, .22), 2.4, .45), e0 + .8 + i * .5, 1, -.1 + .1 * i)
# ---------- every click, coin and falling price
SFX = {'click': click, 'coin': coin, 'coins': coins, 'deny': deny, 'caught': caught}
for (shot, f, kind) in HITS:
    a, _ = at(shot, SC); seg = [s for (x, y, s) in segs if s[0] == 'shot' and s[1] == shot][0]; t = a + (f - seg[2]) / FPS
    x = drop(int(kind[4:])) if kind.startswith('tick') else SFX[kind]()
    put(x, t, .9 if kind != 'click' else .7, .1)
mix = np.stack([L, R], 1)
mix = reverb(mix[:, 0], 1.4, .1)[:, None] * [1, 0] + reverb(mix[:, 1], 1.4, .1)[:, None] * [0, 1]
pk = np.abs(mix).max(); mix = np.tanh(mix / pk * 1.4) * .89
with wave.open('score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('score.wav', round(len(mix) / SR, 2), 's', 'scare at', SC)
